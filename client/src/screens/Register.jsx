import React, { useState } from 'react';
import { apiPost } from '../api.js';

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What is the name of your favorite village/town?",
  "What was the brand of your first mobile phone?",
  "What is your father's nickname?",
];

export default function Register({ nav, toast }) {
  const [role, setRole] = useState('sales');
  const [form, setForm] = useState({ firstName: '', lastName: '', mobile: '', area: '', email: '', password: '' });
  const [answers, setAnswers] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  function update(field, value) { setForm({ ...form, [field]: value }); }
  function updateAnswer(i, value) { const c = [...answers]; c[i] = value; setAnswers(c); }

  async function handleRegister() {
    const { firstName, lastName, mobile, area, email, password } = form;
    if (!firstName || !lastName || !mobile || !area || !email || !password) {
      toast('Please fill all required fields'); return;
    }
    if (mobile.length !== 10) { toast('Mobile number must be 10 digits'); return; }
    if (answers.some(a => !a.trim())) { toast('Please answer all 5 security questions'); return; }

    const securityQuestions = SECURITY_QUESTIONS.map((q, i) => ({ question: q, answer: answers[i] }));

    setLoading(true);
    const result = await apiPost('/auth/register', { ...form, role, securityQuestions });
    setLoading(false);

    if (result.success) {
      alert(`Registration successful!\n\nYour Employee ID: ${result.employeeId}\n\nSave this ID — you'll need it to login.`);
      nav('login');
    } else {
      toast(result.message || 'Registration failed');
    }
  }

  return (
    <div className="screen active">
      <div className="topbar"><button className="back" onClick={() => nav('login')}>←</button><h2>New Registration</h2></div>
      <div className="body-pad">
        <label>First Name</label>
        <input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="e.g. Rahul" />
        <label>Last Name</label>
        <input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="e.g. Patil" />
        <label>Mobile Number</label>
        <input value={form.mobile} onChange={e => update('mobile', e.target.value)} maxLength={10} placeholder="10-digit mobile number" />
        <label>Area</label>
        <input value={form.area} onChange={e => update('area', e.target.value)} placeholder="e.g. Kolhapur" />
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="email@example.com" />

        <label>Role</label>
        <div className="role-row">
          <div className={`role-btn ${role === 'sales' ? 'active' : ''}`} onClick={() => setRole('sales')}>Sales</div>
          <div className={`role-btn ${role === 'manager' ? 'active' : ''}`} onClick={() => setRole('manager')}>Manager</div>
        </div>

        <label>Password</label>
        <input type="password" value={form.password} onChange={e => update('password', e.target.value)} placeholder="Password" />

        <h3 style={{ fontSize: 15, marginTop: 22, color: 'var(--teal)' }}>Security Questions (for Forgot Password)</h3>
        {SECURITY_QUESTIONS.map((q, i) => (
          <div key={i}>
            <label>{i + 1}. {q}</label>
            <input value={answers[i]} onChange={e => updateAnswer(i, e.target.value)} placeholder="Your answer" />
          </div>
        ))}

        <button className="btn" onClick={handleRegister} disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Register'}
        </button>
        <button className="link" onClick={() => nav('login')}>Already have an account? Login</button>
      </div>
    </div>
  );
}
