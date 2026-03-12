const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");
const { requireLogin } = require("../middleware/authMiddleware");

router.get("/profile", requireLogin, profileController.getProfile);

router.get("/profile/edit", requireLogin, profileController.getEditProfile);

router.post("/profile/edit", requireLogin, profileController.postEditProfile);

module.exports = router;