import mongoose, { Document, Schema } from "mongoose";

export interface IInboxToken extends Document {
  uid: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  createdAt: Date;
  updatedAt: Date;
}

const InboxTokenSchema = new Schema<IInboxToken>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Number, required: true },
  },
  { timestamps: true }
);

export const InboxToken = mongoose.models.InboxToken || mongoose.model<IInboxToken>("InboxToken", InboxTokenSchema);
