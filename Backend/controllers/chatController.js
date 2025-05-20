const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all chat rooms for the current user
exports.getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      participants: req.user.id
    })
      .populate('participants', 'name avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    res.json(chatRooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a specific chat room
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if user is a participant in this room
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    if (!chatRoom.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this chat room' });
    }
    
    const messages = await Message.find({ chatRoom: roomId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });
    
    // Process messages to convert binary data to base64 strings
    const processedMessages = messages.map(message => {
      const messageObj = message.toObject();
      
      // Process attachments if they exist
      if (messageObj.attachments && messageObj.attachments.length > 0) {
        messageObj.attachments = messageObj.attachments.map(attachment => {
          // If attachment has binary data, convert it to base64
          if (attachment.data) {
            // Handle the case where data is a Buffer object with type and data properties
            let buffer;
            if (attachment.data.type === 'Buffer' && Array.isArray(attachment.data.data)) {
              buffer = Buffer.from(attachment.data.data);
            } else if (Buffer.isBuffer(attachment.data)) {
              buffer = attachment.data;
            } else if (Array.isArray(attachment.data)) {
              buffer = Buffer.from(attachment.data);
            } else {
              // If it's already a string, assume it's base64
              return {
                ...attachment,
                dataUrl: `data:${attachment.contentType};base64,${attachment.data}`
              };
            }
            
            // Convert buffer to base64 string
            const base64Data = buffer.toString('base64');
            
            // Return only necessary fields, excluding the original data
            return {
              _id: attachment._id,
              contentType: attachment.contentType,
              type: attachment.type,
              name: attachment.name,
              size: attachment.size,
              // Include dataUrl for direct display in the frontend
              dataUrl: `data:${attachment.contentType};base64,${base64Data}`
            };
          }
          
          // If there's no data but there's a URL, keep the URL
          if (attachment.url) {
            return {
              _id: attachment._id,
              url: attachment.url,
              type: attachment.type,
              name: attachment.name,
              size: attachment.size
            };
          }
          
          return attachment;
        });
      }
      
      return messageObj;
    });
    
    res.json(processedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message to a chat room
exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, attachments, messageType } = req.body;
    
    // Either content or attachments must be provided
    if ((!content || content.trim() === '') && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Message content or attachments are required' });
    }
    
    // Check if user is a participant in this room
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    if (!chatRoom.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages to this chat room' });
    }
    
    // Process attachments if any
    const processedAttachments = [];
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        // Convert base64 string back to Buffer for storage
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
      sender: req.user.id,
      content: content || '',
      attachments: processedAttachments,
      messageType: messageType || 'text'
    });
    
    await message.save();
    
    // Update chat room with last message and update timestamp
    chatRoom.lastMessage = message._id;
    
    // Increment unread count for all participants except sender
    chatRoom.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
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
            // Add a data URL for direct display in the frontend
            dataUrl: `data:${attachment.contentType};base64,${attachment.data.toString('base64')}`
          };
        }
        return attachment;
      });
    }
    
    res.status(201).json(responseMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new chat room
exports.createChatRoom = async (req, res) => {
  try {
    const { name, participants } = req.body;
    
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }
    
    // Make sure current user is included in participants
    const allParticipants = [...new Set([...participants, req.user.id])];
    
    // Validate that all participants exist
    const users = await User.find({ _id: { $in: allParticipants } });
    if (users.length !== allParticipants.length) {
      return res.status(400).json({ message: 'One or more participants do not exist' });
    }
    
    // Check if a direct chat already exists between these users
    if (allParticipants.length === 2) {
      const existingRoom = await ChatRoom.findOne({
        participants: { $all: allParticipants, $size: 2 },
        isGroup: false
      });
      
      if (existingRoom) {
        return res.status(200).json(existingRoom);
      }
    }
    
    // Create new chat room
    const chatRoom = new ChatRoom({
      name: name || null,
      participants: allParticipants,
      isGroup: allParticipants.length > 2,
      creator: req.user.id
    });
    
    await chatRoom.save();
    
    // Populate participants info before sending response
    await chatRoom.populate('participants', 'name avatar');
    
    res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get or create a direct chat with another user
exports.getDirectChat = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot create a chat with yourself' });
    }
    
    // Check if user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if a direct chat already exists
    const existingRoom = await ChatRoom.findOne({
      participants: { $all: [req.user.id, userId], $size: 2 },
      isGroup: false
    }).populate('participants', 'name avatar');
    
    if (existingRoom) {
      return res.json(existingRoom);
    }
    
    // Create new direct chat
    const chatRoom = new ChatRoom({
      participants: [req.user.id, userId],
      isGroup: false,
      creator: req.user.id
    });
    
    await chatRoom.save();
    
    // Populate participants info before sending response
    await chatRoom.populate('participants', 'name avatar');
    
    res.status(201).json(chatRoom);
  } catch (error) {
    console.error('Error getting direct chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark a chat room as read for the current user
exports.markRoomAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    if (!chatRoom.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this chat room' });
    }
    
    // Reset unread count for current user
    if (chatRoom.unreadCounts) {
      chatRoom.unreadCounts[req.user.id] = 0;
      await chatRoom.save();
    }
    
    res.json({ message: 'Chat room marked as read' });
  } catch (error) {
    console.error('Error marking room as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload file attachment for chat
exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get file details
    const fileType = req.file.mimetype.split('/')[0]; // image, video, audio, application
    let attachmentType = 'document';
    
    if (fileType === 'image') {
      attachmentType = 'image';
    } else if (fileType === 'video') {
      attachmentType = 'video';
    } else if (fileType === 'audio') {
      attachmentType = 'audio';
    }
    
    // Read file as binary data
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads/', req.file.filename);
    
    // Read file data as buffer
    const fileData = fs.readFileSync(filePath);
    
    // Create a unique ID for this attachment
    const attachmentId = new mongoose.Types.ObjectId();
    
    // Return file details with the ID
    res.json({
      id: attachmentId,
      data: fileData.toString('base64'), // Convert buffer to base64 for transport
      contentType: req.file.mimetype,
      type: attachmentType,
      name: req.file.originalname,
      size: req.file.size
    });
    
    // Clean up the file from disk since we're storing it in the database
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add reaction to a message
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is a participant in the chat room
    const chatRoom = await ChatRoom.findById(message.chatRoom);
    if (!chatRoom || !chatRoom.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to react to this message' });
    }
    
    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.user.id && r.emoji === emoji
    );
    
    if (existingReaction) {
      return res.status(400).json({ message: 'You already reacted with this emoji' });
    }
    
    // Add the reaction
    message.reactions.push({
      user: req.user.id,
      emoji
    });
    
    await message.save();
    
    res.json(message);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove reaction from a message
exports.removeReaction = async (req, res) => {
  try {
    const { messageId, emoji } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if user is a participant in the chat room
    const chatRoom = await ChatRoom.findById(message.chatRoom);
    if (!chatRoom || !chatRoom.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to remove reaction from this message' });
    }
    
    // Find and remove the reaction
    const reactionIndex = message.reactions.findIndex(
      r => r.user.toString() === req.user.id && r.emoji === emoji
    );
    
    if (reactionIndex === -1) {
      return res.status(404).json({ message: 'Reaction not found' });
    }
    
    message.reactions.splice(reactionIndex, 1);
    await message.save();
    
    res.json(message);
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// const ChatRoom = require('../models/ChatRoom');
// const Message = require('../models/Message');
// const User = require('../models/User');

// // Get all chat rooms for the current user
// exports.getChatRooms = async (req, res) => {
//   try {
//     const chatRooms = await ChatRoom.find({
//       participants: req.user.id
//     })
//       .populate('participants', 'name avatar')
//       .populate('lastMessage')
//       .sort({ updatedAt: -1 });
    
//     res.json(chatRooms);
//   } catch (error) {
//     console.error('Error fetching chat rooms:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get messages for a specific chat room
// exports.getMessages = async (req, res) => {
//   try {
//     const { roomId } = req.params;
    
//     // Check if user is a participant in this room
//     const chatRoom = await ChatRoom.findById(roomId);
//     if (!chatRoom) {
//       return res.status(404).json({ message: 'Chat room not found' });
//     }
    
//     if (!chatRoom.participants.includes(req.user.id)) {
//       return res.status(403).json({ message: 'Not authorized to access this chat room' });
//     }
    
//     const messages = await Message.find({ chatRoom: roomId })
//       .populate('sender', 'name avatar')
//       .sort({ createdAt: 1 });
    
//     res.json(messages);
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Send a message to a chat room
// exports.sendMessage = async (req, res) => {
//   try {
//     const { roomId } = req.params;
//     const { content } = req.body;
    
//     if (!content || content.trim() === '') {
//       return res.status(400).json({ message: 'Message content is required' });
//     }
    
//     // Check if user is a participant in this room
//     const chatRoom = await ChatRoom.findById(roomId);
//     if (!chatRoom) {
//       return res.status(404).json({ message: 'Chat room not found' });
//     }
    
//     if (!chatRoom.participants.includes(req.user.id)) {
//       return res.status(403).json({ message: 'Not authorized to send messages to this chat room' });
//     }
    
//     // Create new message
//     const message = new Message({
//       chatRoom: roomId,
//       sender: req.user.id,
//       content,
//     });
    
//     await message.save();
    
//     // Update chat room with last message and update timestamp
//     chatRoom.lastMessage = message._id;
    
//     // Increment unread count for all participants except sender
//     chatRoom.participants.forEach(participantId => {
//       if (participantId.toString() !== req.user.id) {
//         const index = chatRoom.participants.indexOf(participantId);
//         if (!chatRoom.unreadCounts) {
//           chatRoom.unreadCounts = {};
//         }
//         chatRoom.unreadCounts[participantId] = (chatRoom.unreadCounts[participantId] || 0) + 1;
//       }
//     });
    
//     await chatRoom.save();
    
//     // Populate sender info before sending response
//     await message.populate('sender', 'name avatar');
    
//     res.status(201).json(message);
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Create a new chat room
// exports.createChatRoom = async (req, res) => {
//   try {
//     const { name, participants } = req.body;
    
//     if (!participants || !Array.isArray(participants) || participants.length === 0) {
//       return res.status(400).json({ message: 'At least one participant is required' });
//     }
    
//     // Make sure current user is included in participants
//     const allParticipants = [...new Set([...participants, req.user.id])];
    
//     // Validate that all participants exist
//     const users = await User.find({ _id: { $in: allParticipants } });
//     if (users.length !== allParticipants.length) {
//       return res.status(400).json({ message: 'One or more participants do not exist' });
//     }
    
//     // Check if a direct chat already exists between these users
//     if (allParticipants.length === 2) {
//       const existingRoom = await ChatRoom.findOne({
//         participants: { $all: allParticipants, $size: 2 },
//         isGroup: false
//       });
      
//       if (existingRoom) {
//         return res.status(200).json(existingRoom);
//       }
//     }
    
//     // Create new chat room
//     const chatRoom = new ChatRoom({
//       name: name || null,
//       participants: allParticipants,
//       isGroup: allParticipants.length > 2,
//       creator: req.user.id
//     });
    
//     await chatRoom.save();
    
//     // Populate participants info before sending response
//     await chatRoom.populate('participants', 'name avatar');
    
//     res.status(201).json(chatRoom);
//   } catch (error) {
//     console.error('Error creating chat room:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Get or create a direct chat with another user
// exports.getDirectChat = async (req, res) => {
//   try {
//     const { userId } = req.params;
    
//     if (userId === req.user.id) {
//       return res.status(400).json({ message: 'Cannot create a chat with yourself' });
//     }
    
//     // Check if user exists
//     const otherUser = await User.findById(userId);
//     if (!otherUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }
    
//     // Check if a direct chat already exists
//     const existingRoom = await ChatRoom.findOne({
//       participants: { $all: [req.user.id, userId], $size: 2 },
//       isGroup: false
//     }).populate('participants', 'name avatar');
    
//     if (existingRoom) {
//       return res.json(existingRoom);
//     }
    
//     // Create new direct chat
//     const chatRoom = new ChatRoom({
//       participants: [req.user.id, userId],
//       isGroup: false,
//       creator: req.user.id
//     });
    
//     await chatRoom.save();
    
//     // Populate participants info before sending response
//     await chatRoom.populate('participants', 'name avatar');
    
//     res.status(201).json(chatRoom);
//   } catch (error) {
//     console.error('Error getting direct chat:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Mark a chat room as read for the current user
// exports.markRoomAsRead = async (req, res) => {
//   try {
//     const { roomId } = req.params;
    
//     const chatRoom = await ChatRoom.findById(roomId);
//     if (!chatRoom) {
//       return res.status(404).json({ message: 'Chat room not found' });
//     }
    
//     if (!chatRoom.participants.includes(req.user.id)) {
//       return res.status(403).json({ message: 'Not authorized to access this chat room' });
//     }
    
//     // Reset unread count for current user
//     if (chatRoom.unreadCounts) {
//       chatRoom.unreadCounts[req.user.id] = 0;
//       await chatRoom.save();
//     }
    
//     res.json({ message: 'Chat room marked as read' });
//   } catch (error) {
//     console.error('Error marking room as read:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };