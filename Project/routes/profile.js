const express = require("express");
const router = express.Router();
const User = require("../models/User");

function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}

router.get("/profile", requireLogin, async (req, res) => {
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
});

router.get("/profile/edit", requireLogin, async (req, res) => {
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
});

router.post("/profile/edit", requireLogin, async (req, res) => {
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
});

module.exports = router;