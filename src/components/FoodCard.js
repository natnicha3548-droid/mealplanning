import React from 'react';

function FoodCard({ food, onClick }) {
    return (
        <div
            className="food-card clickable"
            onClick={() => onClick && onClick(food.food_id)}
        >
            <img
                src={food.image || 'https://via.placeholder.com/250x180'}
                className="food-img"
                alt={food.food_name}
            />
            

            <div className="food-details">
                <h3 className="food-name">{food.food_name}</h3>

                <p className="food-serving">
                    หน่วย: {food.serving_size || '-'}
                </p>

                <div className="nutrients-row">
                    <span className="kcal-badge">
                        {food.calories ? `${food.calories} kcal` : 'ไม่มีข้อมูล'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default FoodCard;