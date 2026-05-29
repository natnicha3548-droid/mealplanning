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
    FaHeart
} from "react-icons/fa";

import slide1 from "../../assets/sl1.png";
import slide2 from "../../assets/sl2.png";

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

            setCurrentSlide(prev =>
                (prev + 1) % slides.length
            );

        }, 3000);

        // LOAD CALC RESULT

        const localCalc = JSON.parse(
            localStorage.getItem("calcResult")
        );

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

            const user = JSON.parse(
                localStorage.getItem("user")
            );

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

            const user = JSON.parse(
                localStorage.getItem("user")
            );

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
                {
                    method: "DELETE"
                }
            );

            // UPDATE UI

            setFavoriteFoods(prev =>
                prev.filter(
                    food => food.favorite_id !== favoriteId
                )
            );

        } catch (error) {

            console.log(error);

        }

    };

    // ================= RESULT =================

    const result = calcResult || savedResult;

    return (

        <div>

            {/* ================= SLIDE ================= */}

            <div className="slideshow">

                <img
                    src={slides[currentSlide]}
                    alt="slide"
                    className="slide-img"
                />

            </div>

            {/* ================= MAIN CONTAINER ================= */}

            <div className="main-container">

                {/* ================= QUICK ACTIONS ================= */}

                <div className="quick-actions">

                    <Link
                        to="/calculate"
                        state={{
                            formData:
                                formData ||
                                JSON.parse(
                                    localStorage.getItem("formData")
                                )
                        }}
                        className="quick-card"
                    >

                        <div className="quick-icon">
                            <FaFire />
                        </div>

                        <div className="quick-card-content">

                            <h3>
                                คำนวณพลังงาน
                            </h3>

                            <p>
                                คลิกเพื่อคำนวณแคลอรี่ที่คุณต้องการ
                            </p>

                        </div>

                    </Link>

                    <Link
                        to="/menu"
                        className="quick-card"
                    >

                        <div className="quick-icon">
                            <FaBreadSlice />
                        </div>

                        <div className="quick-card-content">

                            <h3>
                                ดูเพิ่มเติม
                            </h3>

                            <p>
                                คลิกเพื่อดูเมนูอาหารทั้งหมด
                            </p>

                        </div>

                    </Link>

                </div>

                {/* ================= NUTRITION CARD ================= */}

                {result && (

                    <div className="nutrition-card">

                        <h2>
                            พลังงานที่ควรได้รับต่อวัน
                        </h2>

                        <div className="tdee">

                            <FaFire />

                            <span>
                                {Math.round(result.tdee)}
                            </span>

                            <small>
                                kcal
                            </small>

                        </div>

                        <div className="macro-box">

                            <div className="macro carb">

                                <FaBreadSlice />

                                <p>คาร์บ</p>

                                <strong>
                                    {Math.round(result.carb)} g
                                </strong>

                            </div>

                            <div className="macro protein">

                                <FaDrumstickBite />

                                <p>โปรตีน</p>

                                <strong>
                                    {Math.round(result.protein)} g
                                </strong>

                            </div>

                            <div className="macro fat">

                                <FaTint />

                                <p>ไขมัน</p>

                                <strong>
                                    {Math.round(result.fat)} g
                                </strong>

                            </div>

                            <div className="macro sugar">

                                <FaCandyCane />

                                <p>น้ำตาล</p>

                                <strong>
                                    {Math.round(result.sugar || 25)} g
                                </strong>

                            </div>

                            <div className="macro sodium">

                                <FaMortarPestle />

                                <p>โซเดียม</p>

                                <strong>
                                    {Math.round(result.sodium || 2000)} mg
                                </strong>

                            </div>

                        </div>

                    </div>

                )}

                {/* ================= LATEST MEAL PLAN ================= */}

                {latestPlan && (

                    <div className="latest-meal-plan">

                        <h2>
                            แผนการกินล่าสุด
                        </h2>

                        <div className="meal-plan-full-card">

                            <div className="plan-header">

                                <div>

                                    <h2>
                                        แผนล่าสุด
                                    </h2>

                                    <p>
                                        รวม {Math.round(latestPlan.total_calories)} kcal
                                    </p>

                                </div>


                            </div>

                            {/* BREAKFAST */}

                            <div className="meal-row">

                                <div className="meal-type">
                                    🌤️ มื้อเช้า
                                </div>

                                <img
                                    src={latestPlan.breakfast_image}
                                    alt=""
                                    className="meal-image"
                                />

                                <div className="meal-info">

                                    <h3>
                                        {latestPlan.breakfast_name}
                                    </h3>

                                    <span>
                                        {Math.round(latestPlan.breakfast_cal)} kcal
                                    </span>

                                </div>

                            </div>

                            {/* LUNCH */}

                            <div className="meal-row">

                                <div className="meal-type">
                                    ☀️ มื้อกลางวัน
                                </div>

                                <img
                                    src={latestPlan.lunch_image}
                                    alt=""
                                    className="meal-image"
                                />

                                <div className="meal-info">

                                    <h3>
                                        {latestPlan.lunch_name}
                                    </h3>

                                    <span>
                                        {Math.round(latestPlan.lunch_cal)} kcal
                                    </span>

                                </div>

                            </div>

                            {/* DINNER */}

                            <div className="meal-row">

                                <div className="meal-type">
                                    🌙 มื้อเย็น
                                </div>

                                <img
                                    src={latestPlan.dinner_image}
                                    alt=""
                                    className="meal-image"
                                />

                                <div className="meal-info">

                                    <h3>
                                        {latestPlan.dinner_name}
                                    </h3>

                                    <span>
                                        {Math.round(latestPlan.dinner_cal)} kcal
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

                {/* ================= FAVORITE FOODS ================= */}

                {favoriteFoods.length > 0 && (

                    <div className="home-favorite-section">

                        {/* HEADER */}

                        <div className="home-favorite-header">

                            <div>

                                <h2 className="home-favorite-title">
                                    รายการโปรด
                                </h2>

                                <p className="home-favorite-subtitle">
                                    เมนูที่คุณบันทึกไว้
                                </p>

                            </div>

                        </div>

                        {/* GRID */}

                        <div className="home-favorite-grid">

                            {favoriteFoods.map((food) => (

                                <div
                                    key={food.favorite_id}
                                    className="home-favorite-card"
                                >

                                    {/* IMAGE */}

                                    <div className="home-favorite-image-wrapper">

                                        <img
                                            src={food.image}
                                            alt={food.food_name}
                                            className="home-favorite-image"
                                        />

                                        {/* HEART */}

                                        <button
                                            className="home-favorite-heart"
                                            onClick={() =>
                                                handleRemoveFavorite(
                                                    food.favorite_id
                                                )
                                            }
                                        >

                                            <FaHeart />

                                        </button>

                                    </div>

                                    {/* CONTENT */}

                                    <div className="home-favorite-content">

                                        <h3>
                                            {food.food_name}
                                        </h3>

                                        <p>
                                            {Math.round(food.calories)} kcal
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}

                {/* ================= PAST MEAL PLAN ================= */}

                <div className="past-meal-plans">

                    <h2>
                        แผนการกินย้อนหลัง
                    </h2>

                </div>

            </div>

        </div>

    );

}

export default HomePage;