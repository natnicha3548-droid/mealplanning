import React, { useState, useEffect, useMemo, useRef } from "react";
import {
    FaSearch, FaHeart, FaRegHeart, FaLock,
    FaBreadSlice, FaDrumstickBite, FaTint, FaCandyCane, FaMortarPestle,
    FaTimes, FaStar, FaRegStar
} from "react-icons/fa";
import { MdDinnerDining } from "react-icons/md";
import { LuSoup } from "react-icons/lu";
import { MdLocalFireDepartment } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import "./MenuFood.css";

function MenuFood() {
    const navigate = useNavigate();

    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [selectedFood, setSelectedFood] = useState(null);
    const [selectedMeal, setSelectedMeal] = useState("breakfast");
    const [quantity, setQuantity] = useState(1);
    const [favFoodIds, setFavFoodIds] = useState([]);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = storedUser?.user_id || null;

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === "") return "0";

        const num = Number(value);

        // ถ้าเป็นจำนวนเต็ม ไม่แสดง .00
        if (Number.isInteger(num)) {
            return String(num);
        }

        // ถ้ามีทศนิยม แสดง 2 ตำแหน่ง
        return num.toFixed(2);
    };

    const [recommendations, setRecommendations] = useState([]);
    const [showRecommendModal, setShowRecommendModal] = useState(false);
    const [addedFood, setAddedFood] = useState(null);
    const [fromRecommend, setFromRecommend] = useState(false);

    // ===== REVIEW STATE =====
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [myReview, setMyReview] = useState(null);
    const [reviewSuccess, setReviewSuccess] = useState("");

    const maskEmail = (email) => {
        if (!email) return "ผู้ใช้งาน";
        const [local, domain] = email.split("@");
        if (!domain) return email;
        const masked = local.slice(0, 2) + "***";
        return `${masked}@${domain}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const parseRecipeDetails = (raw) => {
        if (!raw) return [];
        try {
            const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter((section) => {
                    const hasName = section.section_name && section.section_name.trim() !== "";
                    const hasBlocks = section.blocks?.some(
                        (b) => (b.block_title && b.block_title.trim() !== "") ||
                            (b.content && b.content.trim() !== "")
                    );
                    return hasName || hasBlocks;
                });
            }
        } catch (e) { }
        return [];
    };

    const getFoodData = (foodName) => {
        return foods.find(
            (f) => f.food_name?.toLowerCase() === foodName?.toLowerCase()
        ) || null;
    };

    const getFoodImage = (food) => {
        if (!food?.image) return null;
        return food.image.startsWith("http")
            ? food.image
            : `http://localhost:5000${food.image}`;
    };

    const handleCloseSelectedFood = () => {
        setSelectedFood(null);
        setFromRecommend(false);
        setReviews([]);
        setMyReview(null);
        setReviewRating(0);
        setReviewText("");
        setReviewSuccess("");
    };

    const openFoodFromRecommend = (foodName) => {
        const foodData = getFoodData(foodName);
        if (!foodData) return;
        setSelectedFood(foodData);
        setSelectedMeal("breakfast");
        setQuantity(1);
        setFromRecommend(true);
    };

    useEffect(() => {
        if (selectedFood) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => document.body.classList.remove("modal-open");
    }, [selectedFood]);

    // ===== FETCH REVIEWS เมื่อเปิดโมเดลอาหาร =====
    useEffect(() => {
        if (!selectedFood) return;

        const fetchReviews = async () => {
            setReviewsLoading(true);
            setReviews([]);
            setMyReview(null);
            setReviewRating(0);
            setReviewText("");
            setReviewSuccess("");

            try {
                // ดึงรีวิวที่อนุมัติแล้วของเมนูนี้
                const res = await fetch(`http://localhost:5000/api/reviews/${selectedFood.food_id}`);
                const data = await res.json();
                setReviews(Array.isArray(data) ? data : []);

                // ดึงรีวิวของผู้ใช้ปัจจุบัน (ถ้าล็อกอิน)
                if (currentUserId) {
                    const myRes = await fetch(
                        `http://localhost:5000/api/review-status?user_id=${currentUserId}&food_id=${selectedFood.food_id}`
                    );
                    const myData = await myRes.json();
                    setMyReview(myData);
                    if (myData?.isReviewed) {
                        setReviewRating(myData.rating || 0);
                        setReviewText(myData.review_text || "");
                    }
                }
            } catch (err) {
                console.error("Fetch reviews error:", err);
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchReviews();
    }, [selectedFood, currentUserId]);

    // ===== ส่งรีวิว =====
    const submitReview = async () => {
        if (!currentUserId) {
            openLoginPrompt();
            return;
        }
        if (reviewRating === 0) return;

        setReviewSubmitting(true);

        try {
            await fetch("http://localhost:5000/api/review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: currentUserId,
                    food_id: selectedFood.food_id,
                    rating: reviewRating,
                    review_text: reviewText.trim()
                })
            });

            setMyReview({
                isReviewed: true,
                rating: reviewRating,
                review_text: reviewText.trim()
            });
        } catch (err) {
            console.error("Submit review error:", err);
        } finally {
            setReviewSubmitting(false);
        }
    };

    const getDropdownLabel = () => {
        if (activeCategory === "all" || activeCategory === "fav") return "ทั้งหมด";
        const found = categories.find(c => c.category_id === activeCategory);
        return found ? found.category_name : "ทั้งหมด";
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [foodRes, catRes] = await Promise.all([
                    fetch("http://localhost:5000/api/foods"),
                    fetch("http://localhost:5000/api/categories")
                ]);
                const foodData = await foodRes.json();
                const catData = await catRes.json();
                setFoods(foodData);
                setCategories(
                    Array.isArray(catData)
                        ? catData.filter((c) => c.status === "active")
                        : []
                );

                if (currentUserId) {
                    const favRes = await fetch(`http://localhost:5000/api/favorite-foods?user_id=${currentUserId}`);
                    const favData = await favRes.json();
                    if (favRes.ok) setFavFoodIds(favData.map((f) => f.food_id));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUserId]);

    const openLoginPrompt = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setShowLoginPrompt(true);
    };

    const toggleFavorite = async (e, foodId) => {
        e.stopPropagation();
        if (!storedUser) {
            openLoginPrompt();
            return;
        }
        const isFav = favFoodIds.includes(foodId);
        setFavFoodIds(isFav
            ? favFoodIds.filter((id) => id !== foodId)
            : [...favFoodIds, foodId]
        );
        try {
            await fetch("http://localhost:5000/api/favorite-food", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: currentUserId, food_id: foodId }),
            });
        } catch (err) {
            console.error(err);
        }
    };

    const addToMealPlan = async () => {
        if (!currentUserId) {
            const guestCalc = JSON.parse(sessionStorage.getItem("activeCalcResult"));
            if (!guestCalc || !guestCalc.tdee) {
                alert("กรุณาคำนวณพลังงานและสารอาหารก่อนเพิ่มเมนูอาหาร");
                navigate("/calculate");
                return;
            }
        } else {
            try {
                const res = await fetch(`http://localhost:5000/api/get-calculation/${currentUserId}`);
                const calcData = await res.json();
                if (!calcData) {
                    alert("กรุณาคำนวณพลังงานและสารอาหารก่อนเพิ่มเมนูอาหาร");
                    navigate("/calculate");
                    return;
                }
            } catch (err) {
                console.error(err);
                alert("ไม่สามารถตรวจสอบข้อมูลการคำนวณได้");
                return;
            }
        }

        if (!selectedFood) {
            alert("กรุณาเลือกอาหาร");
            return;
        }

        const myPlate = JSON.parse(localStorage.getItem("myplate")) || [];
        const mealMap = { breakfast: "เช้า", lunch: "กลางวัน", dinner: "เย็น" };
        myPlate.push({
            id: Date.now(),
            food_id: selectedFood.food_id,
            name: selectedFood.food_name,
            image: selectedFood.image,
            qty: quantity,
            meal_type: mealMap[selectedMeal],
            calPerUnit: Number(selectedFood.calories),
            macros: {
                carbs: Number(selectedFood.carbohydrates),
                protein: Number(selectedFood.protein),
                fat: Number(selectedFood.fat),
                sugar: Number(selectedFood.sugar),
                sodium: Number(selectedFood.sodium),
            },
        });
        localStorage.setItem("myplate", JSON.stringify(myPlate));

        const foodForModal = selectedFood;
        setAddedFood(foodForModal);
        setSelectedFood(null);
        setFromRecommend(false);
        setQuantity(1);

        const mealTypeMap = { breakfast: "เช้า", lunch: "กลางวัน", dinner: "เย็น" };
        const mealForRecommend = mealTypeMap[selectedMeal];
        fetch(
            `http://localhost:5000/api/recommend/${encodeURIComponent(foodForModal.food_name)}?meal_type=${encodeURIComponent(mealForRecommend)}`
        )
            .then(res => res.json())
            .then(data => {
                setRecommendations(data || []);
                setShowRecommendModal(true);
            })
            .catch(err => {
                console.error(err);
                setRecommendations([]);
                setShowRecommendModal(true);
            });
    };

    const filteredFoods = useMemo(() => {
        return foods.filter((food) => {
            const matchSearch = (food.food_name || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            let matchCategory = true;
            if (activeCategory === "fav") {
                matchCategory = favFoodIds.includes(food.food_id);
            } else if (activeCategory !== "all") {
                matchCategory = food.category_id === activeCategory;
            }
            return matchSearch && matchCategory;
        });
    }, [foods, searchTerm, activeCategory, favFoodIds]);

    // ===== STAR COMPONENT =====
    const StarRating = ({ value, hover, onRate, onHover, onLeave, readonly = false }) => (
        <div className={`star-rating ${readonly ? "star-rating--readonly" : ""}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star-icon ${star <= (readonly ? value : (hover || value)) ? "star-icon--filled" : ""}`}
                    onClick={() => !readonly && onRate && onRate(star)}
                    onMouseEnter={() => !readonly && onHover && onHover(star)}
                    onMouseLeave={() => !readonly && onLeave && onLeave()}
                >
                    {star <= (readonly ? value : (hover || value)) ? <FaStar /> : <FaRegStar />}
                </span>
            ))}
        </div>
    );

    return (
        <div className="menu-page">

            {/* ================= LOGIN PROMPT MODAL ================= */}
            {showLoginPrompt && (
                <div
                    className="login-prompt-overlay"
                    onClick={() => setShowLoginPrompt(false)}
                >
                    <div
                        className="login-prompt-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="login-prompt-icon">
                            <FaLock />
                        </div>
                        <h3 className="login-prompt-title">กรุณาเข้าสู่ระบบ</h3>
                        <p className="login-prompt-desc">
                            คุณต้องเข้าสู่ระบบก่อน<br />จึงจะสามารถเพิ่มรายการโปรดได้
                        </p>
                        <button
                            className="login-prompt-btn-primary"
                            onClick={() => {
                                setShowLoginPrompt(false);
                                navigate("/auth", { state: { returnTo: "/menu" } });
                            }}
                        >
                            เข้าสู่ระบบ
                        </button>
                        <button
                            className="login-prompt-btn-cancel"
                            onClick={() => setShowLoginPrompt(false)}
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="menu-header">
                <div className="menu-title-box">
                    <div className="menu-icon"><LuSoup /></div>
                    <div>
                        <h1>เมนูอาหารทั้งหมด</h1>
                        <p>เลือกอาหารที่คุณชอบ</p>
                    </div>
                </div>
                <div className="search-wrapper">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="ค้นหาเมนูอาหาร..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link to="/myplate" className="plate-icon-btn">
                        <MdDinnerDining />
                    </Link>
                </div>
            </div>

            {/* ================= TOOLBAR: DROPDOWN & FAVORITE ================= */}
            <div className="menu-toolbar">

                {/* 1. Category Dropdown */}
                <div className="custom-dropdown" ref={dropdownRef}>
                    <div
                        className="dropdown-selected"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {getDropdownLabel()}
                        <span className={`arrow ${isDropdownOpen ? "open" : ""}`}>▼</span>
                    </div>

                    {isDropdownOpen && (
                        <div className="dropdown-menu">
                            <div
                                className="dropdown-item"
                                onClick={() => {
                                    setActiveCategory("all");
                                    setIsDropdownOpen(false);
                                }}
                            >
                                ทั้งหมด
                            </div>
                            {categories.map((cat) => (
                                <div
                                    key={cat.category_id}
                                    className="dropdown-item"
                                    onClick={() => {
                                        setActiveCategory(cat.category_id);
                                        setIsDropdownOpen(false);
                                    }}
                                >
                                    {cat.category_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Favorite Button */}
                <button
                    className={`fav-filter-btn ${activeCategory === "fav" ? "active" : ""}`}
                    onClick={() => {
                        if (!storedUser) {
                            openLoginPrompt();
                            return;
                        }
                        setActiveCategory("fav");
                    }}
                >
                    <FaHeart size={16} /> รายการโปรด
                </button>

            </div>

            {/* GRID */}
            <div className="food-grid">
                {loading ? (
                    <p>กำลังโหลดข้อมูล...</p>
                ) : filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => (
                        <div
                            key={food.food_id}
                            className="food-card"
                            onClick={() => {
                                setSelectedFood(food);
                                setSelectedMeal("breakfast");
                                setQuantity(1);
                                setFromRecommend(false);
                            }}
                        >
                            <button
                                className="fav-btn"
                                onClick={(e) => toggleFavorite(e, food.food_id)}
                            >
                                {favFoodIds.includes(food.food_id) ? <FaHeart /> : <FaRegHeart />}
                            </button>
                            <div className="food-img-wrapper">
                                <img
                                    src={
                                        food.image?.startsWith("http")
                                            ? food.image
                                            : `http://localhost:5000${food.image}`
                                    }
                                    alt={food.food_name}
                                />
                            </div>
                            <div className="food-info">
                                <h3>{food.food_name}</h3>
                                <p>{Number(food.calories).toFixed(0)} kcal</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">ไม่พบเมนูอาหาร</div>
                )}
            </div>

            {/* ================= FOOD DETAIL MODAL ================= */}
            {selectedFood && (() => {
                const recipeSections = parseRecipeDetails(selectedFood.recipe_details);
                return (
                    <div className="modal-overlay" onClick={handleCloseSelectedFood}>
                        <div className="food-modal" onClick={(e) => e.stopPropagation()}>

                            {/* ปุ่มหัวใจ + กากบาท ชิดขอบขวา */}
                            <div className="food-modal-actions">
                                <button
                                    className="bookmark-btn"
                                    onClick={(e) => toggleFavorite(e, selectedFood.food_id)}
                                >
                                    {favFoodIds.includes(selectedFood.food_id) ? <FaHeart /> : <FaRegHeart />}
                                </button>
                                <button
                                    className="food-modal-close-btn"
                                    onClick={handleCloseSelectedFood}
                                    aria-label="ปิด"
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* ===== LEFT ===== */}
                            <div className="food-modal-left">
                                <img
                                    src={
                                        selectedFood.image?.startsWith("http")
                                            ? selectedFood.image
                                            : `http://localhost:5000${selectedFood.image}`
                                    }
                                    alt={selectedFood.food_name}
                                    className="food-modal-image"
                                />

                                {selectedFood.description && selectedFood.description.trim() !== "" && (
                                    <div className="food-section">
                                        <h4>รายละเอียดอาหาร</h4>
                                        <div className="food-box detail-text">
                                            {selectedFood.description}
                                        </div>
                                    </div>
                                )}

                                {recipeSections.length > 0 && (
                                    <div className="food-section">
                                        <h4>ส่วนผสม / วิธีทำ</h4>
                                        {recipeSections.map((section, sIdx) => (
                                            <div key={sIdx} className="recipe-section-block">
                                                {section.section_name && section.section_name.trim() !== "" && (
                                                    <p className="recipe-section-name">{section.section_name}</p>
                                                )}
                                                {section.blocks?.map((block, bIdx) => (
                                                    <div key={bIdx} className="recipe-block">
                                                        {block.block_title && block.block_title.trim() !== "" && (
                                                            <p className="recipe-block-title">{block.block_title}</p>
                                                        )}
                                                        {block.content && block.content.trim() !== "" && (
                                                            <div className="food-box detail-text recipe-block-content">
                                                                {block.content}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedFood.notes && selectedFood.notes.trim() !== "" && (
                                    <div className="food-section">
                                        <h4>หมายเหตุ</h4>
                                        <div className="food-box food-box--note">
                                            {selectedFood.notes}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ===== RIGHT ===== */}
                            <div className="food-modal-right">
                                <h2>{selectedFood.food_name}</h2>

                                <div className="food-section">
                                    <h4>คุณค่าทางโภชนาการ</h4>
                                    <div className="nutrition-grid">
                                        <div className="nutri-card calorie">
                                            <MdLocalFireDepartment className="nutri-icon" />
                                            <p className="nutri-label">แคลอรี่</p>
                                            <span>{formatNumber(selectedFood.calories)} kcal</span>
                                        </div>
                                        <div className="nutri-card carb">
                                            <FaBreadSlice className="nutri-icon" />
                                            <p className="nutri-label">คาร์บ</p>
                                            <span>{formatNumber(selectedFood.carbohydrates)} g</span>
                                        </div>
                                        <div className="nutri-card protein">
                                            <FaDrumstickBite className="nutri-icon" />
                                            <p className="nutri-label">โปรตีน</p>
                                            <span>{formatNumber(selectedFood.protein)} g</span>
                                        </div>
                                        <div className="nutri-card fat">
                                            <FaTint className="nutri-icon" />
                                            <p className="nutri-label">ไขมัน</p>
                                            <span>{formatNumber(selectedFood.fat)} g</span>
                                        </div>
                                        <div className="nutri-card sugar">
                                            <FaCandyCane className="nutri-icon" />
                                            <p className="nutri-label">น้ำตาล</p>
                                            <span>{formatNumber(selectedFood.sugar)} g</span>
                                        </div>
                                        <div className="nutri-card sodium">
                                            <FaMortarPestle className="nutri-icon" />
                                            <p className="nutri-label">โซเดียม</p>
                                            <span>{formatNumber(selectedFood.sodium)} mg</span>
                                        </div>
                                    </div>
                                </div>

                                {/* MEAL SELECT */}
                                <div className="food-section">
                                    <h4>เลือกมื้ออาหาร</h4>
                                    <div className="meal-buttons">
                                        <button
                                            className={selectedMeal === "breakfast" ? "active" : ""}
                                            onClick={() => setSelectedMeal("breakfast")}
                                        >
                                            เช้า
                                        </button>
                                        <button
                                            className={selectedMeal === "lunch" ? "active" : ""}
                                            onClick={() => setSelectedMeal("lunch")}
                                        >
                                            กลางวัน
                                        </button>
                                        <button
                                            className={selectedMeal === "dinner" ? "active" : ""}
                                            onClick={() => setSelectedMeal("dinner")}
                                        >
                                            เย็น
                                        </button>
                                    </div>
                                </div>

                                {/* QUANTITY */}
                                <div className="quantity-section">
                                    <h4>จำนวน</h4>
                                    <div className="quantity-control">
                                        <button
                                            className="quantity-btn"
                                            onClick={() => setQuantity((p) => Math.max(1, p - 1))}
                                        >
                                            -
                                        </button>
                                        <span className="quantity-value">{quantity}</span>
                                        <button
                                            className="quantity-btn"
                                            onClick={() => setQuantity((p) => p + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <button className="add-btn" onClick={addToMealPlan}>
                                    เพิ่มใส่จานอาหาร
                                </button>

                                {/* ===== REVIEWS SECTION ===== */}
                                <div className="food-section review-section">
                                    <h4>รีวิวจากผู้ใช้</h4>

                                    {/* ฟอร์มเขียนรีวิว (เฉพาะผู้ล็อกอิน) */}
                                    {currentUserId ? (
                                        <div className="review-form">
                                            <p className="review-form-label">
                                                {myReview?.isReviewed ? "แก้ไขรีวิวของคุณ" : "เขียนรีวิวของคุณ"}
                                            </p>

                                            <StarRating
                                                value={reviewRating}
                                                hover={reviewHover}
                                                onRate={setReviewRating}
                                                onHover={setReviewHover}
                                                onLeave={() => setReviewHover(0)}
                                            />

                                            <textarea
                                                className="review-textarea"
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                placeholder="แสดงความคิดเห็นของคุณเกี่ยวกับเมนูนี้..."
                                                rows={3}
                                            />

                                            <button
                                                className="review-submit-btn"
                                                onClick={submitReview}
                                                disabled={reviewSubmitting || reviewRating === 0}
                                            >
                                                {reviewSubmitting
                                                    ? "กำลังส่ง..."
                                                    : myReview?.isReviewed
                                                        ? "อัปเดตรีวิว"
                                                        : "ส่งรีวิว"
                                                }
                                            </button>

                                            
                                        </div>
                                    ) : (
                                        <p className="review-login-hint">
                                            <span
                                                className="review-login-link"
                                                onClick={() => navigate("/auth", { state: { returnTo: "/menu" } })}
                                            >
                                                เข้าสู่ระบบ
                                            </span>{" "}
                                            เพื่อเขียนรีวิว
                                        </p>
                                    )}

                                    {/* รายการรีวิวที่อนุมัติแล้ว */}
                                    {reviewsLoading ? (
                                        <p className="review-loading">กำลังโหลดรีวิว...</p>
                                    ) : reviews.length > 0 ? (
                                        <div className="reviews-list">
                                            {reviews.map((r) => (
                                                <div key={r.review_id} className="review-item">
                                                    <div className="review-item-header">
                                                        <StarRating value={r.rating} readonly />
                                                        <span className="review-author">{maskEmail(r.email)}</span>
                                                        <span className="review-date">{formatDate(r.created_at)}</span>
                                                    </div>
                                                    {r.review_text && (
                                                        <p className="review-item-text">{r.review_text}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="review-empty">ยังไม่มีรีวิวสำหรับเมนูนี้</p>
                                    )}
                                </div>

                            </div>

                        </div>
                    </div>
                );
            })()}

            {/* ================= RECOMMEND MODAL ================= */}
            {showRecommendModal && addedFood && !selectedFood && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowRecommendModal(false)}
                >
                    <div
                        className="recommend-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="recommend-modal-header">
                            <h2 className="recommend-modal-title">{addedFood.food_name}</h2>
                            <button
                                className="recommend-close-btn"
                                onClick={() => setShowRecommendModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="recommend-food-img-wrap">
                            <img
                                src={
                                    addedFood.image?.startsWith("http")
                                        ? addedFood.image
                                        : `http://localhost:5000${addedFood.image}`
                                }
                                alt={addedFood.food_name}
                                className="recommend-food-img"
                            />
                            <div className="recommend-added-badge">
                                <span className="recommend-badge-check">✓</span>
                                เพิ่มเมนูอาหารนี้ใส่จานแล้ว
                            </div>
                        </div>

                        <div className="recommend-modal-bottom">
                            <div className="recommend-title-row">
                                <span className="recommend-title-icon">
                                    <MdLocalFireDepartment style={{ color: "white", fontSize: "1.1rem" }} />
                                </span>
                                <h3 className="recommend-title">เมนูแนะนำอาหาร{{ breakfast: "เช้า", lunch: "กลางวัน", dinner: "เย็น" }[selectedMeal]}</h3>
                            </div>

                            {recommendations.length > 0 ? (
                                <div className="recommend-cards-grid">
                                    {recommendations.slice(0, 3).map((item, index) => {
                                        const foodData = getFoodData(item.food);
                                        const img = getFoodImage(foodData);
                                        const calories = foodData?.calories
                                            ? Number(foodData.calories).toFixed(0)
                                            : null;
                                        return (
                                            <div
                                                key={index}
                                                className="recommend-card"
                                                onClick={() => openFoodFromRecommend(item.food)}
                                            >
                                                <div className="recommend-card-img-wrap">
                                                    {img ? (
                                                        <img src={img} alt={item.food} />
                                                    ) : (
                                                        <div className="recommend-card-img-placeholder">🍽️</div>
                                                    )}
                                                    <button
                                                        className="recommend-card-fav-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (foodData) toggleFavorite(e, foodData.food_id);
                                                        }}
                                                    >
                                                        {foodData && favFoodIds.includes(foodData.food_id)
                                                            ? <FaHeart />
                                                            : <FaRegHeart />
                                                        }
                                                    </button>
                                                </div>
                                                <div className="recommend-card-info">
                                                    <p className="recommend-card-name">{item.food}</p>
                                                    {calories && (
                                                        <p className="recommend-card-calorie">
                                                            <MdLocalFireDepartment />
                                                            {calories} แคล
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="recommend-empty">ยังไม่มีข้อมูลแนะนำ</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default MenuFood;
