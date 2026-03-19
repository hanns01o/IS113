const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/movies", async (req, res) => {
    let movies = []
    
    const MovieCategory = req.query.category ? req.query.category : "popular";

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${MovieCategory}?api_key=${process.env.API_KEY}`
        );
        const data = await response.json();
        movies = data.results;
    } catch (error) {
        console.log("Error has occured");
    }
    res.render("movies", { movies })
});

router.get("/details", async (req, res) => {
    let movie = {};
    const movieID = Number(req.query.id);

    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieID}?api_key=${process.env.API_KEY}`);
        const data = await response.json();
        movie = data;

        // watchlist 
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect("/login");
        }
        const watchlist = user.watchList || [];
        const inWatchlist = watchlist.includes(movieID);
        
        res.render("movieDetails", {movie, inWatchlist})
    } catch (error) {
        console.log("Error has occured");
    }
});

module.exports = router;
