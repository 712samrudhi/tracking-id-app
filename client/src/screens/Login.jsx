import React, { useState } from 'react';
import { apiPost } from '../api.js';

export default function Login({ onLoginSuccess, nav, toast }) {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!employeeId || !password) { toast('Enter Employee ID and Password'); return; }
    setLoading(true);
    const result = await apiPost('/auth/login', { employeeId, password });
    setLoading(false);
    if (result.success) {
      onLoginSuccess(result.employee);
    } else {
      toast(result.message || 'Login failed');
    }
  }

  return (
    <div className="screen active">
      <div className="center-pad">
        <h1 className="brand">MLA Sales Tracker</h1>
        <p className="tagline">Login to your account</p>

        <label>Employee ID</label>
        <input value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="e.g. EMP-S-1001" />

        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />

        <button className="btn" onClick={handleLogin} disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Login'}
        </button>
        <button className="link" onClick={() => nav('forgot')}>Forgot Password?</button>
        <button className="link" onClick={() => nav('register')}>New here? Register</button>
      </div>
    </div>
  );
}
