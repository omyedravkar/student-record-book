const mongoose = require('mongoose')

const erpDataSchema = new mongoose.Schema({
    prn: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    dob: { type: String },
    branch: { type: String },
    semester: { type: Number },
    year: { type: Number },
    cgpa: { type: Number },
    attendance: { type: Number },
    marks: {
        maths: { type: Number },
        dsa: { type: Number },
        os: { type: Number },
        dbms: { type: Number }
    },
    role: { 
        type: String, 
        enum: ['student', 'mentor', 'admin'],
        default: 'student'
    }
})

module.exports = mongoose.model('ErpData', erpDataSchema)