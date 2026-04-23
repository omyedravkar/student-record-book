const express = require('express')
const router = express.Router()

const { searchStudents } = require('../controllers/recruiterController')

// GET /api/recruiter/search?type=project
router.get('/search', searchStudents)

module.exports = router