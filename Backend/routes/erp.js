const express = require('express')
const router = express.Router()
const { getErpData, getAllErpData } = require('../controllers/erpController')

// Specific student ka data PRN se
router.get('/student/:prn', getErpData)

// Saare students ka data
router.get('/all', getAllErpData)

module.exports = router