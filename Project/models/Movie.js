const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    genre_ids: {
        type: [Number],
        default: [],
    },
    overview: {
        type: String,
        required: true,
        trim: true
    },
    release_date: {
        type: String,
        required: true
    },    
    posterUrl: {
        type: String,
        default: "images/default-poster.jpg"
    },
    bannerUrl: {
        type: String,
        default: "images/default-banner.jpg"
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["approved", "pending", "rejected"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.Movie || mongoose.model("Movie", movieSchema);