const express = require('express')
const router = express.Router()
const { getErpData, getAllErpData } = require('../controllers/erpController')

// specific student data from erp
router.get('/student/:prn', getErpData)

// all students data
router.get('/all', getAllErpData)

module.exports = router