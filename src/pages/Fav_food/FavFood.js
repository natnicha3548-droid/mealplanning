import React, { useEffect, useState } from "react";
import "./FavFood.css";

function FavFood() {
    const [favFoods, setFavFoods] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem("favFoods");

        if (stored) {
            setFavFoods(JSON.parse(stored));
        } else {
            setFavFoods([]);
        }
    }, []);

    return (
        <div className="fav-container">
            <h2 className="fav-title">รายการโปรดของฉัน</h2>

            {favFoods.length === 0 ? (
                <p className="fav-empty">
                    คุณยังไม่มีรายการโปรดเลย ลองเพิ่มดูสิ!
                </p>
            ) : (
                <ul className="fav-list">
                    {favFoods.map((food, index) => (
                        <li key={index} className="fav-item">
                            <strong>{food.name}</strong>
                            <span>{food.calories} kcal</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default FavFood;