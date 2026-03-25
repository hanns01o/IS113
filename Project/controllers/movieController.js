const User = require("../models/User");
const Review = require("../models/Review");
const Watchlist = require("../models/Watchlist");
const Movie = require("../models/Movie");
const MovieSubmission = require("../models/MovieSubmission");
const { addRecentlyViewed } = require("../utils/recentlyViewedHelper"); 
const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.API_KEY;


exports.getMovies = async (req, res) => {
    let movies = [];
    let customMovies = [];
    const movieCategory = req.query.category ? req.query.category : "popular";

    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieCategory}?api_key=${API_KEY}`
        );

        const data = await response.json();
        movies = data.results || [];

        customMovies = await Movie.find().sort({ createdAt: -1 });

        res.render("movies", { movies, customMovies });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading movies.");
    }
};

exports.getMovieDetails = async (req, res) => {
    let movie = {};
    const movieID = req.query.id;

    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieID}?api_key=${API_KEY}`
        );

        const data = await response.json();
        movie = data;

        const reviews = await Review.find({ movie: movieID })
            .populate('user')
            .sort({ createdAt: -1 });

        if (!req.session.userId) {
            console.log('User not found');
            return res.render("movieDetails", {
                movie,
                reviews,
                inWatchlist: false,
                watchedStatus: false,
                movieId: movieID
            });
        }

            // addIntoRecentlyViewed 
        await addRecentlyViewed(String(req.session.userId), { 
            id: movie.id, 
            title: movie.title, 
            posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "", 
            genre: movie.genres ? movie.genres.map(g => g.name).join(", ") : "", 
            releaseDate: movie.release_date || ""
        })
        

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

exports.getAddMovieForm = async (req, res) => {
    try {
        const response = await fetch(
            `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
        );

        const data = await response.json();
        const genres = data.genres || [];
    res.render("addMovie", {
        error: null,
        success: null,
        genres
    });
    } catch (error) {
        console.error(error);
        res.render("addMovie", {
            error: "Error loading genres. Please try again later.",
            success: null,
            genres: []
        });
    }
};

exports.postAddMovieForm = async (req, res) => {
    try {
        const { title, genre, description, posterUrl, bannerUrl } = req.body;

        const genresResponse = await fetch(
            `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
        );
        const genresData = await genresResponse.json();
        const genres = genresData.genres || [];
        
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
            posterUrl: posterUrl || "/images/default-poster.jpg",
            bannerUrl: bannerUrl || "/images/default-banner.jpg",
            submittedBy: req.session.userId,
            status: "pending"
        });
        
        await newSubmission.save();
        
        res.render("addMovie", {
            error: null,
            success: "Movie submission sent successfully. It is now pending admin review.",
            genres
        });
    } catch (error) {
        console.error(error);
        res.render("addMovie", {
            error: "An error occurred while submitting the movie. Please try again.",
            success: null,
            genres: []
        });
    }
};

exports.getAdminSubmissions = async (req, res) => {
    try {
        const submissions = await MovieSubmission.find()
            .populate("submittedBy", "username email")
            .sort({ submissionDate: -1 });
        
        res.render("adminMovieSubmissions", { submissions });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading movie submissions.");
    }
};

exports.approveSubmission = async (req, res) => {
    try {
        const submissionId = req.params.id;

        const submission = await MovieSubmission.findById(submissionId);
        if (!submission) {
            return res.status(404).send("Submission not found.");
        }

        const newMovie = new Movie({
            title: submission.title,
            genre: submission.genre,
            description: submission.description,
            posterUrl: submission.posterUrl,
            bannerUrl: submission.bannerUrl,
            uploadedBy: submission.submittedBy
        });
        await newMovie.save();

        submission.status = "approved";
        await submission.save();

        res.redirect("/admin/submissions");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error approving submission.");
    }
};

exports.rejectSubmission = async (req, res) => {
    try {
        const submissionId = req.params.id;

        const submission = await MovieSubmission.findById(submissionId);
        if (!submission) {
            return res.status(404).send("Submission not found.");
        }

        submission.status = "rejected";
        await submission.save();

        res.redirect("/admin/submissions");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error rejecting movie submission.");
    }
};

exports.deleteSubmission = async (req, res) => {
    try {
        const submissionId = req.params.id;

        await MovieSubmission.findByIdAndDelete(submissionId);

        res.redirect("/admin/submissions");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error deleting movie submission.");
    }
};

exports.getCustomMovieDetails = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).send("Movie not found.");
        }

        res.render("customMovieDetails", { movie });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error loading movie details.");
    }
};