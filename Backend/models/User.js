const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { 
    type: String, 
    enum: ['requested', 'following', 'rejected'], 
    default: 'requested' 
  },
  requestedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
{
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Profile fields
    avatar: { type: String },
    coverPhoto: { type: String },
    title: { type: String },
    bio: { type: String },
    about: { type: String },
    location: { type: String },
    company: { type: String },
    website: { type: String },
    role: { type: String, default: 'Farmer' },
    skills: [{ type: String }],
    // Social connections
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    connections: [connectionSchema]
},
{ timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;