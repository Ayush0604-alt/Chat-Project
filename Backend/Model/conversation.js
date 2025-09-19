const mongoose = require('mongoose');
const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: String }, 
    type: { type: String, enum: ['private', 'group'], default: 'private' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  },
  { timestamps: true } 
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports= Conversation;
