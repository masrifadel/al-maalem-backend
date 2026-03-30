export const isAdmin = (req, res, next) => {
  // This depends on your verifyToken middleware running first
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
