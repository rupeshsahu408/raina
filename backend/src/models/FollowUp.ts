import mongoose, { Document, Schema } from "mongoose";

export interface IFollowUp extends Document {
  uid: string;
  messageId: string;
  threadId: string;
  subject: string;
  from: string;
  scheduledAt: number;
  reason: string;
  intent: "Sales" | "Support" | "General";
  confidence: "low" | "medium" | "high";
  tag: "Urgent" | "Sales" | "Waiting" | "General";
  status: "pending" | "completed" | "dismissed";
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    uid: { type: String, required: true, index: true },
    messageId: { type: String, required: true },
    threadId: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    from: { type: String, required: true },
    scheduledAt: { type: Number, required: true },
    reason: { type: String, required: true },
    intent: { type: String, enum: ["Sales", "Support", "General"], default: "General" },
    confidence: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    tag: { type: String, enum: ["Urgent", "Sales", "Waiting", "General"], default: "General" },
    status: { type: String, enum: ["pending", "completed", "dismissed"], default: "pending" },
  },
  { timestamps: true }
);

export const FollowUp = mongoose.models.FollowUp || mongoose.model<IFollowUp>("FollowUp", FollowUpSchema);
