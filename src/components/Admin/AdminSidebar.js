import React from 'react';
import { Link } from 'react-router-dom';

function AdminSidebar() {
  return (
    <div className="admin-sidebar" style={{ width: '250px', background: '#333', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <h2>Admin Panel</h2>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '30px' }}>
        <li style={{ marginBottom: '15px' }}><Link to="/admin" style={{ color: '#fff', textDecoration: 'none' }}>📊 Dashboard</Link></li>
        <li style={{ marginBottom: '15px' }}><Link to="/admin/manage-food" style={{ color: '#fff', textDecoration: 'none' }}>🍔 จัดการข้อมูลอาหาร</Link></li>
        <li style={{ marginBottom: '15px' }}><Link to="/admin/manage-categories" style={{ color: '#fff', textDecoration: 'none' }}>📁 จัดการหมวดหมู่อาหาร</Link></li>
        <li style={{ marginBottom: '15px' }}><Link to="/admin/manage-users" style={{ color: '#fff', textDecoration: 'none' }}>👥 จัดการสมาชิก</Link></li>
        <li style={{ marginBottom: '15px' }}><Link to="/admin/manage-reviews" style={{ color: '#fff', textDecoration: 'none' }}>⭐ จัดการรีวิว</Link></li>
      </ul>
    </div>
  );
}

export default AdminSidebar;