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
  FaFish,
  FaAppleAlt,
  FaTags,
  FaGlassWhiskey,
  FaUtensils,
  FaFire,
  FaFireAlt,
  FaLeaf,
  FaSeedling,
  FaPepperHot,
  FaDrumstickBite,
  FaCookieBite,
  FaMortarPestle,
  FaWater,
  FaEgg,
  FaBlender,
  FaHotdog,
  FaMugHot,
  FaLemon
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

    // ของหวาน / ขนม / เบเกอรี่ → ไอศกรีม
    if (
      name.includes("หวาน") ||
      name.includes("เบเกอรี่") ||
      name.includes("เค้ก") ||
      name.includes("ขนม")
    ) {
      return <FaIceCream />;
    }

    // น้ำพริก / เครื่องจิ้ม → พริก (ต้องมาก่อน "น้ำ")
    if (
      name.includes("น้ำพริก") ||
      name.includes("เครื่องจิ้ม") ||
      name.includes("พริก")
    ) {
      return <FaPepperHot />;
    }

    // น้ำต้มกระดูก / ต้มยำ / ต้มข่า / ต้มจืด → หม้อ (ต้องมาก่อน "ต้ม" และ "น้ำ")
    if (
      name.includes("น้ำต้ม") ||
      name.includes("กระดูก") ||
      name.includes("ต้มยำ") ||
      name.includes("ต้มข่า") ||
      name.includes("ต้มจืด")
    ) {
      return <GiCookingPot />;
    }

    // เครื่องดื่ม / ชา / กาแฟ / น้ำ → กาแฟ
    if (
      name.includes("เครื่องดื่ม") ||
      name.includes("ชา") ||
      name.includes("กาแฟ") ||
      name.includes("น้ำ")
    ) {
      return <FaCoffee />;
    }

    // แกง → ครก (โขลกเครื่องแกง)
    if (name.includes("แกง")) {
      return <FaMortarPestle />;
    }

    // ต้ม (ทั่วไป) → เปลวไฟ
    if (name.includes("ต้ม")) {
      return <FaFire />;
    }

    // ทอด → ไข่ (สื่อถึงการทอดในกระทะ)
    if (name.includes("ทอด")) {
      return <FaEgg />;
    }

    // ปิ้ง ย่าง (ต้องมาก่อน "ย่าง") → เปลวไฟลายต่าง
    if (name.includes("ปิ้ง")) {
      return <FaFireAlt />;
    }

    // ผัด → เครื่องปั่น (สื่อถึงการคนผัด)
    if (name.includes("ผัด")) {
      return <FaBlender />;
    }

    // ย่าง / ย่า → ไส้กรอกย่าง
    if (
      name.includes("ย่าง") ||
      name.includes("ย่า")
    ) {
      return <FaHotdog />;
    }

    // นึ่ง → น้ำ (สื่อถึงไอน้ำ)
    if (name.includes("นึ่ง")) {
      return <FaWater />;
    }

    // ลาบ / ก้อย → ชิ้นเนื้อ
    if (
      name.includes("ลาบ") ||
      name.includes("ก้อย")
    ) {
      return <FaDrumstickBite />;
    }

    // พล่า → ใบไม้
    if (name.includes("พล่า")) {
      return <FaLeaf />;
    }

    // ยำ / สลัด → มะนาว (วัตถุดิบหลักของยำ)
    if (
      name.includes("ยำ") ||
      name.includes("สลัด")
    ) {
      return <FaLemon />;
    }

    // ข้าว → ต้นกล้า
    if (name.includes("ข้าว")) {
      return <FaSeedling />;
    }

    // อาหารว่าง / ของว่าง → คุกกี้
    if (
      name.includes("อาหารว่าง") ||
      name.includes("ของว่าง") ||
      name.includes("สแนก")
    ) {
      return <FaCookieBite />;
    }

    // ทะเล / ปลา / กุ้ง / ปู / หอย → ปลา
    if (
      name.includes("ทะเล") ||
      name.includes("ปลา") ||
      name.includes("กุ้ง") ||
      name.includes("ปู") ||
      name.includes("หอย")
    ) {
      return <FaFish />;
    }

    // ผลไม้ → แอปเปิ้ล
    if (name.includes("ผลไม้")) {
      return <FaAppleAlt />;
    }

    // เครื่องดื่มแอลกอฮอล์
    if (
      name.includes("beer") ||
      name.includes("cocktail") ||
      name.includes("เบียร์") ||
      name.includes("ค็อกเทล") ||
      name.includes("เหล้า")
    ) {
      return <FaGlassWhiskey />;
    }

    // ของคาว / อาหาร (ทั่วไป) → ช้อนส้อม
    if (
      name.includes("คาว") ||
      name.includes("อาหาร")
    ) {
      return <FaUtensils />;
    }

    // default
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
