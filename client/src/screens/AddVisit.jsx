import React, { useState } from 'react';
import { apiPost } from '../api.js';

export default function AddVisit({ employee, nav, toast }) {
  const [clientName, setClientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [shopName, setShopName] = useState('');
  const [remark, setRemark] = useState('');
  const [orderTaken, setOrderTaken] = useState(false);
  const [orderDetails, setOrderDetails] = useState('');
  const [orderAmount, setOrderAmount] = useState('');
  const [paymentReceived, setPaymentReceived] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!clientName || !mobile || !shopName) { toast('Client Name, Mobile and Shop Name are required'); return; }

    const payload = { employeeId: employee.employee_id, clientName, mobile, shopName, remark, orderTaken };
    if (orderTaken) {
      payload.orderDetails = orderDetails;
      payload.orderAmount = parseFloat(orderAmount) || 0;
      payload.paymentReceived = parseFloat(paymentReceived) || 0;
      if (!orderDetails || payload.orderAmount <= 0) { toast('Order Details and Order Amount are required'); return; }
    }

    setLoading(true);
    const result = await apiPost('/visits/save', payload);
    setLoading(false);

    if (result.success) {
      toast('Client visit saved successfully');
      nav('visits');
    } else {
      toast(result.message || 'Failed to save visit');
    }
  }

  return (
    <div className="screen active">
      <div className="topbar"><button className="back" onClick={() => nav('visits')}>←</button><h2>New Visit</h2></div>
      <div className="body-pad">
        <label>Client Name</label>
        <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client's name" />
        <label>Mobile Number</label>
        <input value={mobile} onChange={e => setMobile(e.target.value)} maxLength={10} placeholder="10-digit mobile number" />
        <label>Shop Name</label>
        <input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="Shop name" />
        <label>Visit Remark</label>
        <textarea rows={3} value={remark} onChange={e => setRemark(e.target.value)} placeholder="Notes about this visit"></textarea>

        <div className="switch-row">
          <span style={{ fontSize: 14, fontWeight: 600 }}>Order taken during this visit?</span>
          <div className={`switch ${orderTaken ? 'on' : ''}`} onClick={() => setOrderTaken(!orderTaken)}></div>
        </div>

        {orderTaken && (
          <div className="order-box show">
            <label>Order Summary</label>
            <textarea rows={2} value={orderDetails} onChange={e => setOrderDetails(e.target.value)} placeholder="e.g. 10 boxes Product A"></textarea>
            <label>Order Amount (₹)</label>
            <input type="number" value={orderAmount} onChange={e => setOrderAmount(e.target.value)} placeholder="Total order amount" />
            <label>Payment Received (₹)</label>
            <input type="number" value={paymentReceived} onChange={e => setPaymentReceived(e.target.value)} placeholder="Amount received (0 if none)" />
            <div className="hint">💡 If full amount isn't received, the remaining will automatically show as "Pending".</div>
          </div>
        )}

        <button className="btn" onClick={handleSave} disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Save Visit'}
        </button>
      </div>
    </div>
  );
}
