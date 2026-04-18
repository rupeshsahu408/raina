import mongoose, { Document, Schema } from "mongoose";

export interface IRecruitCompanyProfile extends Document {
  uid: string;
  companyName: string;
  companyType: string;
  industry: string;
  companySize: string;
  website: string;
  location: string;
  description: string;
  mission: string;
  benefits: string;
  linkedinUrl: string;
  logoUrl: string;
  verificationStatus: "none" | "requested" | "verified" | "rejected";
  verificationRequestedAt?: Date;
  verificationNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecruitCompanyProfileSchema = new Schema<IRecruitCompanyProfile>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    companyName: { type: String, default: "" },
    companyType: { type: String, default: "" },
    industry: { type: String, default: "" },
    companySize: { type: String, default: "" },
    website: { type: String, default: "" },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    mission: { type: String, default: "" },
    benefits: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    verificationStatus: { type: String, enum: ["none", "requested", "verified", "rejected"], default: "none" },
    verificationRequestedAt: { type: Date },
    verificationNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export const RecruitCompanyProfile =
  mongoose.models.RecruitCompanyProfile ||
  mongoose.model<IRecruitCompanyProfile>("RecruitCompanyProfile", RecruitCompanyProfileSchema);
