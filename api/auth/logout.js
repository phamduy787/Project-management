const { COOKIE_NAME } = require("../../lib/auth");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method not allowed"
    });
  }

  response.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );

  return response.status(200).json({
    authenticated: false
  });
};
