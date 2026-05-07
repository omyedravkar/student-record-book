const StudentRecord = require('../models/StudentRecord')
const ErpData = require('../models/ErpData')

const searchStudents = async (req, res) => {
    try {
        const { type, minCgpa } = req.query

        // Step 1 —  VERIFIED activities 
        let activities = await StudentRecord.find({ status: 'VERIFIED' })

        // Step 2 — Type filter
        if (type) {
            activities = activities.filter(a => a.type === type)
        }

        // Step 3 — CGPA filter — from database 
        if (minCgpa !== undefined) {
            const cgpaValue = Number(minCgpa)
            const filtered = []
            for (const a of activities) {
                const student = await ErpData.findOne({ prn: a.prn })
                if (!student) continue
                if (student.cgpa >= cgpaValue) {
                    filtered.push(a)
                }
            }
            activities = filtered
        }

        // Step 4 — CGPA through sort highest first
        const erpAll = await ErpData.find({})
        activities.sort((a, b) => {
            const studentA = erpAll.find(s => s.prn === a.prn)
            const studentB = erpAll.find(s => s.prn === b.prn)
            return (studentB?.cgpa || 0) - (studentA?.cgpa || 0)
        })

        // Step 5 — CGPA, name add in result 
        const result = activities.map(a => {
            const student = erpAll.find(s => s.prn === a.prn)
            return {
                ...a._doc,
                cgpa: student ? student.cgpa : 'N/A',
                studentName: student ? student.name : 'N/A'
            }
        })

        res.json({ success: true, data: result })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = { searchStudents }