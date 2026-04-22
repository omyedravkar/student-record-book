const express = require('express')
const router = express.Router()
const { approveActivity, rejectActivity, getPendingActivities } = require('../controllers/mentorController')

router.get('/pending', getPendingActivities)
router.put('/approve/:id', approveActivity)
router.put('/reject/:id', rejectActivity)

module.exports = router