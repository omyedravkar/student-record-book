const express = require('express')
const router = express.Router()
const upload = require('../config/uploads')
const {
    addActivity,
    getMyActivities,
    editActivity,
    deleteActivity,
    getVerifiedActivities,
    searchStudents,
    getActivityById
} = require('../controllers/studentRecordController')

router.get('/my', getMyActivities)
router.post('/add', upload.single('document'), addActivity)
router.put('/edit/:id', editActivity)
router.delete('/delete/:id', deleteActivity)
router.get('/verified', getVerifiedActivities)
router.get('/search', searchStudents)
router.get('/detail/:id', getActivityById) // ← history of the activity

module.exports = router