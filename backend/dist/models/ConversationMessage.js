"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationMessage = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ConversationMessageSchema = new mongoose_1.default.Schema({
    uid: { type: String, required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    role: { type: String, required: true, enum: ["user", "ai"], index: true },
    content: { type: String, required: true },
    personality: { type: String, default: null },
    mode: { type: String, default: null, index: true },
}, { timestamps: { updatedAt: false } });
ConversationMessageSchema.index({ uid: 1, conversationId: 1, createdAt: -1 });
exports.ConversationMessage = mongoose_1.default.model("ConversationMessage", ConversationMessageSchema);
