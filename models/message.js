const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  groupId: { type: mongoose.ObjectId, ref: 'Group', required: true },
  sender: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  // colony: { type: mongoose.Schema.Types.ObjectId, required: true},
  // userId: { type: mongoose.Schema.Types.ObjectId, required: true},
  // role: { type:String, required: true},
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;