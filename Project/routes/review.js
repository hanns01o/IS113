const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controllers/reviewController");
const { requireLogin } = require("../middleware/authMiddleware");

// Read
router.get('/', reviewController.getReview);

// Create
router.post('/', requireLogin, reviewController.createReview);
router.get('/new', requireLogin, (req, res) => { res.render('reviews/new', { movieId: req.params.movieId, errors: [] }); });

// Update
router.get('/:reviewId/update', requireLogin, reviewController.getEditForm);
router.post('/:reviewId/update', requireLogin, reviewController.updateReview);

// Delete
router.post('/:reviewId/delete', requireLogin, reviewController.deleteReview);

module.exports = router;
