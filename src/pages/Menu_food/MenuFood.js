import React, { useState, useEffect } from 'react';
import FoodCard from '../../components/Food_card/FoodCard';

import { FiSearch } from "react-icons/fi";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { LuSoup } from "react-icons/lu";

import "./MenuFood.css";

function MenuFood() {

    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
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

    // SEARCH
    const filteredFoods = foods.filter(food => {

        const name =
            (food.food_name || "").toLowerCase();

        return name.includes(
            search.toLowerCase()
        );

    });

    // แยกหมวดจาก category_id
    const savoryFoods = filteredFoods.filter(
        food => food.category_id === 1
    );

    const sweetFoods = filteredFoods.filter(
        food => food.category_id === 2
    );

    return (

        <div className="app-container">

            {/* HEADER */}

            <div className="menu-header">

                <div className="menu-left">

                    <div className="menu-icon">
                        <LuSoup />
                    </div>

                    <div className="menu-text">

                        <h1>
                            รายการอาหารทั้งหมด
                        </h1>

                        <p>
                            รวมเมนูอาหารหลากหลาย ครบทุกมื้อ อร่อยง่าย ได้สุขภาพ
                        </p>

                    </div>

                </div>

                <div className="menu-actions">

                    <div className="search-box">

                        <FiSearch className="search-icon" />

                        <input
                            type="text"
                            placeholder="ค้นหาเมนูอาหาร..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>

                    <button className="filter-btn">
                        <HiOutlineAdjustmentsHorizontal />
                    </button>

                </div>

            </div>

            {/* ของคาว */}

            <div className="section-header">

                <div className="section-title">

                    🍛 ของคาว

                    <span>
                        {savoryFoods.length} เมนู
                    </span>

                </div>

            </div>

            <main className="food-grid">

                {loading ? (

                    <p>กำลังโหลดข้อมูล...</p>

                ) : savoryFoods.length > 0 ? (

                    savoryFoods.map((food) => (

                        <FoodCard
                            key={food.food_id}
                            food={food}
                        />

                    ))

                ) : (

                    <p>ไม่พบเมนูอาหาร</p>

                )}

            </main>

            {/* ของหวาน */}

            <div className="section-header">

                <div className="section-title">

                    🍰 ของหวาน

                    <span>
                        {sweetFoods.length} เมนู
                    </span>

                </div>

            </div>

            <main className="food-grid">

                {loading ? (

                    <p>กำลังโหลดข้อมูล...</p>

                ) : sweetFoods.length > 0 ? (

                    sweetFoods.map((food) => (

                        <FoodCard
                            key={food.food_id}
                            food={food}
                        />

                    ))

                ) : (

                    <p>ไม่พบเมนูอาหาร</p>

                )}

            </main>

        </div>

    );
}

export default MenuFood;