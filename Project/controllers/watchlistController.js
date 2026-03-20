const User = require("../models/User");
const Watchlist = require("../models/Watchlist");

// read
exports.getWatchlist = async (req, res) => {  
    try {
        const user = await User.getUserById(req.session.userId);

        if (!user) {
            return res.redirect("/login");
        }

        const watchlistMovies = await Watchlist.find({ userId: req.session.userId })
            .sort({ addedAt: -1 });

        res.render("watchlist", { user, watchlistMovies });
    } catch (err) {
        console.error(err);
        res.send("Error loading watchlist.");
    }
}

// create
exports.addToWatchlist = async (req, res) => {  
    try {
        const user = await User.getUserById(req.session.userId);
        const movieId = Number(req.params.movieId);
        const { movieTitle, posterPath } = req.body;

        if (!user) {
            return res.redirect("/login");
        }

        await Watchlist.create({
            userId: req.session.userId,
            movieId,
            movieTitle,
            posterPath
        });

        res.redirect(`/details?id=${movieId}`);
    } catch (err) {
        console.error(err);
        res.send("Error adding movie to watchlist.");
    }
}

// delete 
exports.removeFromWatchlist = async (req, res) => { 
    try {
        const user = await User.getUserById(req.session.userId);
        const movieId = Number(req.params.movieId);

        if (!user) {
            return res.redirect("/login");
        }

        await Watchlist.findOneAndDelete({
            userId: req.session.userId,
            movieId: movieId
        });

        res.redirect(`/details?id=${movieId}`);
    } catch (err) {
        console.error(err);
        res.send("Error removing movie from watchlist.");
    }
}

// update (add)
exports.updateAddWatched = async (req, res) => {
    try {
        const user = await User.getUserById(req.session.userId);
        const movieId = Number(req.params.movieId);

        if (!user){
            return res.redirect("/login");
        }

        await Watchlist.findOneAndUpdate(
            { userId: req.session.userId, movieId: movieId },
            { watchedDate: new Date() }
        )

        res.redirect(`/details?id=${movieId}`);
    } catch (err) {
        console.error(err);
        res.send("Error updating (add) watched status of movie.")
    }
}

// update (remove)
exports.updateRemoveWatched = async (req, res) => {
    try {
        const user = await User.getUserById(req.session.userId);
        const movieId = Number(req.params.movieId);

        if (!user){
            return res.redirect("/login");
        }

        await Watchlist.findOneAndUpdate(            
            { userId: req.session.userId, movieId: movieId },
            { watchedDate: null }
        )

        res.redirect(`/details?id=${movieId}`);
    } catch (err) {
        console.error(err);
        res.send("Error updating (remove) watched status of movie.")
    }
}