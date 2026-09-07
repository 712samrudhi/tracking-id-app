const express = require('express');
const pool = require('../db');

const router = express.Router();

function todayStr() { return new Date().toISOString().split('T')[0]; }
function monthStr() { return new Date().toISOString().slice(0, 7); }

// Save a client visit + optional order
router.post('/save', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { employeeId, clientName, mobile, shopName, remark, orderTaken,
      orderDetails, orderAmount, paymentReceived } = req.body;

    if (!employeeId || !clientName || !mobile || !shopName) {
      conn.release();
      return res.json({ success: false, message: 'Client Name, Mobile and Shop Name are required' });
    }

    await conn.beginTransaction();

    const [visitResult] = await conn.query(
      `INSERT INTO client_visits (employee_id, client_name, mobile, shop_name, remark, order_taken, visit_date, visit_month)
       VALUES (?,?,?,?,?,?,?,?)`,
      [employeeId.toUpperCase(), clientName, mobile, shopName, remark || '', orderTaken ? 1 : 0, todayStr(), monthStr()]
    );
    const visitId = visitResult.insertId;

    if (orderTaken) {
      const amount = parseFloat(orderAmount) || 0;
      const received = parseFloat(paymentReceived) || 0;

      if (!orderDetails || amount <= 0) {
        await conn.rollback();
        conn.release();
        return res.json({ success: false, message: 'Order Details and Order Amount are required when Order is taken' });
      }

      const pendingAmount = Math.max(amount - received, 0);
      const status = pendingAmount <= 0 ? 'Paid' : 'Pending';

      await conn.query(
        `INSERT INTO orders
          (employee_id, visit_id, client_name, shop_name, mobile, order_details, order_amount,
           payment_received, pending_amount, payment_status, order_date, order_month)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [employeeId.toUpperCase(), visitId, clientName, shopName, mobile, orderDetails, amount,
          received, pendingAmount, status, todayStr(), monthStr()]
      );
    }

    await conn.commit();
    conn.release();
    res.json({ success: true, visitId, message: 'Visit saved successfully' });
  } catch (err) {
    await conn.rollback();
    conn.release();
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// List this month's client visits
router.get('/list', async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.json({ success: false, message: 'Employee ID required' });

    const [visits] = await pool.query(
      `SELECT id, client_name, mobile, shop_name, remark, order_taken, visit_date
       FROM client_visits WHERE employee_id = ? AND visit_month = ? ORDER BY id DESC`,
      [employeeId.toUpperCase(), monthStr()]
    );

    res.json({ success: true, visits });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
