import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FaEdit,
    FaUtensils,
    FaImage,
    FaFire,
    FaDrumstickBite,
    FaTint,
    FaTrash,
    FaPlusCircle,
    FaPlus
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

    // เพิ่ม notes ลงไปใน State
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

    // State สำหรับกล่องข้อมูลย่อย (Dynamic Boxes)
    const [recipeSections, setRecipeSections] = useState([
        {
            section_name: "",
            blocks: [{ block_title: "", content: "" }]
        }
    ]);

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
                    description: food.description || "",
                    notes: food.notes || ""
                });

                // แปลงข้อมูล recipe_details (JSON) กลับมาเป็น Array
                if (food.recipe_details) {
                    try {
                        const parsedDetails = typeof food.recipe_details === "string" 
                            ? JSON.parse(food.recipe_details) 
                            : food.recipe_details;
                        
                        // ถ้ามีข้อมูลให้เซ็ตค่า ถ้าไม่มีให้ใช้ค่าเริ่มต้น
                        if (parsedDetails && parsedDetails.length > 0) {
                            setRecipeSections(parsedDetails);
                        }
                    } catch (e) {
                        console.error("Error parsing recipe_details:", e);
                    }
                }

                if (food.image) {
                    setPreview(
                        food.image.startsWith("http")
                            ? food.image
                            : `http://localhost:5000${food.image}`
                    );
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

            const submitData = new FormData();

            // ใส่ข้อมูลพื้นฐาน
            Object.keys(formData).forEach((key) => {
                submitData.append(key, formData[key]);
            });

            // ใส่ข้อมูลกล่องย่อยเป็น JSON String
            submitData.append("recipe_details", JSON.stringify(recipeSections));

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
                </div>

            </div>

            <div className="header-line"></div>

            <form
                className="edit-food-form"
                onSubmit={handleSubmit}
            >

                {/* --- ส่วนที่ 1: ข้อมูลพื้นฐาน --- */}
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
                                        const file = e.target.files[0];
                                        if (file) {
                                            setImage(file);
                                            setFileName(file.name);
                                            setPreview(URL.createObjectURL(file));
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
                        <option value="">เลือกหมวดหมู่</option>
                        <option value="1">ของคาว</option>
                        <option value="2">ของหวาน</option>
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
                            <input type="number" step="0.01" name="calories" value={formData.calories} onChange={handleChange} />
                        </div>
                        <div className="edit-nutrition-item">
                            <label><FaDrumstickBite /> โปรตีน</label>
                            <input type="number" name="protein" value={formData.protein} onChange={handleChange} />
                        </div>
                        <div className="edit-nutrition-item">
                            <label><FaTint /> ไขมัน</label>
                            <input type="number" name="fat" value={formData.fat} onChange={handleChange} />
                        </div>
                        <div className="edit-nutrition-item">
                            <label><GiWheat /> คาร์โบไฮเดรต</label>
                            <input type="number" name="carbohydrates" value={formData.carbohydrates} onChange={handleChange} />
                        </div>
                        <div className="edit-nutrition-item">
                            <label><GiSugarCane /> น้ำตาล</label>
                            <input type="number" name="sugar" value={formData.sugar} onChange={handleChange} />
                        </div>
                        <div className="edit-nutrition-item">
                            <label><MdOutlineSoupKitchen /> โซเดียม</label>
                            <input type="number" name="sodium" value={formData.sodium} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="edit-form-group">
                    <label>คำอธิบายสั้นๆ (Description)</label>
                    <textarea
                        rows="3"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
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

                            {/* กล่องย่อย (Blocks) */}
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
                <div className="edit-form-group" style={{ marginTop: '30px' }}>
                    <label>หมายเหตุ / คำอธิบายเพิ่มเติม</label>
                    <textarea
                        rows="4"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="ข้อมูลเพิ่มเติมอื่นๆ ที่อยากระบุ..."
                    />
                </div>

                <button
                    type="submit"
                    className="update-btn"
                    style={{ marginTop: '20px' }}
                >
                    <FaEdit />
                    อัปเดตข้อมูลอาหาร
                </button>

            </form>

        </div>
    );
}

export default EditFood;