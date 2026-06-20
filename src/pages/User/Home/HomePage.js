import React, { useState, useEffect } from "react";
import "./HomePage.css";
import { Link, useNavigate } from "react-router-dom";
import { FaFire, FaBreadSlice, FaDrumstickBite, FaTint, FaCandyCane, FaMortarPestle, FaHeart, FaSun, FaCloudSun, FaMoon, FaChevronRight } from "react-icons/fa";
import { RotateCcw } from 'lucide-react';
import slide1 from "../../../assets/sl1.png";
import slide2 from "../../../assets/sl2.png";

// =================================================================
// 1. Component: แผนอาหารล่าสุด (MealPlanCard)
// =================================================================
const MealPlanCard = ({ title, subtitle, planData, showRestoreBtn, onRestore }) => {
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
                    <h2 className="home-meal-card-title">{title}</h2>
                    <p className="home-meal-card-subtitle">{subtitle}</p>
                </div>
                <div className="home-meal-card-kcal">
                    <span className="home-total-label">รวมทั้งหมด</span>
                    <div className="home-kcal-row">
                        <div className="home-total-cal-badge">{Math.round(planData.total_calories)} kcal</div>
                        {showRestoreBtn && (
                            <button
                                className="home-restore-plan-btn"
                                onClick={() => onRestore()}
                                title="นำแผนอาหารล่าสุดนี้กลับมาใช้ใหม่"
                            >
                                <RotateCcw size={20} />
                            </button>
                        )}
                    </div>
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
                                    <img
                                        src={(() => {
                                            const raw = item.image || item.breakfast_image || item.lunch_image || item.dinner_image;
                                            return raw?.startsWith("http") ? raw : `http://localhost:5000${raw}`;
                                        })()}
                                        alt={item.name}
                                        className="home-meal-img"
                                    />
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

// =================================================================
// 2. Component: แผนอาหารรายการโปรด (FavoritePlanCard)
// =================================================================
const FavoritePlanCard = ({ planData, onRestore }) => {
    const getMeals = (data) => Array.isArray(data) ? data : (data ? [data] : []);

    const themeStyles = {
        breakfast: { bg: "#fff4ea", color: "#ff9800" },
        lunch: { bg: "#ffebee", color: "#f44336" },
        dinner: { bg: "#f3e5f5", color: "#9c27b0" }
    };

    return (
        <div className="home-meal-plan-card" style={{ marginBottom: 0 }}>
            <div className="home-meal-card-header">
                <div>
                    <h2 className="home-meal-card-title">แผนอาหารโปรดของฉัน</h2>
                    <p className="home-meal-card-subtitle">แผนอาหารที่คุณกดใจเก็บไว้</p>
                </div>

                <div className="home-meal-card-kcal">
                    <span className="home-total-label">รวมทั้งหมด</span>
                    <div className="home-kcal-row">
                        <div className="home-total-cal-badge">{Math.round(planData.total_calories)} kcal</div>
                        <div className="home-plan-btn-group">
                            <button
                                className="home-restore-plan-btn"
                                onClick={() => onRestore(planData.plan_date)}
                                title="นำแผนอาหารโปรดนี้กลับมาใช้ใหม่"
                            >
                                <RotateCcw size={20} />
                            </button>
                            <div
                                className="home-favorite-plan-icon"
                                title="แผนอาหารรายการโปรด"
                            >
                                <FaHeart size={25} />
                            </div>
                        </div>
                    </div>
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
                                    <img
                                        src={(() => {
                                            const raw = item.image || item.breakfast_image || item.lunch_image || item.dinner_image;
                                            return raw?.startsWith("http") ? raw : `http://localhost:5000${raw}`;
                                        })()}
                                        alt={item.name}
                                        className="home-meal-img"
                                    />
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

// =================================================================
// 3. หน้า HomePage หลัก
// =================================================================
function HomePage({ user, calcResult, formData }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [savedResult, setSavedResult] = useState(null);
    const [latestPlan, setLatestPlan] = useState(null);
    const [favoriteFoods, setFavoriteFoods] = useState([]);
    const [favoritePlans, setFavoritePlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate] = useState(new Date().toISOString().split('T')[0]);

    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % 2), 3000);

        // อ่านจาก sessionStorage เท่านั้น
        // ปิดแท็บแล้วเปิดใหม่ → sessionStorage หาย → ไม่โชว์จนกว่ากดเสร็จสิ้นใหม่
        const activeCalc = JSON.parse(sessionStorage.getItem("activeCalcResult"));
        if (activeCalc) setSavedResult(activeCalc);

        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        fetch(`http://localhost:5000/api/latest-meal-plan/${user.user_id}`).then(res => res.json()).then(setLatestPlan).catch(console.log);
        fetch(`http://localhost:5000/api/favorite-foods/${user.user_id}`).then(res => res.json()).then(setFavoriteFoods).catch(console.log);
        fetch(`http://localhost:5000/api/favorite-plans/${user.user_id}`).then(res => res.json()).then(setFavoritePlans).catch(console.log);
    };

    useEffect(() => {

        if (!user) {
            setLatestPlan(null);
            setFavoriteFoods([]);
            setFavoritePlans([]);
            setSavedResult(null);
            return;
        }

        // user login แล้ว → ล้าง savedResult ของ guest ออก ใช้ calcResult prop จาก DB แทน
        setSavedResult(null);
        fetchData();

    }, [user]);

    const handleRestoreFavoritePlan = async (plan) => {
        if (!window.confirm("ต้องการนำแผนนี้จากรายการโปรดมาใช้ใหม่ใช่หรือไม่?")) return;

        setIsLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await fetch('http://localhost:5000/api/restore-from-favorite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.user_id || 1,
                    planId: plan.plan_id,
                    targetDate: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                alert("กู้แผนจากรายการโปรดสำเร็จ!");
                navigate("/meal-plan");
            } else {
                alert("ไม่สามารถกู้แผนได้");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreLatestPlan = async (plan) => {
        if (!window.confirm("ต้องการกู้คืนแผนล่าสุดจากเมื่อวานมาใช้ใหม่ใช่หรือไม่?")) return;

        setIsLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await fetch('http://localhost:5000/api/restore-latest-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.user_id || 1,
                    planId: plan.plan_id,
                    targetDate: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                alert("กู้แผนล่าสุดสำเร็จ!");
                navigate("/meal-plan");
            } else {
                alert("ไม่สามารถกู้แผนล่าสุดได้");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFavoriteFood = async (id) => {
        await fetch(`http://localhost:5000/api/favorites/food/${id}`, { method: "DELETE" });
        setFavoriteFoods(prev => prev.filter(f => f.favorite_id !== id));
    };

    // calcResult (จาก App.js state) มาก่อน savedResult เสมอ
    // สมาชิก → calcResult = ข้อมูลจาก DB
    // guest ในเซสชันปัจจุบัน → savedResult = sessionStorage
    const result = calcResult || savedResult;

    return (
        <div>
            <div className="slideshow">
                <img src={currentSlide === 0 ? slide1 : slide2} alt="slide" className="slide-img" />
            </div>

            <div className="main-container">
                <div className="quick-actions">
                    <Link to="/calculate" state={{ formData }} className="quick-card">
                        <div className="quick-icon"><FaFire /></div>
                        <div className="quick-card-content"><h3>คำนวณพลังงาน</h3><p>คลิกเพื่อคำนวณแคลอรี่</p></div>
                    </Link>
                    <Link to="/menu" className="quick-card">
                        <div className="quick-icon"><FaBreadSlice /></div>
                        <div className="quick-card-content"><h3>ดูเมนูเพิ่มเติม</h3><p>คลิกเพื่อดูเมนูทั้งหมด</p></div>
                    </Link>
                </div>

                {result && (
                    <div className="nutrition-card">
                        <h2>พลังงานที่ควรได้รับต่อวัน</h2>
                        <div className="tdee"><FaFire /> <span>{Math.round(result.tdee)}</span><small>kcal</small></div>
                        <div className="macro-box">
                            <div className="macro carb"><FaBreadSlice /><p>คาร์บ</p><strong>{Math.round(result.carb)} g</strong></div>
                            <div className="macro protein"><FaDrumstickBite /><p>โปรตีน</p><strong>{Math.round(result.protein)} g</strong></div>
                            <div className="macro fat"><FaTint /><p>ไขมัน</p><strong>{Math.round(result.fat)} g</strong></div>
                            <div className="macro sugar">
                                <FaCandyCane /><p>น้ำตาล</p><strong>{Math.round(result.sugar)} g</strong>
                            </div>
                            <div className="macro sodium">
                                <FaMortarPestle /><p>โซเดียม</p><strong>{Math.round(result.sodium)} mg</strong>
                            </div>
                        </div>
                    </div>
                )}

                {latestPlan && (
                    <MealPlanCard
                        title="แผนอาหารล่าสุดของฉัน"
                        subtitle="แผนอาหารที่คุณใช้เมื่อวานนี้"
                        planData={latestPlan}
                        showRestoreBtn={true}
                        onRestore={() => handleRestoreLatestPlan(latestPlan)}
                    />
                )}

                {favoriteFoods.length > 0 && (
                    <div className="home-favorite-section">
                        <div className="home-favorite-header">
                            <div className="header-text-group">
                                <h2 className="home-favorite-title">เมนูโปรดของฉัน</h2>
                                <p className="home-favorite-subtitle">เมนูอาหารที่คุณชื่นชอบและกดใจไว้</p>
                            </div>
                            <button
                                className="home-view-more-text-btn"
                                onClick={() => navigate("/favourite-food", { state: { tab: "foods" } })}
                            >
                                ดูเพิ่มเติม <FaChevronRight size={12} />
                            </button>
                        </div>
                        <div className="favorite-foods-wrapper">
                            <div className="favorite-foods-scroll-container">
                                {favoriteFoods.map((food) => (
                                    <div key={food.favorite_id} className="food-slide">
                                        <div className="home-favorite-card">
                                            <div className="home-favorite-image-wrapper">
                                                <img
                                                    src={
                                                        food.image?.startsWith("http")
                                                            ? food.image
                                                            : `http://localhost:5000${food.image}`
                                                    }
                                                    alt={food.food_name}
                                                    className="home-favorite-image"
                                                />
                                                <button className="home-favorite-heart" style={{ cursor: 'default' }}>
                                                    <FaHeart />
                                                </button>
                                            </div>
                                            <div className="home-favorite-content">
                                                <h3>{food.food_name}</h3>
                                                <p>{Math.round(food.calories)} kcal</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {favoritePlans && favoritePlans.length > 0 && (
                    <div className="favorite-plans-wrapper">
                        <div className="favorite-plans-scroll-container">
                            {favoritePlans.map(plan => (
                                <div className="favorite-plan-slide" key={plan.plan_id}>
                                    <FavoritePlanCard
                                        planData={plan}
                                        onRestore={() => handleRestoreFavoritePlan(plan)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default HomePage;
