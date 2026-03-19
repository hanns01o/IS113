const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        // ref: "Movie",
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
    // status: {
    //     type: String,
    //     default: "saved"
    // },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true }); // for unique 

module.exports = mongoose.models.Watchlist || mongoose.model("Watchlist", watchlistSchema);