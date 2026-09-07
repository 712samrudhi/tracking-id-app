const express = require('express');
const pool = require('../db');

const router = express.Router();
const RATE_PER_KM = parseFloat(process.env.RATE_PER_KM || '3');

function todayStr() { return new Date().toISOString().split('T')[0]; }
function monthStr() { return new Date().toISOString().slice(0, 7); }

// Save a GPS-tracked trip
router.post('/save', async (req, res) => {
  try {
    const { employeeId, dailyKm, startLat, startLng, endLat, endLng, routePoints, startedAt, endedAt } = req.body;

    if (!employeeId || dailyKm === undefined || dailyKm < 0) {
      return res.json({ success: false, message: 'Missing or invalid tracking data' });
    }

    const roundedKm = Math.round(dailyKm * 100) / 100;
    const payment = Math.round(roundedKm * RATE_PER_KM * 100) / 100;

    await pool.query(
      `INSERT INTO km_logs
        (employee_id, log_date, log_month, daily_km, payment, start_lat, start_lng, end_lat, end_lng, route_points, started_at, ended_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        employeeId.toUpperCase(), todayStr(), monthStr(), roundedKm, payment,
        startLat || null, startLng || null, endLat || null, endLng || null,
        routePoints ? JSON.stringify(routePoints) : null,
        startedAt || null, endedAt || null,
      ]
    );

    res.json({ success: true, dailyKm: roundedKm, payment, message: 'KM log saved' });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// List this month's KM logs
router.get('/list', async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.json({ success: false, message: 'Employee ID required' });

    const [logs] = await pool.query(
      `SELECT log_date, daily_km, payment FROM km_logs
       WHERE employee_id = ? AND log_month = ? ORDER BY log_date DESC, id DESC`,
      [employeeId.toUpperCase(), monthStr()]
    );

    const monthTotal = logs.reduce((sum, l) => sum + parseFloat(l.daily_km), 0);
    res.json({ success: true, logs, monthTotal, ratePerKm: RATE_PER_KM });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
