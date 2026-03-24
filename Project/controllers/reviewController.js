const Review = require("../models/Review");
const User = require("../models/User");
const { validationResult } = require('express-validator');

// Read - Get all reviews for a movie
exports.getReview = async (req, res) => {
    try {
        const user = await User.getUserById(req.session.userId)
        if (!user) {
            return res.redirect("/login");
        }

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect(`/details?id=${req.params.movieId}&error=validation`);
    }

    try {
        const existing = await Review.findOne({
            movie: req.params.movieId,
            user: req.session.userId
        });

        if (existing) {
            return res.redirect(`/details?id=${req.params.movieId}&error=already_reviewed`);
        }

        await Review.create({
            movie: req.params.movieId,
            user: req.session.userId,
            username: req.session.username,
            rating: req.body.rating,
            comment: req.body.comment
        });

        res.redirect(`/details?id=${req.params.movieId}`);
    } catch (err) {
        console.error(err);
        res.send("Unable to save review");
    }
};

// Update - Edit a review

// GET Update
exports.getEditForm = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review || review.user.toString() !== req.session.userId.toString()) {
            return res.status(403).send("Unauthorized or Review not found");
        }

        res.render('reviews/edit', { 
            review, 
            movieId: req.params.movieId,
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