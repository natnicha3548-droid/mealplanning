import React, { useEffect, useState } from "react";

import {
    FaHeart,
    FaRegHeart,
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

import { MdLocalFireDepartment } from "react-icons/md";

import "./FavFood.css";

function FavFood() {

    const [favFoods, setFavFoods] = useState([]);
    const [favPlans, setFavPlans] = useState([]);
    const [activeTab, setActiveTab] = useState("foods");

    // Modal state
    const [selectedFood, setSelectedFood] = useState(null);
    const [selectedMeal, setSelectedMeal] = useState("breakfast");
    const [quantity, setQuantity] = useState(1);

    const formatNumber = (value) => Number(value || 0).toFixed(0);

    // แปลง recipe_details จาก JSON string → array ของ sections
    const parseRecipeDetails = (raw) => {
        if (!raw) return [];
        try {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter((section) => {
                    const hasName = section.section_name && section.section_name.trim() !== "";
                    const hasBlocks = section.blocks?.some(
                        (b) =>
                            (b.block_title && b.block_title.trim() !== "") ||
                            (b.content && b.content.trim() !== "")
                    );
                    return hasName || hasBlocks;
                });
            }
        } catch (e) {
            // ไม่ใช่ JSON ที่ถูกต้อง
        }
        return [];
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    // ล็อก scroll ตอนเปิด modal
    useEffect(() => {
        if (selectedFood) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => document.body.classList.remove("modal-open");
    }, [selectedFood]);

    // ================= FETCH FAVORITES =================

    const fetchFavorites = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
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

    const removeFavoriteFood = async (e, favoriteId) => {
        e.stopPropagation();
        try {
            await fetch(
                `http://localhost:5000/api/favorites/food/${favoriteId}`,
                { method: "DELETE" }
            );
            setFavFoods(favFoods.filter((food) => food.favorite_id !== favoriteId));
        } catch (error) {
            console.log(error);
        }
    };

    // ================= REMOVE FAVORITE PLAN =================

    const removeFavoritePlan = async (favoriteId) => {
        try {
            await fetch(
                `http://localhost:5000/api/favorites/plan/${favoriteId}`,
                { method: "DELETE" }
            );
            setFavPlans(favPlans.filter((plan) => plan.favorite_id !== favoriteId));
        } catch (error) {
            console.log(error);
        }
    };

    // ================= ADD TO MEAL PLAN (myplate) =================

    const addToMealPlan = () => {
        if (!selectedFood) return;
        const myPlate = JSON.parse(localStorage.getItem("myplate")) || [];
        const mealMap = { breakfast: "เช้า", lunch: "กลางวัน", dinner: "เย็น" };
        myPlate.push({
            id: Date.now(),
            food_id: selectedFood.food_id,
            name: selectedFood.food_name,
            image: selectedFood.image,
            qty: quantity,
            meal_type: mealMap[selectedMeal],
            calPerUnit: Number(selectedFood.calories),
            macros: {
                carbs: Number(selectedFood.carbohydrates),
                protein: Number(selectedFood.protein),
                fat: Number(selectedFood.fat),
                sugar: Number(selectedFood.sugar),
                sodium: Number(selectedFood.sodium),
            },
        });
        localStorage.setItem("myplate", JSON.stringify(myPlate));
        alert("เพิ่มลงจานอาหารแล้ว");
        setSelectedFood(null);
        setQuantity(1);
    };

    // ================= CATEGORY =================

    const savoryFoods = favFoods.filter(
        (food) => food.category && food.category.trim() === "ของคาว"
    );
    const dessertFoods = favFoods.filter(
        (food) => food.category && food.category.trim() === "ของหวาน"
    );
    const otherFoods = favFoods.filter(
        (food) =>
            !food.category ||
            (food.category.trim() !== "ของคาว" && food.category.trim() !== "ของหวาน")
    );

    // ================= FOOD CARD =================

    const renderFoodCards = (foods) => (
        <div className="favorite-food-grid">
            {foods.map((food) => (
                <div
                    key={food.favorite_id}
                    className="favorite-food-card"
                    onClick={() => {
                        setSelectedFood(food);
                        setSelectedMeal("breakfast");
                        setQuantity(1);
                    }}
                >
                    <div className="favorite-food-image-box">
                        <img
                            src={
                                food.image?.startsWith("http")
                                    ? food.image
                                    : `http://localhost:5000${food.image}`
                            }
                            alt={food.food_name}
                            className="favorite-food-image"
                        />
                        <button
                            className="favorite-heart-btn"
                            onClick={(e) => removeFavoriteFood(e, food.favorite_id)}
                        >
                            <FaHeart />
                        </button>
                    </div>
                    <div className="favorite-food-info">
                        <h3>{food.food_name}</h3>
                        <p>{parseInt(food.calories)} kcal</p>
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
                    <h1>รายการโปรดของฉัน</h1>
                    <p>รวมเมนูอาหารและแผนการกินที่คุณชื่นชอบ</p>
                </div>
            </div>

            {/* ================= TAB ================= */}
            <div className="favorite-tabs">
                <button
                    className={activeTab === "foods" ? "tab-btn active" : "tab-btn"}
                    onClick={() => setActiveTab("foods")}
                >
                    <FaUtensils />
                    รายการโปรดอาหาร
                </button>
                <button
                    className={activeTab === "plans" ? "tab-btn active" : "tab-btn"}
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
                                <h2>ของคาว ({savoryFoods.length})</h2>
                            </div>
                            {renderFoodCards(savoryFoods)}
                        </div>
                    )}
                    {dessertFoods.length > 0 && (
                        <div className="food-category">
                            <div className="section-top">
                                <h2>ของหวาน ({dessertFoods.length})</h2>
                            </div>
                            {renderFoodCards(dessertFoods)}
                        </div>
                    )}
                    {otherFoods.length > 0 && (
                        <div className="food-category">
                            <div className="section-top">
                                <h2>อื่น ๆ ({otherFoods.length})</h2>
                            </div>
                            {renderFoodCards(otherFoods)}
                        </div>
                    )}
                    {favFoods.length === 0 && (
                        <div className="empty-box">ยังไม่มีรายการโปรดอาหารจ้า</div>
                    )}
                </>
            )}

            {/* ================= PLAN ================= */}
            {activeTab === "plans" && (
                <>
                    <div className="section-top">
                        <h2>แผนการกินโปรด ({favPlans.length})</h2>
                    </div>
                    {favPlans.length === 0 ? (
                        <div className="empty-box">ยังไม่มีรายการโปรดแผนอาหาร</div>
                    ) : (
                        <div className="meal-plan-list">
                            {favPlans.map((plan, index) => (
                                <div key={plan.favorite_id} className="meal-plan-full-card">

                                    <div className="plan-header">
                                        <div className="plan-header-left">
                                            <h2>{plan.plan_name || `แผนการกินที่ ${index + 1}`}</h2>
                                            <p className="plan-subtitle">แผนอาหารที่คุณกดใจเก็บไว้</p>
                                        </div>
                                        <div className="plan-header-right">
                                            <div className="plan-cal-box">
                                                <span className="plan-cal-label">รวมทั้งหมด</span>
                                                <span className="plan-cal-value">{parseInt(plan.total_calories || 0)} kcal</span>
                                            </div>
                                            <button className="meal-fav-btn" onClick={() => removeFavoritePlan(plan.favorite_id)}>
                                                <FaHeart />
                                            </button>
                                        </div>
                                    </div>

                                    {['breakfast', 'lunch', 'dinner'].map((type) => {
                                        const name = plan[`${type}_name`];
                                        const image = plan[`${type}_image`];
                                        const cal = plan[`${type}_cal`];
                                        const serving = plan[`${type}_serving`];
                                        if (!name) return null;

                                        const themeStyles = {
                                            breakfast: { bg: "#fff4ea", color: "#ff9800", icon: <FaSun size={24} /> },
                                            lunch: { bg: "#ffebee", color: "#f44336", icon: <FaCloudSun size={24} /> },
                                            dinner: { bg: "#f3e5f5", color: "#9c27b0", icon: <FaMoon size={22} /> }
                                        };
                                        const theme = themeStyles[type];
                                        const label = type === 'breakfast' ? 'มื้อเช้า' : type === 'lunch' ? 'มื้อกลางวัน' : 'มื้อเย็น';

                                        return (
                                            <div className="meal-row" key={type}>
                                                <div className="meal-type-stacked">
                                                    <div className="meal-icon-circle" style={{ backgroundColor: theme.bg, color: theme.color }}>
                                                        {theme.icon}
                                                    </div>
                                                    <span style={{ color: theme.color, fontWeight: "700", marginTop: "8px", fontSize: "0.95rem" }}>
                                                        {label}
                                                    </span>
                                                </div>
                                                <img
                                                    src={
                                                        image
                                                            ? image.startsWith("http") ? image : `http://localhost:5000${image}`
                                                            : "https://via.placeholder.com/120"
                                                    }
                                                    alt={name}
                                                    className="meal-image"
                                                />
                                                <div className="meal-info">
                                                    <h3>{name}</h3>
                                                    {serving && <span className="fav-portion-badge">{serving}</span>}
                                                </div>
                                                <div className="meal-cal-right">{parseInt(cal || 0)} kcal</div>
                                            </div>
                                        );
                                    })}

                                    <div className="plan-summary">
                                        <div className="summary-box">
                                            <div className="sum-icon-wrap cal-icon"><FaFire /></div>
                                            <div className="sum-info">
                                                <span className="sum-val">{parseInt(plan.total_calories || 0)}</span>
                                                <span className="sum-unit">kcal</span>
                                            </div>
                                        </div>
                                        <div className="summary-box">
                                            <div className="sum-icon-wrap carb-icon"><FaBreadSlice /></div>
                                            <div className="sum-info">
                                                <span className="sum-label">คาร์บ</span>
                                                <span className="sum-val">{parseInt(plan.carbs || 0)}g</span>
                                            </div>
                                        </div>
                                        <div className="summary-box">
                                            <div className="sum-icon-wrap pro-icon"><FaDrumstickBite /></div>
                                            <div className="sum-info">
                                                <span className="sum-label">โปรตีน</span>
                                                <span className="sum-val">{parseInt(plan.protein || 0)}g</span>
                                            </div>
                                        </div>
                                        <div className="summary-box">
                                            <div className="sum-icon-wrap fat-icon"><FaTint /></div>
                                            <div className="sum-info">
                                                <span className="sum-label">ไขมัน</span>
                                                <span className="sum-val">{parseInt(plan.fat || 0)}g</span>
                                            </div>
                                        </div>
                                        <div className="summary-box">
                                            <div className="sum-icon-wrap sugar-icon"><FaCandyCane /></div>
                                            <div className="sum-info">
                                                <span className="sum-label">น้ำตาล</span>
                                                <span className="sum-val">{parseInt(plan.sugar || 0)}g</span>
                                            </div>
                                        </div>
                                        <div className="summary-box">
                                            <div className="sum-icon-wrap sodium-icon"><FaMortarPestle /></div>
                                            <div className="sum-info">
                                                <span className="sum-label">โซเดียม</span>
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

            {/* ================= FOOD MODAL ================= */}
            {selectedFood && (() => {
                const recipeSections = parseRecipeDetails(selectedFood.recipe_details);
                return (
                    <div className="fav-modal-overlay" onClick={() => setSelectedFood(null)}>
                        <div className="fav-modal-content" onClick={(e) => e.stopPropagation()}>

                            <button
                                className="fav-modal-bookmark-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFavoriteFood(e, selectedFood.favorite_id);
                                    setSelectedFood(null);
                                }}
                            >
                                <FaHeart />
                            </button>

                            {/* ===== LEFT ===== */}
                            <div className="fav-modal-left">
                                <img
                                    src={
                                        selectedFood.image?.startsWith("http")
                                            ? selectedFood.image
                                            : `http://localhost:5000${selectedFood.image}`
                                    }
                                    alt={selectedFood.food_name}
                                    className="fav-modal-image"
                                />

                                {/* คำอธิบายสั้นๆ */}
                                {selectedFood.description && selectedFood.description.trim() !== "" && (
                                    <div className="fav-modal-section">
                                        <h4>รายละเอียดอาหาร</h4>
                                        <div className="fav-modal-box fav-modal-detail-text">
                                            {selectedFood.description}
                                        </div>
                                    </div>
                                )}

                                {/* recipe_details — ส่วนผสม/วิธีทำ */}
                                {recipeSections.length > 0 && (
                                    <div className="fav-modal-section">
                                        <h4>ส่วนผสม / วิธีทำ</h4>
                                        {recipeSections.map((section, sIdx) => (
                                            <div key={sIdx} className="fav-recipe-section-block">
                                                {section.section_name && section.section_name.trim() !== "" && (
                                                    <p className="fav-recipe-section-name">{section.section_name}</p>
                                                )}
                                                {section.blocks?.map((block, bIdx) => (
                                                    <div key={bIdx} className="fav-recipe-block">
                                                        {block.block_title && block.block_title.trim() !== "" && (
                                                            <p className="fav-recipe-block-title">{block.block_title}</p>
                                                        )}
                                                        {block.content && block.content.trim() !== "" && (
                                                            <div className="fav-modal-box fav-modal-detail-text fav-recipe-block-content">
                                                                {block.content}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* หมายเหตุ */}
                                {selectedFood.notes && selectedFood.notes.trim() !== "" && (
                                    <div className="fav-modal-section">
                                        <h4>หมายเหตุ</h4>
                                        <div className="fav-modal-box fav-modal-box--note">
                                            {selectedFood.notes}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ===== RIGHT ===== */}
                            <div className="fav-modal-right">
                                <h2>{selectedFood.food_name}</h2>

                                <div className="fav-modal-section">
                                    <h4>คุณค่าทางโภชนาการ</h4>
                                    <div className="fav-nutri-grid">
                                        <div className="fav-nutri-card fav-nutri-calorie">
                                            <MdLocalFireDepartment className="fav-nutri-icon" />
                                            <p className="fav-nutri-label">แคลอรี่</p>
                                            <span>{formatNumber(selectedFood.calories)} kcal</span>
                                        </div>
                                        <div className="fav-nutri-card fav-nutri-carb">
                                            <FaBreadSlice className="fav-nutri-icon" />
                                            <p className="fav-nutri-label">คาร์บ</p>
                                            <span>{formatNumber(selectedFood.carbohydrates)} g</span>
                                        </div>
                                        <div className="fav-nutri-card fav-nutri-protein">
                                            <FaDrumstickBite className="fav-nutri-icon" />
                                            <p className="fav-nutri-label">โปรตีน</p>
                                            <span>{formatNumber(selectedFood.protein)} g</span>
                                        </div>
                                        <div className="fav-nutri-card fav-nutri-fat">
                                            <FaTint className="fav-nutri-icon" />
                                            <p className="fav-nutri-label">ไขมัน</p>
                                            <span>{formatNumber(selectedFood.fat)} g</span>
                                        </div>
                                        <div className="fav-nutri-card fav-nutri-sugar">
                                            <FaCandyCane className="fav-nutri-icon" />
                                            <p className="fav-nutri-label">น้ำตาล</p>
                                            <span>{formatNumber(selectedFood.sugar)} g</span>
                                        </div>
                                        <div className="fav-nutri-card fav-nutri-sodium">
                                            <FaMortarPestle className="fav-nutri-icon" />
                                            <p className="fav-nutri-label">โซเดียม</p>
                                            <span>{formatNumber(selectedFood.sodium)} mg</span>
                                        </div>
                                    </div>
                                </div>

                                {/* เลือกมื้ออาหาร */}
                                <div className="fav-modal-section">
                                    <h4>เลือกมื้ออาหาร</h4>
                                    <div className="fav-meal-buttons">
                                        <button
                                            className={selectedMeal === "breakfast" ? "active" : ""}
                                            onClick={() => setSelectedMeal("breakfast")}
                                        >
                                            เช้า
                                        </button>
                                        <button
                                            className={selectedMeal === "lunch" ? "active" : ""}
                                            onClick={() => setSelectedMeal("lunch")}
                                        >
                                            กลางวัน
                                        </button>
                                        <button
                                            className={selectedMeal === "dinner" ? "active" : ""}
                                            onClick={() => setSelectedMeal("dinner")}
                                        >
                                            เย็น
                                        </button>
                                    </div>
                                </div>

                                {/* จำนวน */}
                                <div className="fav-qty-section">
                                    <h4>จำนวน</h4>
                                    <div className="fav-qty-control">
                                        <button
                                            className="fav-qty-btn"
                                            onClick={() => setQuantity((p) => Math.max(1, p - 1))}
                                        >
                                            -
                                        </button>
                                        <span className="fav-qty-value">{quantity}</span>
                                        <button
                                            className="fav-qty-btn"
                                            onClick={() => setQuantity((p) => p + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button className="fav-add-btn" onClick={addToMealPlan}>
                                    เพิ่มใส่จานอาหาร
                                </button>
                            </div>

                        </div>
                    </div>
                );
            })()}

        </div>
    );
}

export default FavFood;
