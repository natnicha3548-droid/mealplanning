import React, { useState, useEffect } from 'react';
import FoodCard from '../../components/FoodCard';

const categories = [
    "ทั้งหมด", "จานเดียว", "อีสาน", "คลีน",
    "ต้ม/แกง", "ยำ/สลัด", "เครื่องดื่ม", "ของว่าง"
];

function MenuFood() {

    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/api/foods")
            .then(res => res.json())
            .then(data => {
                setFoods(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // 🔎 filter logic (แก้แล้ว)
    const filteredFoods = foods.filter(food => {

        // ✅ ใช้ field ที่ถูกต้องจาก backend
        const name = (food.food_name || "").toLowerCase();

        // ❗ ตอนนี้ยังไม่มี category ใน DB → ปิด filter นี้ไปก่อน
        const matchCategory = selectedCategory === "ทั้งหมด";

        const matchSearch = name.includes(search.toLowerCase());

        return matchCategory && matchSearch;
    });

    return (
        <div className="app-container">

            {/* HEADER */}
            <div className="menu-header">
                <div>
                    <h1>เมนูอาหาร</h1>
                    <p>เลือกเมนูที่ใช่ สำหรับเป้าหมายของคุณ</p>
                </div>

                <div className="menu-actions">
                    <input
                        type="text"
                        placeholder="ค้นหาเมนูอาหาร..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button className="filter-btn">ตัวกรอง</button>
                </div>
            </div>

            {/* CATEGORY */}
            <div className="category-list">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={selectedCategory === cat ? "active" : ""}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* FOOD GRID */}
            <main className="food-grid">

                {loading ? (
                    <p>กำลังโหลดข้อมูล...</p>
                ) : filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => (
                        <FoodCard key={food.food_id} food={food} />
                    ))
                ) : (
                    <p>ไม่มีข้อมูลอาหาร</p>
                )}

            </main>

            {/* FEATURE SECTION */}
            <div className="features">
                <div className="feature-card">🥗 วัตถุดิบคุณภาพ</div>
                <div className="feature-card">🍃 โภชนาการครบถ้วน</div>
                <div className="feature-card">❤️ อร่อยและสุขภาพดี</div>
                <div className="feature-card">📋 วางแผนง่าย</div>
            </div>

        </div>
    );
}

export default MenuFood;