"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ConversationSchema = new mongoose_1.default.Schema({
    uid: { type: String, required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: "New Chat" },
    preview: { type: String, default: null },
    pinned: { type: Boolean, default: false, index: true },
    manualTitle: { type: Boolean, default: false },
}, { timestamps: true });
ConversationSchema.index({ uid: 1, conversationId: 1 }, { unique: true });
ConversationSchema.index({ uid: 1, pinned: -1, updatedAt: -1 });
ConversationSchema.index({ title: "text", preview: "text" });
exports.Conversation = mongoose_1.default.model("Conversation", ConversationSchema);
