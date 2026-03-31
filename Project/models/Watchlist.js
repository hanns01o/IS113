const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    movieId: {
        type: String,
        required: true
    },
    movieTitle: {
        type: String,
        required: true
    },
    posterPath: {
        type: String,
        required: true
    },  
    addedAt: {
        type: Date,
        default: Date.now
    },
    watchedDate: {
        type: Date,
        default: null
    }
});

watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true }); 

module.exports = mongoose.models.Watchlist || mongoose.model("Watchlist", watchlistSchema);