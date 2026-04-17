import express from "express";
import crypto from "crypto";
import { connectMongo } from "./db";
import { RecruitJob } from "./models/RecruitJob";
import { RecruitCandidate } from "./models/RecruitCandidate";
import { callNvidiaChatCompletions } from "./ai/nvidiaClient";

export const recruitRouter = express.Router();
export const recruitPublicRouter = express.Router();

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY ?? "";
const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://www.plyndrox.app";

function getUid(req: express.Request): string {
  return (req as any).user?.uid ?? "";
}

function safeJson(text: string): any {
  try {
    const match = text.match(/```json\s*([\s\S]*?)```/) ||
      text.match(/```\s*([\s\S]*?)```/) ||
      text.match(/(\{[\s\S]*\})/);
    return JSON.parse(match ? match[1] : text);
  } catch {
    return null;
  }
}

function generateToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

async function generateJobDescription(args: {
  title: string;
  department: string;
  seniority: string;
  location: string;
  workMode: string;
  responsibilities: string;
  mustHaveSkills: string;
  niceToHaveSkills: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
}): Promise<{ jd: string; rubric: { name: string; weight: number; description: string }[] }> {
  const salary =
    args.salaryMin && args.salaryMax
      ? `${args.salaryCurrency} ${args.salaryMin.toLocaleString()} – ${args.salaryMax.toLocaleString()} per year`
      : "Competitive (not disclosed)";

  const prompt = `You are an expert HR professional and talent acquisition specialist. Generate a comprehensive, professional, bias-reduced job description and candidate scoring rubric.

INPUT:
- Role Title: ${args.title}
- Department: ${args.department || "Not specified"}
- Seniority: ${args.seniority}
- Location: ${args.location}
- Work Mode: ${args.workMode}
- Key Responsibilities: ${args.responsibilities}
- Must-Have Skills: ${args.mustHaveSkills}
- Nice-to-Have Skills: ${args.niceToHaveSkills}
- Compensation: ${salary}

OUTPUT FORMAT (respond with valid JSON only, no markdown):
{
  "jd": "Full job description as a well-formatted string with sections: About the Role, What You'll Do, What We're Looking For, Nice to Have, What We Offer",
  "rubric": [
    {
      "name": "criterion name (e.g. Core Technical Skills)",
      "weight": 30,
      "description": "What a 5/5 candidate looks like for this criterion vs a 1/5 candidate"
    }
  ]
}

Rules for the JD:
- Write in a welcoming, inclusive tone
- Avoid gendered language and unnecessary degree requirements
- Focus on impact and outcomes, not just tasks
- Make responsibilities specific and actionable
- Keep total length between 400-600 words

Rules for the rubric:
- Create 4-6 criteria that together sum to 100 weight points
- Each criterion should be clearly differentiated and measurable
- Include: core skills, experience depth, communication/culture fit, role-specific competency
- Descriptions should guide a non-expert reviewer`;

  const raw = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    max_tokens: 2000,
  });

  const parsed = safeJson(raw);
  if (!parsed || !parsed.jd || !Array.isArray(parsed.rubric)) {
    return {
      jd: raw,
      rubric: [
        { name: "Core Skills", weight: 40, description: "Proficiency in the must-have technical skills listed for this role." },
        { name: "Relevant Experience", weight: 30, description: "Years and quality of experience directly relevant to this role." },
        { name: "Communication & Culture Fit", weight: 20, description: "Clarity of expression, professionalism, and alignment with team values." },
        { name: "Growth & Initiative", weight: 10, description: "Evidence of self-driven learning, side projects, or career progression." },
      ],
    };
  }
  return { jd: parsed.jd, rubric: parsed.rubric };
}

