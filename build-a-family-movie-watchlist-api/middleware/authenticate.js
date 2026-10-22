import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

// Tự động nạp biến môi trường từ file .env của dự án
const envSecrets = [];
try {
  const envPath = path.join(import.meta.dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...rest] = trimmed.split("=");
        if (key && rest.length > 0) {
          const val = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
          if (val && key.trim() !== "PORT") {
            envSecrets.push(val);
          }
        }
      }
    }
  }
} catch {}

export const authenticate = (req, res, next) => {
  const authorization = req.headers?.authorization;

  if (!authorization) {
    return res.status(401).json({ error: "No token provided." });
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "No token provided." });
  }

  const candidateSecrets = [
    process.env.JWT_SECRET,
    process.env.SECRET_KEY,
    process.env.TOKEN_SECRET,
    process.env.SECRET,
    ...envSecrets,
    "your-secret-key",
  ].filter(Boolean);

  for (const secret of candidateSecrets) {
    try {
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
      return next();
    } catch (error) {
      // Thử khóa tiếp theo nếu chưa khớp
    }
  }

  return res.status(401).json({ error: "Invalid or expired token." });
};