const crypto = require("crypto");
const {
  COOKIE_NAME,
  createSessionToken
} = require("../../lib/auth");
const { neon } = require("@neondatabase/serverless");

function safeEqual(first, second) {
  const firstBuffer = Buffer.from(String(first));
  const secondBuffer = Buffer.from(String(second));

  if (firstBuffer.length !== secondBuffer.length) return false;

  return crypto.timingSafeEqual(firstBuffer, secondBuffer);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method not allowed"
    });
  }

  const { pin } = request.body || {};
  const sql = neon(process.env.DATABASE_URL);
  const ip = String(
    request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown"
  ).split(",")[0].trim();

  await sql`DELETE FROM auth_attempts WHERE attempted_at < NOW() - INTERVAL '15 minutes'`;
  const attempts = await sql`
    SELECT COUNT(*)::int AS count
    FROM auth_attempts
    WHERE ip_address = ${ip}
      AND attempted_at >= NOW() - INTERVAL '15 minutes'
  `;

  if ((attempts[0]?.count || 0) >= 5) {
    response.setHeader("Retry-After", "900");
    return response.status(429).json({
      authenticated: false,
      message: "Too many attempts. Try again in 15 minutes."
    });
  }

  if (!pin || !safeEqual(pin, process.env.ADMIN_PIN || "")) {
    await sql`INSERT INTO auth_attempts (ip_address) VALUES (${ip})`;
    return response.status(401).json({
      authenticated: false,
      message: "Incorrect administrator PIN"
    });
  }

  await sql`DELETE FROM auth_attempts WHERE ip_address = ${ip}`;

  const token = createSessionToken();

  response.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`
  );

  return response.status(200).json({
    authenticated: true
  });
};
