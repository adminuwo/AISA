import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const aibaseConversationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, default: "New Conversation" },
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

const AibaseConversation = mongoose.model("AibaseConversation", aibaseConversationSchema);
export default AibaseConversation;
