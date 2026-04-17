import mongoose, { Document, Schema } from "mongoose";

export interface IRubricCriteria {
  name: string;
  weight: number;
  description: string;
}

export interface IRecruitJob extends Document {
  uid: string;
  title: string;
  department: string;
  seniority: string;
  location: string;
  workMode: "remote" | "onsite" | "hybrid";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  responsibilities: string;
  mustHaveSkills: string;
  niceToHaveSkills: string;
  generatedJD: string;
  rubric: IRubricCriteria[];
  status: "active" | "paused" | "closed";
  candidateCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RubricCriteriaSchema = new Schema<IRubricCriteria>(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const RecruitJobSchema = new Schema<IRecruitJob>(
  {
    uid: { type: String, required: true, index: true },
    title: { type: String, required: true },
    department: { type: String, default: "" },
    seniority: { type: String, default: "Mid-level" },
    location: { type: String, default: "Remote" },
    workMode: { type: String, enum: ["remote", "onsite", "hybrid"], default: "remote" },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, default: "INR" },
    responsibilities: { type: String, default: "" },
    mustHaveSkills: { type: String, default: "" },
    niceToHaveSkills: { type: String, default: "" },
    generatedJD: { type: String, default: "" },
    rubric: { type: [RubricCriteriaSchema], default: [] },
    status: { type: String, enum: ["active", "paused", "closed"], default: "active" },
    candidateCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const RecruitJob =
  mongoose.models.RecruitJob ||
  mongoose.model<IRecruitJob>("RecruitJob", RecruitJobSchema);
