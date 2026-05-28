import React, { useEffect, useState } from "react";

import {
    FaHeart,
    FaUtensils,
    FaCalendarAlt
} from "react-icons/fa";

import "./FavFood.css";

function FavFood() {

    const [favFoods, setFavFoods] = useState([]);
    const [favPlans, setFavPlans] = useState([]);
    const [activeTab, setActiveTab] = useState("foods");

    useEffect(() => {

        fetchFavorites();

    }, []);

    // ================= FETCH FAVORITES =================

    const fetchFavorites = async () => {

        try {

            const user = JSON.parse(
                localStorage.getItem("user")
            );

            if (!user) return;

            const response = await fetch(
                `http://localhost:5000/api/favorites/${user.user_id}`
            );

            const data = await response.json();

            setFavFoods(data.foods || []);
            setFavPlans(data.plans || []);

        } catch (error) {

            console.log(error);

        }

    };

    // ================= REMOVE FAVORITE FOOD =================

    const removeFavoriteFood = async (favoriteId) => {

        try {

            await fetch(

                `http://localhost:5000/api/favorites/food/${favoriteId}`,

                {
                    method: "DELETE"
                }

            );

            setFavFoods(

                favFoods.filter(
                    (food) => food.favorite_id !== favoriteId
                )

            );

        } catch (error) {

            console.log(error);

        }

    };

    // ================= REMOVE FAVORITE PLAN =================

    const removeFavoritePlan = async (favoriteId) => {

        try {

            await fetch(

                `http://localhost:5000/api/favorites/plan/${favoriteId}`,

                {
                    method: "DELETE"
                }

            );

            setFavPlans(

                favPlans.filter(
                    (plan) => plan.favorite_id !== favoriteId
                )

            );

        } catch (error) {

            console.log(error);

        }

    };

    // ================= CATEGORY =================

    const savoryFoods = favFoods.filter(
        (food) =>
            food.category &&
            food.category.trim() === "ของคาว"
    );

    const dessertFoods = favFoods.filter(
        (food) =>
            food.category &&
            food.category.trim() === "ของหวาน"
    );

    const otherFoods = favFoods.filter(
        (food) =>
            !food.category ||
            (
                food.category.trim() !== "ของคาว" &&
                food.category.trim() !== "ของหวาน"
            )
    );

    // ================= FOOD CARD =================

    const renderFoodCards = (foods) => (

        <div className="favorite-food-grid">

            {foods.map((food) => (

                <div
                    key={food.favorite_id}
                    className="favorite-food-card"
                >

                    <div className="favorite-food-image-box">

                        <img
                            src={food.image}
                            alt={food.food_name}
                            className="favorite-food-image"
                        />

                        <button
                            className="favorite-heart-btn"
                            onClick={() =>
                                removeFavoriteFood(food.favorite_id)
                            }
                        >
                            <FaHeart />
                        </button>

                    </div>

                    <div className="favorite-food-info">

                        <h3>
                            {food.food_name}
                        </h3>

                        <p>
                            {parseInt(food.calories)} kcal
                        </p>

                    </div>

                </div>

            ))}

        </div>

    );

    return (

        <div className="favorite-page">

            {/* ================= HEADER ================= */}

            <div className="favorite-header">

                <div className="favorite-icon">
                    <FaHeart />
                </div>

                <div>

                    <h1>
                        รายการโปรดของฉัน
                    </h1>

                    <p>
                        รวมเมนูอาหารและแผนการกินที่คุณชื่นชอบ
                    </p>

                </div>

            </div>

            {/* ================= TAB ================= */}

            <div className="favorite-tabs">

                <button
                    className={
                        activeTab === "foods"
                            ? "tab-btn active"
                            : "tab-btn"
                    }
                    onClick={() => setActiveTab("foods")}
                >

                    <FaUtensils />
                    รายการโปรดอาหาร

                </button>

                <button
                    className={
                        activeTab === "plans"
                            ? "tab-btn active"
                            : "tab-btn"
                    }
                    onClick={() => setActiveTab("plans")}
                >

                    <FaCalendarAlt />
                    แผนการกิน

                </button>

            </div>

            {/* ================= FOOD ================= */}

            {activeTab === "foods" && (

                <>

                    {savoryFoods.length > 0 && (

                        <div className="food-category">

                            <div className="section-top">

                                <h2>
                                    ของคาว ({savoryFoods.length})
                                </h2>

                            </div>

                            {renderFoodCards(savoryFoods)}

                        </div>

                    )}

                    {dessertFoods.length > 0 && (

                        <div className="food-category">

                            <div className="section-top">

                                <h2>
                                    ของหวาน ({dessertFoods.length})
                                </h2>

                            </div>

                            {renderFoodCards(dessertFoods)}

                        </div>

                    )}

                    {otherFoods.length > 0 && (

                        <div className="food-category">

                            <div className="section-top">

                                <h2>
                                    อื่น ๆ ({otherFoods.length})
                                </h2>

                            </div>

                            {renderFoodCards(otherFoods)}

                        </div>

                    )}

                    {favFoods.length === 0 && (

                        <div className="empty-box">
                            ยังไม่มีรายการโปรดอาหาร
                        </div>

                    )}

                </>

            )}

            {/* ================= PLAN ================= */}

            {activeTab === "plans" && (

                <>

                    <div className="section-top">

                        <h2>
                            แผนการกินโปรด ({favPlans.length})
                        </h2>

                    </div>

                    {favPlans.length === 0 ? (

                        <div className="empty-box">
                            ยังไม่มีรายการโปรดแผนอาหาร
                        </div>

                    ) : (

                        <div className="meal-plan-list">

                            {favPlans.map((plan) => (

                                <div
                                    key={plan.favorite_id}
                                    className="meal-plan-full-card"
                                >

                                    {/* HEADER */}
                                    <div className="plan-header">

                                        <div>

                                            <h2>
                                                {plan.plan_name || "แผนการกิน"}
                                            </h2>

                                            <p>
                                                รวม {parseInt(plan.total_calories)} kcal
                                            </p>

                                        </div>

                                        <button
                                            className="meal-fav-btn"
                                            onClick={() =>
                                                removeFavoritePlan(plan.favorite_id)
                                            }
                                        >
                                            <FaHeart />
                                        </button>

                                    </div>

                                    {/* BREAKFAST */}
                                    <div className="meal-row">

                                        <div className="meal-type">
                                            🌤️ มื้อเช้า
                                        </div>

                                        <img
                                            src={
                                                plan.breakfast_image ||
                                                "https://via.placeholder.com/120"
                                            }
                                            alt={plan.breakfast_name}
                                            className="meal-image"
                                        />

                                        <div className="meal-info">

                                            <h3>
                                                {plan.breakfast_name}
                                            </h3>

                                            <span>
                                                {parseInt(plan.breakfast_cal)} kcal
                                            </span>

                                        </div>

                                    </div>

                                    {/* LUNCH */}
                                    <div className="meal-row">

                                        <div className="meal-type">
                                            ☀️ มื้อกลางวัน
                                        </div>

                                        <img
                                            src={
                                                plan.lunch_image ||
                                                "https://via.placeholder.com/120"
                                            }
                                            alt={plan.lunch_name}
                                            className="meal-image"
                                        />

                                        <div className="meal-info">

                                            <h3>
                                                {plan.lunch_name}
                                            </h3>

                                            <span>
                                                {parseInt(plan.lunch_cal)} kcal
                                            </span>

                                        </div>

                                    </div>

                                    {/* DINNER */}
                                    <div className="meal-row">

                                        <div className="meal-type">
                                            🌙 มื้อเย็น
                                        </div>

                                        <img
                                            src={
                                                plan.dinner_image ||
                                                "https://via.placeholder.com/120"
                                            }
                                            alt={plan.dinner_name}
                                            className="meal-image"
                                        />

                                        <div className="meal-info">

                                            <h3>
                                                {plan.dinner_name}
                                            </h3>

                                            <span>
                                                {parseInt(plan.dinner_cal)} kcal
                                            </span>

                                        </div>

                                    </div>

                                    {/* SUMMARY */}
                                    <div className="plan-summary">

                                        <div className="summary-box">
                                            🔥 {parseInt(plan.total_calories)} kcal
                                        </div>

                                        <div className="summary-box">
                                            🍚 คาร์บ {parseInt(plan.carbs || 0)}g
                                        </div>

                                        <div className="summary-box">
                                            🥩 โปรตีน {parseInt(plan.protein || 0)}g
                                        </div>

                                        <div className="summary-box">
                                            🥑 ไขมัน {parseInt(plan.fat || 0)}g
                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </>

            )}

        </div>

    );

}

export default FavFood;