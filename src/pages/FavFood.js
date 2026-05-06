import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFire, FaBreadSlice, FaDrumstickBite, FaTint } from "react-icons/fa";


function FavFood({ favFoods }) {
    return (
        <div className="fav-foods">
            <h2>อาหารโปรดของคุณ</h2>
            {favFoods.length === 0 ? (
                <p>คุณยังไม่มีอาหารโปรดเลย ลองเพิ่มดูสิ!</p>
            ) : (  
                <div className="fav-food-list">
                    {favFoods.map((food, index) => (
                        <div key={index} className="fav-food-item">
                            <h3>{food.name}</h3>
                            <div className="nutrition-info">
                                <div className="nutrition-item">
                                    <FaFire />  
                                    <span>{food.calories} kcal</span>
                                </div>
                                <div className="nutrition-item">
                                    <FaBreadSlice />
                                    <span>{food.carb} g</span>
                                </div>
                                <div className="nutrition-item">
                                    <FaDrumstickBite />
                                    <span>{food.protein} g</span>
                                </div>
                                <div className="nutrition-item">
                                    <FaTint />
                                    <span>{food.fat} g</span>
                                </div>
                            </div>
                        </div> 
                    ))}
                </div>
            )}
        </div>
    );
}
export default FavFood;