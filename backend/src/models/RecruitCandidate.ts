import mongoose, { Document, Schema } from "mongoose";

export type CandidateStage =
  | "applied"
  | "screened"
  | "assessed"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export interface IScoreBreakdown {
  criterion: string;
  score: number;
  maxScore: number;
  reasoning: string;
}

export interface IRecruitCandidate extends Document {
  jobId: mongoose.Types.ObjectId;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  resumeText: string;
  totalScore: number;
  maxScore: number;
  scoreBreakdown: IScoreBreakdown[];
  aiSummary: string;
  redFlags: string[];
  strengths: string[];
  stage: CandidateStage;
  notes: string;
  interviewBrief: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScoreBreakdownSchema = new Schema<IScoreBreakdown>(
  {
    criterion: { type: String, required: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    reasoning: { type: String, required: true },
  },
  { _id: false }
);

const RecruitCandidateSchema = new Schema<IRecruitCandidate>(
  {
    jobId: { type: Schema.Types.ObjectId, required: true, ref: "RecruitJob", index: true },
    uid: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String },
    resumeText: { type: String, required: true },
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 100 },
    scoreBreakdown: { type: [ScoreBreakdownSchema], default: [] },
    aiSummary: { type: String, default: "" },
    redFlags: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    stage: {
      type: String,
      enum: ["applied", "screened", "assessed", "interview", "offer", "hired", "rejected"],
      default: "applied",
    },
    notes: { type: String, default: "" },
    interviewBrief: { type: String, default: "" },
  },
  { timestamps: true }
);

export const RecruitCandidate =
  mongoose.models.RecruitCandidate ||
  mongoose.model<IRecruitCandidate>("RecruitCandidate", RecruitCandidateSchema);
