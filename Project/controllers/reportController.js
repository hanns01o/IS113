const Report = require("../models/Report");

// POST /reviews/:reviewId/report
exports.submitReport = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const reviewId = req.params.reviewId;

    await Report.create({
      reviewId: reviewId,
      reportedBy: req.session.userId,
      reason: reason,
      details: details ? details.trim() : ""
    });

    // Go back to the movie page they were on
    const backUrl = req.body.backUrl || "/movies";
    res.redirect(backUrl);

  } catch (err) {
    // Duplicate report (same user already reported this review)
    if (err.code === 11000) {
      const backUrl = req.body.backUrl || "/movies";
      return res.redirect(backUrl);
    }
    console.error(err);
    res.send("Error submitting report.");
  }
};

// GET /admin/reports
exports.getReports = async (req, res) => {
  try {
    const filter = req.query.status || "pending";

    const reports = await Report.find({ status: filter })
      .populate("reportedBy", "username email")
      .populate({
        path: "reviewId",
        populate: { path: "userId", select: "username" }
      })
      .sort({ createdAt: -1 });

    const pendingCount = await Report.countDocuments({ status: "pending" });

    res.render("adminReports", { reports, filter, pendingCount });

  } catch (err) {
    console.error(err);
    res.send("Error loading reports.");
  }
};

// POST /admin/reports/:id/dismiss
exports.dismissReport = async (req, res) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, { status: "dismissed" });
    res.redirect("/admin/reports");
  } catch (err) {
    console.error(err);
    res.send("Error dismissing report.");
  }
};

// POST /admin/reports/:id/delete-review
exports.deleteReview = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.send("Report not found.");
    }

    // Delete the review itself
    const Review = require("mongoose").model("Review");
    await Review.findByIdAndDelete(report.reviewId);

    // Mark ALL pending reports for this review as actioned
    await Report.updateMany(
      { reviewId: report.reviewId, status: "pending" },
      { status: "actioned" }
    );

    res.redirect("/admin/reports");

  } catch (err) {
    console.error(err);
    res.send("Error deleting review.");
  }
};
