import express from "express";
import { connectMongo } from "./db";
import { UsageEvent } from "./models/UsageEvent";
import { RecruitJob } from "./models/RecruitJob";
import { RecruitCandidate } from "./models/RecruitCandidate";

export const trackingPublicRouter = express.Router();
export const trackingAdminRouter = express.Router();

const ALLOWED_EVENTS = new Set([
  "opportunity_viewed",
  "opportunity_list_viewed",
  "filter_used",
  "apply_clicked",
  "application_submitted",
  "job_saved",
  "job_unsaved",
  "job_alert_created",
  "niche_viewed",
  "search_performed",
  "profile_viewed",
  "profile_updated",
  "recruiter_job_posted",
  "recruiter_candidate_added",
  "recruiter_stage_changed",
  "recruiter_export_csv",
  "recruiter_profile_viewed",
  "recruiter_offer_letter_generated",
  "recruiter_rejection_email_generated",
  "recently_viewed_job",
  "resume_upload_attempted",
]);

trackingPublicRouter.post("/", async (req, res) => {
  try {
    const { event, uid, sessionId, data } = req.body ?? {};

    if (typeof event !== "string" || !ALLOWED_EVENTS.has(event)) {
      return res.status(400).json({ error: "Unknown or missing event type." });
    }

    await connectMongo();

    UsageEvent.create({
      event,
      uid: uid ?? undefined,
      sessionId: sessionId ?? undefined,
      data: data ?? {},
    }).catch(() => {});

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to record event." });
  }
});

trackingAdminRouter.get("/events", async (req, res) => {
  try {
    await connectMongo();

    const { event: filterEvent, uid: filterUid, days = "30", limit = "200" } = req.query;

    const since = new Date(Date.now() - Number(days) * 86400000);
    const filter: Record<string, unknown> = { createdAt: { $gte: since } };
    if (filterEvent) filter.event = filterEvent;
    if (filterUid) filter.uid = filterUid;

    const events = await UsageEvent.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit), 1000))
      .lean();

    return res.json({ events });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch events." });
  }
});

trackingAdminRouter.get("/summary", async (req, res) => {
  try {
    await connectMongo();

    const { days = "30" } = req.query;
    const since = new Date(Date.now() - Number(days) * 86400000);

    const [eventCounts, topNiches, topJobs] = await Promise.all([
      UsageEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$event", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      UsageEvent.aggregate([
        { $match: { event: "niche_viewed", createdAt: { $gte: since } } },
        { $group: { _id: "$data.niche", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      UsageEvent.aggregate([
        { $match: { event: "opportunity_viewed", createdAt: { $gte: since } } },
        { $group: { _id: "$data.jobId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const topFilters = await UsageEvent.aggregate([
      { $match: { event: "filter_used", createdAt: { $gte: since } } },
      { $group: { _id: "$data.filter", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const uniqueUsers = await UsageEvent.distinct("uid", {
      createdAt: { $gte: since },
      uid: { $exists: true, $ne: null },
    });

    return res.json({
      periodDays: Number(days),
      uniqueUsers: uniqueUsers.length,
      eventCounts: Object.fromEntries(eventCounts.map((e: any) => [e._id, e.count])),
      topNiches: topNiches.map((n: any) => ({ niche: n._id, count: n.count })),
      topJobs: topJobs.map((j: any) => ({ jobId: j._id, count: j.count })),
      topFilters: topFilters.map((f: any) => ({ filter: f._id, count: f.count })),
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch summary." });
  }
});

trackingAdminRouter.get("/recruiter-signals", async (req, res) => {
  try {
    await connectMongo();

    const { days = "30" } = req.query;
    const since = new Date(Date.now() - Number(days) * 86400000);

    const [recruiterEvents, conversionCandidates] = await Promise.all([
      UsageEvent.aggregate([
        {
          $match: {
            event: { $in: ["recruiter_job_posted", "recruiter_candidate_added", "recruiter_stage_changed", "recruiter_export_csv"] },
            createdAt: { $gte: since },
          },
        },
        { $group: { _id: { event: "$event", uid: "$uid" }, count: { $sum: 1 } } },
        { $sort: { "_id.event": 1 } },
      ]),
      RecruitCandidate.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$stage", count: { $sum: 1 } } },
      ]),
    ]);

    const stageBreakdown: Record<string, number> = {};
    for (const s of conversionCandidates as Array<{ _id: string; count: number }>) {
      stageBreakdown[s._id] = s.count;
    }

    return res.json({
      periodDays: Number(days),
      recruiterEvents,
      candidateStageBreakdown: stageBreakdown,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch recruiter signals." });
  }
});
