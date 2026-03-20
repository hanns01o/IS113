const express = require("express");
const router = express.Router();
const watchlistController = require("../controllers/watchlistController");
const { requireLogin } = require("../middleware/authMiddleware");

router.get("/watchlist", requireLogin, watchlistController.getWatchlist);
router.post("/watchlist/add/:movieId", requireLogin, watchlistController.addToWatchlist);
router.post("/watchlist/remove/:movieId", requireLogin, watchlistController.removeFromWatchlist);
router.post("/watchlist/updateadd/:movieId", requireLogin, watchlistController.updateAddWatched);
router.post("/watchlist/updateremove/:movieId", requireLogin, watchlistController.updateRemoveWatched);

module.exports = router;