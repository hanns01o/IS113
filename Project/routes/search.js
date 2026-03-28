const express = require('express');
const router = express.Router();
const { searchMovies, deleteHistory } = require('../controllers/searchController');

router.get('/', searchMovies);
router.post('/delete', deleteHistory);

module.exports = router;