const express = require('express')
const router = express.Router()
const {
    addActivity,
    getMyActivities,
    editActivity,
    deleteActivity
} = require('../controllers/studentRecordController')

router.get('/my', getMyActivities)
router.post('/add', addActivity)
router.put('/edit/:id', editActivity)
router.delete('/delete/:id', deleteActivity)

module.exports = router