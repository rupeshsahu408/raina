import mongoose from "mongoose";

export interface ConversationDoc {
  uid: string;
  conversationId: string;
  title: string;
  preview?: string | null;
  pinned: boolean;
  manualTitle?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new mongoose.Schema<ConversationDoc>(
  {
    uid: { type: String, required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: "New Chat" },
    preview: { type: String, default: null },
    pinned: { type: Boolean, default: false, index: true },
    manualTitle: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ConversationSchema.index({ uid: 1, conversationId: 1 }, { unique: true });
ConversationSchema.index({ uid: 1, pinned: -1, updatedAt: -1 });
ConversationSchema.index({ title: "text", preview: "text" });

export const Conversation = mongoose.model<ConversationDoc>(
  "Conversation",
  ConversationSchema
);

