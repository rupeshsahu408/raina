import mongoose, { Schema, Document } from "mongoose";

export interface IIbaraBot extends Document {
  siteId: string;
  userId: string;
  businessName: string;
  businessType: string;
  location: string;
  workingHours: string;
  services: string;
  knowledgeBase: string;
  tone: "professional" | "friendly";
  language: "english" | "hindi" | "hinglish";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IbaraBotSchema = new Schema<IIbaraBot>(
  {
    siteId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    businessName: { type: String, default: "" },
    businessType: { type: String, default: "" },
    location: { type: String, default: "" },
    workingHours: { type: String, default: "" },
    services: { type: String, default: "" },
    knowledgeBase: { type: String, default: "" },
    tone: { type: String, enum: ["professional", "friendly"], default: "professional" },
    language: { type: String, enum: ["english", "hindi", "hinglish"], default: "english" },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const IbaraBot = mongoose.model<IIbaraBot>("IbaraBot", IbaraBotSchema);
