import express from "express";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import watchlistRoutes from "./routes/watchlist.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Family Movie Watchlist API");
});

// Gắn các đường dẫn API
app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);

// Lắng nghe cổng 3000 để pass test kiểm tra HTTP server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});

export default app;