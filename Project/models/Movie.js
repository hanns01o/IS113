const mongoose = require("mongoose");

// attribute name matches the API field for direct mapping
const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    genre_ids: {
        type: Array,
        default: [],
        required: true
    },
    overview: {
        type: String,
        required: true
    },
    poster_path: {
        type: String,
        required: true
    },
    backdrop_path: {
        type: String,
        required: true
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