import mongoose, { Document, Schema } from "mongoose";

export interface IFollowUp extends Document {
  uid: string;
  messageId: string;
  threadId: string;
  subject: string;
  from: string;
  scheduledAt: number;
  reason: string;
  status: "pending" | "completed" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    uid: { type: String, required: true, index: true },
    messageId: { type: String, required: true },
    threadId: { type: String, required: true },
    subject: { type: String, required: true },
    from: { type: String, required: true },
    scheduledAt: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "completed", "dismissed"], default: "pending" },
  },
  { timestamps: true }
);

export const FollowUp = mongoose.models.FollowUp || mongoose.model<IFollowUp>("FollowUp", FollowUpSchema);
