const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

// ============================================
// REGISTER
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, mobile, area, email, role, password, securityQuestions } = req.body;

    if (!firstName || !lastName || !mobile || !area || !email || !password) {
      return res.json({ success: false, message: 'Please fill all required fields' });
    }
    if (!securityQuestions || securityQuestions.length < 5) {
      return res.json({ success: false, message: 'Please answer all 5 security questions' });
    }

    const finalRole = role === 'manager' ? 'manager' : 'sales';
    const roleCode = finalRole === 'manager' ? 'M' : 'S';
    const startNumber = finalRole === 'manager' ? 2000 : 1000;

    const [rows] = await pool.query(
      'SELECT employee_id FROM employees WHERE role = ? ORDER BY id DESC LIMIT 1',
      [finalRole]
    );

    let nextSerial = startNumber + 1;
    if (rows.length > 0) {
      const parts = rows[0].employee_id.split('-');
      const lastSerial = parseInt(parts[parts.length - 1], 10);
      if (lastSerial >= startNumber) nextSerial = lastSerial + 1;
    }
    const employeeId = `EMP-${roleCode}-${nextSerial}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO employees
        (employee_id, first_name, last_name, mobile, area, email, role, password,
         security_q1, security_a1, security_q2, security_a2, security_q3, security_a3,
         security_q4, security_a4, security_q5, security_a5)
       VALUES (?,?,?,?,?,?,?,?, ?,?, ?,?, ?,?, ?,?, ?,?)`,
      [
        employeeId, firstName, lastName, mobile, area, email, finalRole, hashedPassword,
        securityQuestions[0]?.question || '', securityQuestions[0]?.answer || '',
        securityQuestions[1]?.question || '', securityQuestions[1]?.answer || '',
        securityQuestions[2]?.question || '', securityQuestions[2]?.answer || '',
        securityQuestions[3]?.question || '', securityQuestions[3]?.answer || '',
        securityQuestions[4]?.question || '', securityQuestions[4]?.answer || '',
      ]
    );

    res.json({ success: true, employeeId, message: 'Registration successful' });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// ============================================
// LOGIN
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    if (!employeeId || !password) {
      return res.json({ success: false, message: 'Employee ID and Password are required' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employeeId.trim().toUpperCase()]
    );

    if (rows.length === 0) return res.json({ success: false, message: 'Employee ID not found' });

    const employee = rows[0];
    const match = await bcrypt.compare(password, employee.password);
    if (!match) return res.json({ success: false, message: 'Incorrect password' });

    delete employee.password;
    for (let i = 1; i <= 5; i++) delete employee[`security_a${i}`];

    res.json({ success: true, employee, message: 'Login successful' });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// ============================================
// FORGOT PASSWORD — get questions
// ============================================
router.post('/forgot/questions', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) return res.json({ success: false, message: 'Employee ID is required' });

    const [rows] = await pool.query(
      'SELECT security_q1, security_q2, security_q3, security_q4, security_q5 FROM employees WHERE employee_id = ?',
      [employeeId.trim().toUpperCase()]
    );
    if (rows.length === 0) return res.json({ success: false, message: 'Employee ID not found' });

    const r = rows[0];
    res.json({ success: true, questions: [r.security_q1, r.security_q2, r.security_q3, r.security_q4, r.security_q5] });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

// ============================================
// FORGOT PASSWORD — verify + reset
// ============================================
router.post('/forgot/reset', async (req, res) => {
  try {
    const { employeeId, answers, newPassword } = req.body;
    if (!employeeId || !answers || answers.length < 5 || !newPassword) {
      return res.json({ success: false, message: 'Missing required fields' });
    }

    const [rows] = await pool.query(
      'SELECT security_a1, security_a2, security_a3, security_a4, security_a5 FROM employees WHERE employee_id = ?',
      [employeeId.trim().toUpperCase()]
    );
    if (rows.length === 0) return res.json({ success: false, message: 'Employee ID not found' });

    const r = rows[0];
    const stored = [r.security_a1, r.security_a2, r.security_a3, r.security_a4, r.security_a5]
      .map(a => (a || '').trim().toLowerCase());

    for (let i = 0; i < 5; i++) {
      if ((answers[i] || '').trim().toLowerCase() !== stored[i]) {
        return res.json({ success: false, message: 'One or more answers are incorrect' });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE employees SET password = ? WHERE employee_id = ?', [
      hashedPassword, employeeId.trim().toUpperCase(),
    ]);

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.json({ success: false, message: 'Server error: ' + err.message });
  }
});

module.exports = router;
