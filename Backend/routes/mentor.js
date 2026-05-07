const express = require('express')
const router = express.Router()
const { approveActivity, rejectActivity, getPendingActivities, getMentorHistory } = require('../controllers/mentorController')

router.get('/pending', getPendingActivities)
router.get('/history', getMentorHistory)
router.put('/approve/:id', approveActivity)
router.put('/reject/:id', rejectActivity)

module.exports = router