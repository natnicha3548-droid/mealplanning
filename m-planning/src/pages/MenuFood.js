import React, { useState, useEffect } from 'react';
import FoodCard from '../components/FoodCard';

function MenuFood() {

    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/api/foods")
            .then(res => res.json())
            .then(data => {
                console.log("foods:", data);
                setFoods(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="app-container">

            <div className="menu-header">
                <h1>เมนูอาหาร</h1>
            </div>

            <main className="food-grid">

                {loading ? (
                    <p>กำลังโหลดข้อมูล...</p>
                ) : foods.length > 0 ? (
                    foods.map((food) => (
                        <FoodCard key={food.food_id} food={food} />
                    ))
                ) : (
                    <p>ไม่มีข้อมูลอาหาร</p>
                )}

            </main>

        </div>
    );
}

export default MenuFood;