const StudentRecord = require('../models/StudentRecord')

const getMyActivities = async (req, res) => {
    try {
        const activities = await StudentRecord.find({ prn: req.body.prn })
        res.json({ success: true, data: activities })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const addActivity = async (req, res) => {
    try {
        const activity = new StudentRecord({
            prn: req.body.prn,
            type: req.body.type,
            title: req.body.title,
            organisation: req.body.organisation,
            duration_weeks: req.body.duration_weeks,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            description: req.body.description,
            document_url: req.body.document_url,
            tags: req.body.tags
        })
        await activity.save()
        res.json({ success: true, message: 'Activity add ho gayi!', data: activity })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const editActivity = async (req, res) => {
    try {
        const activity = await StudentRecord.findById(req.params.id)
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity nahi mili' })
        }
        Object.assign(activity, req.body)
        await activity.save()
        res.json({ success: true, message: 'Activity update ho gayi!', data: activity })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const deleteActivity = async (req, res) => {
    try {
        await StudentRecord.findByIdAndDelete(req.params.id)
        res.json({ success: true, message: 'Activity delete ho gayi!' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Recruiter ke liye — sirf verified activities
const getVerifiedActivities = async (req, res) => {
    try {
        const activities = await StudentRecord.find({ status: 'VERIFIED' })
        res.json({ success: true, data: activities })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = { getMyActivities, addActivity, editActivity, deleteActivity, getVerifiedActivities }