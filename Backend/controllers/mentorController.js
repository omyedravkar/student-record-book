const StudentRecord = require('../models/StudentRecord')

// Mentor activity approve 
const approveActivity = async (req, res) => {
    try {
        const activity = await StudentRecord.findById(req.params.id)
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity Not Found' })
        }
        activity.status = 'VERIFIED'
        activity.verified_by = req.body.mentor_name
        activity.verified_at = new Date()
        activity.history.push({         // ← history of the activity
            action: 'Verified',
            timestamp: new Date(),
            note: `Approved by ${req.body.mentor_name}`
        });
        
        await activity.save()
        res.json({ success: true, message: 'Activity Verified Successfully !!', data: activity })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Mentor activity reject 
const rejectActivity = async (req, res) => {
    try {
        const activity = await StudentRecord.findById(req.params.id)
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity Not Found' })
        }
        activity.status = 'REJECTED'
        activity.rejection_reason = req.body.reason
        activity.verified_by = req.body.mentor_name
        activity.verified_at = new Date()
        
        activity.history.push({         // ← history of the activity
            action: 'Rejected',
            timestamp: new Date(),
            note: `Rejected by ${req.body.mentor_name} — ${req.body.reason}`
        });
        
        await activity.save()
        res.json({ success: true, message: 'Activity Rejected !!', data: activity })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// for mentor all activities is pending 
const getPendingActivities = async (req, res) => {
    try {
        const activities = await StudentRecord.find({ status: 'PENDING' })
        res.json({ success: true, data: activities })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
const getMentorHistory = async (req, res) => {
    try {
        const activities = await StudentRecord.find({
            status: { $in: ['VERIFIED', 'REJECTED'] },
            verified_by: req.query.mentor_name
        }).sort({ verified_at: -1 });
        res.json({ success: true, data: activities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { approveActivity, rejectActivity, getPendingActivities, getMentorHistory }