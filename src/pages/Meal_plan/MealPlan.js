import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const stored = localStorage.getItem("mealPlan");

    if (stored) {
      setMealPlan(JSON.parse(stored));
    } else {
      setMealPlan([
        {
          name: "ผัดกะเพราไก่ + ไข่ดาว",
          calories: 600,
          time: "07:00 - 09:00",
          type: "มื้อเช้า",
          image:
            "https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=1200&auto=format&fit=crop",
          tag: "จานเดียว",
          icon: "sun",
        },
        {
          name: "ข้าวอกไก่ย่าง + ผักต้ม",
          calories: 450,
          time: "12:00 - 13:00",
          type: "มื้อกลางวัน",
          image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
          tag: "คลีน",
          icon: "cloud",
        },
        {
          name: "ต้มยำกุ้ง",
          calories: 250,
          time: "18:00 - 19:00",
          type: "มื้อเย็น",
          image:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop",
          tag: "ต้ม/แกง",
          icon: "moon",
        },
      ]);
    }
  }, []);

  const totalCalories = mealPlan.reduce(
    (sum, meal) => sum + meal.calories,
    0
  );

  const renderIcon = (icon) => {
    switch (icon) {
      case "sun":
        return <FaSun />;
      case "cloud":
        return <FaCloudSun />;
      case "moon":
        return <FaMoon />;
      default:
        return <FaSun />;
    }
  };

  return (
    <div className="meal-page">

      {/* HEADER */}
      <div className="meal-top">
        <div>
          <h1>แผนการกินของฉัน</h1>
          <p>วางแผนมื้ออาหารล่วงหน้า เพื่อสุขภาพที่ดีในทุกวัน </p>
        </div>

        <button className="create-btn">
          <FaPlus />
          สร้างแผนใหม่
        </button>
      </div>

      {/* DAYS */}
      <div className="days-row">
        <div className="day active">
          <h4>จันทร์</h4>
          <span>5 พ.ค.</span>
        </div>

        <div className="day">
          <h4>อังคาร</h4>
          <span>6 พ.ค.</span>
        </div>

        <div className="day">
          <h4>พุธ</h4>
          <span>7 พ.ค.</span>
        </div>

        <div className="day">
          <h4>พฤหัสบดี</h4>
          <span>8 พ.ค.</span>
        </div>
      </div>

      <div className="meal-layout">

        {/* LEFT */}
        <div className="meal-list">

          {mealPlan.map((meal, index) => (
            <div className="meal-card" key={index}>

              <div className="meal-icon">
                {renderIcon(meal.icon)}
              </div>

              <div className="meal-time">
                <h3>{meal.type}</h3>
                <span>{meal.time}</span>
              </div>

              <img
                src={meal.image}
                alt={meal.name}
                className="meal-image"
              />

              <div className="meal-info">
                <h2>{meal.name}</h2>

                <div className="meal-tag">
                  {meal.tag}
                </div>
              </div>

              <div className="meal-cal">
                {meal.calories} kcal
              </div>

              <button className="change-btn">
                เปลี่ยนเมนู
              </button>

              <FaEllipsisV className="dot-icon" />
            </div>
          ))}

          <button className="add-meal-btn">
            + เพิ่มมื้ออาหาร / ของว่าง
          </button>

        </div>

        {/* RIGHT */}
        <div className="summary-card">

          <h2>สรุปวันนี้</h2>

          <div className="circle-box">
            <div className="circle">
              <h1>{totalCalories}</h1>
              <span>kcal</span>
            </div>
          </div>

          <div className="summary-list">

            <div className="summary-item">
              <span>คาร์โบไฮเดรต</span>
              <strong>45%</strong>
            </div>

            <div className="summary-item">
              <span>โปรตีน</span>
              <strong>30%</strong>
            </div>

            <div className="summary-item">
              <span>ไขมัน</span>
              <strong>20%</strong>
            </div>

          </div>

          <div className="goal-box">

            <div className="goal-top">
              <span>เป้าหมายรายวัน</span>
              <strong>1450 / 1600 kcal</strong>
            </div>

            <div className="goal-bar">
              <div className="goal-fill"></div>
            </div>

          </div>

          <button className="report-btn">
            ดูรายงานโภชนาการ
          </button>

        </div>

      </div>
    </div>
  );
}

export default MealPlan;