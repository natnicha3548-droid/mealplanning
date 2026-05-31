import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DashboardReport.css';

function DashboardReport() {
  const [stats, setStats] = useState({
    users: 0,
    foods: 0,
    reviews: 0,
    chartData: [],
    topFoods: [],
    recentReviews: [],
    fpGrowthInsights: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/dashboard-stats');
        const data = await res.json();
        
        if (res.ok) {
          setStats({
            users: data.totalUsers || 0,
            foods: data.totalFoods || 0,
            reviews: data.pendingReviews || 0,
            chartData: data.chartData || [],
            topFoods: data.topFoods || [],
            recentReviews: data.recentReviews || [],
            fpGrowthInsights: data.fpGrowthInsights || []
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <h2 className="dashboard-title">รายงานสรุปผล (Dashboard)</h2>
      
      {/* 1. แถบตัวเลขสรุป */}
      <div className="dashboard-stats-container">
        <div className="admin-card stat-card">
          <h4>👥 จำนวนสมาชิกรวม</h4>
          <div className="stat-value">{stats.users} <span>คน</span></div>
        </div>
        <div className="admin-card stat-card">
          <h4>🍔 เมนูอาหารทั้งหมด</h4>
          <div className="stat-value">{stats.foods} <span>เมนู</span></div>
        </div>
        <div className="admin-card stat-card">
          <h4>⭐ รีวิวรอตรวจสอบ</h4>
          <div className="stat-value review-stat">{stats.reviews} <span>รายการ</span></div>
        </div>
      </div>

      {/* 2. Grid แถวกลาง: กราฟ & เมนูยอดฮิต */}
      <div className="dashboard-grid">
        {/* กราฟ 7 วัน */}
        <div className="admin-card">
          <h3 className="dashboard-card-title">📈 แผนการกินที่ถูกสร้าง (7 วันล่าสุด)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorPlans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff8c42" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff8c42" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e6dc" />
                <XAxis dataKey="name" tick={{fill: '#8c7355', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#8c7355', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}/>
                <Area type="monotone" dataKey="plans" name="จำนวนแผน (ครั้ง)" stroke="#ff8c42" strokeWidth={3} fillOpacity={1} fill="url(#colorPlans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* เมนูยอดฮิต */}
        <div className="admin-card">
          <h3 className="dashboard-card-title">🏆 5 อันดับเมนูยอดฮิต</h3>
          <ul className="insight-list">
            {stats.topFoods.length > 0 ? stats.topFoods.map((item, index) => (
              <li key={index}>
                <span>{index + 1}. {item.food_name}</span>
                <span className="insight-value">{item.count} ครั้ง</span>
              </li>
            )) : <li>ไม่มีข้อมูลในขณะนี้</li>}
          </ul>
        </div>
      </div>

      {/* 3. Grid แถวล่าง: FP-growth Insights & จัดการรีวิวด่วน */}
      <div className="dashboard-grid">
        {/* FP-Growth Stats */}
        <div className="admin-card">
          <h3 className="dashboard-card-title">🧠 FP-growth: เมนูที่มักทานคู่กัน</h3>
          <ul className="insight-list">
            {stats.fpGrowthInsights.map((item, index) => (
              <li key={index}>
                <span>🔗 {item.pair}</span>
                <span className="insight-value" style={{background: '#e6f4ea', color: '#1e8e3e'}}>{item.confidence}</span>
              </li>
            ))}
          </ul>
          <p style={{fontSize: '0.85rem', color: '#b5a18e', marginTop: '15px'}}>* ข้อมูลจากการวิเคราะห์พฤติกรรมการจัดแผนอาหารของผู้ใช้</p>
        </div>

        {/* จัดการรีวิวด่วน */}
        <div className="admin-card">
          <h3 className="dashboard-card-title">⚡ จัดการรีวิวด่วน</h3>
          {stats.recentReviews.length > 0 ? stats.recentReviews.map(review => (
            <div key={review.review_id} className="quick-review-item">
              <div className="quick-review-header">
                <span className="quick-review-food">{review.food_name} (⭐{review.rating})</span>
                <span className="quick-review-email">{review.email}</span>
              </div>
              <p className="quick-review-text">"{review.review_text}"</p>
              <div>
                <button className="quick-action-btn btn-approve">✅ อนุมัติ</button>
                <button className="quick-action-btn btn-reject">🗑️ ปฏิเสธ</button>
              </div>
            </div>
          )) : <p style={{color: '#8c7355', textAlign: 'center'}}>ไม่มีรีวิวรอตรวจสอบ 🎉</p>}
        </div>
      </div>
    </>
  );
}

export default DashboardReport;