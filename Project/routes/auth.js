const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { alreadyLoggedIn } = require("../middleware/authMiddleware");

router.get("/signup", alreadyLoggedIn, authController.getSignup);
router.post("/signup", authController.postSignup);

router.get("/login", alreadyLoggedIn, authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/logout", authController.logout);

module.exports = router;