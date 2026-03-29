const User = require("../models/User");
const Review = require("../models/Review");
const Watchlist = require("../models/Watchlist");
const Movie = require("../models/Movie");
const MovieSubmission = require("../models/MovieSubmission");
const { getHistory } = require('./searchController');
const { addRecentlyViewed } = require("../utils/recentlyViewedHelper");
const tmdb = require('../utils/tmdb');

// ─── Movies Page ─────────────────────────────────────────────────────────────

exports.getMovies = async (req, res) => {
    const categoryTitles = {
        'now_playing': 'Now Playing',
        'top_rated':   'Top Rated',
        'upcoming':    'Upcoming',
        'popular':     'Popular'
    };

    const movieCategory    = req.query.category || 'popular';
    const formattedCategory = categoryTitles[movieCategory] || 'Popular';
    const userId           = req.session.userId;

    try {
        const movies       = await tmdb.getMovies(movieCategory);
        const customMovies = await Movie.find().sort({ createdAt: -1 });
        const searchHistory = userId ? await getHistory(userId) : [];

        res.render("movies", { movies, customMovies, searchHistory, movieCategory, formattedCategory });
    } catch (error) {
        console.error('Error loading movies:', error);
        res.status(500).send("Error loading movies.");
    }
};

// ─── Movie Details ────────────────────────────────────────────────────────────

exports.getMovieDetails = async (req, res) => {
    const movieID = req.query.id;
    let movie = null;
    const isFromDB = isNaN(movieID) || movieID.length === 24;
    let errors = [];

    try {
        if (isFromDB) {
            movie = await Movie.findById(movieID).lean();
            if (!movie) return res.status(404).send("Movie not found.");

            // Remap genre_ids: ['28', '12'] → [{ id: 28, name: 'Action' }, ...]
            const allGenres = await tmdb.getGenres();
            movie.genres = movie.genre_ids
                .map(id => allGenres.find(g => g.id === parseInt(id)))
                .filter(Boolean);
        } else {
            movie = await tmdb.getMovieById(movieID);
            movie.poster_path   = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            movie.backdrop_path = `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`;
        }

        const reviews = await Review.find({ movie: String(movieID) })
            .populate('user')
            .sort({ createdAt: -1 });

        if (req.query.error === 'validation') {
            errors.push({ msg: 'Please check your rating (1-10) and comment length (min 10 chars).' });
        }
        if (req.query.error === 'already_reviewed') {
            errors.push({ msg: 'You have already submitted a review for this movie.' });
        } else if (req.query.error === 'admin_denied') {
            errors.push({ msg: "Admins cannot post reviews." });
        } else if (req.query.error === 'save_failed') {
            errors.push({ msg: "Unable to save review. Please try again." });
        }

        if (!req.session.userId) {
            return res.render("movieDetails", {
                movie, 
                reviews, 
                errors,
                inWatchlist: false,
                watchedStatus: false,
                movieId: movieID,
                isFromDB,
                currentUser: null
            });
        }

        const internalId = movie._id || movie.id;
        
        if (req.session.userId) {
            if (req.session.role !== "admin") {
                try{
                    await addRecentlyViewed(String(req.session.userId), {
                        id:          String(internalId),
                        title:       movie.title,
                        posterUrl:   movie.poster_path || "", 
                        genre:       movie.genres ? movie.genres.map(g => g.name).join(", ") : "",
                        releaseDate: movie.release_date || ""
                    });
                } catch (revErr) {
                    console.error("Recently Viewed Error:", revErr);
                }
            }
        }   
        const watchlistItem = await Watchlist.findOne({
            userId:  req.session.userId,
            movieId: String(internalId)
        });

        const inWatchlist   = !!watchlistItem;
        const watchedStatus = watchlistItem ? !!watchlistItem.watchedDate : false;

        res.render("movieDetails", {
            movie, reviews, errors,
            inWatchlist,
            watchedStatus,
            movieId: movieID,
            isFromDB,
            currentUser: { userId: req.session.userId, role: req.session.role }
        });
    } catch (error) {
        console.error('Error loading movie details:', error);
        res.status(500).send("Error loading movie details.");
    }
};

// ─── Add Movie Form ───────────────────────────────────────────────────────────

exports.getAddMovieForm = async (req, res) => {
    try {
        const genres = await tmdb.getGenres();
        res.render("addMovie", { error: null, success: null, genres });
    } catch (error) {
        console.error('Error loading add movie form:', error);
        res.render("addMovie", { error: "Error loading genres. Please try again later.", success: null, genres: [] });
    }
};

