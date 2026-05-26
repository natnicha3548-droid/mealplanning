import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MealPlan.css";
import {
  FaSun,
  FaCloudSun,
  FaMoon,
  FaPlus,
  FaTrash,
  FaHeart,
  FaPen,
  FaStar,
  FaRegStar,
  FaChartPie
} from "react-icons/fa";
import { LuNotebookPen } from "react-icons/lu";

const generateNext7Days = () => {
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const monthNames = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const fullDate = `${yyyy}-${mm}-${dd}`;

    days.push({
      name: dayNames[d.getDay()],
      date: `${d.getDate()} ${monthNames[d.getMonth()]}`,
      fullDate: fullDate,
    });
  }
  return days;
};

function MealPlan() {
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlanFav, setIsPlanFav] = useState(false);

  // 🌟 เพิ่ม State สำหรับเก็บสถานะการรีวิวของอาหารแต่ละเมนู
  const [reviewedStatus, setReviewedStatus] = useState({});

  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [goalData, setGoalData] = useState({
    tdee: 1600, carb: 0, protein: 0, fat: 0, sugar: 25, sodium: 2000  
  });

  const fetchMealPlanFromDB = async (date) => {
    setIsLoading(true);
    setIsPlanFav(false); 
    setReviewedStatus({}); // เคลียร์สถานะรีวิวเมื่อเปลี่ยนวัน

    try {
      const storedUser = localStorage.getItem("user");
      const currentUserId = storedUser ? JSON.parse(storedUser).user_id : 1;
      const response = await fetch(`http://localhost:5000/api/meals?date=${date}&userId=${currentUserId}`);
      
      if (!response.ok) throw new Error("เกิดข้อผิดพลาด");
      const dataFromDB = await response.json();
      setMealPlan(dataFromDB);

      // 🌟 ทันทีที่โหลดข้อมูลแผนอาหารสำเร็จ ให้ไปเช็กสถานะหัวใจและรีวิว
      if (dataFromDB.length > 0) {
        const planId = dataFromDB[0].plan_id;

        // 1. เช็กสถานะหัวใจ (Favorite)
        fetch(`http://localhost:5000/api/favorite-status?user_id=${currentUserId}&plan_id=${planId}`)
          .then(res => res.json())
          .then(data => setIsPlanFav(data.isFav))
          .catch(err => console.error("Error fetching favorite status:", err));

        // 2. เช็กสถานะการรีวิวของอาหารแต่ละรายการในแผน
        const uniqueFoodIds = [...new Set(dataFromDB.map(m => m.food_id))]; // หา ID อาหารแบบไม่ซ้ำ
        uniqueFoodIds.forEach(foodId => {
          fetch(`http://localhost:5000/api/review-status?user_id=${currentUserId}&food_id=${foodId}`)
            .then(res => res.json())
            .then(data => {
              if (data.isReviewed) {
                // เก็บข้อมูลการรีวิวลง State โดยใช้ food_id เป็น Key
                setReviewedStatus(prev => ({
                  ...prev,
                  [foodId]: data
                }));
              }
            })
            .catch(err => console.error("Error fetching review status:", err));
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setMealPlan([]); 
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const days = generateNext7Days();
    setWeekDays(days);
    const storedUser = localStorage.getItem("user");
    const currentUserId = storedUser ? JSON.parse(storedUser).user_id : 1;

    fetch(`http://localhost:5000/api/get-calculation/${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setGoalData({
            tdee: data.tdee || 1600, carb: data.carb || 0, protein: data.protein || 0,
            fat: data.fat || 0, sugar: data.sugar || 25, sodium: data.sodium || 2000   
          });
        }
      }).catch(err => console.error(err));

    fetchMealPlanFromDB(days[0].fullDate);
  }, []);

  const handleDayClick = (index) => {
    setSelectedDay(index);
    fetchMealPlanFromDB(weekDays[index].fullDate);
  };

  const handleEditPlan = () => {
    if (mealPlan.length === 0) return;
    
    const draftPlate = mealPlan.map(meal => ({
      id: meal.meal_detail_id, 
      food_id: meal.food_id,
      name: meal.food_name,
      image: meal.image,
      calPerUnit: Number(meal.calories),
      qty: Number(meal.quantity),
      type: `มื้อ${meal.meal_type}`,
      macros: {
        carbs: Number(meal.carbohydrates),
        protein: Number(meal.protein),
        fat: Number(meal.fat),
        sugar: Number(meal.sugar),
        sodium: Number(meal.sodium)
      }
    }));

    localStorage.setItem("draft_plate", JSON.stringify(draftPlate));
    navigate("/MyPlate"); 
  };

  const handleSaveFavoritePlan = async () => {
    if (!mealPlan || mealPlan.length === 0) return; 
    
    const planId = mealPlan[0].plan_id;
    const storedUser = localStorage.getItem("user");
    const currentUserId = storedUser ? JSON.parse(storedUser).user_id : 1;

    try {
      const response = await fetch("http://localhost:5000/api/favorite-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, plan_id: planId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsPlanFav(data.isFav); 
        
        if (data.isFav) {
           alert("บันทึกแผนอาหารของวันนี้เป็นเซ็ตโปรดเรียบร้อยแล้ว! ❤️");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm("คุณต้องการลบแผนอาหารทั้งหมดของวันนี้ใช่หรือไม่? ข้อมูลทั้งหมดจะหายไป")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/plan/${planId}`, { 
        method: "DELETE" 
      });
      if (response.ok) {
        alert("ลบแผนอาหารของวันนี้สำเร็จ");
        fetchMealPlanFromDB(weekDays[selectedDay].fullDate); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 🌟 ฟังก์ชันเปิดหน้าต่างรีวิว (ตั้งค่ารีวิวเดิมถ้าเคยรีวิวแล้ว)
  const handleOpenReviewModal = (meal) => {
    setReviewTarget(meal);
    if (reviewedStatus[meal.food_id]) {
        // ถ้าเคยรีวิวแล้ว ให้ดึงดาวและข้อความเดิมมาแสดง
        setRating(reviewedStatus[meal.food_id].rating);
        setReviewText(reviewedStatus[meal.food_id].review_text);
    } else {
        // ถ้ายังไม่เคยรีวิว ให้ค่าเริ่มต้นเป็น 5 ดาวและช่องว่าง
        setRating(5);
        setReviewText("");
    }
  };

  const handleConfirmReview = async () => {
    if (!reviewText.trim()) return alert("กรุณาพิมพ์ข้อความรีวิวด้วยครับ");
    const storedUser = localStorage.getItem("user");
    const currentUserId = storedUser ? JSON.parse(storedUser).user_id : 1;
    try {
      const response = await fetch("http://localhost:5000/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, food_id: reviewTarget.food_id, rating, review_text: reviewText })
      });
      if (response.ok) {
        alert("บันทึกรีวิวของคุณเรียบร้อยแล้ว รอการอนุมัติจากระบบครับ ⭐");
        
        // 🌟 อัปเดต State ทันทีเพื่อให้ดาวที่หน้าจอเปลี่ยนสีเป็นสีเหลืองโดยไม่ต้องโหลดหน้าใหม่
        setReviewedStatus(prev => ({
            ...prev,
            [reviewTarget.food_id]: { isReviewed: true, rating, review_text: reviewText }
        }));

        setReviewTarget(null); 
        setReviewText("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const totalCalories = mealPlan.reduce((sum, meal) => sum + (Number(meal.total_calories) || 0), 0);
  const totalCarbs = mealPlan.reduce((sum, meal) => sum + (Number(meal.carbohydrates || 0) * (meal.quantity || 1)), 0);
  const totalProtein = mealPlan.reduce((sum, meal) => sum + (Number(meal.protein || 0) * (meal.quantity || 1)), 0);
  const totalFat = mealPlan.reduce((sum, meal) => sum + (Number(meal.fat || 0) * (meal.quantity || 1)), 0);
  const totalSugar = mealPlan.reduce((sum, meal) => sum + (Number(meal.sugar || 0) * (meal.quantity || 1)), 0);
  const totalSodium = mealPlan.reduce((sum, meal) => sum + (Number(meal.sodium || 0) * (meal.quantity || 1)), 0);

  const goalCalories = goalData.tdee;
  const progressWidth = Math.min((totalCalories / goalCalories) * 100, 100);
  const fillPercentage = Math.min((totalCalories / goalCalories) * 100, 100);
  const totalMacros = totalCarbs + totalProtein + totalFat + totalSugar + (totalSodium / 1000) || 1;

  const pCarb = Math.round((totalCarbs / totalMacros) * 100) || 0;
  const pPro = Math.round((totalProtein / totalMacros) * 100) || 0;
  const pFat = Math.round((totalFat / totalMacros) * 100) || 0;
  const pSug = Math.round((totalSugar / totalMacros) * 100) || 0;
  const pSod = totalMacros > 1 ? Math.max(0, 100 - pCarb - pPro - pFat - pSug) : 0; 

  const endCarb = (totalCarbs / totalMacros) * fillPercentage;
  const endPro = endCarb + ((totalProtein / totalMacros) * fillPercentage);
  const endFat = endPro + ((totalFat / totalMacros) * fillPercentage);
  const endSug = endFat + ((totalSugar / totalMacros) * fillPercentage);
  const endSod = fillPercentage;

  const circleStyle = {
    background: totalCalories === 0 
      ? `#f0f0f0` 
      : `radial-gradient(closest-side, white 85%, transparent 86% 100%), conic-gradient(#FF9F43 0% ${endCarb}%, #EE5253 ${endCarb}% ${endPro}%, #10AC84 ${endPro}% ${endFat}%, #0984E3 ${endFat}% ${endSug}%, #FDCB6E ${endSug}% ${endSod}%, #f0f0f0 ${endSod}% 100%)`
  };

  const renderIcon = (mealType) => {
    if (mealType === "เช้า") return <FaSun style={{ color: "#FF9F43" }} />;
    if (mealType === "กลางวัน") return <FaCloudSun style={{ color: "#fb4949" }} />;
    return <FaMoon style={{ color: "#9074ff" }} />;
  };

  const groupedMeals = mealPlan.reduce((acc, meal) => {
    if (!acc[meal.meal_type]) acc[meal.meal_type] = [];
    acc[meal.meal_type].push(meal);
    return acc;
  }, {});

  return (
    <div className="meal-page">
      <header className="meal-top">
        <div className="meal-left">
          <div className="meal-left-icon"><LuNotebookPen /></div>
          <div className="meal-text">
            <h1>แผนการกินของฉัน</h1>
            <p>วางแผนมื้ออาหารล่วงหน้า เพื่อสุขภาพที่ดีในทุกวัน</p>
          </div>
        </div>
        <Link 
          to="/MyPlate" 
          className="create-btn" 
          style={{ textDecoration: 'none' }}
          onClick={() => localStorage.removeItem("draft_plate")}
        >
          <FaPlus /> สร้างแผนใหม่
        </Link>
      </header>

      <nav className="days-row">
        {weekDays.map((day, idx) => (
          <div key={idx} className={`day ${idx === selectedDay ? "active" : ""}`} onClick={() => handleDayClick(idx)}>
            <h4>{idx === 0 ? "วันนี้" : day.name}</h4>
            <span>{day.date}</span>
          </div>
        ))}
      </nav>

      <main className="meal-layout">
        <section className="meal-list">
          {isLoading ? (
            <div className="empty-msg">กำลังโหลดข้อมูลมื้ออาหาร...</div>
          ) : mealPlan.length === 0 ? (
            <div className="empty-msg">ยังไม่มีแผนการกินในวันนี้</div>
          ) : (
            <div className="unified-plan-card">
              
              <div className="card-top-header-actions">
                <span className="card-header-date-title">เมนูอาหารของฉัน</span>
                <div className="global-icon-actions-group">
                  {/* 🌟 เพิ่ม style เช็กสีหัวใจ */}
                  <button 
                    className={`global-icon-action-btn btn-fav ${isPlanFav ? "active" : ""}`} 
                    style={{ color: isPlanFav ? "red" : "#ddaa9d" }}
                    title="บันทึกแผนนี้เป็นเซ็ตโปรด" 
                    onClick={() => handleSaveFavoritePlan()}
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>

              {Object.keys(groupedMeals).map((mealType) => (
              <div className="meal-group" key={mealType}>
                {groupedMeals[mealType].map((meal, index) => (
                  <div className="meal-row-item" key={index}>
                    <div className="meal-item-left">
                      {index === 0 ? (
                        <div className={`meal-time-column type-${meal.meal_type}`}>
                          <div className="meal-icon-circle">{renderIcon(meal.meal_type)}</div>
                          <span className="meal-text-label">มื้อ{meal.meal_type}</span>
                        </div>
                      ) : (
                        <div className="meal-time-column-placeholder"></div>
                      )}

                      <img src={meal.image} alt={meal.food_name} className="row-img" />
                      <div className="row-details">
                        <h2>{meal.food_name}</h2>
                        <span className="row-qty-tag">
                          {Number(meal.quantity).toFixed(0)} {meal.serving_size ? meal.serving_size.replace(/[0-9\s]/g, '') : "จาน"}
                        </span>
                      </div>
                    </div>

                    <div className="meal-item-right">
                      <div className="row-calories-display">{Number(meal.total_calories).toFixed(0)} kcal</div>
                      {/* 🌟 เปลี่ยนสีดาวเป็นสีเหลืองถ้าเคยรีวิวแล้ว */}
                      <button 
                        className={`row-action-btn btn-star ${reviewedStatus[meal.food_id] ? "active" : ""}`} 
                        title="เขียนรีวิวเมนูนี้" 
                        onClick={() => handleOpenReviewModal(meal)}
                        style={{ color: reviewedStatus[meal.food_id] ? "#ffb936" : "#ddaa9d" }} 
                      >
                        <FaStar style={{ color: reviewedStatus[meal.food_id] ? "#FDCB6E" : "#ddaa9d" }} /> 
                        <span style={{ color: reviewedStatus[meal.food_id] ? "#FDCB6E" : "#ddaa9d" }}>รีวิว</span>
                      </button>
                    </div>
                  </div>
                ))}
                <div className="meal-group-divider"></div>
              </div>
            ))}

              <div className="card-bottom-header-actions">
                <div className="global-icon-actions-group">
                  <button className="global-icon-action-btn btn-edit" title="แก้ไขแผนอาหารของวันนี้" onClick={handleEditPlan}>
                    <FaPen />
                  </button>
                  <button className="global-icon-action-btn btn-delete" title="ลบแผนอาหารของวันนี้ทั้งหมด" onClick={() => handleDeletePlan(mealPlan[0].plan_id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>

            </div>
          )}
        </section>

        <aside className="summary-card">
          <h2>สรุป{selectedDay === 0 ? "วันนี้" : `วัน${weekDays[selectedDay]?.name}`}</h2>
          <div className="circle-box"><div className="circle" style={circleStyle}><h1>{totalCalories.toFixed(0)}</h1><span>kcal</span></div></div>
          <div className="summary-list">
            <NutritionItem label="คาร์โบไฮเดรต" value={`${pCarb}%`} grams={`${totalCarbs.toFixed(1)} / ${Number(goalData.carb).toFixed(0)}g`} />
            <NutritionItem label="โปรตีน" value={`${pPro}%`} grams={`${totalProtein.toFixed(1)} / ${Number(goalData.protein).toFixed(0)}g`} />
            <NutritionItem label="ไขมัน" value={`${pFat}%`} grams={`${totalFat.toFixed(1)} / ${Number(goalData.fat).toFixed(0)}g`} />
            <NutritionItem label="น้ำตาล" value={`${pSug}%`} grams={`${totalSugar.toFixed(1)} / ${Number(goalData.sugar).toFixed(0)}g`} />
            <NutritionItem label="โซเดียม" value={`${pSod}%`} grams={`${totalSodium.toFixed(0)} / ${Number(goalData.sodium).toFixed(0)}mg`} />
          </div>
          <div className="goal-box">
            <div className="goal-top"><span>เป้าหมายรายวัน</span><strong>{totalCalories.toFixed(0)} / {Number(goalCalories).toFixed(0)} kcal</strong></div>
            <div className="goal-bar"><div className="goal-fill" style={{ width: `${progressWidth}%` }}></div></div>
          </div>
          {/* 🌟 เพิ่มปุ่ม Nutrition Report ตรงนี้ 🌟 */}
          <button 
            className="nutrition-report-btn"
            onClick={() => navigate("/report")} // 👈 เปลี่ยน URL ไปยังหน้าที่คุณต้องการ
          >
            <FaChartPie /> ดูรายงานโภชนาการ
          </button>
        </aside>
      </main>

      {reviewTarget && (
        <div className="review-modal-overlay">
          <div className="review-modal-box">
            <h3>เขียนรีวิวให้เมนู "{reviewTarget.food_name}"</h3>
            <div className="star-rating-row">
              {[1, 2, 3, 4, 5].map((num) => (
                <span key={num} onClick={() => setRating(num)} style={{ cursor: "pointer", fontSize: "1.8rem" }}>
                  {num <= rating ? <FaStar style={{ color: "#FDCB6E" }} /> : <FaRegStar style={{ color: "#ccc" }} />}
                </span>
              ))}
            </div>
            <textarea rows="4" placeholder="เมนูนี้รสชาติเป็นอย่างไรบ้าง?..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="review-textarea" />
            <div className="modal-btn-row">
              <button className="modal-cancel-btn" onClick={() => setReviewTarget(null)}>ยกเลิก</button>
              <button className="modal-submit-btn" onClick={handleConfirmReview}>บันทึกรีวิว</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const NutritionItem = ({ label, value, grams }) => (
  <div className="summary-item">
    <span>{label} <small style={{color:"#aaa", fontSize:"0.8rem"}}>({grams})</small></span>
    <strong>{value}</strong>
  </div>
);

export default MealPlan;