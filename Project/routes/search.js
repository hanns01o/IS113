const express = require('express');
const router = express.Router();
const { searchMovies, deleteHistory, searchByGenre, loadMore } = require('../controllers/searchController');

router.get('/', searchMovies);
router.post('/delete', deleteHistory);

router.get('/genre', searchByGenre);
router.get('/more', loadMore);

module.exports = router;