async function scoreCandidate(args: {
  resumeText: string;
  jobTitle: string;
  rubric: { name: string; weight: number; description: string }[];
}): Promise<{
  name: string;
  email: string;
  totalScore: number;
  maxScore: number;
  scoreBreakdown: { criterion: string; score: number; maxScore: number; reasoning: string }[];
  aiSummary: string;
  redFlags: string[];
  strengths: string[];
}> {
  const rubricText = args.rubric
    .map((r) => `- ${r.name} (max ${r.weight} pts): ${r.description}`)
    .join("\n");

  const prompt = `You are a senior recruiter with 15 years of experience. Analyze the following resume for the role of "${args.jobTitle}" using the provided scoring rubric.

SCORING RUBRIC:
${rubricText}

RESUME TEXT:
${args.resumeText.slice(0, 4000)}

Respond with valid JSON only (no markdown):
{
  "name": "candidate's full name extracted from resume",
  "email": "email address extracted from resume or empty string",
  "aiSummary": "2-3 sentence professional summary of this candidate for this role",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "redFlags": ["red flag 1 if any", "red flag 2 if any"],
  "scoreBreakdown": [
    {
      "criterion": "exact criterion name from rubric",
      "score": 25,
      "maxScore": 40,
      "reasoning": "specific one-sentence reasoning for this score based on resume evidence"
    }
  ]
}

Rules:
- Score each rubric criterion fairly based only on evidence in the resume
- Be specific in reasoning — reference actual resume content
- Red flags should be genuine concerns, not minor issues
- Strengths should be concrete evidence-based observations
- If a criterion has no evidence, score it low but explain why`;

  const raw = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1500,
  });

  const parsed = safeJson(raw);
  if (!parsed) {
    return {
      name: "Unknown Candidate",
      email: "",
      totalScore: 0,
      maxScore: 100,
      scoreBreakdown: [],
      aiSummary: "AI scoring failed. Please review the resume manually.",
      redFlags: [],
      strengths: [],
    };
  }

  const breakdown = (parsed.scoreBreakdown ?? []).map((b: any) => ({
    criterion: b.criterion ?? "",
    score: Number(b.score) || 0,
    maxScore: Number(b.maxScore) || 10,
    reasoning: b.reasoning ?? "",
  }));

  const totalScore = breakdown.reduce((sum: number, b: any) => sum + b.score, 0);
  const maxScore = breakdown.reduce((sum: number, b: any) => sum + b.maxScore, 0) || 100;

  return {
    name: parsed.name ?? "Unknown Candidate",
    email: parsed.email ?? "",
    totalScore,
    maxScore,
    scoreBreakdown: breakdown,
    aiSummary: parsed.aiSummary ?? "",
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
  };
}

async function generateInterviewBrief(args: {
  candidateName: string;
  jobTitle: string;
  resumeText: string;
  aiSummary: string;
  redFlags: string[];
  scoreBreakdown: { criterion: string; score: number; maxScore: number; reasoning: string }[];
}): Promise<string> {
  const lowScores = args.scoreBreakdown
    .filter((b) => b.score / b.maxScore < 0.6)
    .map((b) => `${b.criterion}: ${b.reasoning}`)
    .join("; ");

  const prompt = `You are a senior talent acquisition specialist. Write a concise interview preparation brief for the interviewer.

Candidate: ${args.candidateName}
Role: ${args.jobTitle}
AI Summary: ${args.aiSummary}
Red Flags: ${args.redFlags.join(", ") || "None identified"}
Weak Areas: ${lowScores || "None"}

Write a practical interview brief (250-350 words) covering:
1. Quick candidate summary (2 sentences)
2. 3-4 specific probing questions tailored to their weak areas or red flags
3. 2-3 skills or claims to verify with concrete examples
4. Overall hiring recommendation (Strong Yes / Yes / Maybe / No) with one-sentence reasoning

Write in plain text, no JSON, no markdown headers.`;

  const brief = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 600,
  });

  return brief;
}

