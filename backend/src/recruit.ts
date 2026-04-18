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

// Synonym table: maps common alternate forms → canonical lowercase term.
// Both sides of every tier-match comparison are normalized through this,
// so "React.js" in a rubric always matches "React" from AI output, etc.
const TERM_SYNONYMS: Record<string, string> = {
  // JavaScript ecosystem
  "js": "javascript", "ts": "typescript",
  "react.js": "react", "reactjs": "react",
  "vue.js": "vue", "vuejs": "vue",
  "angular.js": "angular", "angularjs": "angular",
  "next.js": "next", "nextjs": "next",
  "nuxt.js": "nuxt", "nuxtjs": "nuxt",
  "node.js": "node", "nodejs": "node",
  "express.js": "express", "expressjs": "express",
  // APIs
  "rest api": "api", "restful api": "api", "rest apis": "api",
  "api integration": "api", "api development": "api",
  "graphql api": "graphql",
  // Databases
  "postgresql": "postgres", "mongo db": "mongodb", "mongo": "mongodb",
  "ms sql": "sql", "mssql": "sql", "mysql": "sql",
  // Cloud
  "amazon web services": "aws", "amazon aws": "aws",
  "google cloud platform": "gcp", "google cloud": "gcp",
  "microsoft azure": "azure",
  // AI / ML
  "machine learning": "ml", "artificial intelligence": "ai",
  "natural language processing": "nlp", "deep learning": "dl",
  // Mobile
  "react native": "react-native",
  "ios development": "ios", "android development": "android",
  // General skills
  "communication skills": "communication",
  "leadership skills": "leadership",
  "problem solving": "problem-solving",
  "problem-solving skills": "problem-solving",
  "project management": "pm", "product management": "pm",
  "ci/cd pipeline": "ci/cd", "continuous integration": "ci/cd",
};

