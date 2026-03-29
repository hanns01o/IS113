const Review = require("../models/Review");
const User = require("../models/User");

// Read - Get all reviews for a movie
exports.getReview = async (req, res) => {
    try {
        // Validation
        const user = await User.getUserById(req.session.userId)
        if (!user) {
            return res.redirect("/login");
        }

        // Display
        res.render('movieDetails', { 
            movie: movie, 
            review: review, 
            movieId: req.params.movieId,
            errors: [] 
        });
    } catch (err) {
        console.error(err);
        res.send("Error loading review");
    }
};

// Create - Add a new review
exports.createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const movieId = req.params.movieId;

        // Error Handling
        const errors = [];
        if (!rating || rating < 1 || rating > 10) {
            errors.push({ msg: 'Rating must be between 1 and 10' })
        }
        if (!comment || comment.trim().length < 10) {
            errors.push({ msg: 'Comment must be at least 10 characters' });
        }
        if (errors.length > 0) {
            return res.redirect(`/details?id=${movieId}&error=validation`);
        }
        
        // Authorisation
        if (req.session.role === 'admin') {
            return res.redirect(`/details?id=${movieId}&error=admin_denied`);
        }

        // Validation
        const existingReview = await Review.findOne({ movie: movieId, user: req.session.userId });
        if (existingReview) {
            return res.redirect(`/details?id=${movieId}&error=already_reviewed`);
        }

        await Review.create({
            movie: String(movieId),
            user: req.session.userId,
            username: req.session.username,
            rating,
            comment
        });

        res.redirect(`/details?id=${movieId}`);
    } catch (err) {
        console.error(err);
        res.send("Unable to save review");
    }
};

// Update - Edit a review

// GET Update
exports.getEditForm = async (req, res) => {
    try {
        const { movieId, reviewId } = req.params;

        const review = await Review.findById(reviewId);

        // Validation
        if (!review || review.user.toString() !== req.session.userId.toString()) {
            return res.status(403).send("Unauthorized or Review not found");
        }

        res.render('reviews/edit', { 
            review, 
            movieId,
            errors: [] 
        });
    } catch (err) {
        res.status(500).send("Server Error");
    }
};

// POST Update
exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        const updatedReview = await Review.findOneAndUpdate(
            { _id: req.params.reviewId, user: req.session.userId },
            { rating, comment },
            { new: true }
        );

        if (!updatedReview) return res.status(403).send("Action denied.");

        res.redirect(`/details?id=${req.params.movieId}`);
    } catch (err) {
        res.status(500).send("Error Updating Review");
    }
};

// Delete - Remove a review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId, movieId } = req.params;
        
        await Review.findByIdAndDelete(reviewId);
        
        res.redirect(`/details?id=${movieId}`);
    } catch (err) {
        res.status(500).send("Error deleting review");
    }
};