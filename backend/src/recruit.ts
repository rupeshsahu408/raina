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
  const attempts = [
    () => JSON.parse(text),
    () => {
      const m = text.match(/```json\s*([\s\S]*?)```/);
      return m ? JSON.parse(m[1]) : null;
    },
    () => {
      const m = text.match(/```\s*([\s\S]*?)```/);
      return m ? JSON.parse(m[1]) : null;
    },
    () => {
      const m = text.match(/(\{[\s\S]*\})/);
      return m ? JSON.parse(m[1]) : null;
    },
  ];
  for (const attempt of attempts) {
    try {
      const result = attempt();
      if (result !== null) return result;
    } catch { /* try next */ }
  }
  return null;
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

  const prompt = `You are a seasoned technical recruiter screening a candidate for the role of "${args.jobTitle}". Evaluate the resume below using the rubric provided.

SCORING RUBRIC:
${rubricText}

RESUME:
${args.resumeText.slice(0, 4000)}

---

SCORING PHILOSOPHY — read carefully before scoring:

Think like a human recruiter presenting this candidate to a hiring manager. Your job is to give a fair, calibrated assessment — not to find reasons to reject.

SCORE CALIBRATION:
- A candidate with solid, relevant experience and most required skills: 70–85%
- A decent mid-level candidate with relevant background but some gaps: 55–70%
- A junior candidate or someone with partial fit: 40–55%
- Clearly unqualified or completely irrelevant background: below 40%
- Do NOT give below 50% of a criterion's points just because the resume doesn't explicitly mention it — infer from context and related experience
- If someone has 3+ years in a closely related role, they likely have adjacent skills even if unstated

RED FLAG RULES — only flag these specific situations:
1. An unexplained employment gap of 2 or more years
2. Zero relevant skills or experience for a role that requires specific technical expertise
3. A clear mismatch between claimed seniority and actual experience (e.g., "10 years experience" with only 2 jobs totaling 3 years)
4. Applying for a role that requires a specific license/certification they demonstrably don't have
DO NOT flag: short tenures at startups, fewer years than ideal, missing one nice-to-have skill, career pivots, non-linear paths, or anything that requires assumption

SUMMARY RULES:
- Open with their current/most recent title and company (or field of work)
- Name 2–3 specific, concrete skills or achievements from the resume
- End with one sentence on how they fit (or don't fit) this specific role
- Write it as you'd say it to a hiring manager — direct, specific, no filler phrases like "strong candidate" or "well-rounded"

Respond with ONLY this JSON (no markdown, no extra text):
{"name":"full name","email":"email or empty string","aiSummary":"specific 2-3 sentence summary","strengths":["concrete strength 1","concrete strength 2","concrete strength 3"],"redFlags":["only genuine red flags — omit this array or leave empty if none"],"scoreBreakdown":[{"criterion":"exact name from rubric","score":28,"maxScore":35,"reasoning":"one sentence citing specific resume evidence"}]}`;

  const raw = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 1600,
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
    reasoning: (b.reasoning ?? "").trim(),
  })).filter((b: any) => b.criterion.length > 0);

  const totalScore = breakdown.reduce((sum: number, b: any) => sum + b.score, 0);
  const maxScore = breakdown.reduce((sum: number, b: any) => sum + b.maxScore, 0) || 100;

  const redFlags = Array.isArray(parsed.redFlags)
    ? parsed.redFlags.filter((f: unknown) => typeof f === "string" && f.trim().length > 0)
    : [];

  const strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths.filter((s: unknown) => typeof s === "string" && s.trim().length > 0)
    : [];

  return {
    name: parsed.name ?? "Unknown Candidate",
    email: parsed.email ?? "",
    totalScore,
    maxScore,
    scoreBreakdown: breakdown,
    aiSummary: (parsed.aiSummary ?? "").trim(),
    redFlags,
    strengths,
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
    .map((r, i) => `${i + 1}. ${r.name} (${r.weight} pts): ${r.description}`)
    .join("\n");

  const prompt = `You are a senior hiring manager at a fast-growing company. Generate exactly 5 written assessment questions for a candidate applying to be a ${args.jobTitle}.

SCORING RUBRIC (your questions must each probe a different criterion):
${rubricText}

JOB DESCRIPTION EXCERPT:
${args.jd.slice(0, 1200)}

STRICT REQUIREMENTS:
- Every question MUST be specific to the ${args.jobTitle} role — no generic questions
- Questions must require 2-4 paragraph written answers based on real experience
- Each question tests a DIFFERENT rubric criterion (match question 1 to criterion 1, etc.)
- Questions should reveal: depth of expertise, problem-solving, communication quality, judgment
- Do NOT ask trivial, yes/no, or easily-Googled questions
- Start each question with "Tell us about a time...", "Describe how you...", "Walk us through...", or "How would you approach..."

Respond with ONLY this exact JSON structure, no markdown, no extra text:
{"questions":[{"id":"q1","text":"..."},{"id":"q2","text":"..."},{"id":"q3","text":"..."},{"id":"q4","text":"..."},{"id":"q5","text":"..."}]}`;

  const raw = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 1200,
  });

  const parsed = safeJson(raw);
  if (parsed && Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
    return parsed.questions.slice(0, 5).map((q: any, i: number) => ({
      id: q.id ?? `q${i + 1}`,
      text: (q.text ?? "").trim(),
    })).filter((q: { id: string; text: string }) => q.text.length > 10);
  }

  return [
    { id: "q1", text: `Describe a challenging technical problem you solved in a previous ${args.jobTitle} role. What was the situation, what actions did you take, and what was the measurable outcome?` },
    { id: "q2", text: `Walk us through a project where you had to work across teams or stakeholders with competing priorities. How did you navigate it and what did you learn?` },
    { id: "q3", text: `Tell us about a time you had to rapidly learn a new skill or technology under a tight deadline. How did you approach it and what was the result?` },
    { id: "q4", text: `Describe a situation where your initial approach to a problem was wrong. How did you identify it, course-correct, and what did you do differently afterward?` },
    { id: "q5", text: `As a ${args.jobTitle}, how would you approach your first 90 days — what would you prioritize, how would you measure early success, and what concerns would you flag to your manager?` },
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
    .map((r) => `- ${r.name} (${r.weight} pts): ${r.description}`)
    .join("\n");

  const resumePct = args.maxScore > 0 ? Math.round((args.resumeScore / args.maxScore) * 100) : 0;

  const qaText = args.questions.map((q, i) => {
    const ans = args.answers.find((a) => a.questionId === q.id);
    const timeTaken = ans?.timeTakenSeconds ?? 0;
    const answerText = ans?.answer?.trim() ?? "";
    const wordCount = answerText.split(/\s+/).filter(Boolean).length;
    const warnings: string[] = [];
    if (timeTaken > 0 && timeTaken < 25) warnings.push("⚠ Answered in under 25 seconds — possible copy-paste or very brief effort");
    if (wordCount < 20 && answerText.length > 0) warnings.push("⚠ Very short answer (fewer than 20 words)");
    if (answerText.length === 0) warnings.push("⚠ No answer provided");
    const warningLine = warnings.length > 0 ? `\n[${warnings.join("; ")}]` : "";
    return `Q${i + 1}: ${q.text}\nAnswer: ${answerText || "(blank)"}${warningLine}`;
  }).join("\n\n---\n\n");

  const prompt = `You are a senior talent acquisition specialist. Evaluate the written assessment responses below for the ${args.jobTitle} role.

CANDIDATE: ${args.candidateName}
RESUME SCORE: ${resumePct}% (${args.resumeScore}/${args.maxScore} points)
RESUME SUMMARY: ${args.resumeSummary}

SCORING RUBRIC:
${rubricText}

ASSESSMENT RESPONSES:
${qaText}

Your task: Combine the resume quality (${resumePct}%) with the assessment quality to produce a final combined score.

SCORING GUIDANCE:
- If assessment answers are EXCELLENT (specific, detailed, clearly experienced): raise score up to +15 points from resume
- If answers MATCH the resume quality (solid, relevant): keep score within ±5 points of resume
- If answers are WEAK (vague, generic, very short, copy-paste signals): lower score by 10-20 points
- If answers are COMPLETELY EMPTY or nonsensical: lower score by 20-30 points

Respond with ONLY this JSON (no markdown, no extra text):
{"combinedScorePercent":72,"hiringDecision":"maybe","impact":{"strengths":["strength from assessment","another strength"],"weaknesses":["weakness if any"],"reasoning":"2-3 sentences explaining what the assessment revealed and why the score changed"}}

Rules:
- combinedScorePercent: integer 0-100 (the final combined score as a percentage, informed by BOTH resume and assessment)
- hiringDecision: "strong_yes" if ≥78%, "maybe" if 55-77%, "no" if <55%
- strengths: 2-4 specific, concrete observations from the actual answers (quote or reference what they said)
- weaknesses: 0-3 genuine concerns (if none, use empty array)
- reasoning: specific explanation of what the assessment revealed that the resume did not show`;

  const raw = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.25,
    max_tokens: 700,
  });

  const parsed = safeJson(raw);

  const combinedPct = typeof parsed?.combinedScorePercent === "number"
    ? Math.max(0, Math.min(100, parsed.combinedScorePercent))
    : resumePct;

  const newTotalScore = Math.round((combinedPct / 100) * args.maxScore);

  const hiringDecision: "strong_yes" | "maybe" | "no" =
    parsed?.hiringDecision === "strong_yes" || parsed?.hiringDecision === "maybe" || parsed?.hiringDecision === "no"
      ? parsed.hiringDecision
      : combinedPct >= 78 ? "strong_yes" : combinedPct >= 55 ? "maybe" : "no";

  const strengths = Array.isArray(parsed?.impact?.strengths)
    ? parsed.impact.strengths.filter((s: unknown) => typeof s === "string" && s.trim().length > 0)
    : [];
  const weaknesses = Array.isArray(parsed?.impact?.weaknesses)
    ? parsed.impact.weaknesses.filter((w: unknown) => typeof w === "string" && w.trim().length > 0)
    : [];
  const reasoning = typeof parsed?.impact?.reasoning === "string" && parsed.impact.reasoning.trim().length > 0
    ? parsed.impact.reasoning
    : `Assessment completed. Final combined score: ${combinedPct}%.`;

  return {
    newTotalScore,
    hiringDecision,
    impact: { strengths, weaknesses, reasoning },
  };
}

