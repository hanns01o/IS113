const User = require("../models/User");
const Watchlist = require("../models/Watchlist");

exports.getMovies = async (req, res) => {
    let movies = [];
    const movieCategory = req.query.category ? req.query.category : "popular";

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieCategory}?api_key=${process.env.API_KEY}`
        );

        const data = await response.json();
        movies = data.results || [];

        res.render("movies", { movies });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading movies.");
    }
};

exports.getMovieDetails = async (req, res) => {
    let movie = {};
    const movieID = Number(req.query.id);

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieID}?api_key=${process.env.API_KEY}`
        );

        const data = await response.json();
        movie = data;

        if (!req.session.userId) {
            return res.render("movieDetails", {
                movie,
                inWatchlist: false,
                watchedStatus: false
            });
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect("/login");
        }

        const watchlistItem = await Watchlist.findOne({
            userId: req.session.userId,
            movieId: movieID
        });

        const inWatchlist = !!watchlistItem;
        const watchedStatus = watchlistItem ? !!watchlistItem.watchedDate : false;

        res.render("movieDetails", {
            movie,
            inWatchlist,
            watchedStatus
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading movie details.");
    }
};