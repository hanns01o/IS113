const express = require("express");
const router = express.Router();
// const User = require("../models/User");
// const Watchlist = require("../models/Watchlist");
const  movieController = require("../controllers/movieController")

router.get("/movies", movieController.getMovies);
router.get("/details", movieController.getMovieDetails);

module.exports = router;
