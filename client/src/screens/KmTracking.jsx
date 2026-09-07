import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import { apiPost, apiGet } from '../api.js';

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function KmTracking({ employee, nav, toast }) {
  const [isTracking, setIsTracking] = useState(false);
  const [liveKm, setLiveKm] = useState(0);
  const [logs, setLogs] = useState([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [ratePerKm, setRatePerKm] = useState(3);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const watchIdRef = useRef(null);
  const routePointsRef = useRef([]);
  const lastLatLngRef = useRef(null);
  const totalKmRef = useRef(0);
  const trackStartRef = useRef(null);
  const trackStartLatLngRef = useRef(null);

  useEffect(() => {
    loadKmLogs();
    return () => { if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, []);

  async function loadKmLogs() {
    const result = await apiGet('/km/list', { employeeId: employee.employee_id });
    if (result.success) {
      setLogs(result.logs);
      setMonthTotal(result.monthTotal);
      setRatePerKm(result.ratePerKm);
    }
  }

  function startTracking() {
    if (!navigator.geolocation) { toast('Geolocation is not supported by this browser'); return; }

    setIsTracking(true);
    setLiveKm(0);
    totalKmRef.current = 0;
    routePointsRef.current = [];
    lastLatLngRef.current = null;
    trackStartRef.current = new Date().toISOString();

    setTimeout(() => {
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([16.7050, 74.2433], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstance.current);
      } else {
        mapInstance.current.invalidateSize();
      }
    }, 150);

    watchIdRef.current = navigator.geolocation.watchPosition(onPositionUpdate, onPositionError, {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000,
    });
  }

  function onPositionUpdate(pos) {
    const { latitude, longitude, accuracy } = pos.coords;
    if (accuracy && accuracy > 30) return; // weak GPS signal — skip this reading

    if (!lastLatLngRef.current) {
      trackStartLatLngRef.current = { lat: latitude, lng: longitude };
      mapInstance.current.setView([latitude, longitude], 16);
      markerRef.current = L.marker([latitude, longitude]).addTo(mapInstance.current);
      polylineRef.current = L.polyline([[latitude, longitude]], { color: '#1E5F74', weight: 4 }).addTo(mapInstance.current);
      routePointsRef.current.push([latitude, longitude]);
      lastLatLngRef.current = { lat: latitude, lng: longitude };
      return;
    }

    const d = haversineKm(lastLatLngRef.current.lat, lastLatLngRef.current.lng, latitude, longitude);
    if (d > 0.012) { // ignore GPS jitter under ~12 meters
      totalKmRef.current += d;
      routePointsRef.current.push([latitude, longitude]);
      polylineRef.current.setLatLngs(routePointsRef.current);
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstance.current.panTo([latitude, longitude]);
      setLiveKm(totalKmRef.current);
      lastLatLngRef.current = { lat: latitude, lng: longitude };
    }
  }

  function onPositionError() {
    toast('Location access needed to track KM. Please allow location permission.');
  }

  async function stopTracking() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    setIsTracking(false);

    const dailyKm = totalKmRef.current;
    const result = await apiPost('/km/save', {
      employeeId: employee.employee_id,
      dailyKm,
      startLat: trackStartLatLngRef.current?.lat,
      startLng: trackStartLatLngRef.current?.lng,
      endLat: lastLatLngRef.current?.lat,
      endLng: lastLatLngRef.current?.lng,
      routePoints: routePointsRef.current,
      startedAt: trackStartRef.current,
      endedAt: new Date().toISOString(),
    });

    if (result.success) {
      toast(`Trip saved! Distance: ${result.dailyKm} km | Payment: ₹${result.payment}`);
      loadKmLogs();
    } else {
      toast(result.message || 'Failed to save trip');
    }
  }

  return (
    <div className="screen active">
      <div className="topbar"><button className="back" onClick={() => nav('dashboard')}>←</button><h2>KM Tracking</h2></div>
      <div className="body-pad">
        <p className="muted">Today: {new Date().toISOString().split('T')[0]}</p>

        {!isTracking && (
          <div className="card" style={{ textAlign: 'center', padding: '26px 18px' }}>
            <div style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>
              Tap Start to turn on the map and begin tracking your travel distance automatically using GPS.
            </div>
            <button className="btn" style={{ marginTop: 0 }} onClick={startTracking}>▶ Start Tracking</button>
          </div>
        )}

        <div style={{ display: isTracking ? 'block' : 'none' }}>
          <div id="km-map" ref={mapRef}></div>
          <div className="card" style={{ textAlign: 'center', marginTop: 12, background: '#F2EDE2' }}>
            <div className="muted">Distance travelled so far</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--teal)', marginTop: 4 }}>{liveKm.toFixed(2)} km</div>
          </div>
          <button className="btn" style={{ background: 'var(--red)' }} onClick={stopTracking}>⏹ Stop Tracking</button>
        </div>

        <div className="card" style={{ marginTop: 22, textAlign: 'center', background: '#F2EDE2' }}>
          <div className="muted">Total KM this month</div>
          <div style={{ fontSize: 23, fontWeight: 800, color: 'var(--teal)', marginTop: 4 }}>{monthTotal.toFixed(1)} km</div>
          <div className="muted" style={{ marginTop: 4 }}>Estimated Payment: ₹{(monthTotal * ratePerKm).toFixed(2)}</div>
        </div>

        <h3 style={{ fontSize: 14.5, margin: '20px 0 10px', color: '#444' }}>History</h3>
        {logs.length === 0 ? (
          <div className="empty">No entries yet</div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className="card row-between" style={{ padding: '11px 14px' }}>
              <span className="muted">{l.log_date}</span>
              <span style={{ fontSize: 13 }}>{l.daily_km} km travelled</span>
              <span style={{ fontWeight: 700, color: 'var(--teal)', fontSize: 13 }}>₹{l.payment}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
