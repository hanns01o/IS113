// services/tmdb.js
const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.API_KEY;

const tmdb = {
  getMovies: async (category = 'popular', page = 1) => {
    const res = await fetch(`${BASE_URL}/movie/${category}?api_key=${API_KEY}&page=${page}`);
    const data = await res.json();
    return data.results;
  },

  getMovieById: async (movieId) => {
    const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    const data = await res.json();
    return data;
  },

  getGenres: async () => {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    const data = await res.json();
    return data.genres;
  },
};

module.exports = tmdb;