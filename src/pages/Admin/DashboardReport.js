import React, { useState, useEffect, useRef } from 'react'; // <--- 1. เพิ่ม useRef ที่นี่
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
  LuTrendingDown, 
  LuMinus,
  LuCalendarDays,
  LuDownload, 
  LuFileSpreadsheet, 
  LuFileText
} from "react-icons/lu";
import { FaChartPie } from "react-icons/fa";
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import './DashboardReport.css';

function DashboardReport() {
  const navigate = useNavigate();
  const reportRef = useRef(null); // <--- สร้าง Ref

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

  const getFilterDisplayText = () => {
    if (timeFilter === '7days') return '7 วันล่าสุด';
    if (timeFilter === 'month') return '1 เดือนล่าสุด';
    if (timeFilter === 'year') return '1 ปีล่าสุด';
    if (timeFilter === 'all') return 'ภาพรวมทั้งหมด';
    
    if (timeFilter.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = timeFilter.split('-');
      const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      return `${thaiMonths[parseInt(month) - 1]} ${parseInt(year) + 543}`;
    }
    return timeFilter;
  };

  const exportToExcel = () => {
    const summaryData = [
      ["รายงานสรุปผล (Dashboard Report)"],
      ["ช่วงเวลาข้อมูล:", getFilterDisplayText()],
      [],
      ["สถิติภาพรวม"],
      ["จำนวนสมาชิกรวม (คน)", stats.users],
      ["เมนูอาหารทั้งหมด (เมนู)", stats.foods],
      ["รีวิวรอตรวจสอบ (รายการ)", stats.reviews],
      [],
      ["5 อันดับเมนูยอดฮิต"],
      ["อันดับ", "ชื่อเมนู", "จำนวนครั้งที่ใช้งาน", "แนวโน้ม"]
    ];

    stats.topFoods.forEach((food, idx) => {
      summaryData.push([idx + 1, food.food_name, food.count, food.trend]);
    });

    summaryData.push([]);
    summaryData.push(["เมนูที่มักทานคู่กัน (FP-growth)"]);
    summaryData.push(["คู่เมนู", "ความเชื่อมั่น", "แนวโน้ม"]);
    stats.fpGrowthInsights.forEach(item => {
      summaryData.push([item.pair, item.confidence, item.trend]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    const chartHeaders = [["วันที่/แกน X", "จำนวนแผน (ครั้ง)"]];
    const chartRows = stats.chartData.map(d => [d.name, d.plans]);
    const wsChart = XLSX.utils.aoa_to_sheet([...chartHeaders, ...chartRows]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, "สรุปภาพรวม");
    XLSX.utils.book_append_sheet(wb, wsChart, "สถิติแผนการกิน");

    XLSX.writeFile(wb, `Dashboard_Report_${timeFilter}.xlsx`);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <>
      {/* 2. จัดโครงสร้าง Header ให้ปุ่มและข้อความอยู่บรรทัดเดียวกัน */}
      <div className="dashboard-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 className="dashboard-main-title" style={{ margin: 0 }}>
          <div className="dashboard-icon-wrapper" style={{ display: 'inline-flex', marginRight: '10px' }}>
            <FaChartPie />
          </div>
          รายงานสรุปผล (Dashboard)
        </h2>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={exportToExcel}
            className="btn-export btn-export-excel"
          >
            <LuFileSpreadsheet size={18} /> Excel
          </button>
          
          <button 
            onClick={exportToPDF}
            className="btn-export btn-export-pdf"
          >
            <LuFileText size={18} /> PDF
          </button>
        </div>
      </div>
      
      {/* 3. เอา div reportRef มาครอบเนื้อหาทั้งหมด (และเอาแท็กปิดไปไว้ล่างสุด) */}
      <div ref={reportRef} className="dashboard-content-wrapper" style={{ padding: '10px' }}>
        
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
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} data-html2canvas-ignore>
                <div className="custom-cute-dropdown" style={{ width: '150px' }}>
                  <div 
                    className={`dropdown-header ${isDropdownOpen ? 'active' : ''}`} 
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                      setIsMonthPickerOpen(false);
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

                <div style={{ position: 'relative' }}>
                  <div 
                    className={`month-picker-wrapper ${isMonthPickerOpen ? 'active' : ''}`} 
                    title="ระบุเดือน/ปีที่ต้องการ"
                    onClick={() => { 
                      setIsMonthPickerOpen(!isMonthPickerOpen); 
                      setIsDropdownOpen(false);
                    }}
                  >
                    <LuCalendarDays className="calendar-icon" />
                  </div>

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
                          const isActive = timeFilter === filterValue;
                          
                          return (
                            <div 
                              key={index} 
                              className={`month-item ${isActive ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setTimeFilter(filterValue);
                                setIsMonthPickerOpen(false);
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
                  <span style={{ fontWeight: '500' }}>{index + 1}. {item.food_name}</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.trend === 'up' && (
                      <span style={{ color: '#1e8e3e', display: 'flex', alignItems: 'center' }} title="กำลังฮิตคนกดเยอะ">
                        <LuTrendingUp size={18} />
                      </span>
                    )}
                    {item.trend === 'down' && (
                      <span style={{ color: '#d93025', display: 'flex', alignItems: 'center' }} title="ความนิยมเริ่มลดลง">
                        <LuTrendingDown size={18} />
                      </span>
                    )}
                    {item.trend === 'neutral' && (
                      <span style={{ color: '#fca311', display: 'flex', alignItems: 'center' }} title="ความนิยมคงที่">
                        <LuMinus size={18} />
                      </span>
                    )}
                    <span className="insight-value">{item.count} ครั้ง</span>
                  </div>
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
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.trend === 'up' && (
                      <span style={{ color: '#1e8e3e', display: 'flex', alignItems: 'center' }} title="จับคู่ทานด้วยกันบ่อยขึ้น">
                        <LuTrendingUp size={18} />
                      </span>
                    )}
                    {item.trend === 'down' && (
                      <span style={{ color: '#d93025', display: 'flex', alignItems: 'center' }} title="จับคู่ทานด้วยกันน้อยลง">
                        <LuTrendingDown size={18} />
                      </span>
                    )}
                    {item.trend === 'neutral' && (
                      <span style={{ color: '#fca311', display: 'flex', alignItems: 'center' }} title="แนวโน้มคงที่">
                        <LuMinus size={18} />
                      </span>
                    )}
                    
                    <span className="insight-value" style={{background: '#e6f4ea', color: '#1e8e3e'}}>
                      {item.confidence}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p style={{fontSize: '0.85rem', color: '#b5a18e', marginTop: '15px'}}>* ข้อมูลจากการวิเคราะห์พฤติกรรมการจัดแผนอาหารของผู้ใช้</p>
          </div>

          <div className="admin-card" data-html2canvas-ignore>
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
                  <span className="quick-review-food">{review.food_name} <span className="review-rating-badge"><LuStar size={14} fill="#ff9800" color="#ff9800"/> {review.rating}</span></span>
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

      </div> {/* <-- ปิด div reportRef ที่นี่ */}
    </>
  );
}

export default DashboardReport;