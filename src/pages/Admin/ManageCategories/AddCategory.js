import React, { useState } from "react";
import axios from "axios";
import {
    FaSave,
    FaFolderPlus
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

            navigate(
                "/admin/manage-categories"
            );

        } catch (error) {

            console.log(error);

            alert("เกิดข้อผิดพลาด");

        }
    };

    return (

        <div className="add-category-page">

            <div className="add-category-card">

                <div className="add-category-header">

                    <div className="header-icon">
                        <FaFolderPlus />
                    </div>

                    <div>
                        <h1>
                            เพิ่มหมวดหมู่อาหาร
                        </h1>

                        
                    </div>

                </div>

                <div className="form-section-title">
                    ข้อมูลหมวดหมู่อาหาร
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="category-form"
                >

                    <div className="form-group">

                        <label>
                            ชื่อหมวดหมู่
                        </label>

                        <input
                            type="text"
                            name="category_name"
                            value={formData.category_name}
                            onChange={handleChange}
                            placeholder="เช่น ของคาว, ของหวาน, เครื่องดื่ม"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            รายละเอียด
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับหมวดหมู่"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            สถานะ
                        </label>

                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                เลือกสถานะการใช้งาน
                            </option>

                            <option value="active">
                                ใช้งาน
                            </option>

                            <option value="inactive">
                                ปิดใช้งาน
                            </option>

                        </select>

                    </div>

                    <button
                        type="submit"
                        className="save-btn"
                    >
                        <FaSave />
                        บันทึกข้อมูล
                    </button>

                </form>

            </div>

        </div>

    );
}

export default AddCategory;