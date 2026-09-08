const { neon } = require("@neondatabase/serverless");
const { isAuthorized } = require("../lib/auth");

const sql = neon(process.env.DATABASE_URL);

function formatProject(p) {
  return {
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
  };
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  try {
    if (request.method === "GET") {
      const rows = await sql`
        SELECT *
        FROM projects
        ORDER BY project_number ASC, id ASC
      `;

      return response.status(200).json({
        projects: rows.map(formatProject)
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
          error: "Project ID is required"
        });
      }

      const oldRows = await sql`
        SELECT *
        FROM projects
        WHERE id = ${String(id)}
      `;

      await sql`
        DELETE FROM projects
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
          'project',
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
      const p = request.body || {};

      if (!p.id || !p.name) {
        return response.status(400).json({
          error: "Project ID and name are required"
        });
      }

      const oldRows = await sql`
        SELECT *
        FROM projects
        WHERE id = ${String(p.id)}
      `;

      const projectNumber =
        p.number === "" ||
        p.number === null ||
        p.number === undefined
          ? null
          : Number(p.number);

      const rows = await sql`
        INSERT INTO projects (
          id,
          project_number,
          name,
          key_driver,
          factory_target,
          target_value,
          key_activity,
          leader,
          department,
          supporter,
          team_member,
          cost_saving,
          cost_investment,
          charter,
          charter_completed,
          target_2026,
          timing,
          status,
          coach,
          sponsor,
          priority,
          monthly,
          fy_initial_volume,
          fy_actual_volume,
          fy_initial_cost,
          fy_actual_cost,
          updated_at
        )
        VALUES (
          ${String(p.id)},
          ${projectNumber},
          ${p.name || ""},
          ${p.keyDriver || ""},
          ${p.factoryTarget || ""},
          ${String(p.targetValue || "")},
          ${p.keyActivity || ""},
          ${p.leader || ""},
          ${p.department || ""},
          ${p.supporter || ""},
          ${p.teamMember || ""},
          ${String(p.costSaving || "")},
          ${String(p.costInvestment || "")},
          ${p.charter || ""},
          ${p.charterCompleted || ""},
          ${p.target2026 || ""},
          ${p.timing || ""},
          ${p.status || ""},
          ${p.coach || ""},
          ${p.sponsor || ""},
          ${String(p.priority || "")},
          ${JSON.stringify(p.monthly || {})}::jsonb,
          ${String(p.fyInitialVolume || "")},
          ${String(p.fyActualVolume || "")},
          ${String(p.fyInitialCost || "")},
          ${String(p.fyActualCost || "")},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          project_number = EXCLUDED.project_number,
          name = EXCLUDED.name,
          key_driver = EXCLUDED.key_driver,
          factory_target = EXCLUDED.factory_target,
          target_value = EXCLUDED.target_value,
          key_activity = EXCLUDED.key_activity,
          leader = EXCLUDED.leader,
          department = EXCLUDED.department,
          supporter = EXCLUDED.supporter,
          team_member = EXCLUDED.team_member,
          cost_saving = EXCLUDED.cost_saving,
          cost_investment = EXCLUDED.cost_investment,
          charter = EXCLUDED.charter,
          charter_completed = EXCLUDED.charter_completed,
          target_2026 = EXCLUDED.target_2026,
          timing = EXCLUDED.timing,
          status = EXCLUDED.status,
          coach = EXCLUDED.coach,
          sponsor = EXCLUDED.sponsor,
          priority = EXCLUDED.priority,
          monthly = EXCLUDED.monthly,
          fy_initial_volume = EXCLUDED.fy_initial_volume,
          fy_actual_volume = EXCLUDED.fy_actual_volume,
          fy_initial_cost = EXCLUDED.fy_initial_cost,
          fy_actual_cost = EXCLUDED.fy_actual_cost,
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
          'project',
          ${String(p.id)},
          ${action},
          ${JSON.stringify(oldRows[0] || {})}::jsonb,
          ${JSON.stringify(rows[0])}::jsonb
        )
      `;

      return response.status(200).json({
        success: true,
        project: formatProject(rows[0])
      });
    }

    return response.status(405).json({
      error: "Method not allowed"
    });
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      error: "Project operation failed",
      message: error.message
    });
  }
};
