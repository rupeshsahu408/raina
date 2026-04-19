export type LedgerQuantityUnit = "qtl" | "kg" | "ton";
export type LedgerNumberFormat = "english" | "hindi";
export type LedgerLanguage = "english" | "hindi" | "mixed";
export type LedgerInputMode = "image" | "manual" | "mixed";

export type LedgerBusinessProfile = {
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
  isComplete?: boolean;
};

export const defaultLedgerProfile: LedgerBusinessProfile = {
  businessName: "",
  ownerName: "",
  gstNumber: "",
  location: "",
  businessType: "grain_trader",
  preferences: {
    quantityUnit: "qtl",
    numberFormat: "english",
    language: "mixed",
    inputMode: "mixed",
  },
  isComplete: false,
};

const hindiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

const labels: Record<string, { english: string; hindi: string; mixed: string }> = {
  smartLedger: { english: "Smart Ledger", hindi: "स्मार्ट लेजर", mixed: "Smart Ledger" },
  dashboard: { english: "Dashboard", hindi: "डैशबोर्ड", mixed: "Dashboard / डैशबोर्ड" },
  uploadSatti: { english: "Upload your satti", hindi: "अपनी सट्टी अपलोड करें", mixed: "Upload satti / सट्टी अपलोड करें" },
  businessSummary: { english: "Business Summary Timeline", hindi: "व्यापार सारांश टाइमलाइन", mixed: "Business Summary / व्यापार सारांश" },
  dailyEntries: { english: "Daily Entries", hindi: "दैनिक एंट्री", mixed: "Daily Entries / दैनिक एंट्री" },
  monthlySummary: { english: "Monthly Summary", hindi: "मासिक सारांश", mixed: "Monthly Summary / मासिक सारांश" },
  yearlySummary: { english: "Yearly Summary", hindi: "वार्षिक सारांश", mixed: "Yearly Summary / वार्षिक सारांश" },
  totalQuantity: { english: "Total Quantity", hindi: "कुल मात्रा", mixed: "Total Quantity / कुल मात्रा" },
  totalPayment: { english: "Total Payment", hindi: "कुल भुगतान", mixed: "Total Payment / कुल भुगतान" },
  settings: { english: "Business Settings", hindi: "व्यापार सेटिंग्स", mixed: "Business Settings / व्यापार सेटिंग्स" },
  manualEntry: { english: "Type satti manually", hindi: "सट्टी मैन्युअली लिखें", mixed: "Manual entry / मैन्युअल एंट्री" },
};

const commodityHindi: Record<string, string> = {
  wheat: "गेहूं",
  gehu: "गेहूं",
  गेहू: "गेहूं",
  गेहूं: "गेहूं",
  rice: "चावल",
  chawal: "चावल",
  चावल: "चावल",
  mustard: "सरसों",
  sarson: "सरसों",
  सरसों: "सरसों",
  maize: "मक्का",
  makka: "मक्का",
  मक्का: "मक्का",
  chana: "चना",
  चना: "चना",
  soybean: "सोयाबीन",
  सोयाबीन: "सोयाबीन",
};

export function formatLedgerNumber(value: number | string, format: LedgerNumberFormat = "english") {
  const formatted = typeof value === "number" ? Number(value).toLocaleString("en-IN") : String(value);
  if (format !== "hindi") return formatted;
  return formatted.replace(/\d/g, (digit) => hindiDigits[Number(digit)] || digit);
}

export function convertFromQuintal(quantity: number, unit: LedgerQuantityUnit = "qtl") {
  const value = Number(quantity) || 0;
  if (unit === "kg") return value * 100;
  if (unit === "ton") return value / 10;
  return value;
}

export function formatLedgerQuantity(quantityInQtl: number, profile?: LedgerBusinessProfile) {
  const unit = profile?.preferences.quantityUnit || "qtl";
  const converted = convertFromQuintal(quantityInQtl, unit);
  const rounded = Math.round(converted * 100) / 100;
  const unitLabel = unit === "qtl" ? "qtl" : unit;
  return `${formatLedgerNumber(rounded, profile?.preferences.numberFormat)} ${unitLabel}`;
}

export function formatLedgerCurrency(amount: number, profile?: LedgerBusinessProfile) {
  return `₹${formatLedgerNumber(Math.round((Number(amount) || 0) * 100) / 100, profile?.preferences.numberFormat)}`;
}

export function ledgerLabel(key: keyof typeof labels, profile?: LedgerBusinessProfile) {
  const language = profile?.preferences.language || "mixed";
  return labels[key]?.[language] || labels[key]?.mixed || key;
}

export function formatCommodityName(name: string, profile?: LedgerBusinessProfile) {
  const language = profile?.preferences.language || "mixed";
  const clean = name || "Unknown";
  const hindi = commodityHindi[clean.toLowerCase()] || commodityHindi[clean] || clean;
  if (language === "hindi") return hindi;
  if (language === "mixed" && hindi !== clean) return `${clean} / ${hindi}`;
  return clean;
}