const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  count: { type: Number, default: 0 },
});

const UserPostCounter = mongoose.model("UserPostCounter", CounterSchema);

module.exports = UserPostCounter;
