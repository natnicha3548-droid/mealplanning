import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FaEdit,
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

import "./EditFood.css";

function EditFood() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
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

    useEffect(() => {
        if (id) {
            fetchFood();
        }
    }, [id]);

    const fetchFood = async () => {

        try {

            const res = await fetch(
                `http://localhost:5000/api/foods/${id}`
            );

            const data = await res.json();

            console.log("Food Data:", data);

            if (data.success && data.food) {

                const food = data.food;

                setFormData({
                    food_name: food.food_name || "",
                    category_id: String(food.category_id || ""),
                    serving_size: food.serving_size || "",
                    calories: food.calories || "",
                    protein: food.protein || "",
                    fat: food.fat || "",
                    carbohydrates: food.carbohydrates || "",
                    sugar: food.sugar || "",
                    sodium: food.sodium || "",
                    description: food.description || ""
                });

                if (food.image) {
                    setPreview(food.image);
                }
            }

        } catch (err) {
            console.log(err);
            alert("ไม่สามารถโหลดข้อมูลอาหารได้");
        }

    };

    const handleChange = (e) => {

        const { name, value, type } = e.target;

        setFormData({
            ...formData,
            [name]: type === "number"
                ? (value === "" ? "" : Number(value))
                : value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const submitData = new FormData();

            Object.keys(formData).forEach((key) => {
                submitData.append(key, formData[key]);
            });

            if (image) {
                submitData.append("image", image);
            }

            const res = await fetch(
                `http://localhost:5000/api/foods/${id}`,
                {
                    method: "PUT",
                    body: submitData
                }
            );

            const result = await res.json();

            if (result.success) {

                alert("อัปเดตข้อมูลสำเร็จ");
                navigate("/admin/manage-food");

            } else {

                alert(result.message || "อัปเดตไม่สำเร็จ");

            }

        } catch (err) {

            console.log(err);
            alert("เกิดข้อผิดพลาด");

        }

    };

    return (
        <div className="edit-food-page">

            <div className="food-page-header">

                <div className="food-header-icon">
                    <FaUtensils />
                </div>

                <div className="food-header-content">
                    <h1>แก้ไขข้อมูลอาหาร</h1>
                    <p>
                        แก้ไขข้อมูลเมนูอาหารและข้อมูลโภชนาการ
                    </p>
                </div>

            </div>

            <div className="header-line"></div>

            <form
                className="edit-food-form"
                onSubmit={handleSubmit}
            >

                <div className="edit-form-group">

                    <label>รูปภาพอาหาร</label>

                    <div className="edit-image-upload">

                        <div className="edit-upload-row">

                            <FaImage className="upload-icon" />

                            <label className="edit-upload-btn">

                                เปลี่ยนรูปภาพ

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

                                            setPreview(
                                                URL.createObjectURL(file)
                                            );

                                        }

                                    }}
                                />

                            </label>

                            {fileName && (
                                <span className="edit-file-name">
                                    {fileName}
                                </span>
                            )}

                        </div>

                        {preview && (
                            <img
                                src={preview}
                                alt="preview"
                                className="edit-preview-image"
                            />
                        )}

                    </div>

                </div>

                <div className="edit-form-group">

                    <label>ชื่ออาหาร</label>

                    <input
                        type="text"
                        name="food_name"
                        value={formData.food_name}
                        onChange={handleChange}
                        required
                    />

                </div>

                <div className="edit-form-group">

                    <label>หมวดหมู่</label>

                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            เลือกหมวดหมู่
                        </option>

                        <option value="1">
                            ของคาว
                        </option>

                        <option value="2">
                            ของหวาน
                        </option>

                    </select>

                </div>

                <div className="edit-form-group">

                    <label>ปริมาณต่อหน่วย</label>

                    <input
                        type="text"
                        name="serving_size"
                        value={formData.serving_size}
                        onChange={handleChange}
                    />

                </div>

                <div className="edit-nutrition-section">

                    <h3>ข้อมูลโภชนาการ</h3>

                    <div className="edit-nutrition-list">

                        <div className="edit-nutrition-item">
                            <label><FaFire /> แคลอรี</label>
                            <input
                                type="number"
                                step="0.01"
                                name="calories"
                                value={formData.calories}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="edit-nutrition-item">
                            <label><FaDrumstickBite /> โปรตีน</label>
                            <input
                                type="number"
                                name="protein"
                                value={formData.protein}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="edit-nutrition-item">
                            <label><FaTint /> ไขมัน</label>
                            <input
                                type="number"
                                name="fat"
                                value={formData.fat}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="edit-nutrition-item">
                            <label><GiWheat /> คาร์โบไฮเดรต</label>
                            <input
                                type="number"
                                name="carbohydrates"
                                value={formData.carbohydrates}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="edit-nutrition-item">
                            <label><GiSugarCane /> น้ำตาล</label>
                            <input
                                type="number"
                                name="sugar"
                                value={formData.sugar}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="edit-nutrition-item">
                            <label><MdOutlineSoupKitchen /> โซเดียม</label>
                            <input
                                type="number"
                                name="sodium"
                                value={formData.sodium}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                </div>

                <div className="edit-form-group">

                    <label>คำอธิบายอาหาร</label>

                    <textarea
                        rows="6"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />

                </div>

                <button
                    type="submit"
                    className="update-btn"
                >
                    <FaEdit />
                    อัปเดตข้อมูลอาหาร
                </button>

            </form>

        </div>
    );
}

export default EditFood;