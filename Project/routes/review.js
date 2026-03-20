const express = require("express");
const router = express.Router({mergeParams: true}); // important for nested routes
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

// Routes
router.get('/', reviewController.getReview);
router.post('/', requireLogin, reviewValidation, reviewController.createReview);
router.get('/:reviewId/edit', requireLogin, (req, res) =>
  res.render('reviews/edit', { reviewId: req.params.reviewId, errors: [] })
);
// router.post('/:reviewId/update', requireLogin, reviewValidation, reviewController.updateReview);
// router.post('/:reviewId/delete', requireLogin, reviewController.deleteReview);

module.exports = router;
