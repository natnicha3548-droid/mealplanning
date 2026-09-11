import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSave, FaEdit } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import "./EditCategory.css";

function EditCategory() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        category_name: "",
        description: "",
        status: ""
    });

    useEffect(() => {
        fetchCategory();
    }, []);

    const fetchCategory = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/categories/${id}`
            );

            setFormData({
                category_name: res.data.category_name || "",
                description: res.data.description || "",
                status: res.data.status || ""
            });

        } catch (error) {
            console.log(error);
            alert("ไม่พบข้อมูลหมวดหมู่");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.put(
                `http://localhost:5000/api/categories/${id}`,
                formData
            );

            alert("แก้ไขหมวดหมู่สำเร็จ");
            navigate("/admin/manage-categories");

        } catch (error) {
            console.log(error);
            alert("เกิดข้อผิดพลาด");
        }
    };

    return (
        <div className="edit-category-page">
            <div className="edit-category-card">
                <div className="edit-category-header">
                    {/* 🌟 เปลี่ยนคลาสจาก header-icon เป็น edit-category-header-icon */}
                    <div className="edit-category-header-icon">
                        <FaEdit />
                    </div>
                    <div>
                        <h1>แก้ไขหมวดหมู่อาหาร</h1>
                    </div>
                </div>

                <form
                    className="edit-category-form"
                    onSubmit={handleSubmit}
                >
                    <div className="edit-category-form-group">
                        <label>ชื่อหมวดหมู่</label>
                        <input
                            type="text"
                            name="category_name"
                            value={formData.category_name}
                            onChange={handleChange}
                            placeholder="เช่น ของคาว ของหวาน เครื่องดื่ม"
                            required
                        />
                    </div>

                    <div className="edit-category-form-group">
                        <label>รายละเอียด</label>
                        <textarea
                            rows="5"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับหมวดหมู่"
                        />
                    </div>

                    <div className="edit-category-form-group">
                        <label>สถานะ</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="">เลือกสถานะการใช้งาน</option>
                            <option value="active">ใช้งาน</option>
                            <option value="inactive">ปิดใช้งาน</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="save-btn"
                    >
                        <FaSave />
                        บันทึกการแก้ไข
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditCategory;