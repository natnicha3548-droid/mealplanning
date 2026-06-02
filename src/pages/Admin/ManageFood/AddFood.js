import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaPlus,
    FaUtensils,
    FaImage,
    FaFire,
    FaDrumstickBite,
    FaTint
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
        description: ""
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
            const data = new FormData();

            Object.keys(formData).forEach((key) => {
                data.append(key, formData[key]);
            });

            if (image) {
                data.append("image", image);
            }

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

                    <p>
                        เพิ่มเมนูอาหารเข้าสู่ระบบและจัดการข้อมูลโภชนาการ
                    </p>
                </div>
            </div>

            <div className="header-line"></div>

            {/* Form */}

            <form
                className="add-food-form"
                onSubmit={handleSubmit}
            >
                {/* รูปภาพ */}

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
                                        const file =
                                            e.target.files[0];

                                        if (file) {
                                            setImage(file);
                                            setFileName(file.name);
                                        }
                                    }}
                                />
                            </label>

                            {fileName && (
                                <span className="file-name">
                                    {fileName}
                                </span>
                            )}
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

                {/* ชื่ออาหาร */}

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

                {/* หมวดหมู่ */}

                <div className="form-group">
                    <label>หมวดหมู่</label>

                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            เลือกหมวดหมู่อาหาร
                        </option>

                        <option value="1">
                            ของคาว
                        </option>

                        <option value="2">
                            ของหวาน
                        </option>
                    </select>
                </div>

                {/* ปริมาณ */}

                <div className="form-group">
                    <label>ปริมาณต่อหน่วย</label>

                    <input
                        type="text"
                        name="serving_size"
                        value={formData.serving_size}
                        onChange={handleChange}
                    />
                </div>

                {/* โภชนาการ */}

                <div className="nutrition-section">
                    <h3>ข้อมูลโภชนาการ</h3>

                    <div className="nutrition-list">
                        <div className="nutrition-item">
                            <label>
                                <FaFire />
                                แคลอรี
                            </label>

                            <input
                                type="number"
                                name="calories"
                                value={formData.calories}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="nutrition-item">
                            <label>
                                <FaDrumstickBite />
                                โปรตีน
                            </label>

                            <input
                                type="number"
                                name="protein"
                                value={formData.protein}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="nutrition-item">
                            <label>
                                <FaTint />
                                ไขมัน
                            </label>

                            <input
                                type="number"
                                name="fat"
                                value={formData.fat}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="nutrition-item">
                            <label>
                                <GiWheat />
                                คาร์โบไฮเดรต
                            </label>

                            <input
                                type="number"
                                name="carbohydrates"
                                value={formData.carbohydrates}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="nutrition-item">
                            <label>
                                <GiSugarCane />
                                น้ำตาล
                            </label>

                            <input
                                type="number"
                                name="sugar"
                                value={formData.sugar}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="nutrition-item">
                            <label>
                                <MdOutlineSoupKitchen />
                                โซเดียม
                            </label>

                            <input
                                type="number"
                                name="sodium"
                                value={formData.sodium}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* คำอธิบาย */}

                <div className="form-group">
                    <label>คำอธิบายอาหาร</label>

                    <textarea
                        rows="6"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                {/* ปุ่มบันทึก */}

                <button
                    type="submit"
                    className="save-btn"
                >
                    <FaPlus />
                    บันทึกอาหาร
                </button>
            </form>
        </div>
    );
}

export default AddFood;