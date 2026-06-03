import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheckCircle,
  FaPauseCircle,
  FaIceCream,
  FaCoffee,
  FaHamburger,
  FaPizzaSlice,
  FaFish,
  FaAppleAlt,
  FaUtensils,
  FaGlassWhiskey
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./ManageCategories.css";

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/categories"
      );

      setCategories(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "ต้องการลบหมวดหมู่นี้หรือไม่ ?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `http://localhost:5000/api/categories/${id}`
      );

      fetchCategories();

    } catch (error) {

      console.log(error);

    }
  };

  const getCategoryIcon = (categoryName = "") => {

    const name = categoryName.toLowerCase();

    if (
      name.includes("หวาน") ||
      name.includes("เบเกอรี่") ||
      name.includes("เค้ก") ||
      name.includes("ขนม")
    ) {
      return <FaIceCream />;
    }

    if (
      name.includes("เครื่องดื่ม") ||
      name.includes("ชา") ||
      name.includes("กาแฟ") ||
      name.includes("น้ำ")
    ) {
      return <FaCoffee />;
    }

    if (
      name.includes("ทะเล") ||
      name.includes("ปลา") ||
      name.includes("กุ้ง")
    ) {
      return <FaFish />;
    }

    if (
      name.includes("ผลไม้")
    ) {
      return <FaAppleAlt />;
    }

    if (
      name.includes("pizza")
    ) {
      return <FaPizzaSlice />;
    }

    if (
      name.includes("beer") ||
      name.includes("cocktail")
    ) {
      return <FaGlassWhiskey />;
    }

    if (
      name.includes("คาว") ||
      name.includes("อาหาร") ||
      name.includes("ข้าว")
    ) {
      return <FaHamburger />;
    }

    return <FaUtensils />;
  };

  const filteredCategories = categories.filter((item) =>
    item.category_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="mc-page">

      <div className="mc-hero">

        <div className="mc-hero-content">

          <div className="mc-hero-icon">
            <FaUtensils />
          </div>

          <div>

            <h1>
              จัดการหมวดหมู่อาหาร
            </h1>

            <p>
              เพิ่ม แก้ไข และลบหมวดหมู่อาหารในระบบ
            </p>

          </div>

        </div>

        <button
          className="mc-add-btn"
          onClick={() =>
            navigate("/admin/add-category")
          }
        >
          <FaPlus />
          เพิ่มหมวดหมู่
        </button>

      </div>

      <div className="mc-stats-grid">

        <div className="mc-stat-card">

          <div className="mc-stat-icon orange">
            <FaUtensils />
          </div>

          <div>

            <h2>
              {categories.length}
            </h2>

            <span>
              หมวดหมู่ทั้งหมด
            </span>

          </div>

        </div>

        <div className="mc-stat-card">

          <div className="mc-stat-icon green">
            <FaCheckCircle />
          </div>

          <div>

            <h2>
              {
                categories.filter(
                  item =>
                    item.status === "active"
                ).length
              }
            </h2>

            <span>
              ใช้งานอยู่
            </span>

          </div>

        </div>

        <div className="mc-stat-card">

          <div className="mc-stat-icon gray">
            <FaPauseCircle />
          </div>

          <div>

            <h2>
              {
                categories.filter(
                  item =>
                    item.status !== "active"
                ).length
              }
            </h2>

            <span>
              ปิดใช้งาน
            </span>

          </div>

        </div>

      </div>

      <div className="mc-search-box">

        <FaSearch />

        <input
          type="text"
          placeholder="ค้นหาหมวดหมู่อาหาร..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      <div className="mc-category-grid">

        {filteredCategories.map((item) => (

          <div
            className="mc-category-card"
            key={item.category_id}
          >

            <div className="mc-card-top">

              <div className="mc-card-icon">
                {getCategoryIcon(item.category_name)}
              </div>

            </div>

            <h3>
              {item.category_name}
            </h3>

            <div className="mc-status-row">

              <span
                className={
                  item.status === "active"
                    ? "mc-badge active"
                    : "mc-badge inactive"
                }
              >
                {item.status}
              </span>

            </div>

            <div className="mc-card-actions">

              <button
                className="mc-edit-btn"
                onClick={() =>
                  navigate(
                    `/admin/edit-category/${item.category_id}`
                  )
                }
              >
                <FaEdit />
                แก้ไข
              </button>

              <button
                className="mc-delete-btn"
                onClick={() =>
                  handleDelete(item.category_id)
                }
              >
                <FaTrash />
                ลบ
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default ManageCategories;