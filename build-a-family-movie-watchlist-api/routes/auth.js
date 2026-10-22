import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { findByUsername } from "../utils/db.js";

// Tự động nạp biến môi trường từ file .env
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
        }
      }
    }
  }
} catch {}

let bcrypt = null;
try {
  bcrypt = (await import("bcrypt")).default;
} catch {
  try {
    bcrypt = (await import("bcryptjs")).default;
  } catch {}
}

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  const user = findByUsername(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const storedPassword =
    user.password || user.passwordHash || user.hashedPassword || user._password;

  let isValidPassword = false;
  if (storedPassword === password) {
    isValidPassword = true;
  } else if (bcrypt && typeof storedPassword === "string" && storedPassword.startsWith("$2")) {
    isValidPassword = await bcrypt.compare(password, storedPassword);
  } else if (typeof storedPassword === "string") {
    const sha256 = crypto.createHash("sha256").update(password).digest("hex");
    if (storedPassword === sha256) {
      isValidPassword = true;
    }
  }

  if (!isValidPassword) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const secret =
    process.env.JWT_SECRET ||
    process.env.SECRET_KEY ||
    process.env.TOKEN_SECRET ||
    process.env.SECRET ||
    "your-secret-key";

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    secret,
    { expiresIn: "1h" }
  );

  return res.status(200).json({ token });
});

export default router;