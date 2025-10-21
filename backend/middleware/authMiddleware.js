import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    // Check for token in request header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Extract token (remove "Bearer ")
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info (from token payload) to the request object
    req.user = decoded;

    // Continue to the next middleware or route
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};
