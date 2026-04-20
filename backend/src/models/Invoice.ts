import mongoose, { Schema, Document } from "mongoose";

export interface InvoiceDoc extends Document {
  uid: string;
  source: "upload" | "gmail";
  status: "processing" | "extracted" | "pending_approval" | "approved" | "rejected";
  originalFileName?: string;
  gmailMessageId?: string;
  fileUrl?: string;
  rawText?: string;

  vendor?: string;
  vendorEmail?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  lineItems?: Array<{ description: string; quantity?: number; unitPrice?: number; amount?: number }>;
  notes?: string;
  confidence?: number;

  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  paymentAmount?: number;
  paymentDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema({
  description: String,
  quantity: Number,
  unitPrice: Number,
  amount: Number,
}, { _id: false });

const InvoiceSchema = new Schema<InvoiceDoc>(
  {
    uid: { type: String, required: true, index: true },
    source: { type: String, enum: ["upload", "gmail"], required: true },
    status: {
      type: String,
      enum: ["processing", "extracted", "pending_approval", "approved", "rejected"],
      default: "processing",
    },
    originalFileName: String,
    gmailMessageId: String,
    fileUrl: String,
    rawText: String,

    vendor: String,
    vendorEmail: String,
    invoiceNumber: String,
    invoiceDate: String,
    dueDate: String,
    currency: { type: String, default: "USD" },
    subtotal: Number,
    tax: Number,
    total: Number,
    lineItems: [LineItemSchema],
    notes: String,
    confidence: Number,

    approvedAt: Date,
    approvedBy: String,
    rejectedAt: Date,
    rejectionReason: String,
    paymentAmount: Number,
    paymentDate: Date,
  },
  { timestamps: true }
);

export const Invoice =
  mongoose.models.Invoice || mongoose.model<InvoiceDoc>("Invoice", InvoiceSchema);
