const StudentRecord = require('../models/StudentRecord')

// Mentor activity approve 
const approveActivity = async (req, res) => {
    try {
        const activity = await StudentRecord.findById(req.params.id)
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity nahi mili' })
        }
        activity.status = 'VERIFIED'
        activity.verified_by = req.body.mentor_name
        activity.verified_at = new Date()
        await activity.save()
        res.json({ success: true, message: 'Activity verify ho gayi!', data: activity })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Mentor activity reject 
const rejectActivity = async (req, res) => {
    try {
        const activity = await StudentRecord.findById(req.params.id)
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity nahi mili' })
        }
        activity.status = 'REJECTED'
        activity.rejection_reason = req.body.reason
        activity.verified_by = req.body.mentor_name
        activity.verified_at = new Date()
        await activity.save()
        res.json({ success: true, message: 'Activity reject ho gayi!', data: activity })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Mentor ke liye — saari pending activities
const getPendingActivities = async (req, res) => {
    try {
        const activities = await StudentRecord.find({ status: 'PENDING' })
        res.json({ success: true, data: activities })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = { approveActivity, rejectActivity, getPendingActivities }