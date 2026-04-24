const StudentRecord = require('../models/StudentRecord')

// Demo ERP data (same as erpController)
const erpData = [
    { prn: "246100030", cgpa: 7.8 },
    { prn: "246100014", cgpa: 9.1 },
    { prn: "246100029", cgpa: 8.1 },
]

const searchStudents = async (req, res) => {
    try {
        const { type, minCgpa } = req.query
        console.log("minCgpa:", minCgpa)
        let activities = await StudentRecord.find({ status: 'VERIFIED' })

        // Step 1: type filter
        if (type) {
            activities = activities.filter(a => a.type === type)
        }

        // Step 2: CGPA filter
        if (minCgpa !== undefined) {
        const cgpaValue = Number(minCgpa)

        activities = activities.filter(a => {
        const student = erpData.find(s => s.prn === a.prn)
        if (!student) return false

        return student.cgpa >= cgpaValue
    })
}

//gives highest cgpa student on top
activities.sort((a, b) => {
    const studentA = erpData.find(s => s.prn === a.prn)
    const studentB = erpData.find(s => s.prn === b.prn)

    return (studentB?.cgpa || 0) - (studentA?.cgpa || 0)
})

    const result = activities.map(a => {
    const student = erpData.find(s => s.prn === a.prn)
    return {
        ...a._doc,
        cgpa: student ? student.cgpa : 'N/A'
    }
})
res.json({ success: true, data: result })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = { searchStudents }