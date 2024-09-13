const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  colony: { type: mongoose.Schema.Types.ObjectId, required: true},
  userId: { type: mongoose.Schema.Types.ObjectId, required: true},
  accessKey: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  images: [String],
  // email: { type: String, required: true, unique: true },
  // password: { type: String, required: true },
  // isAdmin: { type: Boolean, default: false }, // New field
});

const User = mongoose.model('User', userSchema);

module.exports = User;
