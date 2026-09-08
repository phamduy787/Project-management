const crypto = require("crypto");

const COOKIE_NAME = "ild_admin_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

function createSignature(value) {
  return crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(value)
    .digest("hex");
}

function createSessionToken() {
  const expiresAt = String(Date.now() + SESSION_DURATION);
  const signature = createSignature(expiresAt);

  return `${expiresAt}.${signature}`;
}

function readCookies(request) {
  const cookieHeader = request.headers.cookie || "";

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separator = item.indexOf("=");
        const key = item.slice(0, separator);
        const value = item.slice(separator + 1);

        return [key, decodeURIComponent(value)];
      })
  );
}

function isAuthorized(request) {
  if (!process.env.SESSION_SECRET) return false;

  const cookies = readCookies(request);
  const token = cookies[COOKIE_NAME];

  if (!token) return false;

  const [expiresAt, suppliedSignature] = token.split(".");

  if (!expiresAt || !suppliedSignature) return false;
  if (Number(expiresAt) <= Date.now()) return false;

  const expectedSignature = createSignature(expiresAt);

  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (suppliedBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);
}

module.exports = {
  COOKIE_NAME,
  createSessionToken,
  isAuthorized
};
