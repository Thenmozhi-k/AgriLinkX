const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: function() {
        // Content is required unless there are attachments
        return this.attachments.length === 0;
      }
    },
    attachments: [{
      data: Buffer, // Binary data for the attachment
      contentType: String, // MIME type of the attachment
      url: String, // URL to attachment (for backward compatibility)
      type: {
        type: String,
        enum: ['image', 'video', 'audio', 'document'],
        default: 'image'
      },
      name: String,
      size: Number
    }],
    messageType: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact'],
      default: 'text'
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: String
    }],
    isDeleted: {
      type: Boolean,
      default: false
    },
    deliveredTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;