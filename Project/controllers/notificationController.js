const Notification = require("../models/NotificationModel");

exports.getNotifications = async (req, res) => { 
    try{ 
        if(!req.session.userId){ 
            return res.redirect("/login")
        }
        const notifications = await Notification.find({ 
            userId: req.session.userId
        }).sort({ createdAt: -1 }); 
        res.render("notifications", { notifications })
    } catch (err) { 
        console.error(err); 
        res.status(500).send("Error loading notifications.")
    }
}

exports.markAsRead = async (req, res) => { 
    try{ 
        if(!req.session.userId){ 
            return res.redirect("/login")
        }

        await Notification.findOneAndUpdate( 
            { 
                _id: req.params.id, 
                userId: req.session.userId
            }, 
            { 
                isRead: true
            }
        ); 
        res.redirect("/notifications"); 
    } catch (err) { 
        console.error(err); 
        res.status(500).send("Error updating notification."); 
    }
}

exports.markAllAsRead = async (req, res) => { 
    try{ 
        if(!req.session.userId){ 
            return res.redirect("/login"); 
        }

        await Notification.updateMany(
            { userId: req.session.userId, isRead: false }, 
            { isRead: true }
        ); 

        res.redirect("/notifications"); 
    } catch (err) { 
        console.error(err); 
        res.status(500).send("Error marking all the notifications as read."); 
    }
}

exports.clearAllNotification = async(req, res) => { 
    try{ 
        if(!req.session.userId){ 
            return res.redirect("/login"); 
        }

        await Notification.deleteMany({ userId: req.session.userId, isRead: true }); 

        res.redirect("/notifications"); 
    } catch (err){ 
        console.log(err); 
        res.status(500).send("Error clearing notifications."); 
    }
}