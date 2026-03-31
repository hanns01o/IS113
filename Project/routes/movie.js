const express = require("express");
const router = express.Router();
// const User = require("../models/User");
// const Watchlist = require("../models/Watchlist");
const  movieController = require("../controllers/movieController");
const { requireLogin, requireAdmin } = require("../middleware/authMiddleware");


router.get("/movies", movieController.getMovies);
router.get("/details", movieController.getMovieDetails);
router.get("/movies/add", requireLogin, movieController.getAddMovieForm);
router.post("/movies/add", requireLogin, movieController.postAddMovieForm);
router.get("/movies/loadMore", movieController.loadMore);
router.post("/movies/bulk-add", requireLogin, movieController.bulkAddWatchlist);


router.get("/admin/submissions", requireAdmin,movieController.getAdminSubmissions);
router.post("/admin/submissions/:id/approve", requireAdmin, movieController.approveSubmission);
router.post("/admin/submissions/:id/reject", requireAdmin, movieController.rejectSubmission);
router.post("/admin/submissions/:id/delete", requireAdmin, movieController.deleteSubmission);
router.get("/admin/submissions/:id/edit", requireAdmin, movieController.getEditSubmissionForm);
router.post("/admin/submissions/:id/edit", requireAdmin, movieController.editSubmission);

module.exports = router;