async function generateRejectionEmail(args: {
  candidateName: string;
  jobTitle: string;
  stage: string;
}): Promise<string> {
  const stageContext: Record<string, string> = {
    applied: "after reviewing their application",
    screened: "after an initial review of their profile",
    assessed: "after reviewing their written assessment",
    interview: "after the interview stage",
    offer: "after careful consideration of the offer stage",
  };
  const context = stageContext[args.stage] ?? "after careful consideration";

  const prompt = `Write a rejection email for a job candidate. The email should feel human, warm, and genuinely respectful — not a corporate template.

Candidate first name: ${args.candidateName.split(" ")[0]}
Role: ${args.jobTitle}
Stage: ${context}

Write the email body only (no subject line). Follow this structure:
1. Open with their first name and a warm, specific acknowledgment of their interest in the ${args.jobTitle} role
2. Deliver the news clearly but kindly in one sentence — do not be vague or overly corporate
3. Offer one genuine, positive observation (e.g., "We were impressed by your background in X" or "It was clear you put genuine thought into your application")
4. Close with encouragement — keep the door open for future roles, wish them well
5. End with a warm sign-off

TONE RULES:
- Sound like a real person wrote this, not an HR bot
- Avoid clichés: "we regret to inform", "we had many strong candidates", "we'll keep your resume on file"
- Use contractions naturally (we're, we've, you've)
- Keep it under 200 words
- Do not use bullet points or formal headers`;

  const email = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.75,
    max_tokens: 350,
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
