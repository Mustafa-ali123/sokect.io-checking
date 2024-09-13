const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: { type: String, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  createdAt: { type: Date, default: Date.now },
  colony: { type: mongoose.Schema.Types.ObjectId, required: true},
  userId: { type: mongoose.Schema.Types.ObjectId, required: true},
  role: { type:String, required: true},
});

module.exports = mongoose.model('Group', GroupSchema);