import React, { useState, useEffect } from 'react';
import './DashboardReport.css'; // นำเข้า CSS ที่แยกไว้

function DashboardReport() {
  // สร้าง State เพื่อเก็บตัวเลขสถิติ
  const [stats, setStats] = useState({
    users: 0,
    foods: 0,
    reviews: 0
  });

  // ใช้ useEffect เพื่อดึงข้อมูลตอนโหลดหน้าเว็บ
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/dashboard-stats');
        const data = await res.json();
        
        if (res.ok) {
          setStats({
            users: data.totalUsers,
            foods: data.totalFoods,
            reviews: data.pendingReviews
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div >
      <h2 className="dashboard-title">รายงานสรุปผล (Dashboard)</h2>
      
      <div className="dashboard-stats-container">
        
        {/* Card 1: จำนวนสมาชิก */}
        {/* ยังคงใช้คลาส admin-card จาก AdminTheme.css เพื่อคงความโค้งมนและเงา */}
        <div className="admin-card stat-card">
          <h4>👥 จำนวนสมาชิกรวม</h4>
          <div className="stat-value">
            {stats.users} <span>คน</span>
          </div>
        </div>

        {/* Card 2: จำนวนเมนูอาหาร */}
        <div className="admin-card stat-card">
          <h4>🍔 เมนูอาหารทั้งหมด</h4>
          <div className="stat-value">
            {stats.foods} <span>เมนู</span>
          </div>
        </div>

        {/* Card 3: จำนวนรีวิว */}
        <div className="admin-card stat-card">
          <h4>⭐ รีวิวรอตรวจสอบ</h4>
          <div className="stat-value review-stat">
            {stats.reviews} <span>รายการ</span>
          </div>
        </div>

      </div>

      {/* ส่วนดาวน์โหลดรายงาน */}
      <div className="admin-card download-section">
        <h3>ดาวน์โหลดรายงานสรุปผล</h3>
        <div className="download-btn-group">
          <button className="download-btn btn-pdf">
            📥 ดาวน์โหลด PDF
          </button>
          <button className="download-btn btn-excel">
            📊 ดาวน์โหลด Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardReport;