const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');

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
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message to a chat room
exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Check if user is a participant in this room
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ message: 'Chat room not found' });
    }
    
    if (!chatRoom.participants.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages to this chat room' });
    }
    
    // Create new message
    const message = new Message({
      chatRoom: roomId,
      sender: req.user.id,
      content,
    });
    
    await message.save();
    
    // Update chat room with last message and update timestamp
    chatRoom.lastMessage = message._id;
    
    // Increment unread count for all participants except sender
    chatRoom.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        const index = chatRoom.participants.indexOf(participantId);
        if (!chatRoom.unreadCounts) {
          chatRoom.unreadCounts = {};
        }
        chatRoom.unreadCounts[participantId] = (chatRoom.unreadCounts[participantId] || 0) + 1;
      }
    });
    
    await chatRoom.save();
    
    // Populate sender info before sending response
    await message.populate('sender', 'name avatar');
    
    res.status(201).json(message);
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