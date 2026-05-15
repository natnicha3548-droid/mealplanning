import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFire, FaBreadSlice, FaDrumstickBite, FaTint } from "react-icons/fa";

import img1 from "../assets/sl1.png";
import img2 from "../assets/sl2.png";

function HomePage({ calcResult, formData }) {

    const slides = [img1, img2];
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>

            {/* SLIDE */}
            <div className="slideshow">

                <img
                    src={slides[currentSlide]}
                    alt="slide"
                    className="slide-img"
                />

                <div className="overlay">
                    <Link to="/menu" className="view-more">
                        ดูเพิ่มเติม
                    </Link>
                </div>

            </div>

            {/* RESULT */}
            {calcResult && (
                <div className="nutrition-card">

                    <h2>พลังงานที่ควรได้รับต่อวัน</h2>

                    <div className="tdee">
                        <FaFire />
                        <span>{calcResult.tdee}</span>
                        <small>kcal</small>
                    </div>

                    <div className="macro-box">

                        <div className="macro carb">
                            <FaBreadSlice />
                            <p>คาร์บ</p>
                            <strong>{calcResult.carb} g</strong>
                        </div>

                        <div className="macro protein">
                            <FaDrumstickBite />
                            <p>โปรตีน</p>
                            <strong>{calcResult.protein} g</strong>
                        </div>

                        <div className="macro fat">
                            <FaTint />
                            <p>ไขมัน</p>
                            <strong>{calcResult.fat} g</strong>
                        </div>

                    </div>

                    <Link
                        to="/calculate"
                        state={{
                            formData: formData || JSON.parse(localStorage.getItem("formData"))
                        }}
                        className="calc-floating-btn"
                    >
                        คำนวณใหม่
                    </Link>

                </div>
            )}

            {/* แผนการกินล่าสุด */}
            <div className="latest-meal-plan">
                <h2>แผนการกินล่าสุด</h2>
                {/* Content for latest meal plan */}
            </div>

            {/* รายการโปรด */}
            <div className="favorite-items">
                <h2>รายการโปรด</h2>
                {/* Content for favorite items */}
            </div>

            {/* แผนการกินย้อนหลัง */}
            <div className="past-meal-plans">
                <h2>แผนการกินย้อนหลัง</h2>
                {/* Content for past meal plans */}
            </div>

        </div>
    );
}

export default HomePage;