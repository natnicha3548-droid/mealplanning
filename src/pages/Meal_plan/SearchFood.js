import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaSearch, FaHeart, FaRegHeart } from "react-icons/fa"; // 🌟 เพิ่ม FaHeart, FaRegHeart
import "./SearchFood.css";

function SearchFood() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const mealType = queryParams.get("type") || "มื้อเช้า";

  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); // 'all', 1, 2, 'fav'
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  // 🌟 State สำหรับเก็บรายการ ID อาหารที่กดถูกใจไว้
  const [favFoodIds, setFavFoodIds] = useState([]);

  // ดึงข้อมูล User ปัจจุบัน
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = storedUser ? storedUser.user_id : 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ดึงข้อมูลอาหารทั้งหมด
        const foodRes = await fetch("http://localhost:5000/api/foods");
        const foodData = await foodRes.json();
        setFoods(foodData);

        // 2. ดึงข้อมูลว่า User คนนี้เคยกดถูกใจเมนูไหนไว้บ้าง
        const favRes = await fetch(`http://localhost:5000/api/favorite-foods?user_id=${currentUserId}`);
        const favData = await favRes.json();
        if (favRes.ok) {
          // เก็บเฉพาะ food_id ลงใน Array [1, 5, 12, ...]
          setFavFoodIds(favData.map(fav => fav.food_id));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [currentUserId]);

  // 🌟 ฟังก์ชันกดสลับหัวใจ (เพิ่ม/ลบ รายการโปรด)
  const toggleFavorite = async (e, foodId) => {
    e.stopPropagation(); // ป้องกันไม่ให้คลิกทะลุไปเปิด Modal
    
    // อัปเดตหน้าจอทันทีเพื่อให้ผู้ใช้รู้สึกว่าแตะปุ๊บเปลี่ยนปั๊บ (Optimistic UI)
    if (favFoodIds.includes(foodId)) {
      setFavFoodIds(favFoodIds.filter(id => id !== foodId)); // ลบออก
    } else {
      setFavFoodIds([...favFoodIds, foodId]); // เพิ่มเข้า
    }

    // ส่งคำสั่งไปบันทึกลง Database
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

  // 🌟 กรองข้อมูลตาม "คำค้นหา", "หมวดหมู่" และ "รายการโปรด"
  const filteredFoods = foods.filter(f => {
    const matchSearch = f.food_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchCategory = true;
    if (activeCategory === "fav") {
      // ถ้าเลือกแท็บรายการโปรด ให้เช็กว่า food_id อยู่ใน favFoodIds หรือไม่
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
    const currentPlate = JSON.parse(localStorage.getItem("draft_plate")) || [];
    
    const newMeal = {
      id: Date.now(),
      food_id: selectedFood.food_id,
      name: selectedFood.food_name,
      image: selectedFood.image,
      type: mealType,
      qty: quantity,
      calPerUnit: Number(selectedFood.calories) || 0,
      macros: {
        carbs: 50,
        protein: 20,
        fat: 10,
        sugar: 5,
        sodium: 500
      }
    };

    localStorage.setItem("draft_plate", JSON.stringify([...currentPlate, newMeal]));
    navigate("/MyPlate");
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

      {/* 🌟 เพิ่มแท็บ "รายการโปรด" */}
      <div className="sf-category-tabs">
        <button className={`sf-tab ${activeCategory === "all" ? "active" : ""}`} onClick={() => setActiveCategory("all")}>
          ทั้งหมด
        </button>
        <button className={`sf-tab ${activeCategory === 1 ? "active" : ""}`} onClick={() => setActiveCategory(1)}>
          ของคาว
        </button>
        <button className={`sf-tab ${activeCategory === 2 ? "active" : ""}`} onClick={() => setActiveCategory(2)}>
          ของหวาน
        </button>
        <button className={`sf-tab ${activeCategory === "fav" ? "active" : ""}`} onClick={() => setActiveCategory("fav")}>
          ❤️ รายการโปรด
        </button>
      </div>

      <div className="sf-food-grid">
        {filteredFoods.length > 0 ? (
          filteredFoods.map(food => (
            <div key={food.food_id} className="sf-food-card" onClick={() => openModal(food)} style={{ position: "relative" }}>
              
              {/* 🌟 ปุ่มกดหัวใจมุมขวาบนของการ์ด */}
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
                <img src={food.image} alt={food.food_name} className="sf-food-image" />
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

      {/* Modal Popup (ส่วนนี้เหมือนเดิม) */}
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