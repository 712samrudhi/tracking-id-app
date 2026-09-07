import React, { useState } from 'react';
import { apiPost } from '../api.js';

export default function ForgotPassword({ nav, toast }) {
  const [step, setStep] = useState(1);
  const [employeeId, setEmployeeId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(['', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');

  async function fetchQuestions() {
    if (!employeeId) { toast('Enter Employee ID'); return; }
    const result = await apiPost('/auth/forgot/questions', { employeeId });
    if (!result.success) { toast(result.message || 'Employee ID not found'); return; }
    setQuestions(result.questions);
    setStep(2);
  }

  function verifyAndProceed() {
    if (answers.some(a => !a.trim())) { toast('Please answer all questions'); return; }
    setStep(3);
  }

  async function resetPassword() {
    if (!newPassword || newPassword.length < 4) { toast('Password must be at least 4 characters'); return; }
    const result = await apiPost('/auth/forgot/reset', { employeeId, answers, newPassword });
    if (result.success) {
      alert('Password reset successful! Please login with your new password.');
      nav('login');
    } else {
      toast(result.message || 'Reset failed');
    }
  }

  return (
    <div className="screen active">
      <div className="topbar"><button className="back" onClick={() => nav('login')}>←</button><h2>Reset Password</h2></div>
      <div className="body-pad">
        {step === 1 && (
          <>
            <label>Employee ID</label>
            <input value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="e.g. EMP-S-1001" />
            <button className="btn" onClick={fetchQuestions}>Continue</button>
          </>
        )}
        {step === 2 && questions.map((q, i) => (
          <div key={i}>
            <label>{i + 1}. {q}</label>
            <input value={answers[i]} onChange={e => { const c = [...answers]; c[i] = e.target.value; setAnswers(c); }} placeholder="Your answer" />
          </div>
        ))}
        {step === 2 && <button className="btn" onClick={verifyAndProceed}>Verify Answers</button>}
        {step === 3 && (
          <>
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
            <button className="btn" onClick={resetPassword}>Reset Password</button>
          </>
        )}
      </div>
    </div>
  );
}
