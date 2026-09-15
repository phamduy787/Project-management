const { neon } = require("@neondatabase/serverless");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    const projectRows = await sql`
      SELECT *
      FROM projects
      ORDER BY project_number ASC, id ASC
    `;

    const meetingRows = await sql`
      SELECT *
      FROM meeting_minutes
      ORDER BY review_date DESC NULLS LAST, created_at DESC
    `;

    const projects = projectRows.map((p) => ({
      id: p.id,
      number: p.project_number,
      name: p.name,
      keyDriver: p.key_driver || "",
      factoryTarget: p.factory_target || "",
      targetValue: p.target_value || "",
      keyActivity: p.key_activity || "",
      leader: p.leader || "",
      department: p.department || "",
      supporter: p.supporter || "",
      teamMember: p.team_member || "",
      costSaving: p.cost_saving || "",
      costInvestment: p.cost_investment || "",
      charter: p.charter || "",
      charterCompleted: p.charter_completed || "",
      target2026: p.target_2026 || "",
      timing: p.timing || "",
      status: p.status || "",
      coach: p.coach || "",
      sponsor: p.sponsor || "",
      priority: p.priority || "",
      monthly: p.monthly || {},
      fyInitialVolume: p.fy_initial_volume || "",
      fyActualVolume: p.fy_actual_volume || "",
      fyInitialCost: p.fy_initial_cost || "",
      fyActualCost: p.fy_actual_cost || ""
      ,version: p.version || 1
    }));

    const meetings = meetingRows.map((m) => ({
      id: m.id,
      reviewDate: m.review_date || "",
      project: m.project_name || "",
      status: m.status || "",
      leader: m.leader || "",
      timing: m.timing || "",
      finishTime: m.finish_time || "",
      activities: m.activities || "",
      comment: m.comment || ""
      ,blocker: m.blocker || ""
      ,decision: m.decision || ""
      ,action: m.action || ""
      ,actionOwner: m.action_owner || ""
      ,dueDate: m.due_date ? String(m.due_date).slice(0, 10) : ""
      ,actionStatus: m.action_status || "Open"
      ,reviewState: m.review_state || "Reviewed"
      ,reviewedBy: m.reviewed_by || ""
      ,reviewedAt: m.reviewed_at || ""
      ,reviewMonth: m.review_month || ""
    }));

    response.setHeader("Cache-Control", "no-store");

    return response.status(200).json({
      source: "Neon Database",
      projects,
      meetings
    });
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      error: "Unable to load database",
      message: error.message
    });
  }
};
