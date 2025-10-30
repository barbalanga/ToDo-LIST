const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['viewer'], default: 'viewer' }
});

const ListSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [MemberSchema]
}, { timestamps: true });

module.exports = mongoose.model('List', ListSchema);
