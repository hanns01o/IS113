const User = require("../models/User");

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.redirect("/login");
        }

        res.render("profile", { user });
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

        res.render("editProfile", { user, error: null });
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

        await User.findByIdAndUpdate(req.session.userId, {
            username,
            email,
            bio,
            favouriteGenre
        });

        req.session.username = username;

        res.redirect("/profile");
    } catch (err) {
        console.error(err);
        res.send("Error updating profile.");
    }
};