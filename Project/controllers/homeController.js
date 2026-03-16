const Watchlist = require("../models/Watchlist");
const Movie = require("../models/Movie");

exports.getHomePage = async (req, res) => {
    try {
        const watchlistItems = await Watchlist.find({ userId: req.session.userId })
            .populate("movieId");

        const watchlistMovies = watchlistItems
            .map(item => item.movieId)
            .filter(movie => movie);

        let featuredMovie = null;

        if (watchlistMovies.length > 0) {
            featuredMovie = watchlistMovies[0];
        }

        res.render("home", {
            username: req.session.username,
            featuredMovie,
            watchlistMovies
        });
    } catch (err) {
        console.error(err);
        res.send("Error loading home page.");
    }
};