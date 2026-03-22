const Watchlist = require("../models/Watchlist");
const User = require("../models/User"); 

exports.getHomePage = async (req, res) => {
  try {
    let watchlistMovies = [];
    let featuredMovies = [];
    let recommendedMovies = []; 

    let user = null; 

    if (req.session.userId) {
      user = await User.findById(req.session.userId); 

    //   const watchlistItems = await Watchlist.find({ userId: req.session.userId })
    //     .populate("movieId");

    //   watchlistMovies = watchlistItems
    //     .map(item => item.movieId)
    //     .filter(movie => movie);
    // }
      watchlistMovies = await Watchlist.find({ userId: req.session.userId })
        .sort({ addedAt: -1 })
        .limit(5);
    }

    const category = "popular";
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${category}?api_key=${process.env.API_KEY}`
    );

    const data = await response.json();

    if (data.results) {
      featuredMovies = data.results
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
      const genreIds = user.favouriteGenre.join(","); 
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
      watchlistMovies,  //: previewWatchlist
      recommendedMovies
    });
  } catch (err) {
    console.error(err);
    res.send("Error loading home page.");
  }
};