exports.postAddMovieForm = async (req, res) => {
    let genres = [];

    try {
        genres = await tmdb.getGenres();
    } catch (error) {
        console.error('Error fetching genres:', error);
    }

    try {
        const { title, genre, description, posterUrl, bannerUrl } = req.body;

        if (!title || !genre || !description) {
            return res.render("addMovie", {
                error: "Title, genre, and description are required.",
                success: null,
                genres
            });
        }

        if (description.length < 10) {
            return res.render("addMovie", {
                error: "Description must be at least 10 characters long.",
                success: null,
                genres
            });
        }

        const newSubmission = new MovieSubmission({
            title,
            genre,
            description,
            posterUrl:   posterUrl || "/images/default-poster.jpg",
            bannerUrl:   bannerUrl || "/images/default-banner.jpg",
            submittedBy: req.session.userId,
            status:      "pending"
        });

        await newSubmission.save();

        res.render("addMovie", {
            error: null,
            success: "Movie submission sent successfully. It is now pending admin review.",
            genres
        });
    } catch (error) {
        console.error('Error submitting movie:', error);
        res.render("addMovie", { error: "An error occurred while submitting the movie. Please try again.", success: null, genres });
    }
};

// ─── Load More ────────────────────────────────────────────────────────────────

exports.loadMore = async (req, res) => {
    const category = req.query.category;
    const page     = Number(req.query.page) || 2;

    try {
        const movies = await tmdb.getMovies(category, page);
        res.json({ movies });
    } catch (error) {
        console.error('Error loading more movies:', error);
        res.status(500).json({ error: 'Failed to load more movies.' });
    }
};

// ─── Admin Submissions ────────────────────────────────────────────────────────

exports.getAdminSubmissions = async (req, res) => {
    try {
        const submissions = await MovieSubmission.find()
            .populate("submittedBy", "username email")
            .sort({ submissionDate: -1 });

        res.render("adminMovieSubmissions", { submissions });
    } catch (error) {
        console.error('Error loading submissions:', error);
        res.status(500).send("Error loading movie submissions.");
    }
};

exports.approveSubmission = async (req, res) => {
    try {
        const submission = await MovieSubmission.findById(req.params.id);
        if (!submission) return res.status(404).send("Submission not found.");

        const newMovie = new Movie({
            title:        submission.title,
            genre_ids:    submission.genre ? [submission.genre] : [],
            overview:     submission.description,
            poster_path:  submission.posterUrl || "/images/default-poster.jpg",
            backdrop_path: submission.bannerUrl || "/images/default-banner.jpg",
            uploadedBy:   submission.submittedBy
        });

        await newMovie.save();

        submission.status = "approved";
        await submission.save();

        res.redirect("/admin/submissions");
    } catch (error) {
        console.error('Error approving submission:', error);
        res.status(500).send("Error approving submission.");
    }
};

exports.rejectSubmission = async (req, res) => {
    try {
        const submission = await MovieSubmission.findById(req.params.id);
        if (!submission) return res.status(404).send("Submission not found.");

        submission.status = "rejected";
        await submission.save();

        res.redirect("/admin/submissions");
    } catch (error) {
        console.error('Error rejecting submission:', error);
        res.status(500).send("Error rejecting movie submission.");
    }
};

exports.deleteSubmission = async (req, res) => {
    try {
        await MovieSubmission.findByIdAndDelete(req.params.id);
        res.redirect("/admin/submissions");
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).send("Error deleting movie submission.");
    }
};

// ─── Custom Movie Details ─────────────────────────────────────────────────────

exports.getCustomMovieDetails = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).send("Movie not found.");

        res.render("customMovieDetails", { movie });
    } catch (error) {
        console.error('Error loading custom movie details:', error);
        res.status(500).send("Error loading movie details.");
    }
};

exports.bulkAddWatchlist = async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.redirect("/login");
        }

        const selectedMovies = req.body.selectedMovies;

        if (!selectedMovies) {
            return res.redirect("/movies");
        }

        const moviesArray = Array.isArray(selectedMovies) ? selectedMovies : [selectedMovies];

        const watchlistItems = moviesArray.map(item => {
            const [id, source, title, poster] = item.split("|");

            return {
                userId,
                movieId: id,
                movieTitle: title,
                posterPath: source === "api"
                    ? poster
                    : poster.replace("https://image.tmdb.org/t/p/w500", ""),
                addedAt: new Date()
            };
        });

        try {
            await Watchlist.insertMany(watchlistItems, { ordered: false });
        } catch (err) {
            if (err.code !== 11000) throw err;
        }

        res.redirect("/movies");

    } catch (err) {
        console.error(err);
        res.send("Error adding bulk movies.");
    }
};