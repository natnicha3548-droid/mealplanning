import React, { useState, useEffect, useMemo } from "react";
import {
    FaSearch, FaHeart, FaRegHeart,
    FaBreadSlice, FaDrumstickBite, FaTint, FaCandyCane, FaMortarPestle
} from "react-icons/fa";
import { MdDinnerDining } from "react-icons/md";
import { LuSoup } from "react-icons/lu";
import { MdLocalFireDepartment } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import "./MenuFood.css";

function MenuFood() {
    const navigate = useNavigate();

    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedFood, setSelectedFood] = useState(null);
    const [selectedMeal, setSelectedMeal] = useState("breakfast");
    const [quantity, setQuantity] = useState(1);
    const [favFoodIds, setFavFoodIds] = useState([]);

    // state สำหรับ modal แจ้งเตือน login
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = storedUser?.user_id || null;

    const formatNumber = (value) => Number(value || 0).toFixed(0);

    const parseRecipeDetails = (raw) => {
        if (!raw) return [];
        try {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter((section) => {
                    const hasName = section.section_name && section.section_name.trim() !== "";
                    const hasBlocks = section.blocks?.some(
                        (b) => (b.block_title && b.block_title.trim() !== "") ||
                            (b.content && b.content.trim() !== "")
                    );
                    return hasName || hasBlocks;
                });
            }
        } catch (e) { }
        return [];
    };

    useEffect(() => {
        if (selectedFood) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => document.body.classList.remove("modal-open");
    }, [selectedFood]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const foodRes = await fetch("http://localhost:5000/api/foods");
                const foodData = await foodRes.json();
                setFoods(foodData);

                if (currentUserId) {
                    const favRes = await fetch(`http://localhost:5000/api/favorite-foods?user_id=${currentUserId}`);
                    const favData = await favRes.json();
                    if (favRes.ok) setFavFoodIds(favData.map((f) => f.food_id));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUserId]);

    // ================= FAVORITE =================
    const toggleFavorite = async (e, foodId) => {
        e.stopPropagation();
        if (!storedUser) {
            setShowLoginPrompt(true);
            return;
        }
        const isFav = favFoodIds.includes(foodId);
        setFavFoodIds(isFav
            ? favFoodIds.filter((id) => id !== foodId)
            : [...favFoodIds, foodId]
        );
        try {
            await fetch("http://localhost:5000/api/favorite-food", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: currentUserId, food_id: foodId }),
            });
        } catch (err) {
            console.error(err);
        }
    };

    // ================= ADD TO MEAL PLAN =================
    const addToMealPlan = () => {
        if (!selectedFood) { alert("กรุณาเลือกอาหาร"); return; }
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

    // ================= FILTER =================
    const filteredFoods = useMemo(() => {
        return foods.filter((food) => {
            const matchSearch = (food.food_name || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            let matchCategory = true;
            if (activeCategory === "fav") {
                matchCategory = favFoodIds.includes(food.food_id);
            } else if (activeCategory !== "all") {
                matchCategory = food.category_id === activeCategory;
            }
            return matchSearch && matchCategory;
        });
    }, [foods, searchTerm, activeCategory, favFoodIds]);

    return (
        <div className="menu-page">

            {/* ================= LOGIN PROMPT MODAL ================= */}
            {showLoginPrompt && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999
                    }}
                    onClick={() => setShowLoginPrompt(false)}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: "20px",
                            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                            padding: "40px 36px",
                            maxWidth: "380px",
                            width: "90%",
                            textAlign: "center"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: "52px", marginBottom: "12px" }}>🔒</div>
                        <h3 style={{
                            fontSize: "1.25rem",
                            fontWeight: "700",
                            color: "#333",
                            marginBottom: "10px"
                        }}>
                            กรุณาเข้าสู่ระบบ
                        </h3>
                        <p style={{
                            color: "#888",
                            fontSize: "0.95rem",
                            marginBottom: "28px",
                            lineHeight: "1.6"
                        }}>
                            คุณต้องเข้าสู่ระบบก่อน<br />จึงจะสามารถเพิ่มรายการโปรดได้
                        </p>

                        <button
                            onClick={() => {
                                setShowLoginPrompt(false);
                                navigate("/auth", {
                                    state: { returnTo: "/menu" }
                                });
                            }}
                            style={{
                                background: "linear-gradient(135deg, #ff9800, #f44336)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                padding: "13px 0",
                                fontSize: "1rem",
                                fontWeight: "700",
                                cursor: "pointer",
                                width: "100%",
                                marginBottom: "12px",
                                transition: "opacity 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = "0.88"}
                            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                        >
                            เข้าสู่ระบบ
                        </button>

                        <button
                            onClick={() => setShowLoginPrompt(false)}
                            style={{
                                background: "transparent",
                                color: "#aaa",
                                border: "1.5px solid #e0e0e0",
                                borderRadius: "12px",
                                padding: "11px 0",
                                fontSize: "0.95rem",
                                cursor: "pointer",
                                width: "100%",
                                transition: "border-color 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = "#bbb"}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="menu-header">
                <div className="menu-title-box">
                    <div className="menu-icon"><LuSoup /></div>
                    <div>
                        <h1>เมนูอาหารทั้งหมด</h1>
                        <p>เลือกอาหารที่คุณชอบ</p>
                    </div>
                </div>
                <div className="search-wrapper">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="ค้นหาเมนูอาหาร..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link to="/myplate" className="plate-icon-btn">
                        <MdDinnerDining />
                    </Link>
                </div>
            </div>

            {/* CATEGORY */}
            <div className="category-tabs">
                <button
                    className={activeCategory === "all" ? "active" : ""}
                    onClick={() => setActiveCategory("all")}
                >
                    ทั้งหมด
                </button>
                <button
                    className={activeCategory === 1 ? "active" : ""}
                    onClick={() => setActiveCategory(1)}
                >
                    ของคาว
                </button>
                <button
                    className={activeCategory === 2 ? "active" : ""}
                    onClick={() => setActiveCategory(2)}
                >
                    ของหวาน
                </button>
                <button
                    className={activeCategory === "fav" ? "active" : ""}
                    onClick={() => {
                        if (!storedUser) {
                            setShowLoginPrompt(true);
                            return;
                        }
                        setActiveCategory("fav");
                    }}
                >
                    <FaHeart size={16} />
                    รายการโปรด
                </button>
            </div>

            {/* GRID */}
            <div className="food-grid">
                {loading ? (
                    <p>กำลังโหลดข้อมูล...</p>
                ) : filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => (
                        <div
                            key={food.food_id}
                            className="food-card"
                            onClick={() => {
                                setSelectedFood(food);
                                setSelectedMeal("breakfast");
                                setQuantity(1);
                            }}
                        >
                            <button
                                className="fav-btn"
                                onClick={(e) => toggleFavorite(e, food.food_id)}
                            >
                                {favFoodIds.includes(food.food_id) ? <FaHeart /> : <FaRegHeart />}
                            </button>
                            <div className="food-img-wrapper">
                                <img
                                    src={
                                        food.image?.startsWith("http")
                                            ? food.image
                                            : `http://localhost:5000${food.image}`
                                    }
                                    alt={food.food_name}
                                />
                            </div>
                            <div className="food-info">
                                <h3>{food.food_name}</h3>
                                <p>{Number(food.calories).toFixed(0)} kcal</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">ไม่พบเมนูอาหาร</div>
                )}
            </div>

            {/* MODAL */}
            {selectedFood && (() => {
                const recipeSections = parseRecipeDetails(selectedFood.recipe_details);
                return (
                    <div className="modal-overlay" onClick={() => setSelectedFood(null)}>
                        <div className="food-modal" onClick={(e) => e.stopPropagation()}>

                            <button
                                className="bookmark-btn"
                                onClick={(e) => toggleFavorite(e, selectedFood.food_id)}
                            >
                                {favFoodIds.includes(selectedFood.food_id) ? <FaHeart /> : <FaRegHeart />}
                            </button>

                            {/* ===== LEFT ===== */}
                            <div className="food-modal-left">
                                <img
                                    src={
                                        selectedFood.image?.startsWith("http")
                                            ? selectedFood.image
                                            : `http://localhost:5000${selectedFood.image}`
                                    }
                                    alt={selectedFood.food_name}
                                    className="food-modal-image"
                                />

                                {selectedFood.description && selectedFood.description.trim() !== "" && (
                                    <div className="food-section">
                                        <h4>รายละเอียดอาหาร</h4>
                                        <div className="food-box detail-text">
                                            {selectedFood.description}
                                        </div>
                                    </div>
                                )}

                                {recipeSections.length > 0 && (
                                    <div className="food-section">
                                        <h4>ส่วนผสม / วิธีทำ</h4>
                                        {recipeSections.map((section, sIdx) => (
                                            <div key={sIdx} className="recipe-section-block">
                                                {section.section_name && section.section_name.trim() !== "" && (
                                                    <p className="recipe-section-name">{section.section_name}</p>
                                                )}
                                                {section.blocks?.map((block, bIdx) => (
                                                    <div key={bIdx} className="recipe-block">
                                                        {block.block_title && block.block_title.trim() !== "" && (
                                                            <p className="recipe-block-title">{block.block_title}</p>
                                                        )}
                                                        {block.content && block.content.trim() !== "" && (
                                                            <div className="food-box detail-text recipe-block-content">
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
                                    <div className="food-section">
                                        <h4>หมายเหตุ</h4>
                                        <div className="food-box food-box--note">
                                            {selectedFood.notes}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ===== RIGHT ===== */}
                            <div className="food-modal-right">
                                <h2>{selectedFood.food_name}</h2>

                                <div className="food-section">
                                    <h4>คุณค่าทางโภชนาการ</h4>
                                    <div className="nutrition-grid">
                                        <div className="nutri-card calorie">
                                            <MdLocalFireDepartment className="nutri-icon" />
                                            <p className="nutri-label">แคลอรี่</p>
                                            <span>{formatNumber(selectedFood.calories)} kcal</span>
                                        </div>
                                        <div className="nutri-card carb">
                                            <FaBreadSlice className="nutri-icon" />
                                            <p className="nutri-label">คาร์บ</p>
                                            <span>{formatNumber(selectedFood.carbohydrates)} g</span>
                                        </div>
                                        <div className="nutri-card protein">
                                            <FaDrumstickBite className="nutri-icon" />
                                            <p className="nutri-label">โปรตีน</p>
                                            <span>{formatNumber(selectedFood.protein)} g</span>
                                        </div>
                                        <div className="nutri-card fat">
                                            <FaTint className="nutri-icon" />
                                            <p className="nutri-label">ไขมัน</p>
                                            <span>{formatNumber(selectedFood.fat)} g</span>
                                        </div>
                                        <div className="nutri-card sugar">
                                            <FaCandyCane className="nutri-icon" />
                                            <p className="nutri-label">น้ำตาล</p>
                                            <span>{formatNumber(selectedFood.sugar)} g</span>
                                        </div>
                                        <div className="nutri-card sodium">
                                            <FaMortarPestle className="nutri-icon" />
                                            <p className="nutri-label">โซเดียม</p>
                                            <span>{formatNumber(selectedFood.sodium)} mg</span>
                                        </div>
                                    </div>
                                </div>

                                {/* MEAL SELECT */}
                                <div className="food-section">
                                    <h4>เลือกมื้ออาหาร</h4>
                                    <div className="meal-buttons">
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

                                {/* QUANTITY */}
                                <div className="quantity-section">
                                    <h4>จำนวน</h4>
                                    <div className="quantity-control">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => setQuantity((p) => Math.max(1, p - 1))}
                                        >
                                            -
                                        </button>
                                        <span className="quantity-value">{quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => setQuantity((p) => p + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button className="add-btn" onClick={addToMealPlan}>
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

export default MenuFood;
