const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/authMiddleware");

router.get("/admin", requireAdmin, adminController.getAdminPage);


module.exports = router;