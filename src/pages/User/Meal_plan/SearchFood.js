import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaSearch,
  FaHeart,
  FaRegHeart,
  FaBreadSlice,
  FaDrumstickBite,
  FaTint,
  FaMortarPestle,
  FaCandyCane
} from "react-icons/fa";
import { MdLocalFireDepartment } from "react-icons/md";
import "./SearchFood.css";

function SearchFood() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const mealType = queryParams.get("type") || "มื้อเช้า";

  const mode = queryParams.get("mode") || "normal";
  const storageKey = mode === "plan" ? "plan_plate" : "myplate";

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [favFoodIds, setFavFoodIds] = useState([]);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = storedUser?.user_id || null;

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
          if (favRes.ok) {
            setFavFoodIds(favData.map(fav => fav.food_id));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUserId]);

  const toggleFavorite = async (e, foodId) => {
    e.stopPropagation();
    if (!storedUser) {
      alert("กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด");
      return;
    }
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

  const filteredFoods = useMemo(() => {
    return foods.filter(f => {
      const matchSearch = f.food_name.toLowerCase().includes(searchTerm.toLowerCase());
      let matchCategory = true;
      if (activeCategory === "fav") {
        matchCategory = favFoodIds.includes(f.food_id);
      } else if (activeCategory !== "all") {
        matchCategory = f.category_id === activeCategory;
      }
      return matchSearch && matchCategory;
    });
  }, [foods, searchTerm, activeCategory, favFoodIds]);

  const openModal = (food) => {
    setSelectedFood(food);
    setQuantity(1);
  };

  const handleAddToPlate = () => {
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

    localStorage.setItem(storageKey, JSON.stringify([...currentPlate, newMeal]));
    navigate(`/MyPlate?mode=${mode}`);
  };

  return (
    <div className="sf-container">

      {/* HEADER */}
      <header className="sf-header">
        <button className="sf-back-icon" onClick={() => navigate(-1)}>
          <FaChevronLeft />
        </button>
        <h2 className="sf-title">เลือกอาหารสำหรับ {mealType}</h2>
      </header>

      {/* SEARCH */}
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

      {/* CATEGORY */}
      <div className="sf-category-tabs">
        <button
          className={`sf-tab ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => setActiveCategory("all")}
        >
          ทั้งหมด
        </button>
        <button
          className={`sf-tab ${activeCategory === 1 ? "active" : ""}`}
          onClick={() => setActiveCategory(1)}
        >
          ของคาว
        </button>
        <button
          className={`sf-tab ${activeCategory === 2 ? "active" : ""}`}
          onClick={() => setActiveCategory(2)}
        >
          ของหวาน
        </button>
        <button
          className={`sf-tab ${activeCategory === "fav" ? "active" : ""}`}
          onClick={() => {
            if (!storedUser) {
              alert("กรุณาเข้าสู่ระบบก่อนดูรายการโปรด");
              return;
            }
            setActiveCategory("fav");
          }}
        >
          <FaHeart size={14} />
          รายการโปรด
        </button>
      </div>

      {/* GRID */}
      <div className="sf-food-grid">
        {loading ? (
          <p className="sf-loading">กำลังโหลดข้อมูล...</p>
        ) : filteredFoods.length > 0 ? (
          filteredFoods.map(food => (
            <div
              key={food.food_id}
              className="sf-food-card"
              onClick={() => openModal(food)}
            >
              <button
                className="sf-card-fav-btn"
                onClick={(e) => toggleFavorite(e, food.food_id)}
              >
                {favFoodIds.includes(food.food_id) ? <FaHeart /> : <FaRegHeart />}
              </button>
              <div className="sf-img-wrapper">
                <img
                  src={food.image?.startsWith("http") ? food.image : `http://localhost:5000${food.image}`}
                  alt={food.food_name}
                  className="sf-food-image"
                />
              </div>
              <div className="sf-food-info">
                <h4>{food.food_name}</h4>
                <p>{formatNumber(food.calories)} kcal</p>
              </div>
            </div>
          ))
        ) : (
          <div className="sf-empty-state">ไม่พบรายการอาหารที่ค้นหา</div>
        )}
      </div>

      {/* MODAL */}
      {selectedFood && (() => {
        const recipeSections = parseRecipeDetails(selectedFood.recipe_details);
        return (
          <div className="sf-modal-overlay" onClick={() => setSelectedFood(null)}>
            <div
              className="sf-modal-content sf-detail-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <button
                className="sf-bookmark-btn"
                onClick={(e) => toggleFavorite(e, selectedFood.food_id)}
              >
                {favFoodIds.includes(selectedFood.food_id) ? <FaHeart /> : <FaRegHeart />}
              </button>

              {/* ===== LEFT ===== */}
              <div className="sf-detail-left">
                <img
                  src={selectedFood.image?.startsWith("http") ? selectedFood.image : `http://localhost:5000${selectedFood.image}`}
                  alt={selectedFood.food_name}
                  className="sf-detail-image"
                />

                {/* คำอธิบายสั้นๆ — แสดงเมื่อมีข้อมูล */}
                {selectedFood.description && selectedFood.description.trim() !== "" && (
                  <div className="sf-detail-section">
                    <h4>รายละเอียดอาหาร</h4>
                    <div className="sf-detail-description">
                      {selectedFood.description}
                    </div>
                  </div>
                )}

                {/* recipe_details — ส่วนผสม/วิธีทำ จากแอดมิน */}
                {recipeSections.length > 0 && (
                  <div className="sf-detail-section">
                    <h4>ส่วนผสม / วิธีทำ</h4>
                    {recipeSections.map((section, sIdx) => (
                      <div key={sIdx} className="sf-recipe-section-block">
                        {section.section_name && section.section_name.trim() !== "" && (
                          <p className="sf-recipe-section-name">{section.section_name}</p>
                        )}
                        {section.blocks?.map((block, bIdx) => (
                          <div key={bIdx} className="sf-recipe-block">
                            {block.block_title && block.block_title.trim() !== "" && (
                              <p className="sf-recipe-block-title">{block.block_title}</p>
                            )}
                            {block.content && block.content.trim() !== "" && (
                              <div className="sf-detail-description sf-recipe-block-content">
                                {block.content}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* หมายเหตุ — แสดงเฉพาะถ้ามีข้อมูล */}
                {selectedFood.notes && selectedFood.notes.trim() !== "" && (
                  <div className="sf-detail-section">
                    <h4>หมายเหตุ</h4>
                    <div className="sf-detail-note">
                      {selectedFood.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* ===== RIGHT ===== */}
              <div className="sf-detail-right">
                <h2 className="sf-detail-title">{selectedFood.food_name}</h2>

                <div className="sf-detail-section">
                  <h4>คุณค่าทางโภชนาการ</h4>
                  <div className="sf-nutrition-grid">
                    <div className="sf-nutrition-card calorie">
                      <MdLocalFireDepartment className="sf-nutrition-icon" />
                      <p>แคลอรี่</p>
                      <span>{formatNumber(selectedFood.calories)} kcal</span>
                    </div>
                    <div className="sf-nutrition-card carb">
                      <FaBreadSlice className="sf-nutrition-icon" />
                      <p>คาร์บ</p>
                      <span>{formatNumber(selectedFood.carbohydrates)} g</span>
                    </div>
                    <div className="sf-nutrition-card protein">
                      <FaDrumstickBite className="sf-nutrition-icon" />
                      <p>โปรตีน</p>
                      <span>{formatNumber(selectedFood.protein)} g</span>
                    </div>
                    <div className="sf-nutrition-card fat">
                      <FaTint className="sf-nutrition-icon" />
                      <p>ไขมัน</p>
                      <span>{formatNumber(selectedFood.fat)} g</span>
                    </div>
                    <div className="sf-nutrition-card sugar">
                      <FaCandyCane className="sf-nutrition-icon" />
                      <p>น้ำตาล</p>
                      <span>{formatNumber(selectedFood.sugar)} g</span>
                    </div>
                    <div className="sf-nutrition-card sodium">
                      <FaMortarPestle className="sf-nutrition-icon" />
                      <p>โซเดียม</p>
                      <span>{formatNumber(selectedFood.sodium)} mg</span>
                    </div>
                  </div>
                </div>

                {/* QUANTITY */}
                <div className="sf-qty-controls">
                  <button
                    className="sf-qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="sf-qty-number">{quantity}</span>
                  <button
                    className="sf-qty-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>

                {/* ACTION */}
                <div className="sf-action-btns">
                  <button className="sf-cancel-btn" onClick={() => setSelectedFood(null)}>
                    ยกเลิก
                  </button>
                  <button className="sf-add-btn" onClick={handleAddToPlate}>
                    เพิ่มลงจาน
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default SearchFood;
