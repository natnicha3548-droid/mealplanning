import React, { useState, useEffect } from "react";
import "./HomePage.css";
import { Link } from "react-router-dom";

import {
    FaFire,
    FaBreadSlice,
    FaDrumstickBite,
    FaTint,
    FaCandyCane,
    FaMortarPestle
} from "react-icons/fa";

import slide1 from "../../assets/sl1.png";
import slide2 from "../../assets/sl2.png";

function HomePage({ calcResult, formData }) {

    // ================= SLIDE =================

    const slides = [slide1, slide2];
    const [currentSlide, setCurrentSlide] = useState(0);

    // ================= LOCAL STORAGE =================

    const [savedResult, setSavedResult] = useState(null);

    // ================= USE EFFECT =================

    useEffect(() => {

        // AUTO SLIDE

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 3000);

        // LOAD LOCAL STORAGE

        const localCalc = JSON.parse(
            localStorage.getItem("calcResult")
        );

        if (localCalc) {
            setSavedResult(localCalc);
        }

        return () => clearInterval(interval);

    }, []);

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

            {/* ================= QUICK BUTTON ================= */}

            <div className="quick-actions">

                {/* ================= CALCULATE ================= */}

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

                    <div>

                        <h3>
                            คำนวณพลังงาน
                        </h3>

                        <p>
                            คลิกเพื่อคำนวณแคลอรี่ที่คุณต้องการ
                        </p>

                    </div>

                </Link>

                {/* ================= MENU ================= */}

                <Link
                    to="/menu"
                    className="quick-card"
                >

                    <div className="quick-icon">
                        <FaBreadSlice />
                    </div>

                    <div>

                        <h3>
                            ดูเพิ่มเติม
                        </h3>

                        <p>
                            คลิกเพื่อดูเมนูอาหารทั้งหมด
                        </p>

                    </div>

                </Link>

            </div>

            {/* ================= RESULT ================= */}

            {result && (

                <div className="nutrition-card">

                    <h2>
                        พลังงานที่ควรได้รับต่อวัน
                    </h2>

                    {/* ================= TDEE ================= */}

                    <div className="tdee">

                        <FaFire />

                        <span>
                            {Math.round(result.tdee)}
                        </span>

                        <small>
                            kcal
                        </small>

                    </div>

                    {/* ================= MACRO ================= */}

                    <div className="macro-box">

                        {/* ================= CARB ================= */}

                        <div className="macro carb">

                            <FaBreadSlice />

                            <p>
                                คาร์บ
                            </p>

                            <strong>
                                {Math.round(result.carb)} g
                            </strong>

                        </div>

                        {/* ================= PROTEIN ================= */}

                        <div className="macro protein">

                            <FaDrumstickBite />

                            <p>
                                โปรตีน
                            </p>

                            <strong>
                                {Math.round(result.protein)} g
                            </strong>

                        </div>

                        {/* ================= FAT ================= */}

                        <div className="macro fat">

                            <FaTint />

                            <p>
                                ไขมัน
                            </p>

                            <strong>
                                {Math.round(result.fat)} g
                            </strong>

                        </div>

                        {/* ================= SUGAR ================= */}

                        <div className="macro sugar">

                            <FaCandyCane />

                            <p>
                                น้ำตาล
                            </p>

                            <strong>
                                {Math.round(
                                    result.sugar || 25
                                )} g
                            </strong>

                        </div>

                        {/* ================= SODIUM ================= */}

                        <div className="macro sodium">

                            <FaMortarPestle />

                            <p>
                                โซเดียม
                            </p>

                            <strong>
                                {Math.round(
                                    result.sodium || 2000
                                )} mg
                            </strong>

                        </div>

                    </div>

                </div>

            )}

            {/* ================= LATEST MEAL PLAN ================= */}

            <div className="latest-meal-plan">

                <h2>
                    แผนการกินล่าสุด
                </h2>

            </div>

            {/* ================= FAVORITE ================= */}

            <div className="favorite-items">

                <h2>
                    รายการโปรด
                </h2>

            </div>

            {/* ================= PAST PLANS ================= */}

            <div className="past-meal-plans">

                <h2>
                    แผนการกินย้อนหลัง
                </h2>

            </div>

        </div>

    );

}

export default HomePage;