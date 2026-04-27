import mongoose from "mongoose";

export interface QualitySnapshot {
  at: Date;
  qualityRating: string | null;
  messagingTier: string | null;
}

export interface WhatsAppCredentialDoc {
  businessId: string;
  apiTokenEncrypted: string;
  phoneNumberId: string;
  verifyTokenEncrypted: string;
  tokenLast4?: string | null;
  connected: boolean;
  lastTestAt?: Date | null;
  lastError?: string | null;
  provider: "manual" | "oauth-ready";
  lastQualityRating?: string | null;
  lastMessagingTier?: string | null;
  lastHealthCheckAt?: Date | null;
  qualityHistory?: QualitySnapshot[];
  createdAt: Date;
  updatedAt: Date;
}

const QualitySnapshotSchema = new mongoose.Schema<QualitySnapshot>(
  {
    at: { type: Date, default: Date.now },
    qualityRating: { type: String, default: null },
    messagingTier: { type: String, default: null },
  },
  { _id: false }
);

const WhatsAppCredentialSchema = new mongoose.Schema<WhatsAppCredentialDoc>(
  {
    businessId: { type: String, required: true, unique: true, index: true },
    apiTokenEncrypted: { type: String, required: true },
    phoneNumberId: { type: String, required: true },
    verifyTokenEncrypted: { type: String, required: true },
    tokenLast4: { type: String, default: null },
    connected: { type: Boolean, default: false, index: true },
    lastTestAt: { type: Date, default: null },
    lastError: { type: String, default: null },
    provider: { type: String, enum: ["manual", "oauth-ready"], default: "manual" },
    lastQualityRating: { type: String, default: null },
    lastMessagingTier: { type: String, default: null },
    lastHealthCheckAt: { type: Date, default: null },
    qualityHistory: { type: [QualitySnapshotSchema], default: [] },
  },
  { timestamps: true }
);

export const WhatsAppCredential = mongoose.model<WhatsAppCredentialDoc>(
  "WhatsAppCredential",
  WhatsAppCredentialSchema
);