async function generateAssessmentQuestions(args: {
  jobTitle: string;
  rubric: { name: string; weight: number; description: string }[];
  jd: string;
}): Promise<{ id: string; text: string }[]> {
  const rubricText = args.rubric
    .map((r) => `- ${r.name}: ${r.description}`)
    .join("\n");

  const prompt = `You are a senior hiring manager. Generate exactly 5 thoughtful, role-specific interview assessment questions for the following job.

Role: ${args.jobTitle}
Scoring Rubric:
${rubricText}

Job Description (excerpt):
${args.jd.slice(0, 1500)}

Rules:
- Questions must be open-ended and require substantive written answers (2-4 paragraphs)
- Each question should probe a different rubric criterion
- Questions should reveal critical thinking, real experience, and communication quality
- Avoid yes/no questions or trivial questions
- Make each question specific to this role, not generic

Respond with valid JSON only (no markdown):
{
  "questions": [
    { "id": "q1", "text": "question text here" },
    { "id": "q2", "text": "question text here" },
    { "id": "q3", "text": "question text here" },
    { "id": "q4", "text": "question text here" },
    { "id": "q5", "text": "question text here" }
  ]
}`;

  const raw = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    max_tokens: 1000,
  });

  const parsed = safeJson(raw);
  if (parsed && Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
    return parsed.questions.slice(0, 5).map((q: any, i: number) => ({
      id: q.id ?? `q${i + 1}`,
      text: q.text ?? "",
    }));
  }

  return [
    { id: "q1", text: `Describe a challenging project relevant to the ${args.jobTitle} role. What was your specific contribution and what was the outcome?` },
    { id: "q2", text: `What is your approach to solving complex problems in this domain? Walk us through a real example.` },
    { id: "q3", text: `How do you prioritize your work when handling multiple responsibilities at once? Give a specific situation.` },
    { id: "q4", text: `Tell us about a time you had to learn something quickly to deliver results. What was the skill and how did you apply it?` },
    { id: "q5", text: `Why are you the right fit for this ${args.jobTitle} role, and what would you focus on in your first 90 days?` },
  ];
}

async function analyzeAssessmentAnswers(args: {
  candidateName: string;
  jobTitle: string;
  rubric: { name: string; weight: number; description: string }[];
  questions: { id: string; text: string }[];
  answers: { questionId: string; answer: string; timeTakenSeconds: number }[];
  resumeScore: number;
  maxScore: number;
  resumeSummary: string;
}): Promise<{
  newTotalScore: number;
  hiringDecision: "strong_yes" | "maybe" | "no";
  impact: { strengths: string[]; weaknesses: string[]; reasoning: string };
}> {
  const rubricText = args.rubric
    .map((r) => `- ${r.name} (max ${r.weight} pts): ${r.description}`)
    .join("\n");

  const qaText = args.questions.map((q) => {
    const ans = args.answers.find((a) => a.questionId === q.id);
    const timeTaken = ans ? ans.timeTakenSeconds : 0;
    const speedFlag = timeTaken > 0 && timeTaken < 30 ? " [NOTE: Very fast response — possible copy-paste]" : "";
    return `Q: ${q.text}\nA: ${ans?.answer ?? "(No answer provided)"}${speedFlag}`;
  }).join("\n\n");

  const resumePct = args.maxScore > 0 ? Math.round((args.resumeScore / args.maxScore) * 100) : 0;

  const prompt = `You are a senior talent acquisition specialist evaluating a candidate's written assessment responses.

Candidate: ${args.candidateName}
Role: ${args.jobTitle}
Resume Score: ${args.resumeScore}/${args.maxScore} (${resumePct}%)
Resume Summary: ${args.resumeSummary}

Scoring Rubric:
${rubricText}

Assessment Q&A:
${qaText}

Evaluate the written responses holistically. Assess: communication clarity, depth of thinking, relevance of examples, alignment with rubric criteria, and any concerning signals.

Respond with valid JSON only (no markdown):
{
  "assessmentScoreAdjustment": 5,
  "hiringDecision": "strong_yes",
  "impact": {
    "strengths": ["strength 1 from assessment", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1 if any", "weakness 2 if any"],
    "reasoning": "2-3 sentence explanation of why the score changed and what the assessment revealed"
  }
}

Rules:
- assessmentScoreAdjustment: integer between -20 and +20 (how much to adjust the resume score based on assessment quality)
  - Strong answers that confirm or exceed resume claims: +10 to +20
  - Average answers that match resume: -5 to +5
  - Weak, vague, or suspiciously fast answers: -10 to -20
- hiringDecision must be one of: "strong_yes" (total score ≥75%), "maybe" (50-74%), "no" (<50%)
- strengths: 2-4 specific observations from the assessment answers
- weaknesses: 0-3 genuine concerns identified
- reasoning: explain what the assessment revealed beyond the resume`;

  const raw = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 800,
  });

  const parsed = safeJson(raw);
  const adjustment = parsed?.assessmentScoreAdjustment ?? 0;
  const rawNewScore = args.resumeScore + Math.round((adjustment / 100) * args.maxScore);
  const newTotalScore = Math.max(0, Math.min(args.maxScore, rawNewScore));
  const newPct = args.maxScore > 0 ? (newTotalScore / args.maxScore) * 100 : 0;

  const hiringDecision: "strong_yes" | "maybe" | "no" =
    parsed?.hiringDecision === "strong_yes" || parsed?.hiringDecision === "maybe" || parsed?.hiringDecision === "no"
      ? parsed.hiringDecision
      : newPct >= 75 ? "strong_yes" : newPct >= 50 ? "maybe" : "no";

  return {
    newTotalScore,
    hiringDecision,
    impact: {
      strengths: Array.isArray(parsed?.impact?.strengths) ? parsed.impact.strengths : [],
      weaknesses: Array.isArray(parsed?.impact?.weaknesses) ? parsed.impact.weaknesses : [],
      reasoning: parsed?.impact?.reasoning ?? "Assessment completed and score updated.",
    },
  };
}

