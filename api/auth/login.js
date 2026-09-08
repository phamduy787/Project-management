const crypto = require("crypto");
const {
  COOKIE_NAME,
  createSessionToken
} = require("../../lib/auth");

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

  if (!pin || !safeEqual(pin, process.env.ADMIN_PIN || "")) {
    return response.status(401).json({
      authenticated: false,
      message: "Incorrect administrator PIN"
    });
  }

  const token = createSessionToken();

  response.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`
  );

  return response.status(200).json({
    authenticated: true
  });
};
