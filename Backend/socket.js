const User = require('./models/User');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const axios = require('axios');

// Store active users with their socket IDs
const activeUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User authentication and connection setup
    socket.on('authenticate', async (userId) => {
      try {
        const user = await User.findById(userId);
        if (user) {
          // Store user connection
          activeUsers.set(userId, socket.id);
          socket.userId = userId;

          console.log(`User ${userId} authenticated with socket ${socket.id}`);
          
          // Join personal room for direct messages
          socket.join(`user:${userId}`);
          
          // Join all chat rooms the user is part of
          const userRooms = await ChatRoom.find({ participants: userId });
          userRooms.forEach(room => {
            socket.join(`room:${room._id}`);
          });
          
          // Notify other users that this user is online
          socket.broadcast.emit('user_status_change', { userId, status: 'online' });
          
          // Send the active users list to the newly connected user
          const onlineUsers = Array.from(activeUsers.keys());
          socket.emit('active_users', onlineUsers);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        console.log(`User ${socket.userId} disconnected`);
        activeUsers.delete(socket.userId);
        
        // Notify other users that this user is offline
        socket.broadcast.emit('user_status_change', { 
          userId: socket.userId, 
          status: 'offline',
          lastSeen: new Date()
        });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (messageData) => {
      try {
        const { roomId, content, attachments = [], messageType = 'text' } = messageData;
        
        if (!socket.userId || !roomId || (!content && (!attachments || attachments.length === 0))) {
          return socket.emit('error', { message: 'Invalid message data' });
        }
        
        // Check if user is a participant in this room
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom) {
          return socket.emit('error', { message: 'Chat room not found' });
        }
        
        if (!chatRoom.participants.includes(socket.userId)) {
          return socket.emit('error', { message: 'Not authorized to send messages to this chat room' });
        }
        
        // Process attachments if any
        const processedAttachments = [];
        if (attachments && attachments.length > 0) {
          for (const attachment of attachments) {
            // Convert base64 string back to Buffer for storage if it exists
            if (attachment.data) {
              const buffer = Buffer.from(attachment.data, 'base64');
              processedAttachments.push({
                data: buffer,
                contentType: attachment.contentType,
                type: attachment.type,
                name: attachment.name,
                size: attachment.size
              });
            } else if (attachment.url) {
              // Handle legacy attachments with URLs
              processedAttachments.push(attachment);
            }
          }
        }
        
        // Create new message
        const message = new Message({
          chatRoom: roomId,
          sender: socket.userId,
          content: content || '',
          attachments: processedAttachments,
          messageType
        });
        
        await message.save();
        
        // Update chat room with last message and update timestamp
        chatRoom.lastMessage = message._id;
        
        // Increment unread count for all participants except sender
        chatRoom.participants.forEach(participantId => {
          if (participantId.toString() !== socket.userId) {
            if (!chatRoom.unreadCounts) {
              chatRoom.unreadCounts = {};
            }
            chatRoom.unreadCounts[participantId] = (chatRoom.unreadCounts[participantId] || 0) + 1;
          }
        });
        
        await chatRoom.save();
        
        // Populate sender info before sending response
        await message.populate('sender', 'name avatar');
        
        // Convert binary data back to base64 for the response
        const responseMessage = message.toObject();
        if (responseMessage.attachments && responseMessage.attachments.length > 0) {
          responseMessage.attachments = responseMessage.attachments.map(attachment => {
            if (attachment.data) {
              return {
                ...attachment,
                data: attachment.data.toString('base64'),
                // Add a data URL for direct display in the UI
                dataUrl: `data:${attachment.contentType};base64,${attachment.data.toString('base64')}`
              };
            }
            return attachment;
          });
        }
        
        // Broadcast the message to all users in the room
        io.to(`room:${roomId}`).emit('new_message', responseMessage);
        
        // Send notifications to all participants who are not the sender
        const otherParticipants = chatRoom.participants.filter(
          p => p.toString() !== socket.userId
        );
        
        for (const recipientId of otherParticipants) {
          // Create notification
          const notification = new Notification({
            recipient: recipientId,
            sender: socket.userId,
            type: 'message',
            message: chatRoom.isGroup 
              ? `New message in ${chatRoom.name || 'group chat'}`
              : 'New message',
            actionUrl: `/messages/${roomId}`,
            isRead: false
          });
          
          await notification.save();
          
          // Send notification to the recipient if they're online
          const recipientSocketId = activeUsers.get(recipientId.toString());
          if (recipientSocketId) {
            io.to(`user:${recipientId}`).emit('new_notification', notification);
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ roomId, isTyping }) => {
      if (!socket.userId || !roomId) return;
      
      socket.to(`room:${roomId}`).emit('user_typing', {
        roomId,
        userId: socket.userId,
        isTyping
      });
    });

    // Handle read receipts
    socket.on('mark_read', async ({ roomId }) => {
      try {
        if (!socket.userId || !roomId) return;
        
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom || !chatRoom.participants.includes(socket.userId)) {
          return;
        }
        
        // Reset unread count for current user
        if (chatRoom.unreadCounts && chatRoom.unreadCounts[socket.userId]) {
          chatRoom.unreadCounts[socket.userId] = 0;
          await chatRoom.save();
        }
        
        // Update read status for messages
        await Message.updateMany(
          { 
            chatRoom: roomId,
            sender: { $ne: socket.userId },
            readBy: { $ne: socket.userId }
          },
          { $addToSet: { readBy: socket.userId } }
        );
        
        // Notify other users in the room about the read status
        socket.to(`room:${roomId}`).emit('message_read', {
          roomId,
          userId: socket.userId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle voice/video call signaling
    socket.on('call_request', ({ recipientId, callType }) => {
      const recipientSocketId = activeUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(`user:${recipientId}`).emit('incoming_call', {
          callerId: socket.userId,
          callType // 'audio' or 'video'
        });
      } else {
        // Recipient is offline
        socket.emit('call_failed', { reason: 'user_offline' });
      }
    });

    socket.on('call_response', ({ callerId, accepted }) => {
      const callerSocketId = activeUsers.get(callerId);
      if (callerSocketId) {
        io.to(`user:${callerId}`).emit('call_answered', {
          accepted,
          userId: socket.userId
        });
      }
    });

    // Handle WebRTC signaling
    socket.on('webrtc_signal', ({ userId, signal }) => {
      const recipientSocketId = activeUsers.get(userId);
      if (recipientSocketId) {
        io.to(`user:${userId}`).emit('webrtc_signal', {
          userId: socket.userId,
          signal
        });
      }
    });

    // Handle ending calls
    socket.on('end_call', ({ userId }) => {
      const recipientSocketId = activeUsers.get(userId);
      if (recipientSocketId) {
        io.to(`user:${userId}`).emit('call_ended', {
          userId: socket.userId
        });
      }
    });
    
    // AgriBot chatbot integration
    socket.on('bot_message', async (data) => {
      try {
        const { query, language = 'en', useVoice = false } = data;
        
        if (!query) {
          return socket.emit('bot_error', { message: 'Query is required' });
        }
        
        // Instead of making HTTP requests to our own server (which can cause circular issues),
        // let's directly use the fallback responses for now
        // This simulates the bot response without making an actual API call
        
        // Generate a fallback response based on the query
        const botResponseText = generateFallbackResponse(query, language);
        
        // Send text response back to client
        socket.emit('bot_response', {
          text: botResponseText,
          language,
          timestamp: new Date()
        });
        
        // If voice is requested, send a mock audio response
        if (useVoice) {
          socket.emit('bot_voice_response', {
            audioData: 'mock-audio-data-base64', // In a real implementation with API key, this would be actual audio
            contentType: 'audio/mp3',
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Bot message error:', error);
        socket.emit('bot_error', { 
          message: 'Failed to get bot response',
          error: error.message 
        });
      }
    });
    
    // Helper function to generate fallback responses
    function generateFallbackResponse(query, language) {
      const lowerQuery = query.toLowerCase();
      let response = "I'm sorry, but I don't have enough information to answer that question. Could you provide more details about your agricultural needs?";
      
      if (lowerQuery.includes('crop') || lowerQuery.includes('plant')) {
        response = "Based on your query about crops, I recommend considering seasonal patterns, soil quality, and water availability in your region. For specific crop recommendations, a soil test would be beneficial to determine nutrient levels and pH balance.";
      } else if (lowerQuery.includes('pest') || lowerQuery.includes('disease')) {
        response = "For pest and disease management, integrated pest management (IPM) approaches are most effective. This includes regular monitoring, biological controls, and targeted treatments only when necessary. Proper crop rotation and diversity can also help prevent pest buildup.";
      } else if (lowerQuery.includes('fertilizer') || lowerQuery.includes('soil')) {
        response = "Good soil health is fundamental to successful farming. Consider using organic matter like compost to improve soil structure, using cover crops to prevent erosion, and applying balanced fertilizers based on soil test results rather than general recommendations.";
      } else if (lowerQuery.includes('water') || lowerQuery.includes('irrigation')) {
        response = "Water management is critical in agriculture. Drip irrigation systems can reduce water usage by up to 60% compared to conventional methods. Consider rainwater harvesting, mulching to reduce evaporation, and scheduling irrigation based on crop needs rather than fixed schedules.";
      } else if (lowerQuery.includes('market') || lowerQuery.includes('price')) {
        response = "Agricultural markets can be volatile. Consider diversifying your crops to spread risk, exploring direct-to-consumer sales channels, and staying informed about government support programs. Value-added products can also increase your profit margins.";
      }
      
      // For languages other than English, we'll just note that translation would happen here
      if (language !== 'en') {
        const languageNames = {
          hi: 'Hindi',
          ta: 'Tamil',
          te: 'Telugu',
          kn: 'Kannada',
          ml: 'Malayalam',
          pa: 'Punjabi',
          bn: 'Bengali',
          gu: 'Gujarati',
          mr: 'Marathi'
        };
        return `[This response would be translated to ${languageNames[language] || language}]: ${response}`;
      }
      
      return response;
    }
    
    // Handle speech-to-text for bot
    socket.on('bot_speech_to_text', async (data) => {
      try {
        const { audioData, language = 'en' } = data;
        
        if (!audioData) {
          return socket.emit('bot_error', { message: 'Audio data is required' });
        }
        
        // Use a mock response for speech-to-text
        // In a real implementation with API key, this would call the actual API
        socket.emit('bot_speech_to_text_result', {
          text: "How can I improve soil health for organic farming?", // Mock recognized text
          language,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Speech-to-text error:', error);
        socket.emit('bot_error', { 
          message: 'Failed to convert speech to text',
          error: error.message 
        });
      }
    });
  });
};