const { neon } = require("@neondatabase/serverless");
const { isAuthorized } = require("../lib/auth");

const sql = neon(process.env.DATABASE_URL);

function formatDate(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function formatMeeting(m) {
  return {
    id: m.id,
    reviewDate: formatDate(m.review_date),
    projectId: m.project_id || "",
    project: m.project_name || "",
    status: m.status || "",
    leader: m.leader || "",
    timing: m.timing || "",
    finishTime: m.finish_time || "",
    activities: m.activities || "",
    comment: m.comment || ""
  };
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  try {
    if (request.method === "GET") {
      const rows = await sql`
        SELECT *
        FROM meeting_minutes
        ORDER BY review_date DESC NULLS LAST, created_at DESC
      `;

      return response.status(200).json({
        meetings: rows.map(formatMeeting)
      });
    }

    if (!isAuthorized(request)) {
      return response.status(401).json({
        error: "Administrator login required"
      });
    }

    if (request.method === "DELETE") {
      const id = request.query.id;

      if (!id) {
        return response.status(400).json({
          error: "Meeting ID is required"
        });
      }

      const oldRows = await sql`
        SELECT *
        FROM meeting_minutes
        WHERE id = ${String(id)}
      `;

      await sql`
        DELETE FROM meeting_minutes
        WHERE id = ${String(id)}
      `;

      await sql`
        INSERT INTO change_logs (
          entity_type,
          entity_id,
          action,
          old_data
        )
        VALUES (
          'meeting',
          ${String(id)},
          'delete',
          ${JSON.stringify(oldRows[0] || {})}::jsonb
        )
      `;

      return response.status(200).json({
        success: true
      });
    }

    if (request.method === "POST" || request.method === "PUT") {
      const m = request.body || {};

      if (!m.id || !m.project) {
        return response.status(400).json({
          error: "Meeting ID and project name are required"
        });
      }

      const oldRows = await sql`
        SELECT *
        FROM meeting_minutes
        WHERE id = ${String(m.id)}
      `;

      const rows = await sql`
        INSERT INTO meeting_minutes (
          id,
          review_date,
          project_id,
          project_name,
          status,
          leader,
          timing,
          finish_time,
          activities,
          comment,
          updated_at
        )
        VALUES (
          ${String(m.id)},
          ${m.reviewDate || null},
          ${m.projectId || null},
          ${m.project || ""},
          ${m.status || ""},
          ${m.leader || ""},
          ${m.timing || ""},
          ${m.finishTime || ""},
          ${m.activities || ""},
          ${m.comment || ""},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          review_date = EXCLUDED.review_date,
          project_id = EXCLUDED.project_id,
          project_name = EXCLUDED.project_name,
          status = EXCLUDED.status,
          leader = EXCLUDED.leader,
          timing = EXCLUDED.timing,
          finish_time = EXCLUDED.finish_time,
          activities = EXCLUDED.activities,
          comment = EXCLUDED.comment,
          updated_at = NOW()
        RETURNING *
      `;

      const action = oldRows.length ? "update" : "create";

      await sql`
        INSERT INTO change_logs (
          entity_type,
          entity_id,
          action,
          old_data,
          new_data
        )
        VALUES (
          'meeting',
          ${String(m.id)},
          ${action},
          ${JSON.stringify(oldRows[0] || {})}::jsonb,
          ${JSON.stringify(rows[0])}::jsonb
        )
      `;

      return response.status(200).json({
        success: true,
        meeting: formatMeeting(rows[0])
      });
    }

    return response.status(405).json({
      error: "Method not allowed"
    });
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      error: "Meeting operation failed",
      message: error.message
    });
  }
};
