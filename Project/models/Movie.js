const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        default: "Unknown"
    },
    description: {
        type: String,
        default: "No description available."
    },
    posterUrl: {
        type: String,
        default: "/images/default-poster.jpg"
    },
    bannerUrl: {
        type: String,
        default: "/images/default-banner.jpg"
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Movie || mongoose.model("Movie", movieSchema);