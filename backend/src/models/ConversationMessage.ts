import mongoose from "mongoose";

export type ChatRole = "user" | "ai";

export interface ConversationMessageDoc {
  uid: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  personality?: string | null;
  mode?: string | null;
  createdAt: Date;
}

const ConversationMessageSchema = new mongoose.Schema<ConversationMessageDoc>(
  {
    uid: { type: String, required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    role: { type: String, required: true, enum: ["user", "ai"], index: true },
    content: { type: String, required: true },
    personality: { type: String, default: null },
    mode: { type: String, default: null, index: true },
  },
  { timestamps: { updatedAt: false } }
);

ConversationMessageSchema.index({ uid: 1, conversationId: 1, createdAt: -1 });

export const ConversationMessage = mongoose.model<ConversationMessageDoc>(
  "ConversationMessage",
  ConversationMessageSchema
);

