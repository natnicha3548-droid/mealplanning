import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MealPlan.css";
import {
  FaSun,
  FaCloudSun,
  FaMoon,
  FaEllipsisV,
  FaPlus,
} from "react-icons/fa";

// ฟังก์ชันสำหรับสร้างวันที่ 7 วันล่วงหน้า (เริ่มจากวันนี้)
const generateNext7Days = () => {
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const monthNames = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      name: dayNames[d.getDay()],
      date: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      fullDate: d.toISOString().split("T")[0],
    });
  }
  return days;
};

function MealPlan() {
  const [mealPlan, setMealPlan] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับเก็บข้อมูลเป้าหมายที่ดึงมาจากการคำนวณ
  const [goalData, setGoalData] = useState({
    tdee: 1600, // ค่าเริ่มต้น
    carb: 0,
    protein: 0,
    fat: 0
  });

  const fetchMealPlanFromDB = async (date) => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      const currentUserId = storedUser ? JSON.parse(storedUser).user_id : 1;

      const response = await fetch(`http://localhost:5000/api/meals?date=${date}&userId=${currentUserId}`);
      
      if (!response.ok) {
        throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลมื้ออาหาร");
      }

      const dataFromDB = await response.json();
      setMealPlan(dataFromDB);
      setIsLoading(false);

    } catch (error) {
      console.error("Error fetching meals:", error);
      setMealPlan([]); 
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const days = generateNext7Days();
    setWeekDays(days);
    
    // ดึงข้อมูล User
    const storedUser = localStorage.getItem("user");
    const currentUserId = storedUser ? JSON.parse(storedUser).user_id : 1;

    // 1. ดึงเป้าหมายการคำนวณ (TDEE, Macros) จาก Backend
    fetch(`http://localhost:5000/api/get-calculation/${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setGoalData({
            tdee: data.tdee || 1600,
            carb: data.carb || 0,
            protein: data.protein || 0,
            fat: data.fat || 0
          });
        }
      })
      .catch(err => console.error("Error fetching goals:", err));

    // 2. ดึงมื้ออาหารของวันนี้
    fetchMealPlanFromDB(days[0].fullDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDayClick = (index) => {
    setSelectedDay(index);
    fetchMealPlanFromDB(weekDays[index].fullDate);
  };

  // คำนวณแคลอรีที่กินไปแล้ว
  const totalCalories = mealPlan.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
  const totalCarbs = mealPlan.reduce((sum, meal) => sum + (Number(meal.carbs) || 0), 0);
  const totalProtein = mealPlan.reduce((sum, meal) => sum + (Number(meal.protein) || 0), 0);
  const totalFat = mealPlan.reduce((sum, meal) => sum + (Number(meal.fat) || 0), 0);
  const totalSugar = mealPlan.reduce((sum, meal) => sum + (Number(meal.sugar) || 0), 0);
  const totalSodium = mealPlan.reduce((sum, meal) => sum + (Number(meal.sodium) || 0), 0); 

  // ใช้ TDEE เป็น Goal Calories สำหรับขีดความคืบหน้า
  const goalCalories = goalData.tdee;
  const progressWidth = Math.min((totalCalories / goalCalories) * 100, 100);

  // คำนวณเปอร์เซ็นต์สัดส่วนสารอาหาร
  const totalMacros = totalCarbs + totalProtein + totalFat + totalSugar + (totalSodium / 1000) || 1; 
  const pCarb = Math.round((totalCarbs / totalMacros) * 100) || 0;
  const pPro = Math.round((totalProtein / totalMacros) * 100) || 0;
  const pFat = Math.round((totalFat / totalMacros) * 100) || 0;
  const pSug = Math.round((totalSugar / totalMacros) * 100) || 0;
  const pSod = totalMacros > 1 ? Math.max(0, 100 - pCarb - pPro - pFat - pSug) : 0; 

  const endCarb = pCarb;
  const endPro = endCarb + pPro;
  const endFat = endPro + pFat;
  const endSug = endFat + pSug;

  const circleStyle = {
    background: totalCalories === 0 
      ? `radial-gradient(closest-side, white 85%, transparent 86% 100%), #ffd166` // ถ้ายังไม่กินอะไรเลย ให้แสดงวงล้อสีเหลืองอ่อน
      : `radial-gradient(closest-side, white 85%, transparent 86% 100%),
         conic-gradient(
           #FF9F43 0% ${endCarb}%,      
           #EE5253 ${endCarb}% ${endPro}%,     
           #10AC84 ${endPro}% ${endFat}%,     
           #0984E3 ${endFat}% ${endSug}%,     
           #FDCB6E ${endSug}% 100%     
         )`
  };

  const renderIcon = (icon) => {
    switch (icon) {
      case "sun": return <FaSun />;
      case "cloud": return <FaCloudSun />;
      case "moon": return <FaMoon />;
      default: return <FaSun />;
    }
  };

  return (
    <div className="meal-page">
      <header className="meal-top">
        <div>
          <h1>แผนการกินของฉัน</h1>
          <p>วางแผนมื้ออาหารล่วงหน้า เพื่อสุขภาพที่ดีในทุกวัน</p>
        </div>
        <Link to="/MyPlate" className="create-btn" style={{ textDecoration: 'none' }}>
          <FaPlus /> สร้างแผนใหม่
        </Link>
      </header>

      <nav className="days-row">
        {weekDays.map((day, idx) => (
          <div 
            key={idx} 
            className={`day ${idx === selectedDay ? "active" : ""}`}
            onClick={() => handleDayClick(idx)}
            style={{ cursor: "pointer" }}
          >
            <h4>{idx === 0 ? "วันนี้" : day.name}</h4>
            <span>{day.date}</span>
          </div>
        ))}
      </nav>

      <main className="meal-layout">
        <section className="meal-list">
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "50px", color: "#888" }}>กำลังโหลดข้อมูลมื้ออาหาร...</div>
          ) : mealPlan.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px", color: "#888" }}>ยังไม่มีแผนการกินในวันนี้</div>
          ) : (
            mealPlan.map((meal, index) => (
              <div className="meal-card" key={index}>
                <div className="meal-icon">{renderIcon(meal.icon)}</div>
                <div className="meal-time">
                  <h3>{meal.type}</h3>
                  <span>{meal.time}</span>
                </div>
                <img src={meal.image} alt={meal.name} className="meal-image" />
                <div className="meal-info">
                  <h2>{meal.name}</h2>
                  <div className="meal-tag">{meal.tag}</div>
                </div>
                <div className="meal-cal">{meal.calories} kcal</div>
                <button className="change-btn">เปลี่ยนเมนู</button>
                <FaEllipsisV className="dot-icon" />
              </div>
            ))
          )}
        </section>

        <aside className="summary-card">
          <h2>สรุปวันนี้</h2>
          <div className="circle-box">
            <div className="circle" style={circleStyle}>
              <h1>{totalCalories}</h1>
              <span>kcal</span>
            </div>
          </div>

          <div className="summary-list">
            <NutritionItem 
              label="คาร์โบไฮเดรต" 
              value={`${pCarb}%`} 
              grams={`${totalCarbs.toFixed(2)} / ${Number(goalData.carb).toFixed(2)}g`} 
            />
            <NutritionItem 
              label="โปรตีน" 
              value={`${pPro}%`} 
              grams={`${totalProtein.toFixed(2)} / ${Number(goalData.protein).toFixed(2)}g`} 
            />
            <NutritionItem 
              label="ไขมัน" 
              value={`${pFat}%`} 
              grams={`${totalFat.toFixed(2)} / ${Number(goalData.fat).toFixed(2)}g`} 
            />
            <NutritionItem 
              label="น้ำตาล" 
              value={`${pSug}%`} 
              grams={`${totalSugar.toFixed(2)}g`} 
            />
            <NutritionItem 
              label="โซเดียม" 
              value={`${pSod}%`} 
              grams={`${totalSodium.toFixed(2)}mg`} 
            />
          </div>

          <div className="goal-box">
            <div className="goal-top">
              <span>เป้าหมายรายวัน</span>
              <strong>{totalCalories} / {Number(goalCalories).toFixed(0)} kcal</strong>
            </div>
            <div className="goal-bar">
              <div className="goal-fill" style={{ width: `${progressWidth}%` }}></div>
            </div>
          </div>
          <button className="report-btn">ดูรายงานโภชนาการ</button>
        </aside>
      </main>
    </div>
  );
}

const NutritionItem = ({ label, value, grams }) => (
  <div className="summary-item">
    <span>{label} <small style={{color:"#aaa", fontSize:"0.8rem"}}>({grams})</small></span>
    <strong>{value}</strong>
  </div>
);

export default MealPlan;