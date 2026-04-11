import mongoose from "mongoose";

export interface WhatsAppChatLogDoc {
  businessId: string;
  from: string;
  customerName?: string | null;
  customerMessage: string;
  aiReply: string;
  language?: string | null;
  source: "preview" | "whatsapp";
  createdAt: Date;
}

const WhatsAppChatLogSchema = new mongoose.Schema<WhatsAppChatLogDoc>(
  {
    businessId: { type: String, required: true, index: true },
    from: { type: String, required: true, index: true },
    customerName: { type: String, default: null },
    customerMessage: { type: String, required: true },
    aiReply: { type: String, required: true },
    language: { type: String, default: null, index: true },
    source: { type: String, enum: ["preview", "whatsapp"], default: "whatsapp", index: true },
  },
  { timestamps: { updatedAt: false } }
);

WhatsAppChatLogSchema.index({ businessId: 1, createdAt: -1 });

export const WhatsAppChatLog = mongoose.model<WhatsAppChatLogDoc>(
  "WhatsAppChatLog",
  WhatsAppChatLogSchema
);