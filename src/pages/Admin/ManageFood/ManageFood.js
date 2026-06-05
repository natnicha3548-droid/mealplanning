import React, { useEffect, useState } from "react";
import {
  FaUtensils,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./ManageFood.css";

function ManageFood() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadFoods();
    loadCategories();
  }, []);

  const loadFoods = () => {
    fetch("http://localhost:5000/api/foods")
      .then((res) => res.json())
      .then((data) => setFoods(data))
      .catch((err) => console.log(err));
  };

  const loadCategories = () => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.log(err));
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.category_id === categoryId);
    return cat ? cat.category_name : "ไม่ระบุ";
  };

  const getSelectedLabel = () => {
    if (selectedCategoryId === "all") return "ทั้งหมด";
    const cat = categories.find((c) => c.category_id === selectedCategoryId);
    return cat ? cat.category_name : "ทั้งหมด";
  };

  const handleDelete = async (foodId) => {
    const confirmDelete = window.confirm("ต้องการลบอาหารนี้หรือไม่ ?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/foods/${foodId}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (data.success) {
        setFoods(foods.filter((food) => food.food_id !== foodId));
        alert("ลบอาหารสำเร็จ");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const filteredFoods = foods.filter((food) => {
    const matchSearch = food.food_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      selectedCategoryId === "all" || food.category_id === selectedCategoryId;

    return matchSearch && matchCategory;
  });

  return (
    <div className="food-page">

      <div className="food-header">

        <div className="food-title-wrapper">
          <div className="food-title-icon">
            <FaUtensils />
          </div>
          <div>
            <h1 className="food-heading">จัดการข้อมูลอาหาร</h1>
          </div>
        </div>

        <button
          className="food-add-btn"
          onClick={() => navigate("/admin/add-food")}
        >
          <FaPlus />
          เพิ่มรายการอาหาร
        </button>

      </div>

      <div className="food-toolbar">

        {/* Dropdown — โหลด category จาก API */}
        <div className="custom-dropdown">
          <div
            className="dropdown-selected"
            onClick={() => setIsOpen(!isOpen)}
          >
            {getSelectedLabel()}
            <span className={`arrow ${isOpen ? "open" : ""}`}>▼</span>
          </div>

          {isOpen && (
            <div className="dropdown-menu">
              <div
                className="dropdown-item"
                onClick={() => {
                  setSelectedCategoryId("all");
                  setIsOpen(false);
                }}
              >
                ทั้งหมด
              </div>
              {categories.map((cat) => (
                <div
                  key={cat.category_id}
                  className="dropdown-item"
                  onClick={() => {
                    setSelectedCategoryId(cat.category_id);
                    setIsOpen(false);
                  }}
                >
                  {cat.category_name}
                  {cat.status !== "active" && (
                    <span style={{ fontSize: "0.75rem", color: "#aaa", marginLeft: "6px" }}>
                      (ปิดใช้งาน)
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="food-search-box">
          <FaSearch className="food-search-icon" />
          <input
            type="text"
            placeholder="ค้นหาชื่ออาหาร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      <div className="admin-food-grid">

        {filteredFoods.map((food) => (
          <div className="admin-food-card" key={food.food_id}>

            <img
              src={
                food.image?.startsWith("http")
                  ? food.image
                  : `http://localhost:5000${food.image}`
              }
              alt={food.food_name}
              className="admin-food-image"
            />

            <div className="admin-food-content">

              <h3>{food.food_name}</h3>

              {/* badge แสดง category_name จริงจาก API */}
              <span className="admin-food-category category-tag">
                {getCategoryName(food.category_id)}
              </span>

              <div className="admin-food-actions">
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/admin/edit-food/${food.food_id}`)}
                >
                  <FaEdit />
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(food.food_id)}
                >
                  <FaTrash />
                </button>
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default ManageFood;
