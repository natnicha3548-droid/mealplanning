import React, { useState, useEffect, useMemo } from "react";
import { FaSearch, FaHeart, FaRegHeart } from "react-icons/fa";
import { MdDinnerDining } from "react-icons/md";
import { LuSoup } from "react-icons/lu";
import { Link } from "react-router-dom";
import "./MenuFood.css";

function MenuFood() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedFood, setSelectedFood] = useState(null);
    const [selectedMeal, setSelectedMeal] = useState("breakfast");
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (selectedFood) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [selectedFood]);

    const [favFoodIds, setFavFoodIds] = useState([]);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = storedUser?.user_id || 1;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const foodRes = await fetch("http://localhost:5000/api/foods");
                const foodData = await foodRes.json();
                setFoods(foodData);

                const favRes = await fetch(`http://localhost:5000/api/favorite-foods?user_id=${currentUserId}`);
                const favData = await favRes.json();
                if (favRes.ok) {
                    setFavFoodIds(favData.map(f => f.food_id));
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
        const isFav = favFoodIds.includes(foodId);

        if (isFav) {
            setFavFoodIds(favFoodIds.filter(id => id !== foodId));
        } else {
            setFavFoodIds([...favFoodIds, foodId]);
        }

        try {
            await fetch("http://localhost:5000/api/favorite-food", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: currentUserId, food_id: foodId })
            });
        } catch (err) {
            console.error(err);
        }
    };

    // ================= ADD FOOD =================
    const addToMealPlan = () => {
        if (!selectedFood) {
            alert("กรุณาเลือกอาหาร");
            return;
        }

        const myPlate = JSON.parse(localStorage.getItem("myplate")) || [];
        const mealMap = {
            breakfast: "เช้า",
            lunch: "กลางวัน",
            dinner: "เย็น"
        };
        
        const newItem = {
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
                sodium: Number(selectedFood.sodium)
            }
        };

        myPlate.push(newItem);
        localStorage.setItem("myplate", JSON.stringify(myPlate));
        alert("เพิ่มลงจานอาหารแล้ว");
        setSelectedFood(null);
        setQuantity(1);
    };

    // ================= FILTER =================
    const filteredFoods = useMemo(() => {
        return foods.filter(food => {
            const matchSearch = (food.food_name || "").toLowerCase().includes(searchTerm.toLowerCase());
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
            {/* HEADER */}
            <div className="menu-header">
                <div className="menu-title-box">
                    <div className="menu-icon">
                        <LuSoup />
                    </div>
                    <div>
                        <h1>เมนูอาหารทั้งหมด</h1>
                        <p>เลือกอาหารที่คุณชอบ</p>
                    </div>
                </div>

                {/* SEARCH + PLATE */}
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
                <button className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>ทั้งหมด</button>
                <button className={activeCategory === 1 ? "active" : ""} onClick={() => setActiveCategory(1)}>ของคาว</button>
                <button className={activeCategory === 2 ? "active" : ""} onClick={() => setActiveCategory(2)}>ของหวาน</button>
                <button className={activeCategory === "fav" ? "active" : ""} onClick={() => setActiveCategory("fav")}>❤️ รายการโปรด</button>
            </div>

            {/* GRID */}
            <div className="food-grid">
                {loading ? (
                    <p>กำลังโหลดข้อมูล...</p>
                ) : filteredFoods.length > 0 ? (
                    filteredFoods.map(food => (
                        <div
                            key={food.food_id}
                            className="food-card"
                            onClick={() => {
                                setSelectedFood(food);
                                setSelectedMeal("breakfast");
                                setQuantity(1);
                            }}
                        >
                            <button className="fav-btn" onClick={(e) => toggleFavorite(e, food.food_id)}>
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
            {selectedFood && (
                <div className="modal-overlay" onClick={() => setSelectedFood(null)}>
                    <div className="food-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="bookmark-btn" onClick={(e) => toggleFavorite(e, selectedFood.food_id)}>
                            {favFoodIds.includes(selectedFood.food_id) ? <FaHeart /> : <FaRegHeart />}
                        </button>

                        {/* LEFT */}
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
                            <div className="food-section">
                                <h4>รายละเอียดอาหาร</h4>
                                <div className="food-box detail-text">
                                    {selectedFood.description || "ไม่มีรายละเอียดอาหาร"}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="food-modal-right">
                            <h2>{selectedFood.food_name}</h2>
                            <div className="food-section">
                                <h4>คุณค่าทางโภชนาการ</h4>
                                <div className="nutrition-grid">
                                    <div>🔥<span>{selectedFood.calories} kcal</span>แคลอรี่</div>
                                    <div>🍞<span>{selectedFood.carbohydrates} g</span>คาร์โบไฮเดรต</div>
                                    <div>🥩<span>{selectedFood.protein} g</span>โปรตีน</div>
                                    <div>🧈<span>{selectedFood.fat} g</span>ไขมัน</div>
                                    <div>🍭<span>{selectedFood.sugar} g</span>น้ำตาล</div>
                                    <div>🧂<span>{selectedFood.sodium} mg</span>โซเดียม</div>
                                </div>
                            </div>

                            {/* MEAL SELECT */}
                            <div className="food-section">
                                <h4>เลือกมื้ออาหาร</h4>
                                <div className="meal-buttons">
                                    <button className={selectedMeal === "breakfast" ? "active" : ""} onClick={() => setSelectedMeal("breakfast")}>เช้า</button>
                                    <button className={selectedMeal === "lunch" ? "active" : ""} onClick={() => setSelectedMeal("lunch")}>กลางวัน</button>
                                    <button className={selectedMeal === "dinner" ? "active" : ""} onClick={() => setSelectedMeal("dinner")}>เย็น</button>
                                </div>
                            </div>

                            {/* QUANTITY */}
                            <div className="quantity-section">
                                <h4>จำนวน</h4>
                                <div className="quantity-control">
                                    <button className="quantity-btn" onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                                    <span className="quantity-value">{quantity}</span>
                                    <button className="quantity-btn" onClick={() => setQuantity(prev => prev + 1)}>+</button>
                                </div>
                            </div>

                            <button className="add-btn" onClick={addToMealPlan}>เพิ่มใส่จานอาหาร</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MenuFood;