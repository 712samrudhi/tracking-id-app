import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api.js';

export default function Orders({ employee, nav, toast }) {
  const [orders, setOrders] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [filter, setFilter] = useState('all');
  const [payInputs, setPayInputs] = useState({});

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    const result = await apiGet('/orders/list', { employeeId: employee.employee_id });
    if (result.success) {
      setOrders(result.orders);
      setTotalPending(result.totalPending);
    }
  }

  async function updatePayment(orderId) {
    const extraPayment = parseFloat(payInputs[orderId]);
    if (isNaN(extraPayment) || extraPayment <= 0) { toast('Enter a valid amount'); return; }

    const result = await apiPost('/orders/update-payment', { orderId, extraPayment });
    if (result.success) {
      toast(`Updated! New pending: ₹${result.pendingAmount}`);
      loadOrders();
    } else {
      toast(result.message || 'Update failed');
    }
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.payment_status === filter);

  return (
    <div className="screen active">
      <div className="topbar"><button className="back" onClick={() => nav('dashboard')}>←</button><h2>Order Summary</h2></div>
      <div className="body-pad">
        <div className="banner-pending">Total Pending Amount: ₹{totalPending.toFixed(2)}</div>

        <div className="filter-row">
          {['all', 'Paid', 'Pending'].map(f => (
            <div key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f}
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty">No orders found</div>
        ) : (
          filteredOrders.map(o => (
            <div key={o.id} className="card">
              <div className="row-between">
                <span style={{ fontWeight: 700, fontSize: 15 }}>{o.client_name}</span>
                <span className={`badge ${o.payment_status === 'Paid' ? 'green' : 'red'}`}>{o.payment_status}</span>
              </div>
              <div className="muted" style={{ marginTop: 4 }}>Shop: {o.shop_name}</div>
              <div className="muted" style={{ marginTop: 4 }}>{o.order_details}</div>
              <div className="row-between" style={{ marginTop: 9 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Order: ₹{o.order_amount}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)' }}>Received: ₹{o.payment_received}</span>
              </div>
              {o.pending_amount > 0 && (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)', marginTop: 5 }}>Pending: ₹{o.pending_amount}</div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      placeholder="Amount received"
                      style={{ flex: 1 }}
                      value={payInputs[o.id] || ''}
                      onChange={e => setPayInputs({ ...payInputs, [o.id]: e.target.value })}
                    />
                    <button className="btn" style={{ width: 'auto', marginTop: 0, padding: '10px 14px', fontSize: 13 }} onClick={() => updatePayment(o.id)}>
                      Update
                    </button>
                  </div>
                </>
              )}
              <div className="muted" style={{ textAlign: 'right', marginTop: 7 }}>{o.order_date}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
