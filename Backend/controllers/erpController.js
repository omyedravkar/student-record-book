// Demo ERP Data 
const erpData = [
    {
        prn: "246100030",
        name: "Soham Mahure",
        branch: "IT",
        semester: 4,
        cgpa: 7.8,
        attendance: 85,
        marks: {
            maths: 78,
            dsa: 85,
            os: 90,
            dbms: 88
        }
    },
    {
        prn: "246100014",
        name: "Om Yedravkar",
        branch: "IT",
        semester: 4,
        cgpa: 9.1,
        attendance: 92,
        marks: {
            maths: 90,
            dsa: 95,
            os: 88,
            dbms: 92
        }
    },
    {
        prn: "246100029",
        name: "Apurva Uike",
        branch: "IT",
        semester: 4,
        cgpa: 8.4,
        attendance: 78,
        marks: {
            maths: 70,
            dsa: 75,
            os: 80,
            dbms: 72
        }
    }
]

// fetching data from prn
const getErpData = async (req, res) => {
    try {
        const student = erpData.find(s => s.prn === req.params.prn)
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student ERP Data Not Found' 
            })
        }
        
        res.json({ success: true, data: student })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// all students erp data (for admin)
const getAllErpData = async (req, res) => {
    try {
        res.json({ success: true, data: erpData })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = { getErpData, getAllErpData }