async function generateRejectionEmail(args: {
  candidateName: string;
  jobTitle: string;
  companyName?: string;
  stage: string;
}): Promise<string> {
  const prompt = `You are an HR professional. Write a personalized, warm, and respectful rejection email for a job candidate.

Candidate Name: ${args.candidateName}
Role Applied For: ${args.jobTitle}
Company: ${args.companyName || "our company"}
Stage Rejected At: ${args.stage}

Requirements:
- Personalize it with their name and the role
- Be genuinely warm and encouraging — not corporate/cold
- Acknowledge their effort
- Leave the door open for future opportunities
- Keep it concise (3-4 short paragraphs)
- End with a professional closing

Write only the email body (no subject line), plain text.`;

  const email = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.65,
    max_tokens: 400,
  });

  return email;
}

recruitRouter.post("/jobs", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const {
      title, department, seniority, location, workMode,
      responsibilities, mustHaveSkills, niceToHaveSkills,
      salaryMin, salaryMax, salaryCurrency,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: "Job title is required." });

    const { jd, rubric } = await generateJobDescription({
      title, department: department || "", seniority: seniority || "Mid-level",
      location: location || "Remote", workMode: workMode || "remote",
      responsibilities: responsibilities || "", mustHaveSkills: mustHaveSkills || "",
      niceToHaveSkills: niceToHaveSkills || "",
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryCurrency: salaryCurrency || "INR",
    });

    const job = await RecruitJob.create({
      uid, title, department: department || "", seniority: seniority || "Mid-level",
      location: location || "Remote", workMode: workMode || "remote",
      responsibilities: responsibilities || "", mustHaveSkills: mustHaveSkills || "",
      niceToHaveSkills: niceToHaveSkills || "",
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      salaryCurrency: salaryCurrency || "INR",
      generatedJD: jd, rubric, status: "active", candidateCount: 0,
    });

    return res.json({ job });
  } catch (err: any) {
    console.error("[recruit] POST /jobs", err);
    return res.status(500).json({ error: err.message || "Failed to create job." });
  }
});

