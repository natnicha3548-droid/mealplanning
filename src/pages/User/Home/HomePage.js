import React, { useState, useEffect } from "react";
import "./HomePage.css";
import { Link } from "react-router-dom";

import {
    FaFire,
    FaBreadSlice,
    FaDrumstickBite,
    FaTint,
    FaCandyCane,
    FaMortarPestle,
    FaHeart,
    FaStar,
    FaSun,
    FaCloudSun,
    FaMoon,
} from "react-icons/fa";

import slide1 from "../../../assets/sl1.png";
import slide2 from "../../../assets/sl2.png";

function HomePage({ calcResult, formData }) {

    // ================= SLIDE =================
    const slides = [slide1, slide2];
    const [currentSlide, setCurrentSlide] = useState(0);

    // ================= LOCAL STORAGE =================
    const [savedResult, setSavedResult] = useState(null);

    // ================= LATEST PLAN =================
    const [latestPlan, setLatestPlan] = useState(null);

    // ================= FAVORITE FOODS =================
    const [favoriteFoods, setFavoriteFoods] = useState([]);

    // ================= USE EFFECT =================
    useEffect(() => {
        // AUTO SLIDE
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 3000);

        // LOAD CALC RESULT
        const localCalc = JSON.parse(localStorage.getItem("calcResult"));
        if (localCalc) {
            setSavedResult(localCalc);
        }

        // FETCH DATA
        fetchLatestPlan();
        fetchFavoriteFoods();

        return () => clearInterval(interval);
    }, []);

    // ================= FETCH LATEST PLAN =================
    const fetchLatestPlan = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) return;

            const response = await fetch(
                `http://localhost:5000/api/latest-meal-plan/${user.user_id}`
            );
            const data = await response.json();
            setLatestPlan(data);
        } catch (error) {
            console.log(error);
        }
    };

    // ================= FETCH FAVORITE FOODS =================
    const fetchFavoriteFoods = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) return;

            const response = await fetch(
                `http://localhost:5000/api/favorite-foods/${user.user_id}`
            );
            const data = await response.json();
            setFavoriteFoods(data);
        } catch (error) {
            console.log(error);
        }
    };

    // ================= REMOVE FAVORITE =================
    const handleRemoveFavorite = async (favoriteId) => {
        try {
            await fetch(
                `http://localhost:5000/api/favorites/food/${favoriteId}`,
                { method: "DELETE" }
            );
            setFavoriteFoods(prev => prev.filter(food => food.favorite_id !== favoriteId));
        } catch (error) {
            console.log(error);
        }
    };

    // ================= RESULT =================
    const result = calcResult || savedResult;

    // ================= DATA PREPARATION FOR MEALS (ส่วนที่หายไป) =================
    let breakfastData = [];
    let lunchData = [];
    let dinnerData = [];

    if (latestPlan) {
        // เช็คว่า backend ส่งมาเป็น Array ไหม ถ้าไม่ ให้แปลงใส่ Array ชั่วคราวให้ระบบทำงานได้
        breakfastData = Array.isArray(latestPlan.breakfast) 
            ? latestPlan.breakfast 
            : (latestPlan.breakfast_name ? [{ name: latestPlan.breakfast_name, image: latestPlan.breakfast_image, calories: latestPlan.breakfast_cal }] : []);
            
        lunchData = Array.isArray(latestPlan.lunch) 
            ? latestPlan.lunch 
            : (latestPlan.lunch_name ? [{ name: latestPlan.lunch_name, image: latestPlan.lunch_image, calories: latestPlan.lunch_cal }] : []);
            
        dinnerData = Array.isArray(latestPlan.dinner) 
            ? latestPlan.dinner 
            : (latestPlan.dinner_name ? [{ name: latestPlan.dinner_name, image: latestPlan.dinner_image, calories: latestPlan.dinner_cal }] : []);
    }

    return (
        <div>
            {/* ================= SLIDE ================= */}
            <div className="slideshow">
                <img src={slides[currentSlide]} alt="slide" className="slide-img" />
            </div>

            {/* ================= MAIN CONTAINER ================= */}
            <div className="main-container">
                {/* ================= QUICK ACTIONS ================= */}
                <div className="quick-actions">
                    <Link
                        to="/calculate"
                        state={{ formData: formData || JSON.parse(localStorage.getItem("formData")) }}
                        className="quick-card"
                    >
                        <div className="quick-icon"><FaFire /></div>
                        <div className="quick-card-content">
                            <h3>คำนวณพลังงาน</h3>
                            <p>คลิกเพื่อคำนวณแคลอรี่ที่คุณต้องการ</p>
                        </div>
                    </Link>

                    <Link to="/menu" className="quick-card">
                        <div className="quick-icon"><FaBreadSlice /></div>
                        <div className="quick-card-content">
                            <h3>ดูเพิ่มเติม</h3>
                            <p>คลิกเพื่อดูเมนูอาหารทั้งหมด</p>
                        </div>
                    </Link>
                </div>

                {/* ================= NUTRITION CARD ================= */}
                {result && (
                    <div className="nutrition-card">
                        <h2>พลังงานที่ควรได้รับต่อวัน</h2>
                        <div className="tdee">
                            <FaFire />
                            <span>{Math.round(result.tdee)}</span>
                            <small>kcal</small>
                        </div>
                        <div className="macro-box">
                            <div className="macro carb">
                                <FaBreadSlice /><p>คาร์บ</p><strong>{Math.round(result.carb)} g</strong>
                            </div>
                            <div className="macro protein">
                                <FaDrumstickBite /><p>โปรตีน</p><strong>{Math.round(result.protein)} g</strong>
                            </div>
                            <div className="macro fat">
                                <FaTint /><p>ไขมัน</p><strong>{Math.round(result.fat)} g</strong>
                            </div>
                            <div className="macro sugar">
                                <FaCandyCane /><p>น้ำตาล</p><strong>{Math.round(result.sugar || 25)} g</strong>
                            </div>
                            <div className="macro sodium">
                                <FaMortarPestle /><p>โซเดียม</p><strong>{Math.round(result.sodium || 2000)} mg</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= LATEST MEAL PLAN ================= */}
                {latestPlan && (
                    <div className="home-meal-plan-card">
                        <div className="home-meal-card-header">
                            <h2>เมนูอาหารล่าสุดของฉัน</h2>

                            <div className="home-meal-card-kcal">
                                <span className="home-total-label">รวมทั้งหมด</span>
                                <div className="home-total-cal-badge">
                                    {Math.round(latestPlan.total_calories)} kcal
                                </div>
                            </div>
                        </div>

                        {/* BREAKFAST GROUP */}
                        {breakfastData.length > 0 && (
                            <>
                                <div className="home-meal-group">
                                    <div className="home-meal-icon-box home-breakfast-theme">
                                        <div className="home-icon-circle"><FaSun size={26} style={{ color: "#FF9F43" }} /></div>
                                        <span>มื้อเช้า</span>
                                    </div>
                                    <div className="home-meal-items-container">
                                        {breakfastData.map((item, index) => (
                                            <div className="home-meal-food-row" key={index}>
                                                <img src={item.image || item.breakfast_image} alt={item.name} className="home-meal-img" />
                                                <div className="home-meal-details">
                                                    <h3>{item.name || item.breakfast_name}</h3>
                                                    <span className="home-portion-badge">{item.serving_size}</span>
                                                </div>
                                                <div className="home-meal-stats">
                                                    <div className="home-cal-text">{Math.round(item.calories || item.breakfast_cal)} kcal</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* LUNCH GROUP */}
                        {lunchData.length > 0 && (
                            <>
                                <div className="home-meal-group">
                                    <div className="home-meal-icon-box home-lunch-theme">
                                        <div className="home-icon-circle"><FaCloudSun size={26} style={{ color: "#fb4949" }} /></div>
                                        <span>มื้อกลางวัน</span>
                                    </div>
                                    <div className="home-meal-items-container">
                                        {lunchData.map((item, index) => (
                                            <div className="home-meal-food-row" key={index}>
                                                <img src={item.image || item.lunch_image} alt={item.name} className="home-meal-img" />
                                                <div className="home-meal-details">
                                                    <h3>{item.name || item.lunch_name}</h3>
                                                    <span className="home-portion-badge">{item.serving_size}</span>
                                                </div>
                                                <div className="home-meal-stats">
                                                    <div className="home-cal-text">{Math.round(item.calories || item.lunch_cal)} kcal</div>
                                                    
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* DINNER GROUP */}
                        {dinnerData.length > 0 && (
                            <>
                                <div className="home-meal-group">
                                    <div className="home-meal-icon-box home-dinner-theme">
                                        <div className="home-icon-circle"><FaMoon size={24} style={{ color: "#9074ff" }} /></div>
                                        <span>มื้อเย็น</span>
                                    </div>
                                    <div className="home-meal-items-container">
                                        {dinnerData.map((item, index) => (
                                            <div className="home-meal-food-row" key={index}>
                                                <img src={item.image || item.dinner_image} alt={item.name} className="home-meal-img" />
                                                <div className="home-meal-details">
                                                    <h3>{item.name || item.dinner_name}</h3>
                                                    <span className="home-portion-badge">{item.serving_size}</span>
                                                </div>
                                                <div className="home-meal-stats">
                                                    <div className="home-cal-text">{Math.round(item.calories || item.dinner_cal)} kcal</div>
                                                    
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                )}
                
                {/* ================= FAVORITE FOODS ================= */}
                {favoriteFoods.length > 0 && (
                    <div className="home-favorite-section">
                        <div className="home-favorite-header">
                            <div>
                                <h2 className="home-favorite-title">รายการโปรดจ้า</h2>
                                <p className="home-favorite-subtitle">เมนูที่คุณบันทึกไว้</p>
                            </div>
                        </div>
                        <div className="home-favorite-grid">
                            {favoriteFoods.map((food) => (
                                <div key={food.favorite_id} className="home-favorite-card">
                                    <div className="home-favorite-image-wrapper">
                                        <img src={food.image} alt={food.food_name} className="home-favorite-image" />
                                        <button className="home-favorite-heart" onClick={() => handleRemoveFavorite(food.favorite_id)}>
                                            <FaHeart />
                                        </button>
                                    </div>
                                    <div className="home-favorite-content">
                                        <h3>{food.food_name}</h3>
                                        <p>{Math.round(food.calories)} kcal</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ================= PAST MEAL PLAN ================= */}
                <div className="past-meal-plans">
                    <h2>แผนการกินย้อนหลัง..</h2>
                </div>
            </div>
        </div>
    );
}

export default HomePage;