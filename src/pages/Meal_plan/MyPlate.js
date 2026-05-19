import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaSun, FaCloudSun, FaMoon, FaCalendarDays, FaAngleDown, FaAngleUp } from "react-icons/fa6";
import "./MyPlate.css";
import Calendar from 'react-calendar';
import {LuSalad } from "react-icons/lu";

function MyPlate() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]); 
  const [currentWeekDays, setCurrentWeekDays] = useState([]);
  const [baseDate, setBaseDate] = useState(new Date());

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null); // Ref สำหรับตรวจสอบคลิกด้านนอกเพื่อปิด Pop-up
  
  const [goalData, setGoalData] = useState({ 
    tdee: 2000, carb: 200, protein: 150, fat: 60, sugar: 25, sodium: 2000 
  });

  const mealCategories = [
    { id: "breakfast", title: "มื้อเช้า", dbType: "เช้า", icon: <FaSun /> },
    { id: "lunch", title: "มื้อกลางวัน", dbType: "กลางวัน", icon: <FaCloudSun /> },
    { id: "dinner", title: "มื้อเย็น", dbType: "เย็น", icon: <FaMoon /> }
  ];

// ฟังก์ชันใหม่ที่เลื่อนสัปดาห์ตามวันที่เลือกได้
  // ฟังก์ชันที่ปรับให้เอา "วันที่เลือก/วันนี้" ขึ้นเป็นช่องแรกเสมอ
  const generateWeekForDate = (dateToGenerate) => {
    const targetDate = new Date(dateToGenerate);
    const days = [];
    
    // อาร์เรย์ชื่อวัน (0 = อาทิตย์, 1 = จันทร์, ..., 6 = เสาร์)
    const labelsMap = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
    const realTodayString = new Date().toDateString(); 

    for (let i = 0; i < 7; i++) {
      // เริ่มนับวันที่ 0 จาก targetDate (วันที่เลือก หรือ วันนี้) แล้วบวกเพิ่มไปเรื่อยๆ
      const nextDate = new Date(targetDate);
      nextDate.setDate(targetDate.getDate() + i);

      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dd = String(nextDate.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`; 

      days.push({
        dateString,
        dayNum: nextDate.getDate(),
        label: labelsMap[nextDate.getDay()], // ดึงชื่อวันให้ตรงกับวันที่เปลี่ยนไป
        isToday: realTodayString === nextDate.toDateString()
      });
    }
    setCurrentWeekDays(days);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || { user_id: 1 };
    const draftPlate = JSON.parse(localStorage.getItem("draft_plate")) || [];
    setMeals(draftPlate);
    
    // โหลดครั้งแรกให้เลือกวันปัจจุบันอัตโนมัติ
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;
    
    setSelectedDates([todayString]); 
    generateWeekForDate(today);

    // สร้างฟังก์ชันดึงข้อมูล
    const fetchGoalData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/get-calculation/${storedUser.user_id}`);
        if (response.ok) {
          const data = await response.json();
          setGoalData({
            tdee: Number(data.tdee) || 2000,
            carb: Number(data.carb) || 200,
            protein: Number(data.protein) || 150,
            fat: Number(data.fat) || 60,
            sugar: Number(data.sugar) || 25,
            sodium: Number(data.sodium) || 2000
          });
        }
      } catch (error) {
        console.error("Error fetching goal data:", error);
      }
    };

    // เรียกใช้ฟังก์ชันดึงข้อมูล
    fetchGoalData();

    // จัดการเรื่องคลิกข้างนอกปฏิทินแล้วให้ปิด
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    
  }, []); // ปิด useEffect แบบถูกต้องตรงนี้ที่เดียวจบครับ

  // ฟังก์ชันรับค่าจากช่อง input type="date"
  const handleCalendarChange = (pickedDate) => {
    // format: YYYY-MM-DD
    const yyyy = pickedDate.getFullYear();
    const mm = String(pickedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(pickedDate.getDate()).padStart(2, '0');
    const pickedDateString = `${yyyy}-${mm}-${dd}`; 

    setBaseDate(pickedDate); 
    generateWeekForDate(pickedDate); 

    if (!selectedDates.includes(pickedDateString)) {
      setSelectedDates([...selectedDates, pickedDateString]);
    }
    
    setShowCalendar(false); // ปิดปฏิทินหลังจากเลือกวันแล้ว
  };

  

  const calculateTotals = () => {
    let totalCal = 0, totalCarbs = 0, totalProtein = 0, totalFat = 0, totalSugar = 0, totalSodium = 0;
    meals.forEach((meal) => {
      totalCal += (meal.calPerUnit || 0) * meal.qty;
      if (meal.macros) {
        totalCarbs += (meal.macros.carbs || 0) * meal.qty;
        totalProtein += (meal.macros.protein || 0) * meal.qty;
        totalFat += (meal.macros.fat || 0) * meal.qty;
        totalSugar += (meal.macros.sugar || 0) * meal.qty; 
        totalSodium += (meal.macros.sodium || 0) * meal.qty;
      }
    });
    return { totalCal, totalCarbs, totalProtein, totalFat, totalSugar, totalSodium };
  };

  const totals = calculateTotals();
  const remainingCal = goalData.tdee - totals.totalCal;

  const updateQty = (id, amount) => {
    const updatedMeals = meals.map((meal) =>
      meal.id === id ? { ...meal, qty: Math.max(1, meal.qty + amount) } : meal
    );
    setMeals(updatedMeals);
    localStorage.setItem("draft_plate", JSON.stringify(updatedMeals));
  };

  const removeMeal = (id) => {
    const updatedMeals = meals.filter((meal) => meal.id !== id);
    setMeals(updatedMeals);
    localStorage.setItem("draft_plate", JSON.stringify(updatedMeals));
  };

  const toggleDateSelection = (dateString) => {
    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter(d => d !== dateString));
    } else {
      setSelectedDates([...selectedDates, dateString]);
    }
  };

  const handleSavePlan = async () => {
    if (meals.length === 0) return alert("กรุณาเพิ่มอาหารลงจานก่อน");

    const storedUser = JSON.parse(localStorage.getItem("user")) || { user_id: 1 };
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayString = `${yyyy}-${mm}-${dd}`;

    const finalDays = selectedDates.length > 0 ? selectedDates : [todayString];

    const payload = {
      user_id: storedUser.user_id,
      days: finalDays, 
      total_calories: totals.totalCal,
      details: meals.map(m => ({
        meal_type: m.type.replace("มื้อ", ""), 
        food_id: m.food_id,
        quantity: m.qty,
        total_calories: m.calPerUnit * m.qty
      }))
    };

    try {
      const response = await fetch("http://localhost:5000/api/save-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert("บันทึกแผนอาหารสำเร็จ!");
        localStorage.removeItem("draft_plate"); 
        navigate("/meal-plan"); 
      } else {
        const errData = await response.json();
        alert(`เกิดข้อผิดพลาดจากระบบ: ${errData.message}`);
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ กรุณาตรวจสอบว่าเปิดเซิร์ฟเวอร์พอร์ต 5000 หรือยัง");
    }
  };
  
  return (
    <div className="my-plate-container">
      <header className="header-section">
        <div className="logo-title">
          <div className="plate-left-icon"><LuSalad /></div>
          <div className="plate-title"><h1>จานอาหารของฉัน</h1></div>
        </div>
        <div className="cal-info">
          <h2>เป้าหมาย {goalData.tdee.toLocaleString()} kcal</h2>
          <p>ใช้ไป {totals.totalCal.toLocaleString(undefined, {maximumFractionDigits: 0})} kcal | เหลือ {Math.max(0, remainingCal).toLocaleString(undefined, {maximumFractionDigits: 0})} kcal</p>
        </div>
      </header>

      <div className="meals-list">
        {mealCategories.map((category) => {
          const categoryMeals = meals.filter(meal => meal.type === category.title);

          return (
            <div key={category.id} className="meal-section">
              <div className="meal-section-header">
                <div className="ms-icon-box">{category.icon}</div>
                <h2>{category.title}</h2>
              </div>

              {categoryMeals.length > 0 ? (
                <div className="category-meals">
                  {categoryMeals.map((meal) => (
                    <div key={meal.id} className="cute-food-item">
                      
                      {/* ส่วนซ้าย: รูปภาพ + ข้อความซ้อนทับ */}
                      <div className="cfi-image-wrapper">
                        <img src={meal.image} alt={meal.name} className="cfi-image" />
                        <div className="cfi-overlay">
                          <h3 className="cfi-name">{meal.name}</h3>
                          <span className="cfi-kcal">{(meal.calPerUnit * meal.qty).toFixed(0)} kcal</span>
                        </div>
                      </div>

                      {/* ส่วนขวา: ปุ่มจัดการน่ารักๆ */}
                      <div className="cfi-actions">
                        <div className="cfi-qty-control">
                          <button className="qty-btn-cute" onClick={() => updateQty(meal.id, -1)}><FaMinus /></button>
                          <span className="qty-num-cute">{meal.qty}</span>
                          <button className="qty-btn-cute" onClick={() => updateQty(meal.id, 1)}><FaPlus /></button>
                        </div>
                        <button className="delete-btn-cute" onClick={() => removeMeal(meal.id)}><FaTrash /></button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-meal">ยังไม่มีรายการอาหารสำหรับมื้อนี้</p>
              )}

              <button 
                onClick={() => navigate(`/SearchFood?type=${category.title}`)} 
                className="add-meal-btn-wide"
                style={{ cursor: "pointer", zIndex: 10 }} 
              >
                + เพิ่มอาหารใน{category.title}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bottom-section" style={{ gridTemplateColumns: "1fr" }}>
        {/* 🌟 แผงหลอดปรอทอัจฉริยะที่เพิ่มเป้าหมายพลังงานเข้ามาเรียบร้อยแล้ว */}
        <div className="myplate-nutrition-grid">
          
          {/* สารอาหารหลัก 4 ตัว เรียงต่อกันเป็น 2 คอลัมน์อย่างสมดุล */}
          <NutritionBar label="คาร์โบไฮเดรต" current={totals.totalCarbs} limit={goalData.carb} unit="g" />
          <NutritionBar label="โปรตีน" current={totals.totalProtein} limit={goalData.protein} unit="g" />
          <NutritionBar label="ไขมัน" current={totals.totalFat} limit={goalData.fat} unit="g" />
          <NutritionBar label="น้ำตาล" current={totals.totalSugar} limit={goalData.sugar} unit="g" />
          <NutritionBar label="โซเดียม" current={totals.totalSodium} limit={goalData.sodium} unit="mg"/>
          {/* 🎯 หลอดปรอทเป้าหมายพลังงานแคลอรีรวม (เพิ่มเข้ามาใหม่ - อยู่บนสุดแผ่เต็มความกว้าง) */}
          <NutritionBar 
            label="เป้าหมายพลังงาน" 
            current={totals.totalCal} 
            limit={goalData.tdee} 
            unit="kcal" 
            className="calorie-title-special"
          />

        </div>

        <div className="cute-calendar-card">
          <div className="calendar-header-title">
            
            <div className="date-picker-library-wrapper" ref={calendarRef}>
              <button 
                type="button"
                className={`cute-calendar-dropdown-btn ${showCalendar ? 'active' : ''}`}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <FaCalendarDays className="calendar-icon" />
                <span>
                  {baseDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </span>
                {showCalendar ? <FaAngleUp className="arrow-icon" /> : <FaAngleDown className="arrow-icon" />}
              </button>

              {/* 8. แสดง Pop-up ปฏิทินแบบควบคุมสไตล์ได้ */}
              {showCalendar && (
                <div className="cute-calendar-popup">
                  <Calendar 
                    onChange={handleCalendarChange} 
                    value={baseDate} 
                    locale="th-TH" // ตั้งค่าภาษาไทย
                    className="styled-react-calendar" // CSS class สำหรับแต่งสไตล์
                    prevLabel="<"
                    nextLabel=">"
                    prev2Label="<<"
                    next2Label=">>"
                  />
                </div>
              )}
            </div>

            <h3>เลือกวันที่ต้องการบันทึกแผน (เลือกได้หลายวัน)</h3>
          </div>
          <p className="calendar-subtitle">*สามารถกดที่ไอคอนปฏิทินด้านซ้ายเพื่อเลือกสัปดาห์อื่นๆ ได้</p>
          
          {/* ส่วน Grid และปุ่มด้านล่างเหมือนเดิมเลยครับ */}
          <div className="cute-calendar-grid">
            {currentWeekDays.map((day) => {
              const isSelected = selectedDates.includes(day.dateString);
              return (
                <div 
                  key={day.dateString} 
                  className={`cute-date-item ${isSelected ? "selected" : ""} ${day.isToday ? "today" : ""}`}
                  onClick={() => toggleDateSelection(day.dateString)}
                >
                  <span className="day-label">{day.label}</span>
                  <div className="day-circle">
                    <span className="day-number">{day.dayNum}</span>
                  </div>
                  {day.isToday && <span className="today-badge">วันนี้</span>}
                </div>
              );
            })}
          </div>

          <div className="action-buttons" style={{ display: "flex", gap: "15px", flexDirection: "row", marginTop: "25px" }}>
            <button className="btn-back" onClick={() => navigate(-1)} style={{ flex: 1 }}>ย้อนกลับ</button>
            <button className="btn-next" onClick={handleSavePlan} style={{ flex: 1 }}>บันทึกลงตารางอาหาร</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// 🌟 ปรับปรุง NutritionBar ด้านล่างสุดของไฟล์ MyPlate.js
function NutritionBar({ label, current, limit, unit, isFullWidth, className }) { // 1. รับ className เพิ่มเข้ามา
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const fillWidth = Math.min(percentage, 100);

  let statusClass = "bar-normal"; 
  if (current === 0) {
    statusClass = "bar-empty";   
  } else if (percentage > 100) {
    statusClass = "bar-exceeded"; 
  }

  const isExceeded = percentage > 100;
  const exceedAmount = current - limit;

  return (
    /* 2. เอา className พิเศษมาแปะพ่วงไว้ที่กล่องนอกสุดตรงนี้ */
    <div className={`macro-progress-card ${isFullWidth ? "span-full" : ""} ${className || ""}`}>
      
      {/* 3. ลบ inline style ออกเรียบร้อย กลับมาคลีนเหมือนเดิมแล้วครับ */}
      <span className="macro-card-title">{label}</span>
      
      <div className="plate-macro-track">
        <div className={`plate-macro-fill ${statusClass}`} style={{ width: `${fillWidth}%` }} />
        <div className="plate-macro-pill-text">
          {current.toFixed(1)} / {limit > 0 ? limit.toFixed(0) : "--"} {unit}
        </div>
      </div>

      {isExceeded && (
        <div className="exceed-text" style={{ color: "#ee5253", fontSize: "0.85rem", marginTop: "2px", fontWeight: "bold" }}>
          เกินไป {exceedAmount.toFixed(1)} {unit}
        </div>
      )}
    </div>
  );
}

export default MyPlate;