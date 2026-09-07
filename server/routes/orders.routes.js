const express = require('express');
const pool = require('../db');

const router = express.Router();

// List all orders for an employee
router.get('/list', async (req, res) => {
  try {
    const { employeeId } = req.query;
    if (!employeeId) return res.json({ success: false, message: 'Employee ID required' });

    const [orders] = await pool.query(
      `SELECT id, client_name, shop_name, order_details, order_amount,
              payment_received, pending_amount, payment_status, order_date
       FROM orders WHERE employee_id = ? ORDER BY id DESC`,
      [employeeId.toUpperCase()]
    );

    const totalPending = orders
      .filter(o => o.payment_status === 'Pending')
      .reduce((sum, o) => sum + parseFloat(o.pending_amount), 0);

    res.json({ success: true, orders, totalPending });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// Update payment received on a pending order
router.post('/update-payment', async (req, res) => {
  try {
    const { orderId, extraPayment } = req.body;
    if (!orderId || !extraPayment || extraPayment <= 0) {
      return res.json({ success: false, message: 'Valid order ID and amount required' });
    }

    const [rows] = await pool.query('SELECT order_amount, payment_received FROM orders WHERE id = ?', [orderId]);
    if (rows.length === 0) return res.json({ success: false, message: 'Order not found' });

    const order = rows[0];
    const newReceived = parseFloat(order.payment_received) + parseFloat(extraPayment);
    const newPending = Math.max(parseFloat(order.order_amount) - newReceived, 0);
    const newStatus = newPending <= 0 ? 'Paid' : 'Pending';

    await pool.query(
      'UPDATE orders SET payment_received = ?, pending_amount = ?, payment_status = ? WHERE id = ?',
      [newReceived, newPending, newStatus, orderId]
    );

    res.json({ success: true, paymentReceived: newReceived, pendingAmount: newPending, status: newStatus, message: 'Payment updated' });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
