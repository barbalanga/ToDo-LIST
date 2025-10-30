const { Schema, model } = require('mongoose');

const todoSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  list:   { type: Schema.Types.ObjectId, ref: 'List', index: true, default: null }, // אופציונלי
  title:  { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = model('Todo', todoSchema);
