import React, { useState } from "react";
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

  // เปลี่ยน description เป็น notes ตามโครงสร้างใหม่
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
    notes: "" 
  });

  // State สำหรับกล่องข้อมูลย่อย (สูตรอาหาร, ส่วนผสม, วิธีทำ ฯลฯ)
  const [recipeSections, setRecipeSections] = useState([
    {
      section_name: "", // เช่น "หมูสะเต๊ะ", "น้ำจิ้ม"
      blocks: [{ block_title: "", content: "" }] // เช่น "ส่วนผสม", "วิธีทำ"
    }
  ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- ฟังก์ชันจัดการ Dynamic Boxes ---
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
  // ---------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      // ใส่ข้อมูลพื้นฐาน
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // ใส่รูปภาพ
      if (image) {
        data.append("image", image);
      }

      // ใส่ข้อมูลกล่องย่อย โดยแปลงเป็น JSON String
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
      <div className="food-page-header">
        <div className="food-header-icon">
          <FaUtensils />
        </div>
        <div className="food-header-content">
          <h1>เพิ่มข้อมูลอาหาร</h1>
        </div>
      </div>

      <div className="header-line"></div>

      {/* Form */}
      <form className="add-food-form" onSubmit={handleSubmit}>
        
        {/* --- ส่วนที่ 1: ข้อมูลพื้นฐาน --- */}
        <div className="form-group">
          <label>รูปภาพอาหาร</label>
          <div className="image-upload">
            <div className="upload-row">
              <FaImage className="upload-icon" />
              <label className="custom-upload-btn">
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
              {fileName && <span className="file-name">{fileName}</span>}
            </div>
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="preview-image"
              />
            )}
          </div>
        </div>

        <div className="form-group">
          <label>ชื่ออาหาร</label>
          <input
            type="text"
            name="food_name"
            value={formData.food_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>หมวดหมู่</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">เลือกหมวดหมู่อาหาร</option>
            <option value="1">ของคาว</option>
            <option value="2">ของหวาน</option>
          </select>
        </div>

        <div className="form-group">
          <label>ปริมาณต่อหน่วย</label>
          <input
            type="text"
            name="serving_size"
            value={formData.serving_size}
            onChange={handleChange}
            placeholder="เช่น 1 จาน, 1 ถ้วย (250 กรัม)"
          />
        </div>

        <div className="nutrition-section">
          <h3>ข้อมูลโภชนาการ</h3>
          <div className="nutrition-list">
            <div className="nutrition-item">
              <label><FaFire /> แคลอรี</label>
              <input type="number" name="calories" value={formData.calories} onChange={handleChange} />
            </div>
            <div className="nutrition-item">
              <label><FaDrumstickBite /> โปรตีน</label>
              <input type="number" name="protein" value={formData.protein} onChange={handleChange} />
            </div>
            <div className="nutrition-item">
              <label><FaTint /> ไขมัน</label>
              <input type="number" name="fat" value={formData.fat} onChange={handleChange} />
            </div>
            <div className="nutrition-item">
              <label><GiWheat /> คาร์โบไฮเดรต</label>
              <input type="number" name="carbohydrates" value={formData.carbohydrates} onChange={handleChange} />
            </div>
            <div className="nutrition-item">
              <label><GiSugarCane /> น้ำตาล</label>
              <input type="number" name="sugar" value={formData.sugar} onChange={handleChange} />
            </div>
            <div className="nutrition-item">
              <label><MdOutlineSoupKitchen /> โซเดียม</label>
              <input type="number" name="sodium" value={formData.sodium} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* --- ส่วนที่ 2: รายละเอียดสูตรอาหาร (Dynamic Boxes) --- */}
        <div className="recipe-details-section">
        <h3>รายละเอียดส่วนผสมและวิธีทำ</h3>
        
        {recipeSections.map((section, sIndex) => (
            <div key={sIndex} className="dynamic-section-card">
            
            <div className="section-header">
                <input
                type="text"
                placeholder="ชื่อส่วนประกอบหลัก เช่น น้ำจิ้ม, หมูหมัก..."
                value={section.section_name}
                onChange={(e) => handleSectionChange(e.target.value, sIndex)}
                />
                <button
                type="button"
                className="delete-section-btn"
                onClick={() => removeSection(sIndex)}
                >
                <FaTrash /> ลบส่วนนี้
                </button>
            </div>

            {/* กล่องย่อย (Blocks) ภายใน Section */}
            {section.blocks.map((block, bIndex) => (
                <div key={bIndex} className="dynamic-block">
                <div className="dynamic-block-header">
                    <input
                    type="text"
                    placeholder="หัวข้อย่อย เช่น ส่วนผสม, วิธีทำ"
                    value={block.block_title}
                    onChange={(e) => handleBlockChange("block_title", e.target.value, sIndex, bIndex)}
                    />
                    <button
                    type="button"
                    className="delete-block-btn"
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
        <div className="form-group" style={{ marginTop: '30px' }}>
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
        <button type="submit" className="save-btn" style={{ marginTop: '20px' }}>
          <FaPlus /> บันทึกอาหาร
        </button>
      </form>
    </div>
  );
}

export default AddFood;