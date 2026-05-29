import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user'); // ล้างข้อมูล session
    navigate('/auth'); // เตะกลับไปหน้า Login แอดมิน
  };

  return (
    <div className="admin-navbar" style={{ background: '#f4f4f4', padding: '15px 20px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #ddd' }}>
      <span style={{ marginRight: '20px', fontWeight: 'bold' }}>ผู้ดูแลระบบ</span>
      <button onClick={handleLogout} style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '5px 15px', cursor: 'pointer', borderRadius: '4px' }}>
        ออกจากระบบ
      </button>
    </div>
  );
}

export default AdminNavbar; 