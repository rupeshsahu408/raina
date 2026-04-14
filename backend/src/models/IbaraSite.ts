import mongoose, { Schema, Document } from "mongoose";

export interface IIbaraSite extends Document {
  userId: string;
  domain: string;
  verificationToken: string;
  verificationStatus: "pending" | "verified" | "failed";
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IbaraSiteSchema = new Schema<IIbaraSite>(
  {
    userId: { type: String, required: true, index: true },
    domain: { type: String, required: true },
    verificationToken: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed"],
      default: "pending",
    },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

IbaraSiteSchema.index({ userId: 1, domain: 1 }, { unique: true });

export const IbaraSite = mongoose.model<IIbaraSite>("IbaraSite", IbaraSiteSchema);
