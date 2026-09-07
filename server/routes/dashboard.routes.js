const express = require('express');
const pool = require('../db');

const router = express.Router();

function monthStr() { return new Date().toISOString().slice(0, 7); }

router.get('/summary', async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.json({ success: false, message: 'Employee ID required' });

    const [kmRows] = await pool.query(
      "SELECT COALESCE(SUM(daily_km),0) AS total FROM km_logs WHERE employee_id = ? AND log_month = ?",
      [employeeId.toUpperCase(), monthStr()]
    );

    const [pendingRows] = await pool.query(
      "SELECT COUNT(*) AS cnt FROM orders WHERE employee_id = ? AND payment_status = 'Pending'",
      [employeeId.toUpperCase()]
    );

    res.json({
      success: true,
      monthKm: parseFloat(kmRows[0].total),
      pendingCount: pendingRows[0].cnt,
    });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
