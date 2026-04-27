import mongoose from "mongoose";

export type WhatsAppDeliveryStatus = "sent" | "failed" | "pending";

export interface WhatsAppChatLogDoc {
  businessId: string;
  from: string;
  customerName?: string | null;
  customerMessage: string;
  aiReply: string;
  language?: string | null;
  source: "preview" | "whatsapp";
  deliveryStatus?: WhatsAppDeliveryStatus;
  deliveryError?: string | null;
  whatsappMessageId?: string | null;
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
    deliveryStatus: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
      index: true,
    },
    deliveryError: { type: String, default: null },
    whatsappMessageId: { type: String, default: null, index: true },
  },
  { timestamps: { updatedAt: false } }
);

WhatsAppChatLogSchema.index({ businessId: 1, createdAt: -1 });

export const WhatsAppChatLog = mongoose.model<WhatsAppChatLogDoc>(
  "WhatsAppChatLog",
  WhatsAppChatLogSchema
);
