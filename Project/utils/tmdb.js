// TMDB API Calls
const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.API_KEY;

const tmdb = {
  getGenres: async () => {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    const data = await res.json();
    return data.genres;
  },
  getMovies: async (category ) => {
    const res = await fetch(`${BASE_URL}/movie/${category}?api_key=${API_KEY}`);
    const data = await res.json();
    console.log(data);
    return data.results;
  },
  getMovie: async (category ) => {
    const res = await fetch(`${BASE_URL}/movie/${category}?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results;
  },
  getMovieById: async (movieId) => {
    const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    const data = await res.json();
    return data;
  },
};

module.exports = tmdb;