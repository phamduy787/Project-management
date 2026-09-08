module.exports = async function handler(request, response) {
  const adminPin = process.env.ADMIN_PIN || "";
  const sessionSecret = process.env.SESSION_SECRET || "";

  return response.status(200).json({
    adminPinConfigured: adminPin.length > 0,
    adminPinLength: adminPin.length,
    sessionSecretConfigured: sessionSecret.length > 0,
    sessionSecretLength: sessionSecret.length,
    environment: process.env.VERCEL_ENV || "unknown"
  });
};
