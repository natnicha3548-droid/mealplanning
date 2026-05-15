import React, { useState } from "react";
import { FaTrash, FaPlus, FaMinus, FaPlusCircle } from "react-icons/fa";
import "./MyPlate.css";

function MyPlate() {
  // กำหนดเป้าหมายรายวัน
  const dailyGoalCal = 3280;
  const macroLimits = {
    carbs: 850, // กรัม
    protein: 250, // กรัม
    fat: 100, // กรัม
    sodium: 2000, // มิลลิกรัม (สมมติให้แสดงผลเป็นกรัมตามภาพ)
  };

  // State เก็บข้อมูลอาหาร
  const [meals, setMeals] = useState([
    {
      id: 1,
      type: "มื้อเช้า",
      name: "โจ๊กหมู",
      calPerUnit: 300,
      qty: 1,
      macros: { carbs: 300, protein: 50, fat: 20, sodium: 30 },
    },
    {
      id: 2,
      type: "มื้อกลางวัน",
      name: "กะเพราหมูกรอบไข่ดาว",
      calPerUnit: 580,
      qty: 1,
      macros: { carbs: 350, protein: 75, fat: 40, sodium: 70 },
    },
    {
      id: 3,
      type: "มื้อเย็น",
      name: "ข้าวผัดกุ้ง",
      calPerUnit: 400,
      qty: 1,
      macros: { carbs: 300, protein: 75, fat: 20, sodium: 50 },
    },
  ]);

  // ฟังก์ชันคำนวณผลรวม
  const calculateTotals = () => {
    let totalCal = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalSodium = 0;

    meals.forEach((meal) => {
      totalCal += meal.calPerUnit * meal.qty;
      totalCarbs += meal.macros.carbs * meal.qty;
      totalProtein += meal.macros.protein * meal.qty;
      totalFat += meal.macros.fat * meal.qty;
      totalSodium += meal.macros.sodium * meal.qty;
    });

    return { totalCal, totalCarbs, totalProtein, totalFat, totalSodium };
  };

  const totals = calculateTotals();
  const remainingCal = dailyGoalCal - totals.totalCal;

  // ฟังก์ชันจัดการข้อมูล
  const updateQty = (id, amount) => {
    setMeals(
      meals.map((meal) =>
        meal.id === id ? { ...meal, qty: Math.max(1, meal.qty + amount) } : meal
      )
    );
  };

  const removeMeal = (id) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  // หมวดหมู่อาหาร
  const mealTypes = ["มื้อเช้า", "มื้อกลางวัน", "มื้อเย็น"];

  return (
    <div className="my-plate-container">
      {/* ส่วนหัว */}
      <header className="header-section">
        <div className="logo-title">
          <div className="logo-icon">🍽️</div>
          <h1>จานอาหารของฉัน</h1>
        </div>
        <div className="cal-info">
          <h2>พลังงานที่ควรได้รับต่อวัน {dailyGoalCal.toLocaleString()} กิโลแคลอรี่</h2>
          <p>
            พลังงานที่ใช้ {totals.totalCal.toLocaleString()} กิโลแคลอรี่ | ต้องการพลังงานอีก {Math.max(0, remainingCal).toLocaleString()} กิโลแคลอรี่
          </p>
        </div>
      </header>

      {/* รายการอาหาร */}
      <div className="meals-list">
        {mealTypes.map((type) => (
          <div key={type} className="meal-section">
            <h3 className="meal-title">
              {type} <FaPlusCircle className="add-icon" />
            </h3>
            {meals
              .filter((meal) => meal.type === type)
              .map((meal) => (
                <div key={meal.id} className="meal-item">
                  <div className="meal-name">{meal.name}</div>
                  <div className="meal-controls">
                    <span className="meal-cal">
                      {meal.calPerUnit * meal.qty} kcal
                    </span>
                    <div className="actions">
                      <FaTrash
                        className="delete-icon"
                        onClick={() => removeMeal(meal.id)}
                      />
                      <div className="qty-controls">
                        <FaMinus
                          className="qty-btn"
                          onClick={() => updateQty(meal.id, -1)}
                        />
                        <span className="qty-number">{meal.qty}</span>
                        <FaPlus
                          className="qty-btn"
                          onClick={() => updateQty(meal.id, 1)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* สรุปสารอาหารและปุ่ม */}
      <div className="bottom-section">
        <div className="nutrition-summary">
          {/* คาร์โบไฮเดรต */}
          <NutritionBar
            label="คาร์โบไฮเดรต"
            current={totals.totalCarbs}
            limit={macroLimits.carbs}
          />
          {/* โปรตีน */}
          <NutritionBar
            label="โปรตีน"
            current={totals.totalProtein}
            limit={macroLimits.protein}
          />
          {/* ไขมัน */}
          <NutritionBar
            label="ไขมัน"
            current={totals.totalFat}
            limit={macroLimits.fat}
          />
          {/* โซเดียม */}
          <NutritionBar
            label="โซเดียม"
            current={totals.totalSodium}
            limit={macroLimits.sodium}
          />
        </div>

        <div className="action-buttons">
          <button className="btn-back">ย้อนกลับ</button>
          <button className="btn-next">ถัดไป</button>
        </div>
      </div>
    </div>
  );
}

// Component ย่อยสำหรับแท่งสารอาหาร
function NutritionBar({ label, current, limit }) {
  const isExceeded = current > limit;
  const exceedAmount = current - limit;

  return (
    <div className="nutrition-item">
      <div className="nutrition-label">{label}</div>
      <div className={`nutrition-bar ${isExceeded ? "exceeded" : ""}`}>
        {current} กรัม
      </div>
      {isExceeded && (
        <div className="exceed-text">เกิน {exceedAmount} กรัม</div>
      )}
    </div>
  );
}

export default MyPlate;