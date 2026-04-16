import mongoose, { Document, Schema } from "mongoose";

export interface IWaitingReply extends Document {
  uid: string;
  threadId: string;
  subject: string;
  to: string;
  toName: string;
  sentAt: number;
  status: "active" | "resolved";
  resolvedAt?: number;
  createdAt: Date;
  updatedAt: Date;
}

const WaitingReplySchema = new Schema<IWaitingReply>(
  {
    uid: { type: String, required: true, index: true },
    threadId: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    to: { type: String, required: true },
    toName: { type: String, default: "" },
    sentAt: { type: Number, required: true },
    status: { type: String, enum: ["active", "resolved"], default: "active", index: true },
    resolvedAt: { type: Number },
  },
  { timestamps: true }
);

WaitingReplySchema.index({ uid: 1, status: 1 });
WaitingReplySchema.index({ uid: 1, threadId: 1 }, { unique: true });

export const WaitingReply =
  mongoose.models.WaitingReply ||
  mongoose.model<IWaitingReply>("WaitingReply", WaitingReplySchema);
