import mongoose, { Schema, Document } from "mongoose";

export interface ILedgerSession extends Document {
  uid: string;
  rawText: string;
  entries: any[];
  grouped: Record<string, any>;
  summary: {
    totalEntries: number;
    totalQuantity: number;
    totalAmount: number;
    commodityCount: number;
    topCommodity: string;
    processingNote: string;
  };
  meta: {
    processedAt: string;
    fileSizeKb: number;
    mimeType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LedgerSessionSchema = new Schema<ILedgerSession>(
  {
    uid: { type: String, required: true, index: true },
    rawText: { type: String, default: "" },
    entries: { type: Schema.Types.Mixed, default: [] },
    grouped: { type: Schema.Types.Mixed, default: {} },
    summary: {
      totalEntries: { type: Number, default: 0 },
      totalQuantity: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      commodityCount: { type: Number, default: 0 },
      topCommodity: { type: String, default: "" },
      processingNote: { type: String, default: "" },
    },
    meta: {
      processedAt: { type: String, required: true },
      fileSizeKb: { type: Number, default: 0 },
      mimeType: { type: String },
    },
  },
  { timestamps: true }
);

export const LedgerSession =
  mongoose.models.LedgerSession ||
  mongoose.model<ILedgerSession>("LedgerSession", LedgerSessionSchema);
