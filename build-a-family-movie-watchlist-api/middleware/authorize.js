export const authorizeModification = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(403).json({ error: "Access denied" });
  }

  const role = user.role;
  const currentUserId = user.id !== undefined ? user.id : user.userId;
  const targetUserId = req.params.userId;

  // Nếu là parent thì cho qua
  if (role === "parent") {
    return next();
  }

  // Nếu là child và thao tác đúng tài khoản của chính mình thì cho qua
  if (role === "child" && String(currentUserId) === String(targetUserId)) {
    return next();
  }

  return res.status(403).json({ error: "Access denied" });
};