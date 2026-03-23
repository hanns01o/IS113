const User = require("../models/User");
const Review = require("../models/Review");
const Watchlist = require("../models/Watchlist");
const { addRecentlyViewed } = require("../utils/recentlyViewedHelper"); 

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
    // let errors = [];

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movieID}?api_key=${process.env.API_KEY}`
        );

        const data = await response.json();
        movie = data;

        const reviews = await Review.find({ movie: movieID })
            .populate('user')
            .sort({ createdAt: -1 });

        if (!req.session.userId) {
            return res.render("movieDetails", {
                movie,
                reviews,
                inWatchlist: false,
                watchedStatus: false,
                movieId: movieID
            });
        }

        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect("/login");
        }

        if(req.session.userId){ 
            // addIntoRecentlyViewed 
            await addRecentlyViewed(String(req.session.userId), { 
                id: movie.id, 
                title: movie.title, 
                posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "", 
                genre: movie.genres ? movie.genres.map(g => g.name).join(", ") : "", 
                releaseDate: movie.release_date || ""
            })
        }

        const watchlistItem = await Watchlist.findOne({
            userId: req.session.userId,
            movieId: movieID
        });

        const inWatchlist = !!watchlistItem;
        const watchedStatus = watchlistItem ? !!watchlistItem.watchedDate : false;

        res.render("movieDetails", {
            movie,
            reviews,
            inWatchlist,
            watchedStatus,
            movieId: movieID
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading movie details.");
    }
};