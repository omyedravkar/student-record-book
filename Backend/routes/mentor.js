const express = require('express')
const router = express.Router()
const { approveActivity, rejectActivity } = require('../controllers/mentorController')

router.put('/approve/:id', approveActivity)
router.put('/reject/:id', rejectActivity)

module.exports = router