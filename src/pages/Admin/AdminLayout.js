import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AdminNavbar from '../../components/Admin/AdminNavbar';
import './AdminTheme.css';

function AdminLayout() {
  return (
    <div style={{ display: 'flex' }}>
      {/* ซ้าย: Sidebar */}
      <AdminSidebar />
      
      {/* ขวา: เนื้อหาหลัก */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AdminNavbar />
        <div style={{ padding: '20px', flex: 1 }}>
          <Outlet /> {/* หน้าย่อยต่างๆ จะมาโผล่ตรงนี้ */}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;