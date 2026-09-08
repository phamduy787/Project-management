const { neon } = require("@neondatabase/serverless");

module.exports = async function handler(request, response) {
  try {
    const sql = neon(process.env.DATABASE_URL);

    const projectResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM projects
    `;

    const meetingResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM meeting_minutes
    `;

    return response.status(200).json({
      connected: true,
      message: "Neon database connected successfully",
      projects: projectResult[0].count,
      meetingMinutes: meetingResult[0].count
    });
  } catch (error) {
    console.error(error);

    return response.status(500).json({
      connected: false,
      message: "Database connection failed",
      error: error.message
    });
  }
};
