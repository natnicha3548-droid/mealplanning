import React from 'react';
import { FaSun, FaCloudSun, FaMoon } from "react-icons/fa";
import { RotateCcw } from 'lucide-react';
import './MealPlanCard.css';

const MealPlanCard = ({ title, subtitle, planData, showRestoreBtn, onRestore }) => {
    const getMeals = (data) => Array.isArray(data) ? data : (data ? [data] : []);

    return (
        <div className="home-meal-plan-card">
            <div className="home-meal-card-header">
                <div>
                    <h2 className="home-meal-card-title">{title}</h2>
                    <p className="home-meal-card-subtitle">{subtitle}</p>
                </div>
                <div className="home-meal-card-kcal">
                    <span className="home-total-label">รวมทั้งหมด</span>
                    <div className="home-total-cal-badge">{Math.round(planData.total_calories)} kcal</div>
                    {showRestoreBtn && (
                        <button className="home-restore-plan-btn" onClick={onRestore} title="นำแผนเดิมกลับมาใช้ใหม่">
                            <RotateCcw size={20} />
                        </button>
                    )}
                </div>
            </div>

            {['breakfast', 'lunch', 'dinner'].map((type) => {
                const meals = getMeals(planData[type]);
                if (meals.length === 0) return null;
                const icons = { breakfast: <FaSun size={26} color="#FF9F43" />, lunch: <FaCloudSun size={26} color="#fb4949" />, dinner: <FaMoon size={24} color="#9074ff" /> };
                const labels = { breakfast: "มื้อเช้า", lunch: "มื้อกลางวัน", dinner: "มื้อเย็น" };

                return (
                    <div className="home-meal-group" key={type}>
                        <div className="home-meal-icon-box">
                            {/* ย้ายคลาสธีมสี มาไว้ที่ตัววงกลมโดยตรง */}
                            <div className={`home-icon-circle ${type === 'breakfast' ? 'home-breakfast-theme' : type === 'lunch' ? 'home-lunch-theme' : 'home-dinner-theme'}`}>
                                {icons[type]}
                            </div>
                            <span>{labels[type]}</span>
                        </div>
                        
                        <div className="home-meal-items-container">
                            {meals.map((item, idx) => (
                                <div className="home-meal-food-row" key={idx}>
                                    <img src={item.image || item.breakfast_image || item.lunch_image || item.dinner_image} alt={item.name} className="home-meal-img" />
                                    <div className="home-meal-details">
                                        <h3>{item.name}</h3>
                                        <span className="home-portion-badge">{item.serving_size}</span>
                                    </div>
                                    <div className="home-meal-stats">
                                        <div className="home-cal-text">{Math.round(item.calories)} kcal</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const FavoritePlanCard = ({ planData }) => {
    const getMeals = (data) => Array.isArray(data) ? data : (data ? [data] : []);

    const themeStyles = {
        breakfast: { bg: "#fff4ea", color: "#ff9800" },
        lunch: { bg: "#ffebee", color: "#f44336" },
        dinner: { bg: "#f3e5f5", color: "#9c27b0" }
    };

    return (
        <div className="home-meal-plan-card">
            <div className="home-meal-card-header">
                <div>
                    <h2 className="home-meal-card-title">แผนอาหารรายการโปรด</h2>
                    <p className="home-meal-card-subtitle">แผนที่คุณกดใจเก็บไว้</p>
                </div>
                <div className="home-meal-card-kcal">
                    <span className="home-total-label">รวมทั้งหมด</span>
                    <div className="home-total-cal-badge">{Math.round(planData.total_calories)} kcal</div>
                </div>
            </div>

            {['breakfast', 'lunch', 'dinner'].map((type) => {
                const meals = getMeals(planData[type]);
                if (meals.length === 0) return null;
                
                const icons = { 
                    breakfast: <FaSun size={26} color={themeStyles.breakfast.color} />, 
                    lunch: <FaCloudSun size={26} color={themeStyles.lunch.color} />, 
                    dinner: <FaMoon size={24} color={themeStyles.dinner.color} /> 
                };
                const labels = { breakfast: "มื้อเช้า", lunch: "มื้อกลางวัน", dinner: "มื้อเย็น" };

                return (
                    <div className="home-meal-group" key={type}>
                        <div className="home-meal-icon-box">
                            <div className="home-icon-circle" style={{ backgroundColor: themeStyles[type].bg }}>
                                {icons[type]}
                            </div>
                            <span style={{ color: themeStyles[type].color, fontWeight: "600", fontSize: "0.95rem" }}>
                                {labels[type]}
                            </span>
                        </div>
                        
                        <div className="home-meal-items-container">
                            {meals.map((item, idx) => (
                                <div className="home-meal-food-row" key={idx}>
                                    <img src={item.image || item.breakfast_image || item.lunch_image || item.dinner_image} alt={item.name} className="home-meal-img" />
                                    <div className="home-meal-details">
                                        <h3>{item.name || item.breakfast_name || item.lunch_name || item.dinner_name}</h3>
                                        <span className="home-portion-badge">{item.serving_size || "1 ส่วน"}</span>
                                    </div>
                                    <div className="home-meal-stats">
                                        <div className="home-cal-text">{Math.round(item.calories || item.breakfast_cal || item.lunch_cal || item.dinner_cal)} kcal</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MealPlanCard;