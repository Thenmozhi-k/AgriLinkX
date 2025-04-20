const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    unique: true 
  },
  count: { 
    type: Number, 
    default: 1 
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add a static method to get the next count
CounterSchema.statics.getNextSequence = async function(userId) {
  const counter = await this.findOneAndUpdate(
    { userId },
    { 
      $inc: { count: 1 },
      $set: { lastUpdated: new Date() }
    },
    { 
      new: true,      // Return the updated document
      upsert: true,   // Create if it doesn't exist
      setDefaultsOnInsert: true // Apply defaults if creating new doc
    }
  );
  
  return counter.count;
};

const UserPostCounter = mongoose.model("UserPostCounter", CounterSchema);

module.exports = UserPostCounter;