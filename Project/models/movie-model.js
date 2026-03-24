const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    genre_ids: {
        type: [String],
        default: []
    },
    overview: {
        type: String,
        default: "No description available."
    },
    poster_path: {
        type: String,
        default: "/images/default-poster.jpg"
    },
    bannerUrl: {
        type: String,
        default: "/images/default-banner.jpg"
    }
});

const Movie = mongoose.model('Movie', movieSchema, 'movies');

// Methods

exports.retrieveAll = () => {
    
    return Movie.find();
};

