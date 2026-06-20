import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaPlus,
  FaUtensils,
  FaImage,
  FaFire,
  FaDrumstickBite,
  FaTint,
  FaTrash,
  FaPlusCircle
} from "react-icons/fa";

import {
  GiSugarCane,
  GiWheat
} from "react-icons/gi";

import { MdOutlineSoupKitchen } from "react-icons/md";

import "./AddFood.css";

function AddFood() {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");

  // โหลด categories จาก API
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    food_name: "",
    category_id: "",
    serving_size: "",
    calories: "",
    protein: "",
    fat: "",
    carbohydrates: "",
    sugar: "",
    sodium: "",
    description: "",
    notes: ""
  });

  const [recipeSections, setRecipeSections] = useState([
    {
      section_name: "",
      blocks: [{ block_title: "", content: "" }]
    }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data.filter((c) => c.status === "active"));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSection = () => {
    setRecipeSections([
      ...recipeSections,
      { section_name: "", blocks: [{ block_title: "", content: "" }] }
    ]);
  };

  const removeSection = (sectionIndex) => {
    const newSections = [...recipeSections];
    newSections.splice(sectionIndex, 1);
    setRecipeSections(newSections);
  };

  const handleSectionChange = (text, sectionIndex) => {
    const newSections = [...recipeSections];
    newSections[sectionIndex].section_name = text;
    setRecipeSections(newSections);
  };

  const addBlock = (sectionIndex) => {
    const newSections = [...recipeSections];
    newSections[sectionIndex].blocks.push({ block_title: "", content: "" });
    setRecipeSections(newSections);
  };

  const removeBlock = (sectionIndex, blockIndex) => {
    const newSections = [...recipeSections];
    newSections[sectionIndex].blocks.splice(blockIndex, 1);
    setRecipeSections(newSections);
  };

  const handleBlockChange = (field, text, sectionIndex, blockIndex) => {
    const newSections = [...recipeSections];
    newSections[sectionIndex].blocks[blockIndex][field] = text;
    setRecipeSections(newSections);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (image) {
        data.append("image", image);
      }

      data.append("recipe_details", JSON.stringify(recipeSections));

      const res = await fetch(
        "http://localhost:5000/api/foods",
        {
          method: "POST",
          body: data
        }
      );

      const result = await res.json();

      if (result.success) {
        alert("เพิ่มอาหารสำเร็จ");
        navigate("/admin/manage-food");
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.log(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="add-food-page">
      {/* Header */}
      <div className="add-food-page-header">
        <div className="add-food-header-icon">
          <FaUtensils />
        </div>
        <div className="add-food-header-content">
          <h2>เพิ่มข้อมูลอาหาร</h2>
        </div>
      </div>

      <div className="add-header-line"></div>

      {/* Form */}
      <form className="add-food-form" onSubmit={handleSubmit}>

        {/* --- ส่วนที่ 1: ข้อมูลพื้นฐาน --- */}
        <div className="add-form-group">
          <label>รูปภาพอาหาร</label>
          <div className="add-image-upload">
            <div className="add-upload-row">
              <FaImage className="add-upload-icon" />
              <label className="add-custom-upload-btn">
                เลือกรูปอาหาร
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImage(file);
                      setFileName(file.name);
                    }
                  }}
                />
              </label>
              {fileName && <span className="add-file-name">{fileName}</span>}
            </div>
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="add-preview-image"
              />
            )}
          </div>
        </div>

        <div className="add-form-group">
          <label>ชื่ออาหาร</label>
          <input
            type="text"
            name="food_name"
            value={formData.food_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* หมวดหมู่ — โหลดจาก API */}
        <div className="add-form-group">
          <label>หมวดหมู่</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">เลือกหมวดหมู่อาหาร</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="add-form-group">
          <label>ปริมาณต่อหน่วย</label>
          <input
            type="text"
            name="serving_size"
            value={formData.serving_size}
            onChange={handleChange}
            placeholder="เช่น 1 จาน, 1 ถ้วย (250 กรัม)"
          />
        </div>

        <div className="add-nutrition-section">
          <h3>ข้อมูลโภชนาการ</h3>
          <div className="add-nutrition-list">
            <div className="add-nutrition-item">
              <label><FaFire /> แคลอรี</label>
              <input type="number" step="0.01" name="calories" value={formData.calories} onChange={handleChange} onWheel={(e) => e.target.blur()} />
            </div>
            <div className="add-nutrition-item">
              <label><FaDrumstickBite /> โปรตีน</label>
              <input type="number" step="0.01" name="protein" value={formData.protein} onChange={handleChange} onWheel={(e) => e.target.blur()} />
            </div>
            <div className="add-nutrition-item">
              <label><FaTint /> ไขมัน</label>
              <input type="number" step="0.01" name="fat" value={formData.fat} onChange={handleChange} onWheel={(e) => e.target.blur()} />
            </div>
            <div className="add-nutrition-item">
              <label><GiWheat /> คาร์โบไฮเดรต</label>
              <input type="number" step="0.01" name="carbohydrates" value={formData.carbohydrates} onChange={handleChange} onWheel={(e) => e.target.blur()} />
            </div>
            <div className="add-nutrition-item">
              <label><GiSugarCane /> น้ำตาล</label>
              <input type="number" step="0.01" name="sugar" value={formData.sugar} onChange={handleChange} onWheel={(e) => e.target.blur()} />
            </div>
            <div className="add-nutrition-item">
              <label><MdOutlineSoupKitchen /> โซเดียม</label>
              <input type="number" step="0.01" name="sodium" value={formData.sodium} onChange={handleChange} onWheel={(e) => e.target.blur()} />
            </div>
          </div>
        </div>

        {/* --- คำอธิบายสั้นๆ (Description) --- */}
        <div className="add-form-group" style={{ marginTop: '20px' }}>
          <label style={{ fontWeight: 'bold' }}>คำอธิบายสั้นๆ (Description)</label>
          <textarea
            rows="4"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="อธิบายสั้นๆ เกี่ยวกับอาหาร..."
          />
        </div>

        {/* --- ส่วนที่ 2: รายละเอียดสูตรอาหาร (Dynamic Boxes) --- */}
        <div className="add-recipe-details-section">
          <h3>รายละเอียดส่วนผสมและวิธีทำ</h3>

          {recipeSections.map((section, sIndex) => (
            <div key={sIndex} className="add-dynamic-section-card">

              <div className="add-section-header">
                <input
                  type="text"
                  placeholder="ชื่อส่วนประกอบหลัก เช่น น้ำจิ้ม, หมูหมัก..."
                  value={section.section_name}
                  onChange={(e) => handleSectionChange(e.target.value, sIndex)}
                />
                <button
                  type="button"
                  className="add-delete-section-btn"
                  onClick={() => removeSection(sIndex)}
                >
                  <FaTrash /> ลบส่วนนี้
                </button>
              </div>

              {section.blocks.map((block, bIndex) => (
                <div key={bIndex} className="add-dynamic-block">
                  <div className="add-dynamic-block-header">
                    <input
                      type="text"
                      placeholder="หัวข้อย่อย เช่น ส่วนผสม, วิธีทำ"
                      value={block.block_title}
                      onChange={(e) => handleBlockChange("block_title", e.target.value, sIndex, bIndex)}
                    />
                    <button
                      type="button"
                      className="add-delete-block-btn"
                      onClick={() => removeBlock(sIndex, bIndex)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <textarea
                    rows="3"
                    placeholder="รายละเอียด..."
                    value={block.content}
                    onChange={(e) => handleBlockChange("content", e.target.value, sIndex, bIndex)}
                  />
                </div>
              ))}

              <button
                type="button"
                className="add-block-btn"
                onClick={() => addBlock(sIndex)}
              >
                <FaPlusCircle /> เพิ่มหัวข้อย่อยในกลุ่มนี้
              </button>
            </div>
          ))}

          <button
            type="button"
            className="add-section-btn"
            onClick={addSection}
          >
            <FaPlus /> เพิ่มส่วนประกอบหลัก (กล่องใหม่)
          </button>
        </div>

        {/* --- ส่วนที่ 3: หมายเหตุ --- */}
        <div className="add-form-group" style={{ marginTop: '30px' }}>
          <label>หมายเหตุ / คำอธิบายเพิ่มเติม</label>
          <textarea
            rows="4"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="ข้อมูลเพิ่มเติมอื่นๆ ที่อยากระบุ..."
          />
        </div>

        {/* ปุ่มบันทึก */}
        <button type="submit" className="add-save-btn" style={{ marginTop: '20px' }}>
          <FaPlus /> บันทึกอาหาร
        </button>
      </form>
    </div>
  );
}

export default AddFood;
