const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT version, updated_at
      FROM app_state
      WHERE key = 'portfolio'
    `;
    response.setHeader('Cache-Control', 'no-store, max-age=0');
    return response.status(200).json(rows[0] || { version: 0 });
  } catch (error) {
    return response.status(500).json({ error: 'Version check failed' });
  }
};
