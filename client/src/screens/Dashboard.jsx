import React, { useEffect, useState } from 'react';
import { apiGet } from '../api.js';

export default function Dashboard({ employee, nav, onLogout }) {
  const [monthKm, setMonthKm] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    const result = await apiGet('/dashboard/summary', { employeeId: employee.employee_id });
    if (result.success) {
      setMonthKm(result.monthKm);
      setPendingCount(result.pendingCount);
    }
  }

  const menuItems = [
    { label: 'KM Tracking (Start/Stop with Map)', screen: 'km' },
    { label: 'Client Visit List', screen: 'visits' },
    { label: 'New Client Visit + Order', screen: 'addvisit' },
    { label: 'Order Summary', screen: 'orders' },
  ];

  return (
    <div className="screen active">
      <div className="body-pad">
        <div className="hero-card">
          <div className="nm">{employee.first_name} {employee.last_name}</div>
          <div className="id">Employee ID: {employee.employee_id}</div>
          <div className="rl">{employee.role === 'manager' ? 'Manager' : 'Sales Executive'} • {employee.area}</div>
        </div>

        <div className="stat-row">
          <div className="stat-box">
            <div className="v">{monthKm.toFixed(1)} km</div>
            <div className="l">This Month's KM</div>
          </div>
          <div className="stat-box">
            <div className="v red">{pendingCount}</div>
            <div className="l">Pending Payments</div>
          </div>
        </div>

        {menuItems.map(item => (
          <div key={item.screen} className="menu-item" onClick={() => nav(item.screen)}>
            <span>{item.label}</span><span className="arrow">→</span>
          </div>
        ))}

        <button className="link" style={{ color: 'var(--red)', marginTop: 14 }} onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
