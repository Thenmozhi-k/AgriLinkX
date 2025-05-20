const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'system', 'message', 'call'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    actionUrl: {
      type: String
    },
    relatedChatRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom'
    },
    relatedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;