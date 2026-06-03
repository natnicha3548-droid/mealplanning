import React, { useEffect, useState } from "react";

import {
    FaHeart,
    FaUtensils,
    FaCalendarAlt,
    FaSun, 
    FaCloudSun,
    FaMoon,
    FaFire, 
    FaBreadSlice, 
    FaDrumstickBite, 
    FaTint,
    FaCandyCane,     
    FaMortarPestle
} from "react-icons/fa";

import "./FavFood.css";

function FavFood() {

    const [favFoods, setFavFoods] = useState([]);
    const [favPlans, setFavPlans] = useState([]);
    const [activeTab, setActiveTab] = useState("foods");

    useEffect(() => {

        fetchFavorites();

    }, []);

    // ================= FETCH FAVORITES =================

    const fetchFavorites = async () => {

        try {

            const user = JSON.parse(
                localStorage.getItem("user")
            );

            if (!user) return;

            const response = await fetch(
                `http://localhost:5000/api/favorites/${user.user_id}`
            );

            const data = await response.json();

            setFavFoods(data.foods || []);
            setFavPlans(data.plans || []);

        } catch (error) {

            console.log(error);

        }

    };

    // ================= REMOVE FAVORITE FOOD =================

    const removeFavoriteFood = async (favoriteId) => {

        try {

            await fetch(

                `http://localhost:5000/api/favorites/food/${favoriteId}`,

                {
                    method: "DELETE"
                }

            );

            setFavFoods(

                favFoods.filter(
                    (food) => food.favorite_id !== favoriteId
                )

            );

        } catch (error) {

            console.log(error);

        }

    };

    // ================= REMOVE FAVORITE PLAN =================

    const removeFavoritePlan = async (favoriteId) => {

        try {

            await fetch(

                `http://localhost:5000/api/favorites/plan/${favoriteId}`,

                {
                    method: "DELETE"
                }

            );

            setFavPlans(

                favPlans.filter(
                    (plan) => plan.favorite_id !== favoriteId
                )

            );

        } catch (error) {

            console.log(error);

        }

    };

    // ================= CATEGORY =================

    const savoryFoods = favFoods.filter(
        (food) =>
            food.category &&
            food.category.trim() === "ของคาว"
    );

    const dessertFoods = favFoods.filter(
        (food) =>
            food.category &&
            food.category.trim() === "ของหวาน"
    );

    const otherFoods = favFoods.filter(
        (food) =>
            !food.category ||
            (
                food.category.trim() !== "ของคาว" &&
                food.category.trim() !== "ของหวาน"
            )
    );

    // ================= FOOD CARD =================

    const renderFoodCards = (foods) => (

        <div className="favorite-food-grid">

            {foods.map((food) => (

                <div
                    key={food.favorite_id}
                    className="favorite-food-card"
                >

                    <div className="favorite-food-image-box">

                        <img
                            src={food.image}
                            alt={food.food_name}
                            className="favorite-food-image"
                        />

                        <button
                            className="favorite-heart-btn"
                            onClick={() =>
                                removeFavoriteFood(food.favorite_id)
                            }
                        >
                            <FaHeart />
                        </button>

                    </div>

                    <div className="favorite-food-info">

                        <h3>
                            {food.food_name}
                        </h3>

                        <p>
                            {parseInt(food.calories)} kcal
                        </p>

                    </div>

                </div>

            ))}

        </div>

    );

    return (

        <div className="favorite-page">

            {/* ================= HEADER ================= */}

            <div className="favorite-header">

                <div className="favorite-icon">
                    <FaHeart />
                </div>

                <div>

                    <h1>
                        รายการโปรดของฉัน
                    </h1>

                    <p>
                        รวมเมนูอาหารและแผนการกินที่คุณชื่นชอบ
                    </p>

                </div>

            </div>

            {/* ================= TAB ================= */}

            <div className="favorite-tabs">

                <button
                    className={
                        activeTab === "foods"
                            ? "tab-btn active"
                            : "tab-btn"
                    }
                    onClick={() => setActiveTab("foods")}
                >

                    <FaUtensils />
                    รายการโปรดอาหาร

                </button>

                <button
                    className={
                        activeTab === "plans"
                            ? "tab-btn active"
                            : "tab-btn"
                    }
                    onClick={() => setActiveTab("plans")}
                >

                    <FaCalendarAlt />
                    แผนการกิน

                </button>

            </div>

            {/* ================= FOOD ================= */}

            {activeTab === "foods" && (

                <>

                    {savoryFoods.length > 0 && (

                        <div className="food-category">

                            <div className="section-top">

                                <h2>
                                    ของคาว ({savoryFoods.length})
                                </h2>

                            </div>

                            {renderFoodCards(savoryFoods)}

                        </div>

                    )}

                    {dessertFoods.length > 0 && (

                        <div className="food-category">

                            <div className="section-top">

                                <h2>
                                    ของหวาน ({dessertFoods.length})
                                </h2>

                            </div>

                            {renderFoodCards(dessertFoods)}

                        </div>

                    )}

                    {otherFoods.length > 0 && (

                        <div className="food-category">

                            <div className="section-top">

                                <h2>
                                    อื่น ๆ ({otherFoods.length})
                                </h2>

                            </div>

                            {renderFoodCards(otherFoods)}

                        </div>

                    )}

                    {favFoods.length === 0 && (

                        <div className="empty-box">
                            ยังไม่มีรายการโปรดอาหารจ้า
                        </div>

                    )}

                </>

            )}

            {/* ================= PLAN ================= */}

            {activeTab === "plans" && (
            <>
                <div className="section-top">
                    <h2>
                        แผนการกินโปรด ({favPlans.length})
                    </h2>
                </div>

                {favPlans.length === 0 ? (
                    <div className="empty-box">ยังไม่มีรายการโปรดแผนอาหาร</div>
                ) : (
                    <div className="meal-plan-list">
                        {favPlans.map((plan, index) => ( // 🌟 เพิ่ม index ตรงนี้เพื่อให้รันตัวเลขได้
                            <div key={plan.favorite_id} className="meal-plan-full-card">
                                
                                {/* ================= HEADER ของแผน ================= */}
                                <div className="plan-header">
                                    <div className="plan-header-left">
                                        <h2>
                                            {plan.plan_name || `แผนการกินที่ ${index + 1}`}
                                        </h2>
                                        <p className="plan-subtitle">
                                            แผนอาหารที่คุณกดใจเก็บไว้
                                        </p>
                                    </div>
                                    <div className="plan-header-right">
                                        {/* ส่วนตัวเลขแคลอรี */}
                                        <div className="plan-cal-box">
                                            <span className="plan-cal-label">
                                                รวมทั้งหมด
                                            </span>
                                            <span className="plan-cal-value">
                                                {parseInt(plan.total_calories || 0)} kcal
                                            </span>
                                        </div>
                                        <button className="meal-fav-btn" onClick={() => removeFavoritePlan(plan.favorite_id)}>
                                            <FaHeart />
                                        </button>
                                    </div>
                                </div>

                                {/* ================= MEAL ROWS ================= */}
                                {['breakfast', 'lunch', 'dinner'].map((type) => {
                                    const name = plan[`${type}_name`];
                                    const image = plan[`${type}_image`];
                                    const cal = plan[`${type}_cal`];
                                    // ถ้าใน DB มี serving size ให้ใช้ ถ้าไม่มีให้เว้นว่างหรือใส่ค่าเริ่มต้น
                                    const serving = plan[`${type}_serving`]; 

                                    if (!name) return null;

                                    // กำหนดสีและไอคอนตามมื้ออาหารให้เหมือนภาพที่ 2
                                    const themeStyles = {
                                        breakfast: { bg: "#fff4ea", color: "#ff9800", icon: <FaSun size={24} /> },
                                        lunch: { bg: "#ffebee", color: "#f44336", icon: <FaCloudSun size={24} /> },
                                        dinner: { bg: "#f3e5f5", color: "#9c27b0", icon: <FaMoon size={22} /> }
                                    };

                                    const theme = themeStyles[type];
                                    const label = type === 'breakfast' ? 'มื้อเช้า' : type === 'lunch' ? 'มื้อกลางวัน' : 'มื้อเย็น';

                                    return (
                                        <div className="meal-row" key={type}>
                                            
                                            {/* 1. ไอคอนและชื่อมื้ออาหาร (จัดแนวตั้ง) */}
                                            <div className="meal-type-stacked">
                                                <div className="meal-icon-circle" style={{ backgroundColor: theme.bg, color: theme.color }}>
                                                    {theme.icon}
                                                </div>
                                                <span style={{ color: theme.color, fontWeight: "700", marginTop: "8px", fontSize: "0.95rem" }}>
                                                    {label}
                                                </span>
                                            </div>

                                            {/* 2. รูปอาหาร */}
                                            <img
                                                src={image || "https://via.placeholder.com/120"}
                                                alt={name}
                                                className="meal-image"
                                            />

                                            {/* 3. ชื่ออาหารและปริมาณ */}
                                            <div className="meal-info">
                                                <h3>{name}</h3>
                                                {serving && (
                                                    <span className="home-portion-badge">{serving}</span>
                                                )}
                                            </div>

                                            {/* 4. แคลอรี (จัดชิดขวา) */}
                                            <div className="meal-cal-right">
                                                {parseInt(cal || 0)} kcal
                                            </div>

                                        </div>
                                    );
                                })}
                                {/* ================= SUMMARY ================= */}
                                <div className="plan-summary">
                                    
                                    {/* กล่องแคลอรี */}
                                    <div className="summary-box">
                                        <div className="sum-icon-wrap cal-icon">
                                            <FaFire />
                                        </div>
                                        <div className="sum-info">
                                            <span className="sum-val">{parseInt(plan.total_calories || 0)}</span>
                                            <span className="sum-unit">kcal</span>
                                        </div>
                                    </div>

                                    {/* กล่องคาร์บ */}
                                    <div className="summary-box">
                                        <div className="sum-icon-wrap carb-icon">
                                            <FaBreadSlice />
                                        </div>
                                        <div className="sum-info">
                                            <span className="sum-label">คาร์บ</span>
                                            <span className="sum-val">{parseInt(plan.carbs || 0)}g</span>
                                        </div>
                                    </div>

                                    {/* กล่องโปรตีน */}
                                    <div className="summary-box">
                                        <div className="sum-icon-wrap pro-icon">
                                            <FaDrumstickBite />
                                        </div>
                                        <div className="sum-info">
                                            <span className="sum-label">โปรตีน</span>
                                            <span className="sum-val">{parseInt(plan.protein || 0)}g</span>
                                        </div>
                                    </div>

                                    {/* กล่องไขมัน */}
                                    <div className="summary-box">
                                        <div className="sum-icon-wrap fat-icon">
                                            <FaTint />
                                        </div>
                                        <div className="sum-info">
                                            <span className="sum-label">ไขมัน</span>
                                            <span className="sum-val">{parseInt(plan.fat || 0)}g</span>
                                        </div>
                                    </div>

                                    {/* กล่องน้ำตาล */}
                                    <div className="summary-box">
                                        <div className="sum-icon-wrap sugar-icon">
                                            <FaCandyCane />
                                        </div>
                                        <div className="sum-info">
                                            <span className="sum-label">น้ำตาล</span>
                                            <span className="sum-val">{parseInt(plan.sugar || 0)}g</span>
                                        </div>
                                    </div>

                                    {/* กล่องโซเดียม */}
                                    <div className="summary-box">
                                        <div className="sum-icon-wrap sodium-icon">
                                            <FaMortarPestle />
                                        </div>
                                        <div className="sum-info">
                                            <span className="sum-label">โซเดียม</span>
                                            {/* โซเดียมใช้หน่วยเป็น mg (มิลลิกรัม) นะครับ */}
                                            <span className="sum-val">{parseInt(plan.sodium || 0)}mg</span> 
                                        </div>
                                    </div>

                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </>
        )}

        </div>

    );

}

export default FavFood;