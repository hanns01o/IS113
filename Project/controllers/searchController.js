const SearchHistory = require('../models/SearchHistory');
const Movie = require('../models/Movie');
const tmdb = require('../utils/tmdb');

// CREATE or UPDATE search history
const saveSearch = async (userId, query) => {
    try {
        const existing = await SearchHistory.findOne({ userId, query });
        if (existing) {
            await SearchHistory.updateEntry(userId, query);
        } else {
            await SearchHistory.createEntry(userId, query);
        }
    } catch (err) {
        console.error('Error saving search history:', err);
    }
};

// READ — get latest 5 searches
const getHistory = async (userId) => {
    try {
        return await SearchHistory.getHistory(userId);
    } catch (err) {
        console.error('Error fetching search history:', err);
        return [];
    }
};

exports.searchMovies = async (req, res) => {
    const searchQuery = req.query.search;
    const userId = req.session.userId;

    try {
        if (searchQuery && userId) {
            await saveSearch(userId, searchQuery);
        }

        const customMovies = searchQuery
            ? await Movie.find({ title: { $regex: searchQuery, $options: 'i' }, status: "approved" }).sort({ createdAt: -1 })
            : [];

        const movies = searchQuery ? await tmdb.searchMovies(searchQuery) : [];

        const searchHistory = userId ? await getHistory(userId) : [];

        res.render('search', {
            movies,
            customMovies,
            searchHistory,
            searchQuery,
            mode: 'search'
        });
    } catch (err) {
        console.error('Error searching movies:', err);
        res.render('search', { error: 'Something went wrong while searching.' });
    }
};

exports.searchByGenre = async (req, res) => {
    const genreId = req.query.tag;
    const userId = req.session.userId;

    try {
        const customMovies = await Movie.find({ genre_ids: genreId, status: "approved" });
        const movies = await tmdb.searchByGenre(genreId);
        const searchHistory = userId ? await getHistory(userId) : [];

        // Resolve genre name from TMDB
        const genres = await tmdb.getGenres();
        const currentGenre = genres.find(g => g.id === parseInt(genreId));
        const genreName = currentGenre?.name || 'Unknown Genre';

        res.render('search', {
            movies,
            customMovies,
            searchHistory,
            searchQuery: genreName,
            genreId,
            mode: 'genre'
        });
    } catch (err) {
        console.error('Error searching by genre:', err);
        res.render('search', { error: 'Something went wrong while filtering by genre.' });
    }
};

exports.loadMore = async (req, res) => {
    const { mode, query, tag, page } = req.query;
    const pageNum = Number(page) || 2;

    try {
        let movies = [];

        if (mode === 'genre') {
            movies = await tmdb.searchByGenre(tag, pageNum);
        } else if (mode === 'search') {
            movies = await tmdb.searchMovies(query, pageNum);
        }

        res.json({ movies });
    } catch (err) {
        console.error('Load more error:', err);
        res.status(500).json({ error: 'Failed to load more movies.' });
    }
};

exports.deleteHistory = async (req, res) => {
    try {
        await SearchHistory.deleteEntry(req.body.id, req.session.userId);
        res.redirect('back');
    } catch (err) {
        console.error('Error deleting search history:', err);
        res.redirect('back');
    }
};

exports.getHistory = getHistory;