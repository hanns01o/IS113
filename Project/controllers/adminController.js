exports.getAdminPage = async (req, res) => {
    res.render("adminDashboard", {username: req.session.username});
};

