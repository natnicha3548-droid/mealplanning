import React, { useEffect, useState } from "react";

function MealPlan() {
    const [mealPlan, setMealPlan] = useState([]);
    useEffect(() => {
        const stored = localStorage.getItem("mealPlan");
        if (stored) {
            setMealPlan(JSON.parse(stored));
        } else {
            setMealPlan([]);
        }
    }, []); // โหลดครั้งเดียวตอน component mount

    return (
        <div style={{ padding: "20px" }}>
            <h2>แผนการกินของคุณ</h2>
            {mealPlan.length === 0 ? (
                <p>คุณยังไม่มีแผนการกินเลย ลองสร้างดูสิ!!!</p>
            ) : (
                <ul>
                    {mealPlan.map((meal, index) => (
                        <li key={index}>
                            <strong>{meal.name}</strong> - {meal.calories} kcal
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}  
export default MealPlan;