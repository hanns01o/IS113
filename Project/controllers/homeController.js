const Watchlist = require("../models/Watchlist");
const User = require("../models/User"); 
const {getRecentlyViewed, clearRecentlyViewed} = require("../utils/recentlyViewedHelper");
const { getMovies } = require("../utils/tmdb");

exports.getHomePage = async (req, res) => {
  try {
    let watchlistMovies = [];
    let filterMovies = [];
    let recentlyWatched = [];
    let featuredMovies = [];
    let recommendedMovies = []; 
    let recentlyViewedMovies = []; 

    let user = null; 

    if (req.session.userId) {
      user = await User.findById(req.session.userId); 

      recentlyViewedMovies = await getRecentlyViewed(String(req.session.userId)); 

      watchlistMovies = await Watchlist.find({ userId: req.session.userId })
        .sort({ addedAt: -1 })
        .limit(5);

      filterMovies = await Watchlist.find({ userId: req.session.userId})
        .sort({ watchedDate: -1})
      
      recentlyWatched = filterMovies.filter(movie => movie.watchedDate)
        .slice(0,5)
    }

    const movies = await getMovies();
    if (movies) {
      featuredMovies = movies
        .filter(movie => movie.backdrop_path)
        .slice(0, 3)
        .map(movie => ({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          backdropUrl: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
          posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          rating: movie.vote_average,
          releaseDate: movie.release_date
        }));
    }

    if (user && user.favouriteGenre && user.favouriteGenre.length > 0){
      // if the user set their fav genre, it will be the latest show containing at least one of the fav genre. If not random show with the latest release date will be shown. 
      const genreIds = user.favouriteGenre.join("|"); 
      const recommendResponse = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&with_genres=${genreIds}&sort_by=primary_release_date.desc`
      );

      const recommendData = await recommendResponse.json(); 
      if(recommendData.results){ 
        recommendedMovies = recommendData.results
          .filter(movie => movie.poster_path)
          .slice(0, 10)
          .map(movie => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            backdropUrl: movie.backdrop_path
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
              : null,
            rating: movie.vote_average,
            releaseDate: movie.release_date
          }));
      }

    }

    // const previewWatchlist = watchlistMovies.slice(0, 5);

    res.render("home", {
      featuredMovies,
      filterMovies,
      watchlistMovies,
      recentlyWatched,
      recommendedMovies, 
      recentlyViewedMovies
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading home page.");
  }
};

exports.clearRecentlyViewedController = (req, res) => { 
  try{ 
    clearRecentlyViewed(String(req.session.userId)); 
    res.redirect("/home"); 
  } catch (err) { 
    console.log(err); 
    res.send("Error clearing recently viewed")
  }
}