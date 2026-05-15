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

function MealPlan() {
  const [mealPlan, setMealPlan] = useState([]);

  // ดึงข้อมูลจาก LocalStorage หรือใช้ค่า Default
  useEffect(() => {
    const stored = localStorage.getItem("mealPlan");
    if (stored) {
      setMealPlan(JSON.parse(stored));
    } else {
      const defaultPlan = [
        {
          name: "ผัดกะเพราไก่ + ไข่ดาว",
          calories: 600,
          time: "07:00 - 09:00",
          type: "มื้อเช้า",
          image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=1200&auto=format&fit=crop",
          tag: "จานเดียว",
          icon: "sun",
        },
        {
          name: "ข้าวอกไก่ย่าง + ผักต้ม",
          calories: 450,
          time: "12:00 - 13:00",
          type: "มื้อกลางวัน",
          image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
          tag: "คลีน",
          icon: "cloud",
        },
        {
          name: "ต้มยำกุ้ง",
          calories: 250,
          time: "18:00 - 19:00",
          type: "มื้อเย็น",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop",
          tag: "ต้ม/แกง",
          icon: "moon",
        },
      ];
      setMealPlan(defaultPlan);
      localStorage.setItem("mealPlan", JSON.stringify(defaultPlan));
    }
  }, []);

  const totalCalories = mealPlan.reduce((sum, meal) => sum + meal.calories, 0);
  const goalCalories = 1600;
  const progressWidth = Math.min((totalCalories / goalCalories) * 100, 100);

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
      {/* HEADER */}
      <header className="meal-top">
        <div>
          <h1>แผนการกินของฉัน</h1>
          <p>วางแผนมื้ออาหารล่วงหน้า เพื่อสุขภาพที่ดีในทุกวัน</p>
        </div>
        <Link to="/MyPlate" className="create-btn" style={{ textDecoration: 'none' }}>
          <FaPlus /> สร้างแผนใหม่
        </Link>
      </header>

      {/* DAYS SELECTOR */}
      <nav className="days-row">
        {["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี"].map((day, idx) => (
          <div key={idx} className={`day ${idx === 0 ? "active" : ""}`}>
            <h4>{day}</h4>
            <span>{5 + idx} พ.ค.</span>
          </div>
        ))}
      </nav>

      <main className="meal-layout">
        {/* LEFT: Meal List */}
        <section className="meal-list">
          {mealPlan.map((meal, index) => (
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
          ))}
          <button className="add-meal-btn">+ เพิ่มมื้ออาหาร / ของว่าง</button>
        </section>

        {/* RIGHT: Summary Card */}
        <aside className="summary-card">
          <h2>สรุปวันนี้</h2>
          <div className="circle-box">
            <div className="circle">
              <h1>{totalCalories}</h1>
              <span>kcal</span>
            </div>
          </div>

          <div className="summary-list">
            <NutritionItem label="คาร์โบไฮเดรต" value="45%" />
            <NutritionItem label="โปรตีน" value="30%" />
            <NutritionItem label="ไขมัน" value="20%" />
          </div>

          <div className="goal-box">
            <div className="goal-top">
              <span>เป้าหมายรายวัน</span>
              <strong>{totalCalories} / {goalCalories} kcal</strong>
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

// Sub-component เพื่อความสะอาดของโค้ด
const NutritionItem = ({ label, value }) => (
  <div className="summary-item">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export default MealPlan;