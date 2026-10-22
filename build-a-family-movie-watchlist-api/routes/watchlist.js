import express from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../utils/db.js";

const router = express.Router();

// GET danh sách phim
router.get("/:userId", authenticate, (req, res) => {
  const userId = Number(req.params.userId);
  const watchlist = getWatchlist(userId);

  if (watchlist === null) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.status(200).json(watchlist);
});

// POST thêm phim mới
router.post("/:userId/movies", authenticate, authorizeModification, (req, res) => {
  const userId = Number(req.params.userId);
  const movie = addMovie(userId, req.body);

  if (movie === null) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.status(201).json(movie);
});

// PUT cập nhật phim
router.put("/:userId/movies/:movieId", authenticate, authorizeModification, (req, res) => {
  const userId = Number(req.params.userId);
  const movieId = Number(req.params.movieId);
  const updated = updateMovie(userId, movieId, req.body);

  if (updated === null) {
    return res.status(404).json({ error: "User or movie not found." });
  }

  return res.status(200).json(updated);
});

// DELETE xóa phim
router.delete("/:userId/movies/:movieId", authenticate, authorizeModification, (req, res) => {
  const userId = Number(req.params.userId);
  const movieId = Number(req.params.movieId);
  const deleted = deleteMovie(userId, movieId);

  if (!deleted) {
    return res.status(404).json({ error: "User or movie not found." });
  }

  return res.status(200).json({ message: "Movie deleted successfully." });
});

export default router;