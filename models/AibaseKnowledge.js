import mongoose from "mongoose";

const aibaseKnowledgeSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    content: { type: String },
    uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

const AibaseKnowledge = mongoose.model("AibaseKnowledge", aibaseKnowledgeSchema);
export default AibaseKnowledge;
