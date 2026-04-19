import mongoose, { Schema, Document } from "mongoose";

export type LedgerQuantityUnit = "qtl" | "kg" | "ton";
export type LedgerNumberFormat = "english" | "hindi";
export type LedgerLanguage = "english" | "hindi" | "mixed";
export type LedgerInputMode = "image" | "manual" | "mixed";

export interface ILedgerBusinessProfile extends Document {
  uid: string;
  businessName: string;
  ownerName: string;
  gstNumber: string;
  location: string;
  businessType: string;
  preferences: {
    quantityUnit: LedgerQuantityUnit;
    numberFormat: LedgerNumberFormat;
    language: LedgerLanguage;
    inputMode: LedgerInputMode;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LedgerBusinessProfileSchema = new Schema<ILedgerBusinessProfile>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    businessName: { type: String, default: "" },
    ownerName: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    location: { type: String, default: "" },
    businessType: { type: String, default: "grain_trader" },
    preferences: {
      quantityUnit: { type: String, enum: ["qtl", "kg", "ton"], default: "qtl" },
      numberFormat: { type: String, enum: ["english", "hindi"], default: "english" },
      language: { type: String, enum: ["english", "hindi", "mixed"], default: "mixed" },
      inputMode: { type: String, enum: ["image", "manual", "mixed"], default: "mixed" },
    },
  },
  { timestamps: true }
);

export const LedgerBusinessProfile =
  mongoose.models.LedgerBusinessProfile ||
  mongoose.model<ILedgerBusinessProfile>("LedgerBusinessProfile", LedgerBusinessProfileSchema);