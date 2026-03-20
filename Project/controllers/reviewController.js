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
        const reviews = await Review.find({ movie: req.params.movieId })
            .populate('user', 'username') // Display username of reviewer instead of random ID
            .sort({ createdAt: -1 }); // Ensures latest reviews appear at the top (descending order)

        res.render('reviews/index', { reviews, movieId: req.params.movieId });
    } catch (err) {
        console.error(err);
        res.send("Error loading review");
    }
};

// Create - Add a new review
exports.createReview = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('reviews/new', {
            errors: errors.array(),
            movieId: req.params.movieId
        });
    }

    try {
        const existing = await Review.findOne({
            movie: req.params.movieId,
            user: req.session.userId
        });
        
        if (existing) {
            return res.status(409).render('reviews/new', {
                errors: [{ msg: 'You have already reviewed this movie.' }],
                movieId: req.params.movieId
            });
        }

        await Review.create({
            movie: req.params.movieId,
            user: req.session.userId,
            rating: req.body.rating,
            comment: req.body.comment
        });
    } catch (err) {
        console.error(err);
        res.send("Unable to save review");
    }
};

// Update - Edit a review
exports.updateReview = async (req, res) => {

};

// Delete - Remove a review
exports.removeReview = async (req, res) => {

};