import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // 🌟 นำเข้า useLocation
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaSun,
  FaCloudSun,
  FaMoon,
  FaCalendarDays,
  FaAngleDown,
  FaAngleUp
} from "react-icons/fa6";

import "./MyPlate.css";
import Calendar from "react-calendar";
import { LuSalad } from "react-icons/lu";

function MyPlate() {

  const navigate = useNavigate();
  const location = useLocation(); // 🌟

  // 🌟 อ่านโหมดจาก URL
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get("mode") || "normal";
  // 🌟 ถ้ามาจากหน้าสร้างแผน จะใช้ตะกร้า plan_plate นอกนั้นใช้ myplate
  const storageKey = mode === "plan" ? "plan_plate" : "myplate"; 

  const [meals, setMeals] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [currentWeekDays, setCurrentWeekDays] = useState([]);
  const [baseDate, setBaseDate] = useState(new Date());

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const [goalData, setGoalData] = useState({
    tdee: 0,
    carb: 0,
    protein: 0,
    fat: 0,
    sugar: 0,
    sodium: 0
  });

  const mealCategories = [
    { id: "breakfast", title: "มื้อเช้า", dbType: "เช้า", icon: <FaSun /> },
    { id: "lunch", title: "มื้อกลางวัน", dbType: "กลางวัน", icon: <FaCloudSun /> },
    { id: "dinner", title: "มื้อเย็น", dbType: "เย็น", icon: <FaMoon /> }
  ];

  // ================= WEEK =================
  const generateWeekForDate = (dateToGenerate) => {
    const targetDate = new Date(dateToGenerate);
    const days = [];
    const labelsMap = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
    const realTodayString = new Date().toDateString();

    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(targetDate);
      nextDate.setDate(targetDate.getDate() + i);

      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dd = String(nextDate.getDate()).padStart(2, "0");
      const dateString = `${yyyy}-${mm}-${dd}`;

      days.push({
        dateString,
        dayNum: nextDate.getDate(),
        label: labelsMap[nextDate.getDay()],
        isToday: realTodayString === nextDate.toDateString()
      });
    }
    setCurrentWeekDays(days);
  };

  // ================= LOAD =================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    
    // 🌟 ดึงข้อมูลจากตะกร้าที่ถูกต้อง
    const draftPlate = JSON.parse(localStorage.getItem(storageKey)) || [];
    setMeals(draftPlate);

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayString = `${yyyy}-${mm}-${dd}`;

    setSelectedDates([todayString]);
    generateWeekForDate(today);

    const fetchGoalData = async () => {

      if (storedUser?.user_id) {

        try {

          const response = await fetch(
            `http://localhost:5000/api/get-calculation/${storedUser.user_id}`
          );

          if (response.ok) {

            const data = await response.json();

            setGoalData({
              tdee: Number(data.tdee) || 0,
              carb: Number(data.carb) || 0,
              protein: Number(data.protein) || 0,
              fat: Number(data.fat) || 0,
              sugar: Number(data.sugar) || 0,
              sodium: Number(data.sodium) || 0
            });

          }

        } catch (error) {
          console.error(error);
        }

      } else {

        const calcResult = JSON.parse(
          localStorage.getItem("calcResult")
        );

        if (calcResult) {

          setGoalData({
            tdee: Number(calcResult.tdee) || 0,
            carb: Number(calcResult.carb) || 0,
            protein: Number(calcResult.protein) || 0,
            fat: Number(calcResult.fat) || 0,
            sugar: Number(calcResult.sugar) || 0,
            sodium: Number(calcResult.sodium) || 0
          });

        }

      }

    };

    fetchGoalData();

    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [storageKey]); // 🌟

  // ================= CALENDAR =================
  const handleCalendarChange = (pickedDate) => {
    const yyyy = pickedDate.getFullYear();
    const mm = String(pickedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(pickedDate.getDate()).padStart(2, "0");
    const pickedDateString = `${yyyy}-${mm}-${dd}`;

    setBaseDate(pickedDate);
    generateWeekForDate(pickedDate);

    if (!selectedDates.includes(pickedDateString)) {
      setSelectedDates([...selectedDates, pickedDateString]);
    }
    setShowCalendar(false);
  };

  // ================= TOTALS =================
  const calculateTotals = () => {
    let totalCal = 0, totalCarbs = 0, totalProtein = 0, totalFat = 0, totalSugar = 0, totalSodium = 0;

    meals.forEach((meal) => {
      totalCal += Number(meal.calPerUnit || 0) * Number(meal.qty || 0);
      if (meal.macros) {
        totalCarbs += Number(meal.macros.carbs || 0) * Number(meal.qty || 0);
        totalProtein += Number(meal.macros.protein || 0) * Number(meal.qty || 0);
        totalFat += Number(meal.macros.fat || 0) * Number(meal.qty || 0);
        totalSugar += Number(meal.macros.sugar || 0) * Number(meal.qty || 0);
        totalSodium += Number(meal.macros.sodium || 0) * Number(meal.qty || 0);
      }
    });

    return { totalCal, totalCarbs, totalProtein, totalFat, totalSugar, totalSodium };
  };

  const totals = calculateTotals();
  const remainingCal = Number(goalData.tdee || 0) - Number(totals.totalCal || 0);

  // ================= UPDATE =================
  const updateQty = (id, amount) => {
    const updatedMeals = meals.map((meal) =>
      meal.id === id ? { ...meal, qty: Math.max(1, meal.qty + amount) } : meal
    );
    setMeals(updatedMeals);
    localStorage.setItem(storageKey, JSON.stringify(updatedMeals)); // 🌟
  };

  // ================= REMOVE =================
  const removeMeal = (id) => {
    const updatedMeals = meals.filter((meal) => meal.id !== id);
    setMeals(updatedMeals);
    localStorage.setItem(storageKey, JSON.stringify(updatedMeals)); // 🌟
  };

  // ================= DATE =================
  const toggleDateSelection = (dateString) => {
    if (selectedDates.includes(dateString)) {
      setSelectedDates(selectedDates.filter(d => d !== dateString));
    } else {
      setSelectedDates([...selectedDates, dateString]);
    }
  };

  // ================= SAVE =================
  const handleSavePlan = async () => {

    if (meals.length === 0) {
      return alert("กรุณาเพิ่มอาหารลงจานก่อน");
    }

    const storedUser = JSON.parse(
      localStorage.getItem("user")
    );

    if (!storedUser?.user_id) {
      alert("กรุณาสมัครสมาชิกหรือเข้าสู่ระบบก่อนบันทึกแผนอาหาร");
      return;
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayString = `${yyyy}-${mm}-${dd}`;

    const finalDays = selectedDates.length > 0 ? selectedDates : [todayString];

    const payload = {
      user_id: storedUser.user_id,
      days: finalDays,
      total_calories: totals.totalCal,
      details: meals.map((m) => ({
        meal_type: m.meal_type,
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
        localStorage.removeItem(storageKey); // 🌟 ลบเฉพาะตะกร้าที่ใช้อยู่
        navigate("/meal-plan");
      } else {
        const errData = await response.json();
        alert(`เกิดข้อผิดพลาดจากระบบ: ${errData.message}`);
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้");
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
          <h2>เป้าหมาย {Number(goalData.tdee || 0).toLocaleString()} kcal</h2>
          <p>
            ใช้ไป {Number(totals.totalCal || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} kcal
            {" | "}
            เหลือ {Math.max(0, remainingCal).toLocaleString(undefined, { maximumFractionDigits: 0 })} kcal
          </p>
        </div>
      </header>

      <div className="meals-list">
        {mealCategories.map((category) => {
          const categoryMeals = meals.filter((meal) => meal.meal_type === category.dbType);

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
                      <div className="cfi-image-wrapper">
                        <img src={meal.image} alt={meal.name} className="cfi-image" />
                        <div className="cfi-overlay">
                          <h3 className="cfi-name">{meal.name}</h3>
                          <span className="cfi-kcal">{(meal.calPerUnit * meal.qty).toFixed(0)} kcal</span>
                        </div>
                      </div>
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
                // 🌟 ส่งค่า mode ต่อไปยังหน้าค้นหาด้วย
                onClick={() => navigate(`/SearchFood?type=${category.title}&mode=${mode}`)}
                className="add-meal-btn-wide"
              >
                + เพิ่มอาหารใน{category.title}
              </button>
            </div>
          );
        })}
      </div>

      <div className="bottom-section" style={{ gridTemplateColumns: "1fr" }}>
        <div className="myplate-nutrition-grid">
          <NutritionBar label="คาร์โบไฮเดรต" current={totals.totalCarbs} limit={goalData.carb} unit="g" />
          <NutritionBar label="โปรตีน" current={totals.totalProtein} limit={goalData.protein} unit="g" />
          <NutritionBar label="ไขมัน" current={totals.totalFat} limit={goalData.fat} unit="g" />
          <NutritionBar label="น้ำตาล" current={totals.totalSugar} limit={goalData.sugar} unit="g" />
          <NutritionBar label="โซเดียม" current={totals.totalSodium} limit={goalData.sodium} unit="mg" />
          <NutritionBar label="เป้าหมายพลังงาน" current={totals.totalCal} limit={goalData.tdee} unit="kcal" className="calorie-title-special" />
        </div>

        <div className="cute-calendar-card">
          <div className="calendar-header-title">
            <div className="date-picker-library-wrapper" ref={calendarRef}>
              <button type="button" className={`cute-calendar-dropdown-btn ${showCalendar ? "active" : ""}`} onClick={() => setShowCalendar(!showCalendar)}>
                <FaCalendarDays className="calendar-icon" />
                <span>{baseDate.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}</span>
                {showCalendar ? <FaAngleUp className="arrow-icon" /> : <FaAngleDown className="arrow-icon" />}
              </button>
              {showCalendar && (
                <div className="cute-calendar-popup">
                  <Calendar onChange={handleCalendarChange} value={baseDate} locale="th-TH" className="styled-react-calendar" prevLabel="<" nextLabel=">" prev2Label="<<" next2Label=">>" />
                </div>
              )}
            </div>
            <h3>เลือกวันที่ต้องการบันทึกแผน</h3>
          </div>
          <p className="calendar-subtitle">*สามารถเลือกได้หลายวัน</p>
          <div className="cute-calendar-grid">
            {currentWeekDays.map((day) => {
              const isSelected = selectedDates.includes(day.dateString);
              return (
                <div key={day.dateString} className={`cute-date-item ${isSelected ? "selected" : ""} ${day.isToday ? "today" : ""}`} onClick={() => toggleDateSelection(day.dateString)}>
                  <span className="day-label">{day.label}</span>
                  <div className="day-circle"><span className="day-number">{day.dayNum}</span></div>
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

function NutritionBar({ label, current, limit, unit, isFullWidth, className }) {
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
    <div className={`macro-progress-card ${isFullWidth ? "span-full" : ""} ${className || ""}`}>
      <span className="macro-card-title">{label}</span>
      <div className="plate-macro-track">
        <div className={`plate-macro-fill ${statusClass}`} style={{ width: `${fillWidth}%` }} />
        <div className="plate-macro-pill-text">
          {Number(current || 0).toFixed(1)}
          {" / "}
          {limit > 0 ? Number(limit || 0).toFixed(0) : "--"} {unit}
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