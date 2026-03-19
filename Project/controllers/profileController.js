const User = require("../models/User");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect("/login");
        }
        
        const response = await fetch(
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.API_KEY}`
        );
        const data = await response.json();
        const genres = data.genres || [];

        const favouriteGenreNames = genres
            .filter(g => user.favouriteGenre && user.favouriteGenre.includes(String(g.id)))
            .map(g => g.name);

        res.render("profile", { user, favouriteGenreNames });
    } catch (err) {
        console.error(err);
        res.send("Error loading profile.");
    }
};

exports.getEditProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect("/login");
        }

        // calling api for genre 
        const response = await fetch(
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.API_KEY}`
        );
        const data = await response.json(); 
        const genres = data.genres || []; 
        

        res.render("editProfile", { user, genres, error: null });
    } catch (err) {
        console.error(err);
        res.send("Error loading edit profile page.");
    }
};

exports.postEditProfile = async (req, res) => {
    try {
        const { username, email, bio, favouriteGenre } = req.body;

        if (!username || !email) {
            const user = await User.findById(req.session.userId);

            return res.render("editProfile", {
                user,
                error: "Username and email cannot be empty."
            });
        }

        const genres = Array.isArray(favouriteGenre) ? favouriteGenre : [favouriteGenre]; 

        await User.findByIdAndUpdate(req.session.userId, {
            username,
            email,
            bio,
            favouriteGenre : genres
        });

        req.session.username = username;

        res.redirect("/profile");
    } catch (err) {
        console.error(err);
        res.send("Error updating profile.");
    }
};