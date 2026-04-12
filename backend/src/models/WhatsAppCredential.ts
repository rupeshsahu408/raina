import mongoose from "mongoose";

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
  createdAt: Date;
  updatedAt: Date;
}

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
  },
  { timestamps: true }
);

export const WhatsAppCredential = mongoose.model<WhatsAppCredentialDoc>(
  "WhatsAppCredential",
  WhatsAppCredentialSchema
);