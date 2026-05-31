import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import './AdminNavbar.css'; // <--- อย่าลืม import ไฟล์ CSS เข้ามาด้วยนะครับ

function AdminNavbar() {
  
  const handleLogout = () => {
    // 1. ล้างข้อมูลใน Storage ทิ้งให้หมด
    localStorage.removeItem('user'); 
    localStorage.removeItem('adminUser'); 
    localStorage.removeItem('calculation'); 
    
    // 2. บังคับรีเฟรชและเตะกลับไปหน้า Login
    window.location.href = '/auth'; 
  };

  return (
    <div className="admin-navbar">
      <div className="admin-user-info">
        <span className="admin-greeting">สวัสดี, ผู้ดูแลระบบ</span>
        <button className="admin-btn-logout" onClick={handleLogout}>
          <FaSignOutAlt style={{ marginRight: '5px' }} /> ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

export default AdminNavbar;