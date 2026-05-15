import React, { useEffect, useState } from "react";

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
        <div style={{ padding: "20px" }}>
            <h2>รายการโปรดของคุณ</h2>
            {favFoods.length === 0 ? (
                <p>คุณยังไม่มีรายการโปรดเลย ลองเพิ่มดูสิ!</p>
            ) : (
                <ul>
                    {favFoods.map((food, index) => (
                        <li key={index}>
                            <strong>{food.name}</strong> - {food.calories} kcal
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
export default FavFood;