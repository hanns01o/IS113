const express = require("express");
const router = express.Router({mergeParams: true});
const reviewController = require("../controllers/reviewController");
const { requireLogin } = require("../middleware/authMiddleware");
const { body } = require('express-validator');

// Validation Rules
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 10 })
    .withMessage('Rating must be between 1 and 10'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

// ROUTES

// Read
router.get('/', reviewController.getReview);

// Create
router.post('/', requireLogin, reviewValidation, reviewController.createReview);
router.get('/new', requireLogin, (req, res) => {
    res.render('reviews/new', { movieId: req.params.movieId, errors: [] });
});

// Update
router.get('/:reviewId/update', requireLogin, reviewController.getEditForm);
router.post('/:reviewId/update', requireLogin, reviewController.updateReview);

// Delete
router.post('/:reviewId/delete', requireLogin, reviewController.deleteReview);

module.exports = router;
