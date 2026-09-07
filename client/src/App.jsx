import React, { useState, useEffect } from 'react';
import Login from './screens/Login.jsx';
import Register from './screens/Register.jsx';
import ForgotPassword from './screens/ForgotPassword.jsx';
import Dashboard from './screens/Dashboard.jsx';
import KmTracking from './screens/KmTracking.jsx';
import ClientVisits from './screens/ClientVisits.jsx';
import AddVisit from './screens/AddVisit.jsx';
import Orders from './screens/Orders.jsx';

export default function App() {
  const [screen, setScreen] = useState('login');
  const [employee, setEmployee] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('mla_employee');
    if (saved) {
      setEmployee(JSON.parse(saved));
      setScreen('dashboard');
    }
  }, []);

  function toast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2800);
  }

  function handleLoginSuccess(emp) {
    setEmployee(emp);
    localStorage.setItem('mla_employee', JSON.stringify(emp));
    setScreen('dashboard');
  }

  function handleLogout() {
    setEmployee(null);
    localStorage.removeItem('mla_employee');
    setScreen('login');
  }

  const nav = setScreen; // shorthand passed to screens

  return (
    <div id="app">
      {screen === 'login' && <Login onLoginSuccess={handleLoginSuccess} nav={nav} toast={toast} />}
      {screen === 'register' && <Register nav={nav} toast={toast} />}
      {screen === 'forgot' && <ForgotPassword nav={nav} toast={toast} />}
      {screen === 'dashboard' && employee && (
        <Dashboard employee={employee} nav={nav} onLogout={handleLogout} />
      )}
      {screen === 'km' && employee && <KmTracking employee={employee} nav={nav} toast={toast} />}
      {screen === 'visits' && employee && <ClientVisits employee={employee} nav={nav} />}
      {screen === 'addvisit' && employee && <AddVisit employee={employee} nav={nav} toast={toast} />}
      {screen === 'orders' && employee && <Orders employee={employee} nav={nav} toast={toast} />}

      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  );
}
