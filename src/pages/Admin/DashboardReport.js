import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { 
  LuUsers, 
  LuUtensils, 
  LuStar, 
  LuTrendingUp, 
  LuTrophy, 
  LuNetwork, 
  LuLink, 
  LuZap, 
  LuCircleCheck, 
  LuTrash2,
  LuPartyPopper,
  LuArrowRight,
  LuCalendarDays // <--- นำเข้าไอคอนปฏิทิน
} from "react-icons/lu";
import { FaChartPie } from "react-icons/fa";
import './DashboardReport.css';

function DashboardReport() {
  const navigate = useNavigate();

  const [timeFilter, setTimeFilter] = useState('7days'); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const thaiMonthsShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

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
        const res = await fetch(`http://localhost:5000/api/admin/dashboard-stats?filter=${timeFilter}`);
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
  }, [timeFilter]);

  // ================= เพิ่มฟังก์ชันแปลงข้อความให้แสดงผลสวยๆ =================
  const getFilterDisplayText = () => {
    if (timeFilter === '7days') return '7 วันล่าสุด';
    if (timeFilter === 'month') return '1 เดือนล่าสุด';
    if (timeFilter === 'year') return '1 ปีล่าสุด';
    if (timeFilter === 'all') return 'ภาพรวมทั้งหมด';
    
    // ถ้ามีการเลือกเดือนเจาะจง (รูปแบบ YYYY-MM) แปลงเป็น พ.ค. 2569
    if (timeFilter.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = timeFilter.split('-');
      const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      return `${thaiMonths[parseInt(month) - 1]} ${parseInt(year) + 543}`;
    }
    return timeFilter;
  };

  return (
    <>
      <div className="dashboard-page-header" style={{ marginBottom: '25px' }}>
        <h2 className="dashboard-main-title">
          <div className="dashboard-icon-wrapper">
            <FaChartPie />
          </div>
          รายงานสรุปผล (Dashboard)
        </h2>
      </div>
      
      <div className="dashboard-stats-container">
        <div className="admin-card stat-card" onClick={() => navigate('/admin/manage-users')} style={{ cursor: 'pointer', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', color: '#ff8c42', opacity: 0.5 }}>
            <LuArrowRight size={20} />
          </div>
          <h4><LuUsers className="title-icon" /> จำนวนสมาชิกรวม</h4>
          <div className="stat-value">{stats.users} <span>คน</span></div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#a68c74' }}>คลิกเพื่อดูทั้งหมด</p>
        </div>
        
        <div className="admin-card stat-card" onClick={() => navigate('/admin/manage-food')} style={{ cursor: 'pointer', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', color: '#ff8c42', opacity: 0.5 }}>
            <LuArrowRight size={20} />
          </div>
          <h4><LuUtensils className="title-icon" /> เมนูอาหารทั้งหมด</h4>
          <div className="stat-value">{stats.foods} <span>เมนู</span></div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#a68c74' }}>คลิกเพื่อดูทั้งหมด</p>
        </div>

        <div className="admin-card stat-card" onClick={() => navigate('/admin/manage-reviews')} style={{ cursor: 'pointer', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '20px', right: '20px', color: '#ff8c42', opacity: 0.5 }}>
            <LuArrowRight size={20} />
          </div>
          <h4><LuStar className="title-icon" /> รีวิวรอตรวจสอบ</h4>
          <div className="stat-value review-stat">{stats.reviews} <span>รายการ</span></div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#a68c74' }}>คลิกเพื่อดูทั้งหมด</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="dashboard-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>
              <LuTrendingUp className="title-icon" /> 
              แผนการกินที่ถูกสร้าง ({getFilterDisplayText()})
            </h3>
            
            {/* ================= จับ Dropdown และปฏิทินมาอยู่คู่กัน ================= */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              
              {/* 1. Custom Dropdown ตัวเดิม */}
              <div className="custom-cute-dropdown" style={{ width: '150px' }}>
                <div 
                  className={`dropdown-header ${isDropdownOpen ? 'active' : ''}`} 
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    setIsMonthPickerOpen(false); // ปิดปฏิทินถ้าเปิดอยู่
                  }}
                >
                  {getFilterDisplayText()}
                  <span className="arrow">▼</span>
                </div>
                
                {isDropdownOpen && (
                  <ul className="dropdown-options" style={{ width: '150px', right: 0, left: 'auto' }}>
                    <li onClick={() => { setTimeFilter('7days'); setIsDropdownOpen(false); }}>7 วันล่าสุด</li>
                    <li onClick={() => { setTimeFilter('month'); setIsDropdownOpen(false); }}>1 เดือนล่าสุด</li>
                    <li onClick={() => { setTimeFilter('year'); setIsDropdownOpen(false); }}>1 ปีล่าสุด</li>
                    <li onClick={() => { setTimeFilter('all'); setIsDropdownOpen(false); }}>ภาพรวมทั้งหมด</li>
                  </ul>
                )}
              </div>

              {/* 2. ไอคอนปฏิทิน และ Custom Month Picker ที่สร้างเอง */}
              <div style={{ position: 'relative' }}>
                <div 
                  className={`month-picker-wrapper ${isMonthPickerOpen ? 'active' : ''}`} 
                  title="ระบุเดือน/ปีที่ต้องการ"
                  onClick={() => { 
                    setIsMonthPickerOpen(!isMonthPickerOpen); 
                    setIsDropdownOpen(false); // ปิดเมนูอันอื่นถ้าเปิดอยู่
                  }}
                >
                  <LuCalendarDays className="calendar-icon" />
                </div>

                {/* กล่องปฏิทินที่เราสร้างเอง (น่ารัก 100%) */}
                {isMonthPickerOpen && (
                  <div className="custom-month-popup">
                    <div className="month-popup-header">
                      <button onClick={(e) => { e.stopPropagation(); setPickerYear(pickerYear - 1) }}>&lt;</button>
                      <span>ปี {pickerYear + 543}</span>
                      <button onClick={(e) => { e.stopPropagation(); setPickerYear(pickerYear + 1) }}>&gt;</button>
                    </div>
                    
                    <div className="month-popup-grid">
                      {thaiMonthsShort.map((m, index) => {
                        const monthStr = String(index + 1).padStart(2, '0');
                        const filterValue = `${pickerYear}-${monthStr}`;
                        const isActive = timeFilter === filterValue; // เช็คว่าเดือนนี้ถูกเลือกอยู่ไหม
                        
                        return (
                          <div 
                            key={index} 
                            className={`month-item ${isActive ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setTimeFilter(filterValue); // สั่งอัปเดตกราฟ
                              setIsMonthPickerOpen(false); // ปิดหน้าต่าง
                            }}
                          >
                            {m}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
            {/* ================================================================= */}
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff8c42" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff8c42" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e6dc" />
                <XAxis dataKey="name" tick={{fill: '#8c7355', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#8c7355', fontSize: 12}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}/>
                <Area 
                  type="monotone" 
                  dataKey="plans" 
                  name="จำนวนแผน (ครั้ง)" 
                  stroke="#ff8c42" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorPlans)" 
                  dot={{ r: 4, fill: '#ff8c42', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <h3 className="dashboard-card-title"><LuTrophy className="title-icon" /> 5 อันดับเมนูยอดฮิต</h3>
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

      <div className="dashboard-grid">
        <div className="admin-card">
          <h3 className="dashboard-card-title"><LuNetwork className="title-icon" /> FP-growth: เมนูที่มักทานคู่กัน</h3>
          <ul className="insight-list">
            {stats.fpGrowthInsights.map((item, index) => (
              <li key={index}>
                <span className="flex-align"><LuLink /> {item.pair}</span>
                <span className="insight-value" style={{background: '#e6f4ea', color: '#1e8e3e'}}>{item.confidence}</span>
              </li>
            ))}
          </ul>
          <p style={{fontSize: '0.85rem', color: '#b5a18e', marginTop: '15px'}}>* ข้อมูลจากการวิเคราะห์พฤติกรรมการจัดแผนอาหารของผู้ใช้</p>
        </div>

        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px dashed #f9ece0', paddingBottom: '10px' }}>
            <h3 className="dashboard-card-title" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}><LuZap className="title-icon" /> จัดการรีวิวด่วน</h3>
            <button 
              onClick={() => navigate('/admin/manage-reviews')}
              style={{ background: 'none', border: 'none', color: '#ff8c42', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              ดูทั้งหมด <LuArrowRight />
            </button>
          </div>
          
          {stats.recentReviews.length > 0 ? stats.recentReviews.map(review => (
            <div key={review.review_id} className="quick-review-item">
              <div className="quick-review-header">
                <span className="quick-review-food">{review.food_name} <span className="review-rating-badge"><LuStar size={14}/> {review.rating}</span></span>
                <span className="quick-review-email">{review.email}</span>
              </div>
              <p className="quick-review-text">"{review.review_text}"</p>
              <div>
                <button className="quick-action-btn btn-approve"><LuCircleCheck /> อนุมัติ</button>
                <button className="quick-action-btn btn-reject"><LuTrash2 /> ปฏิเสธ</button>
              </div>
            </div>
          )) : <p style={{color: '#8c7355', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}>ไม่มีรีวิวรอตรวจสอบ <LuPartyPopper /></p>}
        </div>
      </div>
    </>
  );
}

export default DashboardReport;