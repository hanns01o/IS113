const SearchHistory = require('../models/SearchHistory');
const Movie = require('../models/Movie'); // add this
const tmdb = require('../utils/tmdb');

// CREATE or UPDATE search history
const saveSearch = async (userId, query) => {
    const existing = await SearchHistory.findOne({ userId, query });

    if (existing) {
        await SearchHistory.updateEntry(userId, query);
    } else {
        await SearchHistory.createEntry(userId, query);
    }
};

// READ — get latest 5 searches
const getHistory = async (userId) => {
  return await SearchHistory.getHistory(userId); 
};

exports.searchMovies = async (req, res) => {
    const searchQuery = req.query.search;
    const userId = req.session.userId;

    // Update search history if the same search and userId is found
    if (searchQuery && userId) {
        await saveSearch(userId, searchQuery);
    }

    // Search community movies from DB
    const customMovies = searchQuery
        ? await Movie.find({ title: { $regex: searchQuery, $options: 'i' } }).sort({ createdAt: -1 })
        : [];


    // Fetch results from TMDB
    const movies = searchQuery ? await tmdb.searchMovies(searchQuery) : [];

    // Get history for dropdown
    const searchHistory = userId ? await getHistory(userId) : [];

    res.render('search', {
        movies,
        customMovies,
        searchHistory,
        searchQuery,
        formattedCategory: `Results for "${searchQuery}"`
    });
};

// DELETE — remove one entry
exports.deleteHistory = async (req, res) => {
  await SearchHistory.deleteEntry(req.body.id, req.session.userId);
  res.redirect('back');
};

exports.getHistory = getHistory; // export the same function