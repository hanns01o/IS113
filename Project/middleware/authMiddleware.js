function requireLogin(req, res, next){
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    next();
};

function alreadyLoggedIn(req, res, next) {
    if (req.session.userId) {
        return res.redirect("/home");
    }
    next();
}

module.exports = {
    alreadyLoggedIn, 
    requireLogin
};