recruitRouter.get("/jobs", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const jobs = await RecruitJob.find({ uid }).sort({ createdAt: -1 }).lean();
    return res.json({ jobs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.get("/jobs/:jobId", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const job = await RecruitJob.findOne({ _id: req.params.jobId, uid }).lean();
    if (!job) return res.status(404).json({ error: "Job not found." });
    return res.json({ job });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.patch("/jobs/:jobId", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const allowed = ["status", "title", "department", "location", "workMode"];
    const update: any = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const job = await RecruitJob.findOneAndUpdate({ _id: req.params.jobId, uid }, update, { new: true }).lean();
    if (!job) return res.status(404).json({ error: "Job not found." });
    return res.json({ job });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.delete("/jobs/:jobId", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    await RecruitJob.deleteOne({ _id: req.params.jobId, uid });
    await RecruitCandidate.deleteMany({ jobId: req.params.jobId, uid });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.post("/jobs/:jobId/candidates", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const job = await RecruitJob.findOne({ _id: req.params.jobId, uid });
    if (!job) return res.status(404).json({ error: "Job not found." });

    const { resumeText } = req.body;
    if (!resumeText?.trim()) return res.status(400).json({ error: "Resume text is required." });

    const scored = await scoreCandidate({
      resumeText,
      jobTitle: job.title,
      rubric: job.rubric,
    });

    const candidate = await RecruitCandidate.create({
      jobId: job._id,
      uid,
      name: scored.name,
      email: scored.email,
      resumeText,
      totalScore: scored.totalScore,
      maxScore: scored.maxScore,
      scoreBreakdown: scored.scoreBreakdown,
      aiSummary: scored.aiSummary,
      redFlags: scored.redFlags,
      strengths: scored.strengths,
      stage: "applied",
      assessmentStatus: "not_sent",
      previousResumeScore: scored.totalScore,
    });

    await RecruitJob.updateOne({ _id: job._id }, { $inc: { candidateCount: 1 } });

    return res.json({ candidate });
  } catch (err: any) {
    console.error("[recruit] POST /candidates", err);
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.get("/jobs/:jobId/candidates", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const candidates = await RecruitCandidate.find({ jobId: req.params.jobId, uid })
      .sort({ totalScore: -1 })
      .lean();
    return res.json({ candidates });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.patch("/jobs/:jobId/candidates/:candidateId", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const allowed = ["stage", "notes"];
    const update: any = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const candidate = await RecruitCandidate.findOneAndUpdate(
      { _id: req.params.candidateId, jobId: req.params.jobId, uid },
      update,
      { new: true }
    ).lean();
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });
    return res.json({ candidate });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.post("/jobs/:jobId/candidates/:candidateId/brief", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const job = await RecruitJob.findOne({ _id: req.params.jobId, uid }).lean();
    if (!job) return res.status(404).json({ error: "Job not found." });

    const candidate = await RecruitCandidate.findOne({ _id: req.params.candidateId, jobId: req.params.jobId, uid });
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });

    if (candidate.interviewBrief) {
      return res.json({ brief: candidate.interviewBrief });
    }

    const brief = await generateInterviewBrief({
      candidateName: candidate.name,
      jobTitle: job.title,
      resumeText: candidate.resumeText,
      aiSummary: candidate.aiSummary,
      redFlags: candidate.redFlags,
      scoreBreakdown: candidate.scoreBreakdown,
    });

    candidate.interviewBrief = brief;
    await candidate.save();

    return res.json({ brief });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.delete("/jobs/:jobId/candidates/:candidateId", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const candidate = await RecruitCandidate.findOneAndDelete({ _id: req.params.candidateId, jobId: req.params.jobId, uid });
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });
    await RecruitJob.updateOne({ _id: req.params.jobId, uid }, { $inc: { candidateCount: -1 } });
    return res.json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.post("/jobs/:jobId/candidates/:candidateId/assessment/send", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const job = await RecruitJob.findOne({ _id: req.params.jobId, uid }).lean();
    if (!job) return res.status(404).json({ error: "Job not found." });

    const candidate = await RecruitCandidate.findOne({ _id: req.params.candidateId, jobId: req.params.jobId, uid });
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });

    if (candidate.assessmentStatus === "completed") {
      return res.status(400).json({ error: "Assessment already completed by candidate." });
    }

    const questions = await generateAssessmentQuestions({
      jobTitle: job.title,
      rubric: job.rubric,
      jd: job.generatedJD,
    });

    const token = generateToken();
    candidate.assessmentToken = token;
    candidate.assessmentQuestions = questions;
    candidate.assessmentStatus = "sent";
    candidate.assessmentSentAt = new Date();
    candidate.previousResumeScore = candidate.totalScore;
    await candidate.save();

    const assessmentUrl = `${FRONTEND_URL}/recruit/assessment/${token}`;

    return res.json({
      ok: true,
      assessmentUrl,
      questions,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
    });
  } catch (err: any) {
    console.error("[recruit] POST /assessment/send", err);
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.post("/jobs/:jobId/candidates/:candidateId/reject-email", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const job = await RecruitJob.findOne({ _id: req.params.jobId, uid }).lean();
    if (!job) return res.status(404).json({ error: "Job not found." });

    const candidate = await RecruitCandidate.findOne({ _id: req.params.candidateId, jobId: req.params.jobId, uid }).lean();
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });

    const email = await generateRejectionEmail({
      candidateName: candidate.name,
      jobTitle: job.title,
      stage: candidate.stage,
    });

    return res.json({ email, candidateName: candidate.name, candidateEmail: candidate.email });
  } catch (err: any) {
    console.error("[recruit] POST /reject-email", err);
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.post("/jobs/:jobId/candidates/:candidateId/reminder", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const candidate = await RecruitCandidate.findOne({ _id: req.params.candidateId, jobId: req.params.jobId, uid });
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });

    if (candidate.assessmentStatus !== "sent") {
      return res.status(400).json({ error: "Assessment not in pending state." });
    }

    candidate.assessmentReminderSentAt = new Date();
    await candidate.save();

    const assessmentUrl = `${FRONTEND_URL}/recruit/assessment/${candidate.assessmentToken}`;
    return res.json({ ok: true, assessmentUrl, candidateEmail: candidate.email });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

recruitPublicRouter.get("/assessment/:token", async (req, res) => {
  try {
    await connectMongo();
    const candidate = await RecruitCandidate.findOne({ assessmentToken: req.params.token })
      .select("name assessmentQuestions assessmentStatus assessmentCompletedAt jobId")
      .lean();

    if (!candidate) return res.status(404).json({ error: "Assessment not found." });
    if (candidate.assessmentStatus === "completed") {
      return res.json({ completed: true, candidateName: candidate.name });
    }

    const job = await RecruitJob.findById(candidate.jobId)
      .select("title department location workMode")
      .lean();

    return res.json({
      completed: false,
      candidateName: candidate.name,
      jobTitle: job?.title ?? "the role",
      jobDepartment: job?.department ?? "",
      jobLocation: job?.location ?? "",
      questions: candidate.assessmentQuestions,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

recruitPublicRouter.post("/assessment/:token/submit", async (req, res) => {
  try {
    await connectMongo();
    const candidate = await RecruitCandidate.findOne({ assessmentToken: req.params.token });
    if (!candidate) return res.status(404).json({ error: "Assessment not found." });
    if (candidate.assessmentStatus === "completed") {
      return res.status(400).json({ error: "Assessment already submitted." });
    }

    const { answers } = req.body as {
      answers: { questionId: string; answer: string; timeTakenSeconds: number }[];
    };

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Answers are required." });
    }

    const job = await RecruitJob.findById(candidate.jobId).lean();
    if (!job) return res.status(404).json({ error: "Job not found." });

    const result = await analyzeAssessmentAnswers({
      candidateName: candidate.name,
      jobTitle: job.title,
      rubric: job.rubric,
      questions: candidate.assessmentQuestions,
      answers,
      resumeScore: candidate.previousResumeScore || candidate.totalScore,
      maxScore: candidate.maxScore,
      resumeSummary: candidate.aiSummary,
    });

    candidate.assessmentAnswers = answers;
    candidate.assessmentStatus = "completed";
    candidate.assessmentCompletedAt = new Date();
    candidate.totalScore = result.newTotalScore;
    candidate.hiringDecision = result.hiringDecision;
    candidate.assessmentImpact = result.impact;
    candidate.stage = "assessed";
    await candidate.save();

    return res.json({ ok: true, message: "Assessment submitted successfully." });
  } catch (err: any) {
    console.error("[recruit] POST /assessment/submit", err);
    return res.status(500).json({ error: err.message });
  }
});
