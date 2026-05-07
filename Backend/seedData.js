const mongoose = require('mongoose')
const ErpData = require('./models/ErpData')
const User = require('./models/User')
require('dotenv').config()

const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const erpRecords = [
    // Students
    {
        prn: "246100030",
        name: "Soham Mahure",
        email: "soham@walchandsangli.ac.in",
        phone: "9876543210",        
        dob: "2005-05-12",
        branch: "IT", semester: 4, year: 2,
        cgpa: 7.8, attendance: 85,
        marks: { maths: 78, dsa: 85, os: 90, dbms: 88 },
        role: "student"
    },
    {
        prn: "246100014",
        name: "Om Yedravkar",
        email: "om@walchandsangli.ac.in",
        phone: "9876543210",
        dob: "2005-06-15",
        branch: "IT", semester: 4, year: 2,
        cgpa: 9.1, attendance: 92,
        marks: { maths: 90, dsa: 95, os: 88, dbms: 92 },
        role: "student"
    },
    {
        prn: "246100029",
        name: "Apurva Uike",
        email: "apurva@walchandsangli.ac.in",
        phone: "9876543210",
        dob: "2005-07-20",
        branch: "IT", semester: 4, year: 2,
        cgpa: 8.4, attendance: 88,
        marks: { maths: 82, dsa: 88, os: 85, dbms: 90 },
        role: "student"
    },
    // Mentors
    {
        prn: "MENTOR001",
        name: "Prof. Rathod",
        email: "rathod@walchandsangli.ac.in",
        phone: "9876543210",
        dob: "1980-01-01",
        branch: "IT", semester: 0, year: 0,
        cgpa: 0, attendance: 0,
        marks: { maths: 0, dsa: 0, os: 0, dbms: 0 },
        role: "mentor"
    },
    {
        prn: "MENTOR002",
        name: "Prof. Sharma",
        email: "sharma@walchandsangli.ac.in",
        phone: "9876543210",
        dob: "1985-05-10",
        branch: "CSE", semester: 0, year: 0,
        cgpa: 0, attendance: 0,
        marks: { maths: 0, dsa: 0, os: 0, dbms: 0 },
        role: "mentor"
    },
    // Admins
    {
        prn: "ADMIN001",
        name: "Admin One",
        email: "admin1@walchandsangli.ac.in",
        phone: "9845643210",
        dob: "1985-05-10",
        branch: "Admin", semester: 0, year: 0,
        cgpa: 0, attendance: 0,
        marks: { maths: 0, dsa: 0, os: 0, dbms: 0 },
        role: "admin"
    },
    {
        prn: "ADMIN002",
        name: "Admin Two",
        email: "admin2@walchandsangli.ac.in",
        phone: "9876578910",
        dob: "1985-05-10",
        branch: "Admin", semester: 0, year: 0,
        cgpa: 0, attendance: 0,
        marks: { maths: 0, dsa: 0, os: 0, dbms: 0 },
        role: "admin"
    }
]

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected')

        // clearing old data
        await ErpData.deleteMany({})
        await User.deleteMany({})
        console.log('Old data cleared')

        // inseting ERP data 
        await ErpData.insertMany(erpRecords)
        console.log('ERP data inserted')

        // creating user with same data
        for (const record of erpRecords) {
            const user = new User({
                prn: record.prn,
                name: record.name,
                email: record.email,
                password: record.prn.toLowerCase() + "123",
                role: record.role,
                branch: record.branch,
                year: record.year
            })
            await user.save()
        }
        console.log('Users created')
        console.log('-------------------')
        console.log('Login credentials:')
        erpRecords.forEach(r => {
            console.log(`${r.role.toUpperCase()} | ${r.email} | ${r.prn.toLowerCase()}123`)
        })

        mongoose.connection.close()
    } catch (error) {
        console.error('Error:', error)
    }
}

seedDatabase()