const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ["spam", "spoilers", "offensive", "harassment", "other"]
  },
  details: {
    type: String,
    default: "",
    maxlength: 300
  },
  status: {
    type: String,
    enum: ["pending", "dismissed", "actioned"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// One user can only report the same review once
reportSchema.index({ reportedBy: 1, reviewId: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
