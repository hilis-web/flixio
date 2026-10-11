const jwt = require("jsonwebtoken");

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No token: continue as an anonymous visitor
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    return res.status(401).json({
      error: "Invalid authorization format",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      error: "Authentication service is not configured",
    });
  }

  try {
    const decoded = jwt.verify(parts[1], secret);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      decoded.id === undefined ||
      decoded.id === null ||
      !["string", "number"].includes(typeof decoded.id) ||
      String(decoded.id).trim() === ""
    ) {
      return res.status(401).json({
        error: "Invalid token payload",
      });
    }

    req.user = {
      id: decoded.id,
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

module.exports = optionalAuthMiddleware;
