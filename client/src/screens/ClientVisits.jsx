import React, { useEffect, useState } from 'react';
import { apiGet } from '../api.js';

export default function ClientVisits({ employee, nav }) {
  const [visits, setVisits] = useState([]);

  useEffect(() => { loadVisits(); }, []);

  async function loadVisits() {
    const result = await apiGet('/visits/list', { employeeId: employee.employee_id });
    if (result.success) setVisits(result.visits);
  }

  return (
    <div className="screen active">
      <div className="topbar"><button className="back" onClick={() => nav('dashboard')}>←</button><h2>Client Visits</h2></div>
      <div className="body-pad">
        <div className="fab-add" onClick={() => nav('addvisit')}>+ Add New Client Visit</div>

        {visits.length === 0 ? (
          <div className="empty">No visits yet this month</div>
        ) : (
          visits.map(v => (
            <div key={v.id} className="card">
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>{v.client_name}</div>
              <div className="muted" style={{ marginTop: 3 }}>Shop: {v.shop_name}</div>
              <div className="muted">📞 {v.mobile}</div>
              <div className="muted" style={{ fontStyle: 'italic', marginTop: 5 }}>Remark: {v.remark || '-'}</div>
              <div className="row-between" style={{ marginTop: 9 }}>
                <span className={`badge ${v.order_taken ? 'green' : 'gray'}`}>
                  {v.order_taken ? 'Order Taken' : 'Visit Only'}
                </span>
                <span className="muted">{v.visit_date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
