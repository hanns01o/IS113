const Notification = require("../models/NotificationModel");

async function createNotification(userId, message, type = "general", relatedId = null) {
    try {
        await Notification.create({
        userId,
        message,
        type,
        relatedId
        });
    } catch (err) {
        console.error("Error creating notification:", err);
    }
}

module.exports = {
    createNotification
};