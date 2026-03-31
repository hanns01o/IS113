const express = require("express"); 
const router = express.Router(); 
const notificationController = require("../controllers/notificationController"); 

router.get("/notifications", notificationController.getNotifications); 
router.post("/notifications/read/:id", notificationController.markAsRead); 
router.post("/notifications/readAll", notificationController.markAllAsRead);
router.post("/notifications/clearAll", notificationController.clearAllNotification)

module.exports = router; 