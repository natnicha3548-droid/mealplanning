import React, { useState } from "react";
import axios from "axios";
import {
    FaSave,
    FaFolderPlus,
    FaCaretDown,
    FaCaretUp
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "./AddCategory.css";

function AddCategory() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        category_name: "",
        description: "",
        status: ""
    });

    // สร้าง State สำหรับควบคุมการเปิด/ปิด Dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "http://localhost:5000/api/categories",
                formData
            );
            alert("เพิ่มหมวดหมู่สำเร็จ");
            navigate("/admin/manage-categories");
        } catch (error) {
            console.log(error);
            alert("เกิดข้อผิดพลาด");
        }
    };

    // ฟังก์ชันสำหรับจำลองการเลือก Option แล้วส่งค่าไปให้ handleChange
    const handleOptionSelect = (value) => {
        handleChange({ target: { name: 'status', value: value } });
        setIsDropdownOpen(false); // เลือกเสร็จให้ปิดเมนู
    };

    return (
        <div className="add-category-page">
            <div className="add-category-card">
                <div className="add-category-header">
                    <div className="add-category-header-icon">
                        <FaFolderPlus />
                    </div>
                    <div>
                        <h2>เพิ่มหมวดหมู่อาหาร</h2>
                    </div>
                </div>

                <div className="add-category-form-section-title">
                    ข้อมูลหมวดหมู่อาหาร
                </div>

                <form onSubmit={handleSubmit} className="add-category-form">
                    <div className="add-category-form-group">
                        <label>ชื่อหมวดหมู่</label>
                        <input
                            type="text"
                            name="category_name"
                            value={formData.category_name}
                            onChange={handleChange}
                            placeholder="เช่น ของคาว, ของหวาน, เครื่องดื่ม"
                            required
                        />
                    </div>

                    <div className="add-category-form-group">
                        <label>รายละเอียด</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับหมวดหมู่"
                        />
                    </div>

                    <div className="add-category-form-group">
                        <label>สถานะ</label>
                        
                        {/* 🌟 เปลี่ยนจาก <select> เป็น Custom Dropdown */}
                        <div className="custom-select-container">
                            <div 
                                className={`custom-select-header ${isDropdownOpen ? 'open' : ''}`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span>
                                    {formData.status === 'active' ? 'ใช้งาน' : 
                                     formData.status === 'inactive' ? 'ปิดใช้งาน' : 
                                     'เลือกสถานะการใช้งาน'}
                                </span>
                                {isDropdownOpen ? <FaCaretUp /> : <FaCaretDown />}
                            </div>

                            {isDropdownOpen && (
                                <div className="custom-select-options">
                                    <div 
                                        className={`custom-select-option ${formData.status === '' ? 'selected' : ''}`}
                                        onClick={() => handleOptionSelect('')}
                                    >
                                        เลือกสถานะการใช้งาน
                                    </div>
                                    <div 
                                        className={`custom-select-option ${formData.status === 'active' ? 'selected' : ''}`}
                                        onClick={() => handleOptionSelect('active')}
                                    >
                                        ใช้งาน
                                    </div>
                                    <div 
                                        className={`custom-select-option ${formData.status === 'inactive' ? 'selected' : ''}`}
                                        onClick={() => handleOptionSelect('inactive')}
                                    >
                                        ปิดใช้งาน
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* 🌟 จบส่วน Custom Dropdown */}

                    </div>

                    <button type="submit" className="save-btn">
                        <FaSave />
                        บันทึกข้อมูล
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddCategory;