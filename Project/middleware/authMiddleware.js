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

function requireAdmin(req, res, next) {
    if(!req.session.userId || req.session.role !== "admin") {
        return res.status(403).send("Access denied. Admins only.");
    }

    next();
}

module.exports = {
    alreadyLoggedIn, 
    requireLogin,
    requireAdmin
};