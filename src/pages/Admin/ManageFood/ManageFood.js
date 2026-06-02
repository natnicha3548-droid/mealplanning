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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = () => {
    fetch("http://localhost:5000/api/foods")
      .then((res) => res.json())
      .then((data) => setFoods(data))
      .catch((err) => console.log(err));
  };

  const handleDelete = async (foodId) => {

    const confirmDelete = window.confirm(
      "ต้องการลบอาหารนี้หรือไม่ ?"
    );

    if (!confirmDelete) return;

    try {

      const res = await fetch(
        `http://localhost:5000/api/foods/${foodId}`,
        {
          method: "DELETE"
        }
      );

      const data = await res.json();

      if (data.success) {

        setFoods(
          foods.filter(
            (food) => food.food_id !== foodId
          )
        );

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
      category === "ทั้งหมด" ||
      (category === "ของคาว" && food.category_id === 1) ||
      (category === "ของหวาน" && food.category_id !== 1);

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
            <h1 className="food-heading">
              จัดการข้อมูลอาหาร
            </h1>
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

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>ทั้งหมด</option>
          <option>ของคาว</option>
          <option>ของหวาน</option>
        </select>

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

      <div className="food-grid">

        {filteredFoods.map((food) => (

          <div
            className="food-card"
            key={food.food_id}
          >

            <img
              src={
                food.image?.startsWith("http")
                  ? food.image
                  : `http://localhost:5000${food.image}`
              }
              alt={food.food_name}
              className="food-image"
            />

            <div className="food-content">

              <h3>{food.food_name}</h3>

              <span
                className={`food-category ${food.category_id === 1
                    ? "savory-tag"
                    : "sweet-tag"
                  }`}
              >
                {food.category_id === 1
                  ? "ของคาว"
                  : "ของหวาน"}
              </span>

              <div className="food-actions">

                <button className="edit-btn">
                  <FaEdit />
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(food.food_id)
                  }
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