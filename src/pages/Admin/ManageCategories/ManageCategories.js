import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCheckCircle,
  FaPauseCircle,
  FaTags,
  FaFireAlt,
  FaPepperHot,
  FaWater,
  FaEgg,
  FaBlender,
  FaLemon,
  FaUtensils,
  FaCookie
} from "react-icons/fa";
import { GiCookingPot } from "react-icons/gi";
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

    // ผัด
    if (name.includes("ผัด")) {
      return <FaUtensils />
    }

    // ทอด → ไข่ (สื่อถึงการทอดในกระทะ)
    if (name.includes("ทอด")) {
      return <FaEgg />;
    }

    // แกง/ต้ม → หม้อ
    if (
      name.includes("แกง") ||
      name.includes("ต้ม")
    ) {
      return <GiCookingPot />;
    }

    // ยำ → มะนาว (วัตถุดิบหลักของยำ)
    if (name.includes("ยำ")) {
      return <FaLemon />;
    }

    // นึ่ง/หุง → น้ำ (สื่อถึงไอน้ำ)
    if (
      name.includes("นึ่ง") ||
      name.includes("หุง")
    ) {
      return <FaWater />;
    }

    // ปิ้ง/ย่าง → เปลวไฟลายต่าง
    if (
      name.includes("ปิ้ง") ||
      name.includes("ย่าง")
    ) {
      return <FaFireAlt />;
    }

    // ของว่าง / ขนม
    if (
      name.includes("ของว่าง")
    ) {
      return <FaCookie />;
    }

    // default (หมวดหมู่อื่นที่อาจเพิ่มในอนาคต)
    return <FaTags />;
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
            <FaTags />
          </div>
          <div>
            <h2>จัดการหมวดหมู่อาหาร</h2>
          </div>
        </div>

        <button className="mc-add-btn" onClick={() => navigate("/admin/add-category")}>
          <FaPlus /> เพิ่มหมวดหมู่
        </button>

      </div>

      <div className="mc-stats-grid">

        <div className="mc-stat-card">

          <div className="mc-stat-icon orange">
            <FaTags />
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
