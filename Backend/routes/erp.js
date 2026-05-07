const express = require('express');
const router = express.Router();
const ErpData = require('../models/ErpData');

router.get('/student/:prn', async (req, res) => {
  try {
    const data = await ErpData.findOne({ prn: req.params.prn });
    if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const data = await ErpData.find({});
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;