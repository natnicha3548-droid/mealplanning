import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { 
  Sun, CloudSun, Moon, RefreshCw, 
  History, CalendarDays, Calendar, Bookmark, CalendarCheck2, ChevronLeft, ChevronDown, RotateCcw
} from 'lucide-react';
import { FaHeart, FaStar, FaSun, FaCloudSun, FaMoon } from "react-icons/fa";
import './PastPlans.css';

const mealIcons = {
  'มื้อเช้า': 'icon-breakfast',
  'มื้อกลางวัน': 'icon-lunch',
  'มื้อเย็น': 'icon-dinner'
};

const PastPlans = () => {
  const navigate = useNavigate();
  // ================= สร้างฟังก์ชันคำนวณวันที่ =================
  const today = new Date();
  const currentYear = today.getFullYear();
  
  const thaiDayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const thaiMonthShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const getFormattedDate = (dateObj) => {
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayFullDate = getFormattedDate(today);

  // คำนวณวันที่ของ "เมื่อวาน"
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getFormattedDate(yesterday);
  const yesterdayShortDate = `${yesterday.getDate()} ${thaiMonthShort[yesterday.getMonth()]}`;

  const generateCurrentWeek = () => {
    const curr = new Date();
    const day = curr.getDay(); 
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(curr.setDate(diff));

    const week = [];
    const orderedDayNames = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push({
        name: orderedDayNames[i],
        date: `${date.getDate()} ${thaiMonthShort[date.getMonth()]}`,
        fullDate: getFormattedDate(date)
      });
    }
    return week;
  };

  const generateDaysInMonth = (year, monthIndex) => {
    const date = new Date(year, monthIndex, 1);
    const days = [];
    while (date.getMonth() === monthIndex) {
      days.push({
        name: thaiDayNames[date.getDay()],
        date: `${date.getDate()} ${thaiMonthShort[monthIndex]}`,
        fullDate: getFormattedDate(date)
      });
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const weekDays = useMemo(() => generateCurrentWeek(), []);

  // ================= State Management =================
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('เมื่อวาน'); 
  const [selectedDate, setSelectedDate] = useState(yesterdayStr);
  const [viewingMonth, setViewingMonth] = useState(null); 
  const [mealData, setMealData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // เพิ่ม State สำหรับจัดการรายการโปรด
  const [currentPlanId, setCurrentPlanId] = useState(null); 
  const [isPlanFavorite, setIsPlanFavorite] = useState(false);
  const [reviewedStatus, setReviewedStatus] = useState({});

  const monthsData = [
    { id: '01', name: 'มกราคม', light: '#ffedd5', main: '#f97316', icon: '❄️🏔️' },
    { id: '02', name: 'กุมภาพันธ์', light: '#fce7f3', main: '#ec4899', icon: '💖🎈' },
    { id: '03', name: 'มีนาคม', light: '#dcfce7', main: '#22c55e', icon: '🌳🌼' },
    { id: '04', name: 'เมษายน', light: '#fef08a', main: '#eab308', icon: '🏖️🌴' },
    { id: '05', name: 'พฤษภาคม', light: '#ccfbf1', main: '#14b8a6', icon: '🌱🌼' },
    { id: '06', name: 'มิถุนายน', light: '#f3e8ff', main: '#a855f7', icon: '☂️🌸' },
    { id: '07', name: 'กรกฎาคม', light: '#ffedd5', main: '#f97316', icon: '⛱️🦀' },
    { id: '08', name: 'สิงหาคม', light: '#ecfccb', main: '#84cc16', icon: '🌻🍃' },
    { id: '09', name: 'กันยายน', light: '#fef3c7', main: '#f59e0b', icon: '🍂🍁' },
    { id: '10', name: 'ตุลาคม', light: '#ffedd5', main: '#ea580c', icon: '🎃🦇' },
    { id: '11', name: 'พฤศจิกายน', light: '#e0f2fe', main: '#0ea5e9', icon: '🏕️⛰️' },
    { id: '12', name: 'ธันวาคม', light: '#fae8ff', main: '#d946ef', icon: '🎄🎁' },
  ];

  // ================= API Fetching =================
  const fetchMeals = async (targetDate) => {
    setIsLoading(true);
    setIsPlanFavorite(false);
    setReviewedStatus({}); // เคลียร์ค่ารีวิวเมื่อเปลี่ยนวัน

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userId = storedUser ? storedUser.user_id : 1;
      const response = await fetch(`http://localhost:5000/api/meals?userId=${userId}&date=${targetDate}`);
      const data = await response.json();

      if (response.ok && data.length > 0) {
        const planId = data[0].plan_id;
        setCurrentPlanId(planId);
        
        // 1. เช็กสถานะหัวใจ (Favorite)
        fetch(`http://localhost:5000/api/favorite-status?user_id=${userId}&plan_id=${planId}`)
          .then(res => res.json())
          .then(favData => setIsPlanFavorite(favData.isFav))
          .catch(err => console.error("Error fetching favorite:", err));

        // 2. เช็กสถานะรีวิวของแต่ละเมนู
        const uniqueFoodIds = [...new Set(data.map(m => m.food_id))];
        uniqueFoodIds.forEach(foodId => {
          fetch(`http://localhost:5000/api/review-status?user_id=${userId}&food_id=${foodId}`)
            .then(res => res.json())
            .then(revData => {
              if (revData.isReviewed) {
                setReviewedStatus(prev => ({
                  ...prev,
                  [foodId]: revData
                }));
              }
            })
            .catch(err => console.error("Error fetching review:", err));
        });

        const formattedData = data.map(item => {
          let icon, typeText;
          if (item.meal_type === 'เช้า') {
            icon = <FaSun size={26} style={{ color: "#FF9F43" }} />;
            typeText = 'มื้อเช้า';
          } else if (item.meal_type === 'กลางวัน') {
            icon = <FaCloudSun size={26} style={{ color: "#fb4949" }} />;
            typeText = 'มื้อกลางวัน';
          } else {
            icon = <FaMoon size={24} style={{ color: "#9074ff" }} />;
            typeText = 'มื้อเย็น';
          }
          return {
            id: item.meal_detail_id,
            food_id: item.food_id, // 🌟 ต้องมี food_id
            type: typeText,
            icon: icon,
            name: item.food_name,
            portion: `${Number(item.quantity)} ${String(item.serving_size).replace('1 ', '')}`,
            cal: Math.round(item.total_calories),
            img: item.image || 'https://placehold.co/100x70/ffe0b2/ff9800?text=Food'
          };
        });
        setMealData(formattedData);
      } else {
        setMealData([]);
        setCurrentPlanId(null);
        setIsPlanFavorite(false);
      }
    } catch (error) {
      setMealData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab === 'เมื่อวาน') {
      setSelectedDate(yesterdayStr);
    }
  }, [activeTab]);

  // ================= Toggle Favorite =================
  const handleToggleFavorite = async () => {
    if (!currentPlanId) return;
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = storedUser ? storedUser.user_id : 1;

    try {
      // ยิงไปที่ API เดียวกับหน้า MealPlan
      const response = await fetch('http://localhost:5000/api/favorite-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, plan_id: currentPlanId })
      });

      if (response.ok) {
        const data = await response.json();
        setIsPlanFavorite(data.isFav); // อัปเดตสถานะหัวใจตามที่เซิร์ฟเวอร์ตอบกลับมา
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึกรายการโปรด");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // ================= นำแผนกลับมาใช้ใหม่ =================
  const handleRestorePlan = async () => {
    const confirmRestore = window.confirm("ต้องการนำแผนนี้มาใช้อีกครั้งในวันนี้ใช่หรือไม่?");
    if (!confirmRestore) return;

    setIsLoading(true);
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const userId = storedUser ? storedUser.user_id : 1;

        const response = await fetch('http://localhost:5000/api/restore-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId,
            sourceDate: selectedDate, 
            targetDate: new Date().toISOString().split('T')[0] 
        })
        });

        if (response.ok) {
        alert("นำแผนกลับมาใช้เรียบร้อยแล้ว!");
        window.location.href = '/meal-plan'; 
        } else {
        alert("เกิดข้อผิดพลาดในการคัดลอกแผน");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        setIsLoading(false);
    }
  };

  // ================= Event Handlers =================
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'เมื่อวาน') {
      setSelectedYear(currentYear); 
      setViewingMonth(null); 
      setSelectedDate(yesterdayStr); 
      fetchMeals(yesterdayStr);
    } else if (tab === 'สัปดาห์') {
      setSelectedYear(currentYear); 
      setViewingMonth(null); 
      setSelectedDate(todayFullDate); 
    } else if (tab === 'เดือน') {
      setViewingMonth(null); 
    }
  };

  const handleMonthClick = (index) => {
    setViewingMonth(index); 
    const firstDayOfMonth = `${selectedYear}-${String(index + 1).padStart(2, '0')}-01`;
    setSelectedDate(firstDayOfMonth);
  };

  const totalCalories = mealData.reduce((sum, meal) => sum + meal.cal, 0);

  const getListTitle = () => {
    if (activeTab === 'เมื่อวาน') return `เมนูอาหารของเมื่อวาน (${yesterdayShortDate})`;
    
    let displayDate = "";
    if (activeTab === 'สัปดาห์') {
      displayDate = weekDays.find(d => d.fullDate === selectedDate)?.date || "";
    } else if (viewingMonth !== null) {
      const days = generateDaysInMonth(selectedYear, viewingMonth);
      displayDate = days.find(d => d.fullDate === selectedDate)?.date || "";
    }
    
    return displayDate ? `เมนูอาหารวันที่ ${displayDate} ${selectedYear}` : 'เมนูอาหารของฉัน';
  };

  // จัดกลุ่ม mealData ตาม type
  const groupedMeals = mealData.reduce((acc, meal) => {
    if (!acc[meal.type]) {
        acc[meal.type] = [];
    }
    acc[meal.type].push(meal);
    return acc;
  }, {});

  // ================= Render Functions =================
  const renderMealList = () => (
    <div className="past-plan-card">
        <div className="meal-list-container">
        
        {/* ส่วนหัว (ปุ่มหัวใจรายการโปรด) */}
        <div className="meal-list-header">
            <h3>{getListTitle()}</h3>
            <button 
              className={`heart-icon-btn ${isPlanFavorite ? 'active' : ''}`} 
              aria-label="Favorite"
              onClick={handleToggleFavorite}
              style={{
                backgroundColor: isPlanFavorite ? '#fff0f2' : 'transparent',
                border: 'none',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              {/* 🌟 ใช้ isPlanFavorite เพื่อเปลี่ยนสี */}
              <FaHeart size={22} style={{ color: isPlanFavorite ? "red" : "#ddaa9d", transition: 'color 0.3s' }} />
            </button>
        </div>
        
        {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#ff9800' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '10px' }}>กำลังโหลดเมนูอาหาร...</p>
            </div>
        ) : mealData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
            <p>ไม่มีประวัติอาหารในวันนี้</p>
            </div>
        ) : (
            <div className="meal-items">
            {Object.entries(groupedMeals).map(([type, meals]) => (
            <div className="meal-group" key={type}>
                {meals.map((meal, index) => (
                <div className="meal-card" key={meal.id}>
                    <div className="meal-type">
                    {index === 0 && (
                        <>
                        {/* ตรงนี้คือจุดที่แก้ไขครับ */}
                        <span className={`meal-icon ${mealIcons[meal.type] || ''}`}>
                            {meal.icon}
                        </span>
                        <span className="meal-type-text">{meal.type}</span>
                        </>
                    )}
                    </div>
                    
                    <div className="meal-detail">
                    <img src={meal.img} alt={meal.name} className="meal-image" />
                    <div className="meal-info">
                        <h4>{meal.name}</h4>
                        <span className="meal-portion">{meal.portion}</span>
                    </div>
                    </div>
                    
                    <div className="meal-stats">
                      <span className="meal-cal">{meal.cal} kcal</span>
                      <span 
                        className="meal-review"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          // 🌟 ใช้ reviewedStatus[meal.food_id] เพื่อเช็กว่าเมนูนี้รีวิวหรือยัง
                          color: reviewedStatus[meal.food_id] ? "#FDCB6E" : "#ddaa9d",
                          fontWeight: reviewedStatus[meal.food_id] ? "500" : "400",
                          cursor: "pointer",
                          transition: "color 0.2s"
                        }}
                      >
                        <FaStar size={16} style={{ color: reviewedStatus[meal.food_id] ? "#FDCB6E" : "#ddaa9d" }} /> 
                        รีวิว
                      </span>
                    </div>
                </div>
                ))}
            </div>
            ))}
            </div>
        )}

        {mealData.length > 0 && (
            <div className="meal-total-row">
            <span className="total-label">รวมทั้งหมด</span>
            <span className="total-value">{totalCalories} kcal</span>
            </div>
        )}

        <div className="meal-list-footer">
            <button 
              className="nutrition-btn"
              onClick={() => navigate("/report", { 
                state: { 
                  pastDate: selectedDate, 
                  totalCalories: totalCalories 
                } 
              })} 
            >ดูรายงานโภชนาการ</button>
            <button 
                className="restore-plan-btn" 
                aria-label="นำแผนกลับมาใช้" 
                title="คลิกเพื่อนำแผนเดิมกลับมาใช้ใหม่" 
                onClick={handleRestorePlan}
            >
                <RotateCcw size={20} />
            </button>
        </div>
        </div>
    </div>
  );

  const renderMonthGrid = () => (
    <div className="month-grid-pastel">
      {monthsData.map((month, index) => (
        <div 
          className="calendar-card" 
          key={month.id}
          style={{ '--theme-light': month.light, '--theme-main': month.main }}
          onClick={() => handleMonthClick(index)} 
        >
          <div className="calendar-rings">
            <div className="ring"></div>
            <div className="ring"></div>
          </div>
          <div className="calendar-top-bar"></div>
          <div className="calendar-content">
            <div className="month-header">
              <span className="month-badge">{month.id}</span>
              <span className="month-title">{month.name}</span>
            </div>
            <div className="month-art">
              <span className="art-emoji">{month.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMonthDetail = () => {
    const daysInMonth = generateDaysInMonth(selectedYear, viewingMonth);
    const monthInfo = monthsData[viewingMonth];

    return (
      <div className="month-detail-view fade-in">
        <button className="back-btn" onClick={() => setViewingMonth(null)}>
          <ChevronLeft size={20} /> กลับไปเลือกเดือน
        </button>
        
        <h3 className="month-detail-title" style={{ color: monthInfo.main }}>
          {monthInfo.icon} ประจำเดือน{monthInfo.name} {selectedYear}
        </h3>
        
        <div className="week-selector">
          {daysInMonth.map((day) => {
            const isToday = day.fullDate === todayFullDate;
            return (
              <div 
                key={day.fullDate} 
                className={`day-card ${selectedDate === day.fullDate ? 'active' : ''}`}
                onClick={() => setSelectedDate(day.fullDate)}
                style={{ minWidth: '70px' }}
              >
                <span className="day-name">
                  {day.name} {isToday && <span style={{fontSize: '0.8rem', color: '#f97316'}}>•</span>}
                </span>
                <span className="day-date">{day.date}</span>
              </div>
            )
          })}
        </div>

        {renderMealList()}
      </div>
    );
  };

  return (
    <div className="past-plans-wrapper pastel-theme">

      <header className="past-plans-header">
        <div className="header-left">
          <div className="title-row">
            <History size={28} className="history-icon" />
            <h1>ประวัติ</h1>
            
            <div 
              className="year-selector-wrapper" 
              onMouseLeave={() => setIsYearOpen(false)} 
            >
              <div 
                className={`year-selector-display ${isYearOpen ? 'open' : ''}`}
                onClick={() => setIsYearOpen(!isYearOpen)}
              >
                {selectedYear}
                <ChevronDown size={22} className={`year-dropdown-icon ${isYearOpen ? 'open' : ''}`} />
              </div>

              {isYearOpen && (
                <div className="year-dropdown-menu">
                  {[...Array(5)].map((_, i) => {
                    const y = currentYear - i;
                    return (
                      <div 
                        key={y} 
                        className={`year-dropdown-item ${selectedYear === y ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedYear(y);
                          setActiveTab('เดือน');
                          setViewingMonth(null);
                          setIsYearOpen(false); 
                        }}
                      >
                        {y}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <p className="subtitle">ประวัติการวางแผนอาหาร</p>
        </div>
        
        <div className="header-right">
          <div className="pill-tab-menu">
            <button 
              className={`pill-tab-btn ${activeTab === 'เมื่อวาน' ? 'active' : ''}`}
              onClick={() => handleTabClick('เมื่อวาน')}
            >
              <Calendar size={18} /> เมื่อวาน ({yesterdayShortDate})
            </button>
            <button 
              className={`pill-tab-btn ${activeTab === 'สัปดาห์' ? 'active' : ''}`}
              onClick={() => handleTabClick('สัปดาห์')}
            >
              <Bookmark size={18} /> สัปดาห์
            </button>
            <button 
              className={`pill-tab-btn ${activeTab === 'เดือน' ? 'active' : ''}`}
              onClick={() => handleTabClick('เดือน')}
            >
              <CalendarCheck2 size={18} /> เดือน
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'สัปดาห์' && (
        <div className="week-selector">
          {weekDays.map((day) => {
            const isToday = day.fullDate === todayFullDate;
            return (
              <div 
                key={day.fullDate} 
                className={`day-card ${selectedDate === day.fullDate ? 'active' : ''}`}
                onClick={() => setSelectedDate(day.fullDate)}
              >
                <span className="day-name">
                  {day.name} {isToday && <span style={{fontSize: '0.8rem', color: '#f97316'}}>•</span>}
                </span>
                <span className="day-date">{day.date}</span>
              </div>
            )
          })}
        </div>
      )}

      <main className="past-plans-content">
        {activeTab === 'เมื่อวาน' && renderMealList()}
        {activeTab === 'สัปดาห์' && renderMealList()}
        {activeTab === 'เดือน' && viewingMonth === null && renderMonthGrid()}
        {activeTab === 'เดือน' && viewingMonth !== null && renderMonthDetail()}
      </main>
    </div>
  );
};

export default PastPlans;