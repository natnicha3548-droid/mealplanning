import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFire, FaBreadSlice, FaDrumstickBite, FaTint } from "react-icons/fa";


function MealPlan({ mealPlan }) {
    return (
        <div className="meal-plan">
            <h2>แผนการกินของคุณ</h2>
            {mealPlan.length === 0 ? (
                <p>คุณยังไม่มีแผนการกินเลย ลองสร้างดูสิ!</p>
            ) : (  
                <div className="meal-plan-list">
                    {mealPlan.map((meal, index) => (
                        <div key={index} className="meal-plan-item">
                            <h3>{meal.name}</h3>
                            <div className="nutrition-info">
                                <div className="nutrition-item">
                                    <FaFire />  
                                    <span>{meal.calories} kcal</span>
                                </div>
                                <div className="nutrition-item">
                                    <FaBreadSlice />
                                    <span>{meal.carb} g</span>
                                </div>
                                <div className="nutrition-item">
                                    <FaDrumstickBite />
                                    <span>{meal.protein} g</span>
                                </div>
                                <div className="nutrition-item">
                                    <FaTint />
                                    <span>{meal.fat} g</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
export default MealPlan;