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

    const slides = [slide1, slide2];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {

        const interval = setInterval(() => {

            setCurrentSlide(prev =>
                (prev + 1) % slides.length
            );

        }, 3000);

        return () => clearInterval(interval);

    }, []);

    return (

        <div>

            {/* ================= SLIDE ================= */}

            <div className="slideshow">

                <img
                    src={slides[currentSlide]}
                    alt="slide"
                    className="slide-img"
                />

                <div className="overlay">

                    <Link
                        to="/menu"
                        className="view-more"
                    >
                        ดูเพิ่มเติม
                    </Link>

                </div>

            </div>

            {/* ================= RESULT ================= */}

            {calcResult && (

                <div className="nutrition-card">

                    <h2>
                        พลังงานที่ควรได้รับต่อวัน
                    </h2>

                    {/* TDEE */}

                    <div className="tdee">

                        <FaFire />

                        <span>
                            {Math.round(calcResult.tdee)}
                        </span>

                        <small>kcal</small>

                    </div>

                    {/* MACRO */}

                    <div className="macro-box">

                        {/* CARB */}

                        <div className="macro carb">

                            <FaBreadSlice />

                            <p>คาร์บ</p>

                            <strong>
                                {Math.round(calcResult.carb)} g
                            </strong>

                        </div>

                        {/* PROTEIN */}

                        <div className="macro protein">

                            <FaDrumstickBite />

                            <p>โปรตีน</p>

                            <strong>
                                {Math.round(calcResult.protein)} g
                            </strong>

                        </div>

                        {/* FAT */}

                        <div className="macro fat">

                            <FaTint />

                            <p>ไขมัน</p>

                            <strong>
                                {Math.round(calcResult.fat)} g
                            </strong>

                        </div>

                        {/* SUGAR */}

                        <div className="macro sugar">

                            <FaCandyCane />

                            <p>น้ำตาล</p>

                            <strong>
                                {Math.round(calcResult.sugar || 25)} g
                            </strong>

                        </div>

                        {/* SODIUM */}

                        <div className="macro sodium">

                            <FaMortarPestle />

                            <p>โซเดียม</p>

                            <strong>
                                {Math.round(calcResult.sodium || 2000)} mg
                            </strong>

                        </div>

                    </div>

                    {/* BUTTON */}

                    <Link
                        to="/calculate"
                        state={{
                            formData:
                                formData ||
                                JSON.parse(
                                    localStorage.getItem("formData")
                                )
                        }}
                        className="calc-floating-btn"
                    >
                        คำนวณใหม่
                    </Link>

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