import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaSearch, FaHeart, FaRegHeart } from "react-icons/fa";
import "./SearchFood.css";

function SearchFood() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const mealType = queryParams.get("type") || "มื้อเช้า";
  
  // 🌟 อ่านค่า mode และเลือกตะกร้าให้ตรงกับหน้า MyPlate ที่เรียกมา
  const mode = queryParams.get("mode") || "normal"; 
  const storageKey = mode === "plan" ? "plan_plate" : "myplate";

  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); 
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  const [favFoodIds, setFavFoodIds] = useState([]);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = storedUser ? storedUser.user_id : 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const foodRes = await fetch("http://localhost:5000/api/foods");
        const foodData = await foodRes.json();
        setFoods(foodData);

        const favRes = await fetch(`http://localhost:5000/api/favorite-foods?user_id=${currentUserId}`);
        const favData = await favRes.json();
        if (favRes.ok) {
          setFavFoodIds(favData.map(fav => fav.food_id));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [currentUserId]);

  const toggleFavorite = async (e, foodId) => {
    e.stopPropagation(); 
    if (favFoodIds.includes(foodId)) {
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
      console.error("Error toggling favorite:", err);
    }
  };

  const filteredFoods = foods.filter(f => {
    const matchSearch = f.food_name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchCategory = true;
    if (activeCategory === "fav") {
      matchCategory = favFoodIds.includes(f.food_id);
    } else if (activeCategory !== "all") {
      matchCategory = f.category_id === activeCategory;
    }
    return matchSearch && matchCategory;
  });

  const openModal = (food) => {
    setSelectedFood(food);
    setQuantity(1);
  };

  const handleAddToPlate = () => {
    // 🌟 ดึงข้อมูลจากตะกร้าที่ถูกต้อง
    const currentPlate = JSON.parse(localStorage.getItem(storageKey)) || [];
    const cleanMealType = mealType.replace("มื้อ", "");

    const newMeal = {
      id: Date.now(),
      food_id: selectedFood.food_id,
      name: selectedFood.food_name,
      image: selectedFood.image,
      qty: quantity,
      meal_type: cleanMealType,
      calPerUnit: Number(selectedFood.calories) || 0,
      macros: {
        carbs: Number(selectedFood.carbohydrates) || 0,
        protein: Number(selectedFood.protein) || 0,
        fat: Number(selectedFood.fat) || 0,
        sugar: Number(selectedFood.sugar) || 0,
        sodium: Number(selectedFood.sodium) || 0
      }
    };

    // 🌟 บันทึกลงตะกร้าที่ถูกต้อง
    localStorage.setItem(storageKey, JSON.stringify([...currentPlate, newMeal]));
    navigate(`/MyPlate?mode=${mode}`); // 🌟 เด้งกลับไปพร้อมโหมดเดิม
  };

  return (
    <div className="sf-container">
      <header className="sf-header">
        <button className="sf-back-icon" onClick={() => navigate(-1)}>
          <FaChevronLeft />
        </button>
        <h2 className="sf-title">เลือกอาหารสำหรับ {mealType}</h2>
      </header>

      <div className="sf-search-wrapper">
        <FaSearch className="sf-search-icon" />
        <input 
          type="text" 
          className="sf-search-input"
          placeholder="ค้นหาเมนูอาหาร..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="sf-category-tabs">
        <button className={`sf-tab ${activeCategory === "all" ? "active" : ""}`} onClick={() => setActiveCategory("all")}>ทั้งหมด</button>
        <button className={`sf-tab ${activeCategory === 1 ? "active" : ""}`} onClick={() => setActiveCategory(1)}>ของคาว</button>
        <button className={`sf-tab ${activeCategory === 2 ? "active" : ""}`} onClick={() => setActiveCategory(2)}>ของหวาน</button>
        <button className={`sf-tab ${activeCategory === "fav" ? "active" : ""}`} onClick={() => setActiveCategory("fav")}>❤️ รายการโปรด</button>
      </div>

      <div className="sf-food-grid">
        {filteredFoods.length > 0 ? (
          filteredFoods.map(food => (
            <div key={food.food_id} className="sf-food-card" onClick={() => openModal(food)} style={{ position: "relative" }}>
              <button 
                onClick={(e) => toggleFavorite(e, food.food_id)}
                style={{
                  position: "absolute", top: "10px", right: "10px", background: "white",
                  border: "none", borderRadius: "50%", padding: "8px", cursor: "pointer",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)", zIndex: 2, display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}
              >
                {favFoodIds.includes(food.food_id) ? <FaHeart color="#ff4757" size={18} /> : <FaRegHeart color="#ccc" size={18} />}
              </button>

              <div className="sf-img-wrapper">
                <img
                  src={
                    food.image?.startsWith("http")
                      ? food.image
                      : `http://localhost:5000${food.image}`
                  }
                  alt={food.food_name}
                  className="sf-food-image"
                />
              </div>
              <div className="sf-food-info">
                <h4>{food.food_name}</h4>
                <p>{Number(food.calories).toFixed(0)} kcal</p>
              </div>
            </div>
          ))
        ) : (
          <div className="sf-empty-state">ไม่พบรายการอาหารที่ค้นหา</div>
        )}
      </div>

      {selectedFood && (
        <div className="sf-modal-overlay">
          <div className="sf-modal-content">
            <h3 className="sf-modal-title">{selectedFood.food_name}</h3>
            <p className="sf-modal-cal">{Number(selectedFood.calories).toFixed(0)} kcal / {selectedFood.serving_size || "จาน"}</p>
            
            <div className="sf-qty-controls">
              <button className="sf-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span className="sf-qty-number">{quantity}</span>
              <button className="sf-qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>

            <div className="sf-action-btns">
              <button className="sf-cancel-btn" onClick={() => setSelectedFood(null)}>ยกเลิก</button>
              <button className="sf-add-btn" onClick={handleAddToPlate}>เพิ่มลงจาน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFood;