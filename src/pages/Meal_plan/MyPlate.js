import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaSun, FaCloudSun, FaMoon } from "react-icons/fa";
import "./MyPlate.css";

function MyPlate() {
  const [meals, setMeals] = useState([]);
  const [goalData, setGoalData] = useState({
    tdee: 2000,
    carb: 0,
    protein: 0,
    fat: 0,
    sugar: 0, // เพิ่มการเก็บเป้าหมายน้ำตาล
    sodium: 2000, 
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : { user_id: 1 };
        const today = new Date().toISOString().split("T")[0];

        // 1. ดึงเป้าหมายสารอาหาร
        const goalRes = await fetch(`http://localhost:5000/api/get-calculation/${user.user_id}`);
        const goalJson = await goalRes.json();
        if (goalJson) {
          setGoalData({
            tdee: Number(goalJson.tdee) || 2000,
            carb: Number(goalJson.carb) || 0,
            protein: Number(goalJson.protein) || 0,
            fat: Number(goalJson.fat) || 0,
            sugar: Number(goalJson.sugar) || 25, // หากใน DB ไม่มีน้ำตาล ให้ใช้ค่าแนะนำ 25g (6 ช้อนชา)
            sodium: Number(goalJson.sodium) || 2000, 
          });
        }

        // 2. ดึงรายการอาหารของวันนี้
        const mealsRes = await fetch(`http://localhost:5000/api/meals?date=${today}&userId=${user.user_id}`);
        const mealsJson = await mealsRes.json();
        
        const formattedMeals = mealsJson.map((m, index) => ({
          id: m.meal_detail_id || index,
          type: m.type,
          time: m.time,
          name: m.name,
          tag: m.tag,
          icon: m.icon,
          image: m.image,
          calPerUnit: Number(m.calories) / (Number(m.quantity) || 1),
          qty: Number(m.quantity) || 1,
          macros: { 
            carbs: Number(m.carbs) / (Number(m.quantity) || 1), 
            protein: Number(m.protein) / (Number(m.quantity) || 1), 
            fat: Number(m.fat) / (Number(m.quantity) || 1), 
            sugar: Number(m.sugar) / (Number(m.quantity) || 1), // ดึงน้ำตาล
            sodium: Number(m.sodium) / (Number(m.quantity) || 1) 
          },
        }));

        setMeals(formattedMeals);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTotals = () => {
    let totalCal = 0, totalCarbs = 0, totalProtein = 0, totalFat = 0, totalSugar = 0, totalSodium = 0;
    meals.forEach((meal) => {
      totalCal += meal.calPerUnit * meal.qty;
      totalCarbs += meal.macros.carbs * meal.qty;
      totalProtein += meal.macros.protein * meal.qty;
      totalFat += meal.macros.fat * meal.qty;
      totalSugar += meal.macros.sugar * meal.qty; // คำนวณน้ำตาลรวม
      totalSodium += meal.macros.sodium * meal.qty;
    });
    return { totalCal, totalCarbs, totalProtein, totalFat, totalSugar, totalSodium };
  };

  const totals = calculateTotals();
  const remainingCal = goalData.tdee - totals.totalCal;

  const updateQty = (id, amount) => {
    setMeals(
      meals.map((meal) =>
        meal.id === id ? { ...meal, qty: Math.max(1, meal.qty + amount) } : meal
      )
    );
  };

  const removeMeal = (id) => {
    if(window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
        setMeals(meals.filter((meal) => meal.id !== id));
        // เพิ่ม: fetch DELETE API ที่นี่เพื่อลบในฐานข้อมูลจริง
    }
  };

  const renderIcon = (icon) => {
    switch (icon) {
      case "sun": return <FaSun />;
      case "cloud": return <FaCloudSun />;
      case "moon": return <FaMoon />;
      default: return <FaSun />;
    }
  };

  if (isLoading) return <div className="loading">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="my-plate-container">
      <header className="header-section">
        <div className="logo-title">
          <h1>จานอาหารของฉัน</h1>
          <p>วางแผนมื้ออาหารล่วงหน้า เพื่อสุขภาพที่ดีในทุกวัน</p>
        </div>
        <div className="cal-info">
          <h2>เป้าหมาย {goalData.tdee.toLocaleString()} kcal</h2>
          <p>ใช้ไป {totals.totalCal.toLocaleString(undefined, {maximumFractionDigits: 0})} kcal | เหลือ {Math.max(0, remainingCal).toLocaleString(undefined, {maximumFractionDigits: 0})} kcal</p>
        </div>
      </header>

      <div className="meals-list">
        {meals.length === 0 ? (
          <div className="no-data">
            <p>ยังไม่มีรายการอาหารสำหรับวันนี้</p>
            <Link to="/SearchFood" className="add-first-btn">เริ่มเพิ่มอาหาร</Link>
          </div>
        ) : (
          meals.map((meal) => (
            <div key={meal.id} className="meal-card-beautiful">
              <div className="mc-icon-box">{renderIcon(meal.icon)}</div>
              <div className="mc-time-info">
                <h3>{meal.type}</h3>
                <span>{meal.time}</span>
              </div>
              <img src={meal.image} alt={meal.name} className="mc-image" />
              <div className="mc-main-info">
                <h2>{meal.name}</h2>
                <span className="mc-tag">{meal.tag}</span>
              </div>
              <div className="mc-calories">
                {(meal.calPerUnit * meal.qty).toFixed(0)} kcal
              </div>
              <div className="mc-actions">
                <div className="mc-qty-box">
                  <button className="qty-btn" onClick={() => updateQty(meal.id, -1)}><FaMinus /></button>
                  <span className="qty-num">{meal.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(meal.id, 1)}><FaPlus /></button>
                </div>
                <button className="delete-btn" onClick={() => removeMeal(meal.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
        
        <button className="add-meal-btn-wide">+ เพิ่มมื้ออาหาร / ของว่าง</button>
      </div>

      <div className="bottom-section">
        <div className="nutrition-summary">
          <NutritionBar label="คาร์โบไฮเดรต" current={totals.totalCarbs} limit={goalData.carb} unit="กรัม" />
          <NutritionBar label="โปรตีน" current={totals.totalProtein} limit={goalData.protein} unit="กรัม" />
          <NutritionBar label="ไขมัน" current={totals.totalFat} limit={goalData.fat} unit="กรัม" />
          <NutritionBar label="น้ำตาล" current={totals.totalSugar} limit={goalData.sugar} unit="กรัม" />
          <NutritionBar label="โซเดียม" current={totals.totalSodium} limit={goalData.sodium} unit="มิลลิกรัม" />
        </div>

        <div className="action-buttons">
          <button className="btn-back" onClick={() => window.history.back()}>ย้อนกลับ</button>
          <button className="btn-next">บันทึกแผนอาหาร</button>
        </div>
      </div>
    </div>
  );
}

function NutritionBar({ label, current, limit, unit }) {
  const isExceeded = current > limit && limit > 0;
  const exceedAmount = current - limit;
  // คำนวณ % เพื่อทำขีดสี (ถ้าต้องการทำ Progress Bar)
  const percent = Math.min((current / limit) * 100, 100);

  return (
    <div className="nutrition-item">
      <div className="nutrition-label">{label}</div>
      <div className={`nutrition-bar ${isExceeded ? "exceeded" : ""}`}>
        {current.toFixed(1)} / {limit > 0 ? limit.toFixed(0) : "--"} {unit}
      </div>
      {isExceeded && <div className="exceed-text">เกินไป {exceedAmount.toFixed(1)} {unit}</div>}
    </div>
  );
}

export default MyPlate;