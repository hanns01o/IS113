const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { requireLogin, requireAdmin } = require("../middleware/authMiddleware");

// User submits a report on a review
router.post("/reviews/:reviewId/report", requireLogin, reportController.submitReport);

// Admin views all reports
router.get("/admin/reports", requireAdmin, reportController.getReports);

// Admin dismisses a report (ignore it)
router.post("/admin/reports/:id/dismiss", requireAdmin, reportController.dismissReport);

// Admin deletes the reported review
router.post("/admin/reports/:id/delete-review", requireAdmin, reportController.deleteReview);

module.exports = router;
