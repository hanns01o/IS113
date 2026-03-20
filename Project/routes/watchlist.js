const express = require("express");
const router = express.Router();
const watchlistController = require("../controllers/watchlistController");
const { requireLogin } = require("../middleware/authMiddleware");

router.get("/watchlist", requireLogin, watchlistController.getWatchlist);
router.post("/watchlist/add/:movieId", requireLogin, watchlistController.addToWatchlist);
router.post("/watchlist/remove/:movieId", requireLogin, watchlistController.removeFromWatchlist);

module.exports = router;

// function requireLogin(req, res, next) {
//     if (!req.session.userId) {
//         return res.redirect("/login");
//     }
//     next();
// }

// router.get("/watchlist", requireLogin, async (req, res) => {
//     try {
//         const user = await User.getUserById(req.session.userId);

//         if (!user) {
//             return res.redirect("/login");
//         }

//         const watchlistMovies = [];

//         for (const movieId of user.watchList) {
//             const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.API_KEY}`);
//             const movieData = await response.json();
//             watchlistMovies.push({
//                 id: movieData.id,
//                 title: movieData.title,
//                 poster_path: movieData.poster_path
//             });        
//         }
//         res.render("watchlist", { user, watchlistMovies });

//     } catch (err) {
//         console.error(err);
//         res.send("Error loading watchlist.");
//     }
// });

// router.post("/watchlist/add/:movieId", requireLogin, async (req, res) => {
//     try {
//         const user = await User.getUserById(req.session.userId);
//         const movieId = Number(req.params.movieId);

//         if (!user) {
//             return res.redirect("/login");
//         }

//         const watchlist = user.watchList || [];
//         if (!watchlist.includes(movieId)) {
//             watchlist.push(movieId);
//             await user.save();
//         }

//         res.redirect(`/details?id=${movieId}`);
//     } catch (err) {
//         console.error(err);
//         res.send("Error adding movie to watchlist.");
//     }
// });

// router.post("/watchlist/remove/:movieId", requireLogin, async (req, res) => {
//     try {
//         const user = await User.getUserById(req.session.userId);
//         const movieId = Number(req.params.movieId);

//         if (!user) {
//             return res.redirect("/login");
//         }
        
//         user.watchList = (user.watchList || []).filter(id => id !== movieId);
//         await user.save();

//         res.redirect(`/details?id=${movieId}`);
//     } catch (err) {
//         console.error(err);
//         res.send("Error removing movie from watchlist.");
//     }
// });