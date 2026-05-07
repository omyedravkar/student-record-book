const StudentRecord = require('../models/StudentRecord')
const generateTags = require('../config/tagGenrator')

const getMyActivities = async (req, res) => {
    try {
        const activities = await StudentRecord.find({ prn: req.query.prn })
        res.json({ success: true, data: activities })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const addActivity = async (req, res) => {
    try {
        const recordData = {
            prn: req.body.prn,
            type: req.body.type,
            subcategory: req.body.subcategory || '',
            level: req.body.level || '',
            title: req.body.title,
            organisation: req.body.organisation,
            duration_weeks: req.body.duration_weeks,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            description: req.body.description,
            document_url: req.file ? `/uploads/${req.file.filename}` : req.body.document_url,
        }

        const autoTags = generateTags(recordData)
        const customTags = req.body.customTags ? req.body.customTags.split(',').map(t => t.trim().toLowerCase()) : []
        recordData.tags = [...new Set([...autoTags, ...customTags])]

        const activity = new StudentRecord(recordData)
        await activity.save()
        res.json({ success: true, message: 'Activity added!', data: activity })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const editActivity = async (req, res) => {
    try {
       const activity = await StudentRecord.findById(req.params.id)

if (!activity) {
    return res.status(404).json({ 
        success: false, 
        message: 'Activity not found' 
    })
}

// Time lock check
const lockDate = activity.created_at



const now = new Date()
const submittedAt = new Date(lockDate)
const diffDays = (now - submittedAt) / (1000 * 60 * 60 * 24)  //minutes  

if (diffDays > 7) {
    return res.status(403).json({ 
        success: false, 
        message: 'Edit window closed.' 
    })
}     Object.assign(activity, req.body)

activity.created_at = activity.created_at 


        activity.submitted_at = new Date()  // ← submitted timestamp
        if (!activity.history) activity.history = [];
        activity.history.push({            // ← history of the activity
        action: 'Edited',
        timestamp: new Date(),
        note: 'Activity updated and resubmitted'
        });
        await activity.save()
        res.json({ success: true, message: 'Activity updated!', data: activity })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const deleteActivity = async (req, res) => {
    try {
        await StudentRecord.findByIdAndDelete(req.params.id)
        res.json({ success: true, message: 'Activity deleted!' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const getVerifiedActivities = async (req, res) => {
    try {
        const activities = await StudentRecord.find({ status: 'VERIFIED' })
        res.json({ success: true, data: activities })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const searchStudents = async (req, res) => {
    try {
        const q = req.query.q || ''
        const type = req.query.type || ''

        let matchQuery = { status: 'VERIFIED' }
        if (type) matchQuery.type = type

        let records
        if (q) {
            records = await StudentRecord.find({
                ...matchQuery,
                $text: { $search: q }
            }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } })
        } else {
            records = await StudentRecord.find(matchQuery)
        }

        // Group by PRN
        const grouped = {}
        records.forEach(r => {
            if (!grouped[r.prn]) {
                grouped[r.prn] = {
                    prn: r.prn,
                    matched: q ? true : false,
                    records: []
                }
            }
            grouped[r.prn].records.push(r)
        })

        const result = Object.values(grouped)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
const getActivityById = async (req, res) => {
    try {
        const activity = await StudentRecord.findById(req.params.id)
        if (!activity) {
            return res.status(404).json({ success: false, message: 'Activity not found' })
        }
        res.json({ success: true, data: activity })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
module.exports = { getMyActivities, addActivity, editActivity, deleteActivity, getVerifiedActivities, searchStudents, getActivityById }