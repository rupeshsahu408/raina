import mongoose from "mongoose";

export type WhatsAppTone = "friendly" | "professional";
export type WhatsAppLanguageMode = "auto" | "english" | "hindi" | "hinglish";

export interface WhatsAppBusinessProfileDoc {
  businessId: string;
  businessName: string;
  businessType: string;
  workingHours?: string | null;
  location?: string | null;
  services?: string | null;
  knowledgeBook?: string | null;
  tone: WhatsAppTone;
  languageMode: WhatsAppLanguageMode;
  autoReplyEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppBusinessProfileSchema = new mongoose.Schema<WhatsAppBusinessProfileDoc>(
  {
    businessId: { type: String, required: true, unique: true, index: true },
    businessName: { type: String, required: true, default: "Business" },
    businessType: { type: String, required: true, default: "Business" },
    workingHours: { type: String, default: null },
    location: { type: String, default: null },
    services: { type: String, default: null },
    knowledgeBook: { type: String, default: null },
    tone: { type: String, enum: ["friendly", "professional"], default: "professional" },
    languageMode: { type: String, enum: ["auto", "english", "hindi", "hinglish"], default: "auto" },
    autoReplyEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const WhatsAppBusinessProfile = mongoose.model<WhatsAppBusinessProfileDoc>(
  "WhatsAppBusinessProfile",
  WhatsAppBusinessProfileSchema
);