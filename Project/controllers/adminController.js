const {createNotification} = require("../utils/notificationHelper")
const Report = require("../models/Report"); 

exports.getAdminPage = async (req, res) => {
    res.render("adminDashboard", {username: req.session.username});
};

exports.approveReport = async (req, res) => {
    try{ 
        const reportId = req.params.id; 
        const report = await Report.findById(reportId); 
        if(!report){ 
            return  res.status(404).send("Report not found."); 
        }

        report.status = "approved"; 
        await report.save(); 

        await createNotification( 
            report.userId, 
            "Your report has been approved by admin", 
            "report", 
            report._id.toString() 
        ); 
        res.direct("/admin/reports"); 
    } catch (err) { 
        console.error(err); 
        res.status(500).send("Error in approving report.")
    }
}