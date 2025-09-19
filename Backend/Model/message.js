const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    attachmentsMeta: [{ type: Object }], 
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  },
  { timestamps: true } 
);

const Message = mongoose.model('Message', messageSchema);

module.exports=Message;