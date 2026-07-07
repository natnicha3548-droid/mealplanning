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
    FaMortarPestle,
    FaTimes,
} from "react-icons/fa";

import { MdLocalFireDepartment } from "react-icons/md";

import "./FavFood.css";

function FavFood() {

    const [favFoods, setFavFoods] = useState([]);
    const [favPlans, setFavPlans] = useState([]);
    const [activeTab, setActiveTab] = useState("foods");
    const [categories, setCategories] = useState([]);

    // Modal state
    const [selectedFood, setSelectedFood] = useState(null);
    const [selectedMeal, setSelectedMeal] = useState("breakfast");
    const [quantity, setQuantity] = useState(1);

    const formatNumber = (value) => Number(value || 0).toFixed(0);

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
        } catch (e) { }
        return [];
    };

    useEffect(() => {
        fetchFavorites();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedFood) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => document.body.classList.remove("modal-open");
    }, [selectedFood]);

    // ================= CLOSE MODAL =================

    const handleCloseSelectedFood = () => {
        setSelectedFood(null);
        setQuantity(1);
    };

    // ================= FETCH CATEGORIES =================

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/categories");
            const data = await response.json();
            setCategories(data.filter((cat) => cat.status === "active"));
        } catch (error) {
            console.log(error);
        }
    };

    // ================= GROUP PLAN ROWS =================

    const groupPlanData = (plansRaw) => {
        const planMap = {};

        plansRaw.forEach((row) => {
            const key = row.favorite_id;

            if (!planMap[key]) {
                planMap[key] = {
                    favorite_id: row.favorite_id,
                    plan_name: row.plan_name,
                    plan_date: row.plan_date,
                    total_calories: row.total_calories,
                    carbs: row.carbs,
                    protein: row.protein,
                    fat: row.fat,
                    sugar: row.sugar,
                    sodium: row.sodium,
                    _bfSet: new Set(),
                    _lSet: new Set(),
                    _dSet: new Set(),
                    meals: { breakfast: [], lunch: [], dinner: [] },
                };
            }

            const p = planMap[key];

            if (row.breakfast_name && !p._bfSet.has(row.breakfast_name)) {
                p._bfSet.add(row.breakfast_name);
                p.meals.breakfast.push({
                    food_name: row.breakfast_name,
                    image: row.breakfast_image,
                    calories: row.breakfast_cal,
                    serving: row.breakfast_serving,
                });
            }

            if (row.lunch_name && !p._lSet.has(row.lunch_name)) {
                p._lSet.add(row.lunch_name);
                p.meals.lunch.push({
                    food_name: row.lunch_name,
                    image: row.lunch_image,
                    calories: row.lunch_cal,
                    serving: row.lunch_serving,
                });
            }

            if (row.dinner_name && !p._dSet.has(row.dinner_name)) {
                p._dSet.add(row.dinner_name);
                p.meals.dinner.push({
                    food_name: row.dinner_name,
                    image: row.dinner_image,
                    calories: row.dinner_cal,
                    serving: row.dinner_serving,
                });
            }
        });

        return Object.values(planMap).map(({ _bfSet, _lSet, _dSet, ...plan }) => plan);
    };

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
            setFavPlans(groupPlanData(data.plans || []));
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
        handleCloseSelectedFood();
    };

    // ================= CATEGORY GROUPING =================

    const getCategoryGroups = () => {
        const groups = [];
        const matchedFoodIds = new Set();

        categories.forEach((cat) => {
            const catName = cat.category_name.trim();
            const foods = favFoods.filter(
                (food) => food.category && food.category.trim() === catName
            );
            if (foods.length > 0) {
                groups.push({ name: catName, foods });
                foods.forEach((f) => matchedFoodIds.add(f.favorite_id));
            }
        });

        const otherFoods = favFoods.filter(
            (food) => !matchedFoodIds.has(food.favorite_id)
        );
        if (otherFoods.length > 0) {
            const otherByCategory = {};
            otherFoods.forEach((food) => {
                const key = food.category?.trim() || "อื่น ๆ";
                if (!otherByCategory[key]) otherByCategory[key] = [];
                otherByCategory[key].push(food);
            });
            Object.entries(otherByCategory).forEach(([name, foods]) => {
                groups.push({ name, foods });
            });
        }

        return groups;
    };

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

    // ================= MEAL ROW RENDERER =================

    const renderMealRows = (plan) => {
        const themeStyles = {
            breakfast: { bg: "#fff4ea", color: "#ff9800", icon: <FaSun size={24} />, label: "มื้อเช้า" },
            lunch: { bg: "#ffebee", color: "#f44336", icon: <FaCloudSun size={24} />, label: "มื้อกลางวัน" },
            dinner: { bg: "#f3e5f5", color: "#9c27b0", icon: <FaMoon size={22} />, label: "มื้อเย็น" },
        };

        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        const visibleGroups = mealTypes.filter((type) => {
            const foods = plan.meals[type];
            return foods && foods.length > 0;
        });

        return visibleGroups.map((type, groupIdx) => {
            const foods = plan.meals[type];
            const theme = themeStyles[type];
            const isLast = groupIdx === visibleGroups.length - 1;

            return (
                <div
                    key={type}
                    style={{
                        borderBottom: isLast ? "none" : "1px dashed #e56589ae",
                        marginBottom: isLast ? 0 : "4px",
                        paddingBottom: isLast ? 0 : "4px",
                    }}
                >
                    {foods.map((food, idx) => (
                        <div className="meal-row" key={`${type}-${idx}`}>
                            <div className="meal-type-stacked">
                                {idx === 0 ? (
                                    <>
                                        <div
                                            className="meal-icon-circle"
                                            style={{ backgroundColor: theme.bg, color: theme.color }}
                                        >
                                            {theme.icon}
                                        </div>
                                        <span style={{ color: theme.color, fontWeight: "700", marginTop: "8px", fontSize: "0.95rem" }}>
                                            {theme.label}
                                        </span>
                                    </>
                                ) : (
                                    <div style={{ width: "56px" }} />
                                )}
                            </div>
                            <img
                                src={
                                    food.image
                                        ? food.image.startsWith("http") ? food.image : `http://localhost:5000${food.image}`
                                        : "https://via.placeholder.com/120"
                                }
                                alt={food.food_name}
                                className="meal-image"
                            />
                            <div className="meal-info">
                                <h3>{food.food_name}</h3>
                                {food.serving && <span className="fav-portion-badge">{food.serving}</span>}
                            </div>
                            <div className="meal-cal-right">{parseInt(food.calories || 0)} kcal</div>
                        </div>
                    ))}
                </div>
            );
        });
    };

    return (
        <div className="fav-mp-wrapper">

            {/* ================= HEADER ================= */}
            <div className="fav-mp-header">
                <div className="fav-mp-icon">
                    <FaHeart />
                </div>
                <div>
                    <h1>รายการโปรดของฉัน</h1>
                    <p>รวมเมนูอาหารและแผนการกินที่คุณชื่นชอบ</p>
                </div>
            </div>

            {/* ================= TAB ================= */}
            <div className="fav-mp-tabs">
                <button
                    className={activeTab === "foods" ? "fav-mp-tab-btn active" : "fav-mp-tab-btn"}
                    onClick={() => setActiveTab("foods")}
                >
                    <FaUtensils />
                    รายการโปรดอาหาร
                </button>
                <button
                    className={activeTab === "plans" ? "fav-mp-tab-btn active" : "fav-mp-tab-btn"}
                    onClick={() => setActiveTab("plans")}
                >
                    <FaCalendarAlt />
                    แผนการกิน
                </button>
            </div>

            {/* ================= FOOD ================= */}
            {activeTab === "foods" && (
                <>
                    {getCategoryGroups().map((group) => (
                        <div className="food-category" key={group.name}>
                            <div className="fav-mp-section-top">
                                <h2>{group.name} ({group.foods.length})</h2>
                            </div>
                            {renderFoodCards(group.foods)}
                        </div>
                    ))}
                    {favFoods.length === 0 && (
                        <div className="fav-mp-empty-box">ยังไม่มีรายการโปรดอาหารจ้า</div>
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

                                    {renderMealRows(plan)}

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
                    <div className="fav-modal-overlay" onClick={handleCloseSelectedFood}>
                        <div className="fav-modal-content" onClick={(e) => e.stopPropagation()}>

                            {/* ปุ่มหัวใจ + กากบาท ชิดขอบขวา — เหมือน MenuFood */}
                            <div className="fav-modal-actions">
                                <button
                                    className="fav-modal-bookmark-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFavoriteFood(e, selectedFood.favorite_id);
                                        handleCloseSelectedFood();
                                    }}
                                >
                                    <FaHeart />
                                </button>
                                <button
                                    className="fav-modal-close-btn"
                                    onClick={handleCloseSelectedFood}
                                    aria-label="ปิด"
                                >
                                    <FaTimes />
                                </button>
                            </div>

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

                                {selectedFood.description && selectedFood.description.trim() !== "" && (
                                    <div className="fav-modal-section">
                                        <h4>รายละเอียดอาหาร</h4>
                                        <div className="fav-modal-box fav-modal-detail-text">
                                            {selectedFood.description}
                                        </div>
                                    </div>
                                )}

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
