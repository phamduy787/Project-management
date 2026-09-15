const { isAuthorized } = require("../../lib/auth");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({
      error: "Method not allowed"
    });
  }

  response.setHeader("Cache-Control", "no-store");

  return response.status(200).json({
    authenticated: isAuthorized(request)
  });
};
