const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");
const { requireLogin } = require("../middleware/authMiddleware");

router.get("/home", requireLogin, homeController.getHomePage);
router.post("/recentlyViewed/clear", homeController.clearRecentlyViewedController);

module.exports = router;