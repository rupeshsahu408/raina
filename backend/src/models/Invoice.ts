import mongoose, { Schema, Document } from "mongoose";

export interface InvoiceFlag {
  type: "duplicate" | "new_vendor" | "amount_anomaly" | "missing_fields" | "overdue_risk";
  severity: "info" | "warning" | "critical";
  message: string;
  relatedInvoiceId?: string;
}

export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  accountType?: string;
}

export interface InvoiceDoc extends Document {
  uid: string;
  source: "upload" | "gmail";
  status: "processing" | "extracted" | "pending_approval" | "approved" | "rejected" | "paid";
  originalFileName?: string;
  originalMimeType?: string;
  originalFileData?: string;
  gmailMessageId?: string;
  fileUrl?: string;
  rawText?: string;

  vendor?: string;
  vendorEmail?: string;
  vendorAddress?: string;
  supplierGstin?: string;

  buyerName?: string;
  buyerEmail?: string;
  buyerAddress?: string;
  buyerGstin?: string;

  invoiceNumber?: string;
  poNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  currency?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  discount?: number;
  lineItems?: Array<{
    description: string;
    hsnCode?: string;
    quantity?: number;
    unitPrice?: number;
    gstPercent?: number;
    amount?: number;
  }>;
  notes?: string;
  bankDetails?: BankDetails;
  confidence?: number;

  flags?: InvoiceFlag[];
  analysedAt?: Date;
  isNewVendor?: boolean;
  approvalRuleId?: string;
  approvalRuleName?: string;
  assignedApproverEmail?: string;
  assignedApproverName?: string;
  approvalTrail?: Array<{ action: string; actorUid?: string; actorEmail?: string; note?: string; at: Date }>;
  comments?: Array<{ id: string; body: string; authorUid?: string; authorEmail?: string; createdAt: Date }>;

  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  paidAt?: Date;
  paymentAmount?: number;
  paymentDate?: Date;
  paidNote?: string;

  emailLog?: Array<{
    type: string;
    to: string;
    subject: string;
    sentAt: Date;
    sentBy?: string;
    previewHtml?: string;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

const FlagSchema = new Schema<InvoiceFlag>(
  {
    type: { type: String, enum: ["duplicate", "new_vendor", "amount_anomaly", "missing_fields", "overdue_risk"] },
    severity: { type: String, enum: ["info", "warning", "critical"] },
    message: String,
    relatedInvoiceId: String,
  },
  { _id: false }
);

const LineItemSchema = new Schema(
  {
    description: String,
    hsnCode: String,
    quantity: Number,
    unitPrice: Number,
    gstPercent: Number,
    amount: Number,
  },
  { _id: false }
);

const BankDetailsSchema = new Schema(
  {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    accountType: String,
  },
  { _id: false }
);

const InvoiceSchema = new Schema<InvoiceDoc>(
  {
    uid: { type: String, required: true, index: true },
    source: { type: String, enum: ["upload", "gmail"], required: true },
    status: {
      type: String,
      enum: ["processing", "extracted", "pending_approval", "approved", "rejected", "paid"],
      default: "processing",
    },
    originalFileName: String,
    originalMimeType: String,
    originalFileData: String,
    gmailMessageId: String,
    fileUrl: String,
    rawText: String,

    vendor: String,
    vendorEmail: String,
    vendorAddress: String,
    supplierGstin: String,

    buyerName: String,
    buyerEmail: String,
    buyerAddress: String,
    buyerGstin: String,

    invoiceNumber: String,
    poNumber: String,
    invoiceDate: String,
    dueDate: String,
    currency: String,
    subtotal: Number,
    tax: Number,
    total: Number,
    discount: Number,
    lineItems: [LineItemSchema],
    notes: String,
    bankDetails: BankDetailsSchema,
    confidence: Number,

    flags: [FlagSchema],
    analysedAt: Date,
    isNewVendor: Boolean,
    approvalRuleId: String,
    approvalRuleName: String,
    assignedApproverEmail: String,
    assignedApproverName: String,
    approvalTrail: [
      {
        action: String,
        actorUid: String,
        actorEmail: String,
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],
    comments: [
      {
        id: String,
        body: String,
        authorUid: String,
        authorEmail: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    approvedAt: Date,
    approvedBy: String,
    rejectedAt: Date,
    rejectionReason: String,
    paidAt: Date,
    paymentAmount: Number,
    paymentDate: Date,
    paidNote: String,

    emailLog: [
      {
        type: String,
        to: String,
        subject: String,
        sentAt: { type: Date, default: Date.now },
        sentBy: String,
        previewHtml: String,
      },
    ],
  },
  { timestamps: true }
);

export const Invoice =
  mongoose.models.Invoice || mongoose.model<InvoiceDoc>("Invoice", InvoiceSchema);
