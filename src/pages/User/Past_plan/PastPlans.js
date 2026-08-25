import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from "react-router-dom";
import {
  RefreshCw, Calendar, CalendarCheck2, ChevronLeft, ChevronDown,
} from 'lucide-react';
import {
  FaHeart, FaStar, FaSun, FaCloudSun, FaMoon,
  FaSnowflake, FaMountain, FaGift, FaTree, FaSeedling,
  FaUmbrellaBeach, FaLeaf, FaCloudRain, FaUmbrella,
  FaWater, FaWind, FaGhost, FaCampground, FaFire, FaSnowman
} from "react-icons/fa";
import './PastPlans.css';

import { LuCalendarClock } from "react-icons/lu";

const mealIcons = {
  'มื้อเช้า': 'icon-breakfast',
  'มื้อกลางวัน': 'icon-lunch',
  'มื้อเย็น': 'icon-dinner'
};

const mealThemeColors = {
  'มื้อเช้า': '#ff9800',
  'มื้อกลางวัน': '#f44336',
  'มื้อเย็น': '#9c27b0'
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

  // ================= State Management =================
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const savedTab = sessionStorage.getItem("past_activeTab");
  const [activeTab, setActiveTab] = useState(
    savedTab === 'เดือน' ? 'เดือน' : 'วันนี้'
  );
  const [selectedDate, setSelectedDate] = useState(
    savedTab === 'เดือน'
      ? (sessionStorage.getItem("past_selectedDate") || todayFullDate)
      : todayFullDate
  );
  const [viewingMonth, setViewingMonth] = useState(sessionStorage.getItem("past_viewingMonth") ? Number(sessionStorage.getItem("past_viewingMonth")) : null);
  const [mealData, setMealData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [reviewedStatus, setReviewedStatus] = useState({});


  // รีวิว
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFood, setActiveFood] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const monthsData = [
    { id: '01', name: 'มกราคม', light: '#ffedd5', main: '#f97316', icon: <><FaSnowflake size={24} /> <FaMountain size={24} /></> },
    { id: '02', name: 'กุมภาพันธ์', light: '#fce7f3', main: '#ec4899', icon: <><FaHeart size={24} /> <FaGift size={24} /></> },
    { id: '03', name: 'มีนาคม', light: '#dcfce7', main: '#22c55e', icon: <><FaTree size={24} /> <FaSeedling size={24} /></> },
    { id: '04', name: 'เมษายน', light: '#fef08a', main: '#eab308', icon: <><FaSun size={24} /> <FaUmbrellaBeach size={24} /></> },
    { id: '05', name: 'พฤษภาคม', light: '#ccfbf1', main: '#14b8a6', icon: <><FaLeaf size={24} /> <FaCloudRain size={24} /></> },
    { id: '06', name: 'มิถุนายน', light: '#f3e8ff', main: '#a855f7', icon: <><FaUmbrella size={24} /> <FaWater size={24} /></> },
    { id: '07', name: 'กรกฎาคม', light: '#ffedd5', main: '#f97316', icon: <><FaSun size={24} /> <FaWater size={24} /></> },
    { id: '08', name: 'สิงหาคม', light: '#ecfccb', main: '#84cc16', icon: <><FaSun size={24} /> <FaLeaf size={24} /></> },
    { id: '09', name: 'กันยายน', light: '#fef3c7', main: '#f59e0b', icon: <><FaLeaf size={24} /> <FaWind size={24} /></> },
    { id: '10', name: 'ตุลาคม', light: '#ffedd5', main: '#ea580c', icon: <><FaGhost size={24} /> <FaMoon size={24} /></> },
    { id: '11', name: 'พฤศจิกายน', light: '#e0f2fe', main: '#0ea5e9', icon: <><FaCampground size={24} /> <FaFire size={24} /></> },
    { id: '12', name: 'ธันวาคม', light: '#fae8ff', main: '#d946ef', icon: <><FaTree size={24} /> <FaSnowman size={24} /></> },
  ];

  // ================= API Fetching =================
  const fetchMeals = async (targetDate) => {
    setIsLoading(true);
    setLoadError('');
    setReviewedStatus({}); // เคลียร์ค่ารีวิวเมื่อเปลี่ยนวัน

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userId = storedUser ? storedUser.user_id : 1;
      const response = await fetch(`http://localhost:5000/api/meals?userId=${userId}&date=${targetDate}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error('ไม่สามารถโหลดประวัติการกินได้');
      }

      if (Array.isArray(data) && data.length > 0) {
        // ตรวจสอบว่าผู้ใช้เคยรีวิวเมนูในประวัตินี้หรือยัง
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
            icon = <FaSun size={26} style={{ color: mealThemeColors['มื้อเช้า'] }} />;
            typeText = 'มื้อเช้า';
          } else if (item.meal_type === 'กลางวัน') {
            icon = <FaCloudSun size={26} style={{ color: mealThemeColors['มื้อกลางวัน'] }} />;
            typeText = 'มื้อกลางวัน';
          } else {
            icon = <FaMoon size={24} style={{ color: mealThemeColors['มื้อเย็น'] }} />;
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
            img: item.image
              ? (item.image.startsWith("http") ? item.image : `http://localhost:5000${item.image}`)
              : 'https://placehold.co/100x70/ffe0b2/ff9800?text=Food'
          };
        });
        setMealData(formattedData);
      } else {
        setMealData([]);
      }
    } catch (error) {
      setLoadError('ไม่สามารถเชื่อมต่อข้อมูลประวัติการกินได้ กรุณาลองใหม่อีกครั้ง');
      setMealData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🌟 เพิ่ม useEffect ชุดนี้เพื่อเซฟค่าตัวเลือกเก็บไว้ตอนย้ายหน้า
  useEffect(() => {
    sessionStorage.setItem("past_activeTab", activeTab);
    sessionStorage.setItem("past_selectedDate", selectedDate);
    if (viewingMonth !== null) {
      sessionStorage.setItem("past_viewingMonth", viewingMonth);
    } else {
      sessionStorage.removeItem("past_viewingMonth");
    }
  }, [activeTab, selectedDate, viewingMonth]);

  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab === 'วันนี้') {
      setSelectedDate(todayFullDate);
    }
  }, [activeTab, todayFullDate]);

  // ================= Event Handlers =================
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'วันนี้') {
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
    if (activeTab === 'วันนี้') return `ประวัติการกินวันนี้ (${today.getDate()} ${thaiMonthShort[today.getMonth()]})`;

    let displayDate = "";
    if (viewingMonth !== null) {
      const days = generateDaysInMonth(selectedYear, viewingMonth);
      displayDate = days.find(d => d.fullDate === selectedDate)?.date || "";
    }

    return displayDate ? `ประวัติการกินวันที่ ${displayDate} ${selectedYear}` : 'ประวัติการกินของฉัน';
  };

  // จัดกลุ่ม mealData ตาม type
  const groupedMeals = mealData.reduce((acc, meal) => {
    if (!acc[meal.type]) {
      acc[meal.type] = [];
    }
    acc[meal.type].push(meal);
    return acc;
  }, {});

  const openReviewModal = (foodId) => {
    const existing = reviewedStatus[foodId];
    setActiveFood(foodId);
    setRating(existing ? existing.rating : 0);
    setReviewText(existing ? existing.review_text : "");
    setIsModalOpen(true);
  };

  const handleSaveReview = async () => {
    const userId = JSON.parse(localStorage.getItem('user'))?.user_id || 1;
    await fetch('http://localhost:5000/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, food_id: activeFood, rating, review_text: reviewText })
    });
    setIsModalOpen(false);
    fetchMeals(selectedDate);
  };

  // ================= Render Functions =================
  const renderMealList = () => (
    <div className="past-plan-card">
      <div className="meal-list-container">

        <div className="meal-list-header">
          <h3>{getListTitle()}</h3>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#ff9800' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '10px' }}>กำลังโหลดเมนูอาหาร...</p>
          </div>
        ) : loadError ? (
          <div className="history-empty-state history-error" role="alert">
            <p>{loadError}</p>
            <button className="retry-btn" onClick={() => fetchMeals(selectedDate)}>ลองใหม่</button>
          </div>
        ) : mealData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#888' }}>
            <p>ยังไม่มีบันทึกการกินในวันที่เลือก</p>
          </div>
        ) : (
          <div className="meal-items">
            {Object.entries(groupedMeals).map(([type, meals]) => (
              <div className="meal-group" key={type}>
                {/* หัวข้อมื้ออาหาร แสดงครั้งเดียวต่อกลุ่ม เหมือนหน้า HomePage บนมือถือ */}
                <div className="meal-type">
                  <span className={`meal-icon ${mealIcons[type] || ''}`}>
                    {meals[0].icon}
                  </span>
                  <span className="meal-type-text" style={{ color: mealThemeColors[type] }}>{type}</span>
                </div>

                <div className="meal-items-list">
                  {meals.map((meal) => (
                    <div className="meal-card" key={meal.id}>
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
                          onClick={() => openReviewModal(meal.food_id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: reviewedStatus[meal.food_id] ? "#FDCB6E" : "#ddaa9d",
                            fontWeight: reviewedStatus[meal.food_id] ? "500" : "400",
                            cursor: "pointer",
                            transition: "color 0.2s"
                          }}
                        >
                          <FaStar size={16} style={{ color: reviewedStatus[meal.food_id] ? "#FDCB6E" : "#ddaa9d" }} />
                          {reviewedStatus[meal.food_id] ? "แก้ไขรีวิว" : "รีวิว"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
          >ดูสรุปโภชนาการ</button>
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
                  {day.name} {isToday && <span style={{ fontSize: '0.8rem', color: '#f97316' }}>•</span>}
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

      {/* 🌟 ย้าย Modal ออกมาอยู่ข้างนอกสุดตรงนี้ เพื่อไม่ให้เกิดบั๊กซ้อนทับกัน */}
      {isModalOpen && createPortal(
        <div className="review-modal-overlay">
          <div className="review-modal-content">
            <h3>
              {reviewedStatus[activeFood] ? "แก้ไขรีวิวเมนู" : "เขียนรีวิวให้เมนู"} "{mealData.find(m => m.food_id === activeFood)?.name}"
            </h3>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <FaStar key={s} color={s <= rating ? "#FDCB6E" : "#ddd"}
                  onClick={() => setRating(s)} size={35} style={{ cursor: 'pointer', margin: '0 2px' }} />
              ))}
            </div>

            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
              placeholder="เมนูนี้รสชาติเป็นอย่างไรบ้าง?..." />

            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)}>ยกเลิก</button>
              <button onClick={handleSaveReview}>
                {reviewedStatus[activeFood] ? "อัปเดตรีวิว" : "บันทึกรีวิว"}
              </button>
            </div>
          </div>
        </div>,
        document.body // 👈 ส่งไปแสดงที่ body ของ HTML
      )}

      <header className="past-plans-header">
        <div className="header-left">
          <div className="title-row">
            <div className="past-icon"><LuCalendarClock /></div>
            <h1>ประวัติการกิน</h1>

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
          <p className="subtitle">ดูรายการอาหารและพลังงานที่กินย้อนหลัง</p>
        </div>

        <div className="header-right">
          <div className="pill-tab-menu">
            <button
              className={`pill-tab-btn ${activeTab === 'วันนี้' ? 'active' : ''}`}
              onClick={() => handleTabClick('วันนี้')}
            >
              <Calendar size={18} /> วันนี้
            </button>
            <button
              className={`pill-tab-btn ${activeTab === 'เดือน' ? 'active' : ''}`}
              onClick={() => handleTabClick('เดือน')}
            >
              <CalendarCheck2 size={18} /> รายเดือน
            </button>
          </div>
          <button
            className="icon-only-btn"
            aria-label="รีโหลดประวัติการกิน"
            title="รีโหลดประวัติการกิน"
            onClick={() => fetchMeals(selectedDate)}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <main className="past-plans-content">
        {activeTab === 'วันนี้' && renderMealList()}
        {activeTab === 'เดือน' && viewingMonth === null && renderMonthGrid()}
        {activeTab === 'เดือน' && viewingMonth !== null && renderMonthDetail()}
      </main>
    </div>
  );
};

export default PastPlans;