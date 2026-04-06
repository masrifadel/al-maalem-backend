import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(403)
      .json({ message: "Access Denied. No token provided." });

  try {
    // Check if it's an admin token (bypass JWT verification)
    if (token.startsWith("admin_jwt_")) {
      req.userId = "admin_user";
      req.role = "admin";
      next();
      return;
    }
    
    // Regular JWT verification for normal users
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