function normalizeTerm(name: string): string {
  const lower = name.toLowerCase().trim();
  return TERM_SYNONYMS[lower] ?? lower;
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

function extractNameFromResume(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines.slice(0, 6)) {
    if (line.length < 60 && /^[A-Z][a-zA-Z]+([\s'-][A-Z][a-zA-Z]+)+$/.test(line)) {
      return line;
    }
  }
  for (const line of lines.slice(0, 6)) {
    if (line.length < 60 && /^[A-Za-z]+([\s'-][A-Za-z]+)+$/.test(line) && !/[@:\/\d]/.test(line)) {
      return line;
    }
  }
  return "Candidate";
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
  scoringFailed: boolean;
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

THREE-TIER SCORING WEIGHTS — apply this framework to every criterion:

TIER 1 — Must-Have Skills (accounts for 60% of the total score weight):
These are the core technical skills, domain knowledge, or mandatory qualifications stated in the job description. Score these strictly but fairly:
- Clearly demonstrated → 85–100% of that criterion's points
- Partially demonstrated or strongly implied by related experience → 60–75%
- Minimal or indirect evidence → 40–55%
- Genuinely absent with no reasonable inference → 20–35% (not zero — they got through to screening)

TIER 2 — Experience Depth (accounts for 25% of the total score weight):
This covers years of experience, seniority, scope of work, leadership, or complexity of past projects. Score based on actual evidence:
- Exceeds expectations for the level → 85–100%
- Meets expectations with solid history → 65–80%
- Slightly below expected level or years → 45–60%
- Significantly under-experienced → 25–40%

TIER 3 — Nice-to-Have Skills (accounts for 15% of the total score weight):
These are bonus qualifications, secondary tools, or preferred (not required) skills. Be generous here — do NOT penalize heavily for missing these:
- Present and demonstrated → 80–100%
- Implied or related equivalent present → 60–75%
- Absent entirely → 45–60% (this is a bonus category, not a dealbreaker)

SCORE CALIBRATION — your final score across all criteria should land roughly here:
- Strong candidate: most required skills present, solid experience → 70–85%
- Good mid-level candidate: relevant background, minor gaps → 55–70%
- Junior or partial-fit candidate → 40–55%
- Clearly unqualified → below 40%

Classify each rubric criterion into one of the three tiers above based on its name and description, then score accordingly. When in doubt about a tier, treat it as Tier 1.
Do NOT penalise for skills that are plausibly implied by the candidate's role history or industry background.

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

CONFIDENCE DEFINITIONS — set one per criterion:
- "high": Strong, explicit evidence in resume (named skill, titled role, direct achievement)
- "medium": Partial or inferred evidence (related role, implied skill, adjacent experience)
- "low": Weak or unclear signal (thin mention, assumed from context, no direct evidence)

Respond with ONLY this JSON (no markdown, no extra text):
{"name":"full name","email":"email or empty string","aiSummary":"specific 2-3 sentence summary","strengths":["concrete strength 1","concrete strength 2","concrete strength 3"],"redFlags":["only genuine red flags — omit this array or leave empty if none"],"scoreBreakdown":[{"criterion":"exact name from rubric","score":28,"maxScore":35,"reasoning":"one sentence citing specific resume evidence","confidence":"medium","tier":1}]}

For "tier": classify each criterion as 1 (must-have skill), 2 (experience depth), or 3 (nice-to-have), matching the THREE-TIER SCORING WEIGHTS defined above.`;

  const raw = await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 2000,
  });

  const parsed = safeJson(raw);
  if (!parsed) {
    const rubricMaxScore = args.rubric.reduce((sum, r) => sum + r.weight, 0) || 100;
    const extractedName = extractNameFromResume(args.resumeText);
    console.error("[recruit] scoreCandidate: AI returned unparseable response. Raw output (first 500 chars):", raw?.slice(0, 500));
    return {
      name: extractedName,
      email: "",
      totalScore: 0,
      maxScore: rubricMaxScore,
      scoreBreakdown: [],
      aiSummary: "",
      redFlags: [],
      strengths: [],
      scoringFailed: true,
    };
  }

  const validConfidence = (v: any): "high" | "medium" | "low" =>
    v === "high" || v === "low" ? v : "medium";

  // Build deterministic tier map from rubric weights (60 / 25 / 15 split).
  // Criteria are sorted by weight descending; we accumulate until each
  // threshold is reached. This enforces the highest-weight criteria are
  // always Tier 1, regardless of what the AI classified them as.
  const totalRubricWeight = args.rubric.reduce((sum, r) => sum + r.weight, 0);
  const sortedRubric = [...args.rubric].sort((a, b) => b.weight - a.weight);
  // Store both raw and synonym-normalized keys so either form matches.
  const rubricTierMap = new Map<string, 1 | 2 | 3>();
  let accumulated = 0;
  for (const r of sortedRubric) {
    accumulated += r.weight;
    const pct = totalRubricWeight > 0 ? accumulated / totalRubricWeight : 1;
    const tier: 1 | 2 | 3 = pct <= 0.60 ? 1 : pct <= 0.85 ? 2 : 3;
    const raw = r.name.toLowerCase().trim();
    rubricTierMap.set(raw, tier);
    rubricTierMap.set(normalizeTerm(raw), tier); // also store canonical form
  }

  const resolveTier = (criterionName: string, aiTier: any): 1 | 2 | 3 => {
    const raw = (criterionName ?? "").toLowerCase().trim();
    const normalized = normalizeTerm(raw);

    // 1. Exact match on raw name
    if (rubricTierMap.has(raw)) return rubricTierMap.get(raw)!;
    // 2. Exact match on normalized name (catches React → react.js, JS → javascript, etc.)
    if (rubricTierMap.has(normalized)) return rubricTierMap.get(normalized)!;
    // 3. Partial match — normalized criterion substring of a normalized rubric key or vice versa
    for (const [rubricKey, tier] of rubricTierMap) {
      const normRubric = normalizeTerm(rubricKey);
      if (normalized.includes(normRubric) || normRubric.includes(normalized)) return tier;
    }
    // 4. AI fallback — validated integer only
    const n = Number(aiTier);
    return n === 1 || n === 2 || n === 3 ? n : 1;
  };

  const breakdown = (parsed.scoreBreakdown ?? []).map((b: any) => ({
    criterion: b.criterion ?? "",
    score: Number(b.score) || 0,
    maxScore: Number(b.maxScore) || 10,
    reasoning: (b.reasoning ?? "").trim(),
    confidence: validConfidence(b.confidence),
    tier: resolveTier(b.criterion, b.tier),
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
    name: (parsed.name?.trim() || extractNameFromResume(args.resumeText)),
    email: parsed.email ?? "",
    totalScore,
    maxScore,
    scoreBreakdown: breakdown,
    aiSummary: (parsed.aiSummary ?? "").trim(),
    redFlags,
    strengths,
    scoringFailed: false,
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

    const { source } = req.body;

    // AI Memory: check if this email has applied before under same recruiter
    let previousApplication: {
      jobTitle: string;
      stage: string;
      totalScore: number;
      maxScore: number;
      rejectedAt: Date;
      aiSummary: string;
    } | null = null;

    if (scored.email) {
      const prev = await RecruitCandidate.findOne({
        uid,
        email: scored.email,
        stage: { $in: ["rejected", "hired"] },
      })
        .populate<{ jobId: { title: string } }>("jobId", "title")
        .sort({ updatedAt: -1 })
        .lean() as any;

      if (prev) {
        previousApplication = {
          jobTitle: (prev.jobId as any)?.title ?? "a previous role",
          stage: prev.stage,
          totalScore: prev.totalScore,
          maxScore: prev.maxScore,
          rejectedAt: prev.updatedAt,
          aiSummary: prev.aiSummary,
        };
      }
    }

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
      scoringFailed: scored.scoringFailed,
      source: source || "",
    });

    await RecruitJob.updateOne({ _id: job._id }, { $inc: { candidateCount: 1 } });

    return res.json({ candidate, previousApplication });
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
    const allowed = ["stage", "notes", "source", "gender", "ageRange", "inTalentPool", "talentPoolNote"];
    const update: any = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    if (update.stage) {
      update.stageMovedAt = new Date();
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

recruitRouter.post("/jobs/:jobId/candidates/:candidateId/retry-score", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const job = await RecruitJob.findOne({ _id: req.params.jobId, uid }).lean();
    if (!job) return res.status(404).json({ error: "Job not found." });

    const candidate = await RecruitCandidate.findOne({ _id: req.params.candidateId, jobId: req.params.jobId, uid });
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });

    const scored = await scoreCandidate({
      resumeText: candidate.resumeText,
      jobTitle: job.title,
      rubric: job.rubric,
    });

    candidate.name = scored.name;
    candidate.email = scored.email || candidate.email;
    candidate.totalScore = scored.totalScore;
    candidate.maxScore = scored.maxScore;
    candidate.scoreBreakdown = scored.scoreBreakdown as any;
    candidate.aiSummary = scored.aiSummary;
    candidate.redFlags = scored.redFlags;
    candidate.strengths = scored.strengths;
    candidate.scoringFailed = scored.scoringFailed;
    if (!candidate.scoringFailed) {
      candidate.previousResumeScore = scored.totalScore;
    }
    await candidate.save();

    return res.json({ candidate });
  } catch (err: any) {
    console.error("[recruit] POST /retry-score", err);
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

// ─── Analytics ──────────────────────────────────────────────────────────────

recruitRouter.get("/analytics", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);

    const [jobs, allCandidates] = await Promise.all([
      RecruitJob.find({ uid }).lean(),
      RecruitCandidate.find({ uid }).lean(),
    ]);

    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === "active").length;
    const totalCandidates = allCandidates.length;

    // Stage funnel (all candidates across all jobs)
    const STAGES = ["applied", "screened", "assessed", "interview", "offer", "hired", "rejected"] as const;
    const stageCounts: Record<string, number> = {};
    for (const s of STAGES) stageCounts[s] = 0;
    for (const c of allCandidates) {
      if (stageCounts[c.stage] !== undefined) stageCounts[c.stage]++;
    }

    // Drop-off rates: % who made it through each stage (excluding rejected)
    const activeStages = STAGES.filter(s => s !== "rejected");
    const funnelDropoff = activeStages.map((stage, i) => {
      const count = stageCounts[stage] || 0;
      const dropoffPct = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
      return { stage, count, dropoffPct };
    });

    // Average time-to-hire (job createdAt → first hired candidate updatedAt)
    const avgTimeToHireMs: number[] = [];
    for (const job of jobs) {
      const hired = allCandidates.filter(
        c => c.jobId.toString() === job._id.toString() && c.stage === "hired"
      );
      if (hired.length > 0) {
        const earliest = Math.min(...hired.map(c => new Date(c.updatedAt).getTime()));
        avgTimeToHireMs.push(earliest - new Date(job.createdAt).getTime());
      }
    }
    const avgTimeToHireDays = avgTimeToHireMs.length > 0
      ? Math.round(avgTimeToHireMs.reduce((a, b) => a + b, 0) / avgTimeToHireMs.length / 86400000)
      : null;

    // Source breakdown
    const sourceCounts: Record<string, number> = {};
    for (const c of allCandidates) {
      const src = c.source?.trim() || "Not specified";
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }
    const sourceBreakdown = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count, pct: Math.round((count / totalCandidates) * 100) }))
      .sort((a, b) => b.count - a.count);

    // Bias detection: gender & age distribution (from voluntarily provided data only)
    const genderCounts: Record<string, number> = {};
    const ageCounts: Record<string, number> = {};
    for (const c of allCandidates) {
      if (c.gender?.trim()) {
        const g = c.gender.trim().toLowerCase();
        genderCounts[g] = (genderCounts[g] || 0) + 1;
      }
      if (c.ageRange?.trim()) {
        const a = c.ageRange.trim();
        ageCounts[a] = (ageCounts[a] || 0) + 1;
      }
    }
    const totalWithGender = Object.values(genderCounts).reduce((a, b) => a + b, 0);
    const totalWithAge = Object.values(ageCounts).reduce((a, b) => a + b, 0);
    const genderBreakdown = Object.entries(genderCounts).map(([gender, count]) => ({
      gender, count, pct: totalWithGender > 0 ? Math.round((count / totalWithGender) * 100) : 0,
    }));
    const ageBreakdown = Object.entries(ageCounts).map(([ageRange, count]) => ({
      ageRange, count, pct: totalWithAge > 0 ? Math.round((count / totalWithAge) * 100) : 0,
    }));

    // Bias across stages: gender distribution per pipeline stage (for hired vs rejected comparison)
    const biasStageData: Record<string, Record<string, number>> = {};
    for (const c of allCandidates) {
      if (!c.gender?.trim()) continue;
      const g = c.gender.trim().toLowerCase();
      if (!biasStageData[c.stage]) biasStageData[c.stage] = {};
      biasStageData[c.stage][g] = (biasStageData[c.stage][g] || 0) + 1;
    }

    // Per-job stats
    const jobStats = jobs.map(job => {
      const jCandidates = allCandidates.filter(c => c.jobId.toString() === job._id.toString());
      const avgScore = jCandidates.length > 0
        ? Math.round(jCandidates.reduce((s, c) => s + (c.maxScore > 0 ? (c.totalScore / c.maxScore) * 100 : 0), 0) / jCandidates.length)
        : 0;
      const hired = jCandidates.filter(c => c.stage === "hired").length;
      const rejected = jCandidates.filter(c => c.stage === "rejected").length;
      return {
        jobId: job._id,
        title: job.title,
        department: job.department,
        status: job.status,
        totalCandidates: jCandidates.length,
        avgScorePct: avgScore,
        hired,
        rejected,
        createdAt: job.createdAt,
      };
    });

    return res.json({
      totalJobs,
      activeJobs,
      totalCandidates,
      stageCounts,
      funnelDropoff,
      avgTimeToHireDays,
      sourceBreakdown,
      genderBreakdown,
      ageBreakdown,
      biasStageData,
      jobStats,
    });
  } catch (err: any) {
    console.error("[recruit] GET /analytics", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── Talent Pool ─────────────────────────────────────────────────────────────

recruitRouter.get("/talent-pool", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);

    // Silver-medal candidates: rejected or not hired, but scored >= 55% OR manually added to pool
    const candidates = await RecruitCandidate.find({
      uid,
      $or: [
        { inTalentPool: true },
        {
          stage: "rejected",
          $expr: { $gte: [{ $divide: ["$totalScore", { $max: ["$maxScore", 1] }] }, 0.55] },
        },
      ],
    })
      .populate<{ jobId: { title: string; department: string; status: string } }>("jobId", "title department status")
      .sort({ totalScore: -1 })
      .lean();

    return res.json({ candidates });
  } catch (err: any) {
    console.error("[recruit] GET /talent-pool", err);
    return res.status(500).json({ error: err.message });
  }
});

recruitRouter.patch("/talent-pool/:candidateId", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const { inTalentPool, talentPoolNote } = req.body;
    const update: any = {};
    if (inTalentPool !== undefined) update.inTalentPool = inTalentPool;
    if (talentPoolNote !== undefined) update.talentPoolNote = talentPoolNote;
    const candidate = await RecruitCandidate.findOneAndUpdate(
      { _id: req.params.candidateId, uid },
      update,
      { new: true }
    ).lean();
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });
    return res.json({ candidate });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Offer Letter ─────────────────────────────────────────────────────────────

async function generateOfferLetter(args: {
  candidateName: string;
  jobTitle: string;
  department: string;
  location: string;
  workMode: string;
  seniority: string;
  startDate: string;
  salary: string;
  salaryCurrency: string;
  signingBonus?: string;
  benefits?: string;
  companyName?: string;
  hiringManagerName?: string;
}): Promise<string> {
  const prompt = `You are an expert HR professional. Write a professional, warm, and legally clear job offer letter.

DETAILS:
- Candidate Name: ${args.candidateName}
- Role: ${args.jobTitle}
- Department: ${args.department || "Not specified"}
- Location: ${args.location}
- Work Mode: ${args.workMode}
- Seniority: ${args.seniority}
- Start Date: ${args.startDate}
- Salary: ${args.salaryCurrency} ${args.salary} per year
${args.signingBonus ? `- Signing Bonus: ${args.signingBonus}` : ""}
${args.benefits ? `- Benefits / Perks: ${args.benefits}` : ""}
${args.companyName ? `- Company: ${args.companyName}` : ""}
${args.hiringManagerName ? `- Hiring Manager: ${args.hiringManagerName}` : ""}

Write a complete, ready-to-send offer letter that includes:
1. A warm congratulatory opening with the candidate's name and role
2. Job details: title, department, location, work mode, start date
3. Compensation: base salary${args.signingBonus ? ", signing bonus" : ""}${args.benefits ? ", key benefits" : ""}
4. At-will employment / standard employment terms statement (one paragraph)
5. A clear acceptance instruction (e.g., "Please confirm your acceptance by replying to this email or signing and returning this letter by [date 5 days from start date]")
6. A warm, encouraging close

FORMAT RULES:
- Write in plain text, no markdown headers or bullet points in the letter body
- Use professional but human language — not robotic legalese
- Keep it between 350–500 words
- Use proper letter formatting with spacing between sections
- If company name is not provided, use "the Company" as a placeholder
- End with a signature block for the hiring manager`;

  return await callNvidiaChatCompletions({
    apiKey: NVIDIA_API_KEY,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 900,
  });
}

recruitRouter.post("/jobs/:jobId/candidates/:candidateId/offer-letter", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const job = await RecruitJob.findOne({ _id: req.params.jobId, uid }).lean();
    if (!job) return res.status(404).json({ error: "Job not found." });

    const candidate = await RecruitCandidate.findOne({ _id: req.params.candidateId, jobId: req.params.jobId, uid });
    if (!candidate) return res.status(404).json({ error: "Candidate not found." });

    const {
      startDate, salary, salaryCurrency, signingBonus, benefits, companyName, hiringManagerName, regenerate,
    } = req.body;

    if (!startDate || !salary) {
      return res.status(400).json({ error: "Start date and salary are required." });
    }

    // Use cached version unless regenerate is requested
    if (candidate.offerLetter && !regenerate) {
      return res.json({ offerLetter: candidate.offerLetter });
    }

    const letter = await generateOfferLetter({
      candidateName: candidate.name,
      jobTitle: job.title,
      department: job.department,
      location: job.location,
      workMode: job.workMode,
      seniority: job.seniority,
      startDate,
      salary,
      salaryCurrency: salaryCurrency || job.salaryCurrency || "INR",
      signingBonus,
      benefits,
      companyName,
      hiringManagerName,
    });

    candidate.offerLetter = letter;
    await candidate.save();

    return res.json({ offerLetter: letter });
  } catch (err: any) {
    console.error("[recruit] POST /offer-letter", err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── Export ───────────────────────────────────────────────────────────────────

recruitRouter.get("/jobs/:jobId/export", async (req, res) => {
  try {
    await connectMongo();
    const uid = getUid(req);
    const job = await RecruitJob.findOne({ _id: req.params.jobId, uid }).lean();
    if (!job) return res.status(404).json({ error: "Job not found." });

    const candidates = await RecruitCandidate.find({ jobId: req.params.jobId, uid })
      .sort({ totalScore: -1 })
      .lean();

    const format = (req.query.format as string) || "csv";

    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${job.title.replace(/[^a-z0-9]/gi, "_")}_candidates.json"`);
      return res.json(candidates.map(c => ({
        name: c.name,
        email: c.email,
        phone: c.phone || "",
        stage: c.stage,
        score: c.totalScore,
        maxScore: c.maxScore,
        scorePct: c.maxScore > 0 ? Math.round((c.totalScore / c.maxScore) * 100) : 0,
        hiringDecision: c.hiringDecision || "",
        assessmentStatus: c.assessmentStatus,
        source: c.source || "",
        redFlags: c.redFlags.join("; "),
        strengths: c.strengths.join("; "),
        aiSummary: c.aiSummary,
        notes: c.notes || "",
        addedAt: c.createdAt,
      })));
    }

    // CSV export
    const escape = (val: string | number | undefined) => {
      const s = String(val ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const headers = ["Name", "Email", "Phone", "Stage", "Score", "Max Score", "Score %", "Hiring Decision", "Assessment Status", "Source", "Red Flags", "Strengths", "AI Summary", "Notes", "Added At"];
    const rows = candidates.map(c => [
      c.name,
      c.email,
      c.phone || "",
      c.stage,
      c.totalScore,
      c.maxScore,
      c.maxScore > 0 ? Math.round((c.totalScore / c.maxScore) * 100) : 0,
      c.hiringDecision || "",
      c.assessmentStatus,
      c.source || "",
      c.redFlags.join("; "),
      c.strengths.join("; "),
      c.aiSummary,
      c.notes || "",
      new Date(c.createdAt).toISOString(),
    ].map(escape).join(","));

    const csv = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${job.title.replace(/[^a-z0-9]/gi, "_")}_candidates.csv"`);
    return res.send(csv);
  } catch (err: any) {
    console.error("[recruit] GET /export", err);
    return res.status(500).json({ error: err.message });
  }
});
