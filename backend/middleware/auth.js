import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.id;

      // Log only in development
      if (process.env.NODE_ENV === "development") {
        console.log(`🔐 Auth success → userId: ${decoded.id}`);
      }

      return next();
    } catch (err) {
      console.error("🔐 jwt.verify error:", err.message);

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Server error in auth middleware" });
  }
};

export default auth;
