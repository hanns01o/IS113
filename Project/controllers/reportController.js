const Report = require("../models/Report");
const Review = require("../models/Review");
const { createNotification } = require("../utils/notificationHelper"); 

// POST /reviews/:reviewId/report
exports.submitReport = async (req, res) => {
  try {
    const { reason, details } = req.body;
    const reviewId = req.params.reviewId;

    const report = await Report.create({
      reviewId: reviewId,
      reportedBy: req.session.userId,
      reason: reason,
      details: details ? details.trim() : ""
    });

    const review = await Review.findById(reviewId);
    const commentText = review?.comment || "No comment text";

    await createNotification(
      req.session.userId,
      `Your report has been submitted successfully on \nComment: ${commentText}`,
      "report",
      report._id.toString()
    );

    // Go back to the movie page they were on
    const backUrl = req.body.backUrl || "/movies";
    res.redirect(backUrl);

  } catch (err) {
    // Duplicate report (same user already reported this review)
    if (err.code === 11000) {
      const backUrl = req.body.backUrl || "/movies";
      const separator = backUrl.includes("?") ? "&" : "?";
      return res.redirect(backUrl + separator + "reported=duplicate");
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
        populate: { path: "user", select: "username" }
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
    // await Report.findByIdAndUpdate(req.params.id, { status: "dismissed" });
    const report = await Report.findByIdAndUpdate(
      req.params.id, 
      {status: "dismissed"}, 
      { new: true }
    ).populate("reportedBy").populate("reviewId"); 

    if(report){ 
      const commentText = report.reviewId?.comment || "No comment";
      await createNotification(
        report.reportedBy._id,
        `Your report has been reviewed and dismissed.\nComment: ${commentText}`,
        "report",
        report._id.toString()
      );
    }

    res.redirect("/admin/reports");
  } catch (err) {
    console.error(err);
    res.send("Error dismissing report.");
  }
};

// POST /admin/reports/:id/delete-review
/*
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
*/

exports.deleteReview = async (req, res) => {
  try {
    const selectedReport = await Report.findById(req.params.id).populate("reviewId");

    if (!selectedReport) {
      return res.send("Report not found.");
    }

    const review = selectedReport.reviewId;

    if (!review) {
      return res.send("Review not found.");
    }

    const commentText = review.comment || "No comment";

    const shortComment =
      commentText.length > 80
        ? commentText.substring(0, 80) + "..."
        : commentText;

    const reviewOwnerId = review.user.toString(); // change if your field name is different

    // Get all reports linked to this review BEFORE deleting anything
    const relatedReports = await Report.find({ reviewId: review._id });

    // Notify all reporter users
    for (const report of relatedReports) {
      await createNotification(
        report.reportedBy,
        `Your reported comment has been removed by the admin.\nComment: ${shortComment}`,
        "report",
        report._id.toString()
      );
    }

    // Notify review owner
    if (reviewOwnerId) {
      await createNotification(
        reviewOwnerId,
        `Your review has been removed by the admin due to reports from users.\nComment: ${shortComment}`,
        "report",
        selectedReport._id.toString()
      );
    }

    // Delete the review
    await Review.findByIdAndDelete(review._id);

    // Delete all reports related to that review
    await Report.deleteMany({ reviewId: review._id });

    res.redirect("/admin/reports");

  } catch (err) {
    console.error(err);
    res.send("Error deleting review.");
  }
};
