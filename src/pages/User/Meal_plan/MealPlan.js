import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import "./MealPlan.css";
import { FaSun, FaCloudSun, FaMoon, FaPlus, FaTrash, FaHeart, FaPen, FaStar, FaRegStar, FaChartPie } from "react-icons/fa";
import { LuNotebookPen } from "react-icons/lu";

const generateNext7Days = () => {
  const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push({ name: dayNames[d.getDay()], date: `${d.getDate()} ${monthNames[d.getMonth()]}`, fullDate: `${yyyy}-${mm}-${dd}` });
  }
  return days;
};

const mealIcons = {
  'เช้า': 'icon-breakfast',
  'กลางวัน': 'icon-lunch',
  'เย็น': 'icon-dinner'
};

const mealThemeColors = {
  'เช้า': '#ff9800',
  'กลางวัน': '#f44336',
  'เย็น': '#9c27b0'
};

function MealPlan() {
  const navigate = useNavigate();
  const [mealPlan, setMealPlan] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(Number(sessionStorage.getItem("meal_selectedDay")) || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlanFav, setIsPlanFav] = useState(false);
  const [reviewedStatus, setReviewedStatus] = useState({});
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptReturnTo, setLoginPromptReturnTo] = useState("/meal-plan");

  const [goalData, setGoalData] = useState({ tdee: 0, carb: 0, protein: 0, fat: 0, sugar: 0, sodium: 0 });

  const fetchMealPlanFromDB = async (date) => {
    setIsLoading(true);
    setIsPlanFav(false);
    setReviewedStatus({});

    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (!parsedUser?.user_id) {
      setMealPlan([]);
      setIsLoading(false);
      return;
    }

    try {
      const currentUserId = parsedUser.user_id;
      const response = await fetch(`http://localhost:5000/api/meals?date=${date}&userId=${currentUserId}`);
      if (!response.ok) throw new Error("เกิดข้อผิดพลาด");
      const dataFromDB = await response.json();
      setMealPlan(dataFromDB);

      if (dataFromDB.length > 0) {
        const planId = dataFromDB[0].plan_id;
        fetch(`http://localhost:5000/api/favorite-status?user_id=${currentUserId}&plan_id=${planId}`)
          .then(res => res.json())
          .then(data => setIsPlanFav(data.isFav))
          .catch(err => console.error(err));

        const uniqueFoodIds = [...new Set(dataFromDB.map(m => m.food_id))];
        uniqueFoodIds.forEach(foodId => {
          fetch(`http://localhost:5000/api/review-status?user_id=${currentUserId}&food_id=${foodId}`)
            .then(res => res.json())
            .then(data => { if (data.isReviewed) setReviewedStatus(prev => ({ ...prev, [foodId]: data })); })
            .catch(err => console.error(err));
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setMealPlan([]);
      setIsLoading(false);
    }
  };

  useEffect(() => { sessionStorage.setItem("meal_selectedDay", selectedDay); }, [selectedDay]);

  useEffect(() => {
    const days = generateNext7Days();
    setWeekDays(days);

    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (parsedUser?.user_id) {
      // MEMBER → โหลดจาก DB
      fetch(`http://localhost:5000/api/get-calculation/${parsedUser.user_id}`)
        .then(res => res.json())
        .then(data => {
          if (data) setGoalData({ tdee: data.tdee || 0, carb: data.carb || 0, protein: data.protein || 0, fat: data.fat || 0, sugar: data.sugar || 0, sodium: data.sodium || 0 });
        }).catch(err => console.error(err));
    } else {
      // GUEST → โหลดจาก localStorage["calcResult"] ที่เดียว
      const saved = JSON.parse(localStorage.getItem("calcResult"));
      if (saved) setGoalData({
        tdee: saved.tdee || 0,
        carb: saved.carb || 0,
        protein: saved.protein || 0,
        fat: saved.fat || 0,
        sugar: saved.sugar || 0,
        sodium: saved.sodium || 0
      });
    }

    fetchMealPlanFromDB(days[0].fullDate);
  }, []);

  const handleDayClick = (index) => { setSelectedDay(index); fetchMealPlanFromDB(weekDays[index].fullDate); };

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!storedUser;

  const requireLogin = (returnPath = "/meal-plan") => {
    setLoginPromptReturnTo(returnPath);
    setShowLoginPrompt(true);
  };

  const handleEditPlan = () => {
    if (mealPlan.length === 0) return;
    if (!isLoggedIn) { requireLogin("/meal-plan"); return; }
    const draftPlate = mealPlan.map(meal => ({
      id: meal.meal_detail_id, food_id: meal.food_id, name: meal.food_name, image: meal.image,
      calPerUnit: Number(meal.calories), qty: Number(meal.quantity), meal_type: meal.meal_type,
      macros: { carbs: Number(meal.carbohydrates), protein: Number(meal.protein), fat: Number(meal.fat), sugar: Number(meal.sugar), sodium: Number(meal.sodium) }
    }));
    localStorage.setItem("plan_plate", JSON.stringify(draftPlate));
    navigate("/MyPlate?mode=plan");
  };

  const handleSaveFavoritePlan = async () => {
    if (!mealPlan || mealPlan.length === 0) return;
    if (!isLoggedIn) { requireLogin("/meal-plan"); return; }
    const planId = mealPlan[0].plan_id;
    try {
      const response = await fetch("http://localhost:5000/api/favorite-plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: storedUser.user_id, plan_id: planId })
      });
      if (response.ok) {
        const data = await response.json();
        setIsPlanFav(data.isFav);
        if (data.isFav) alert("บันทึกแผนอาหารของวันนี้เป็นเซ็ตโปรดเรียบร้อยแล้ว! ❤️");
      }
    } catch (error) { console.error(error); }
  };

  const handleDeletePlan = async (planId) => {
    if (!isLoggedIn) { requireLogin("/meal-plan"); return; }
    if (!window.confirm("คุณต้องการลบแผนอาหารทั้งหมดของวันนี้ใช่หรือไม่? ข้อมูลทั้งหมดจะหายไป")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/plan/${planId}`, { method: "DELETE" });
      if (response.ok) { alert("ลบแผนอาหารของวันนี้สำเร็จ"); fetchMealPlanFromDB(weekDays[selectedDay].fullDate); }
    } catch (error) { console.error(error); }
  };

  const handleOpenReviewModal = (meal) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!isLoggedIn) { requireLogin("/meal-plan"); return; }
    setReviewTarget(meal);
    if (reviewedStatus[meal.food_id]) {
      setRating(reviewedStatus[meal.food_id].rating);
      setReviewText(reviewedStatus[meal.food_id].review_text);
    } else {
      setRating(5);
      setReviewText("");
    }
  };

  const handleConfirmReview = async () => {
    if (!reviewText.trim()) return alert("กรุณาพิมพ์ข้อความรีวิวด้วยครับ");
    const currentUserId = storedUser ? JSON.parse(localStorage.getItem("user")).user_id : null;
    try {
      const response = await fetch("http://localhost:5000/api/review", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId, food_id: reviewTarget.food_id, rating, review_text: reviewText })
      });
      if (response.ok) {
        alert("บันทึกรีวิวของคุณเรียบร้อยแล้ว รอการอนุมัติจากระบบครับ ⭐");
        setReviewedStatus(prev => ({ ...prev, [reviewTarget.food_id]: { isReviewed: true, rating, review_text: reviewText } }));
        setReviewTarget(null); setReviewText("");
      }
    } catch (error) { console.error(error); }
  };

  const totalCalories = mealPlan.reduce((sum, meal) => sum + (Number(meal.total_calories) || 0), 0);
  const totalCarbs = mealPlan.reduce((sum, meal) => sum + (Number(meal.carbohydrates || 0) * (meal.quantity || 1)), 0);
  const totalProtein = mealPlan.reduce((sum, meal) => sum + (Number(meal.protein || 0) * (meal.quantity || 1)), 0);
  const totalFat = mealPlan.reduce((sum, meal) => sum + (Number(meal.fat || 0) * (meal.quantity || 1)), 0);
  const totalSugar = mealPlan.reduce((sum, meal) => sum + (Number(meal.sugar || 0) * (meal.quantity || 1)), 0);
  const totalSodium = mealPlan.reduce((sum, meal) => sum + (Number(meal.sodium || 0) * (meal.quantity || 1)), 0);

  const goalCalories = goalData.tdee;
  const progressWidth = goalCalories > 0 ? Math.min((totalCalories / goalCalories) * 100, 100) : 0;
  const fillPercentage = goalCalories > 0 ? Math.min((totalCalories / goalCalories) * 100, 100) : 0;
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
    if (mealType === "เช้า") return <FaSun size={26} style={{ color: "#FF9F43" }} />;
    if (mealType === "กลางวัน") return <FaCloudSun size={26} style={{ color: "#fb4949" }} />;
    return <FaMoon size={24} style={{ color: "#9074ff" }} />;
  };

  const groupedMeals = mealPlan.reduce((acc, meal) => {
    if (!acc[meal.meal_type]) acc[meal.meal_type] = [];
    acc[meal.meal_type].push(meal);
    return acc;
  }, {});

  return (
    <div className="meal-page">

      {showLoginPrompt && createPortal(
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 12px 40px rgba(0,0,0,0.18)", padding: "40px 36px", maxWidth: "380px", width: "90%", textAlign: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "52px", marginBottom: "12px" }}>🔒</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#333", marginBottom: "10px" }}>กรุณาเข้าสู่ระบบ</h3>
            <p style={{ color: "#888", fontSize: "0.95rem", marginBottom: "28px", lineHeight: "1.7" }}>
              คุณต้องเข้าสู่ระบบก่อน<br />จึงจะสามารถใช้ฟีเจอร์นี้ได้
            </p>
            <button
              onClick={() => { setShowLoginPrompt(false); navigate("/auth", { state: { returnTo: loginPromptReturnTo } }); }}
              style={{ background: "linear-gradient(135deg, #ff9800, #f44336)", color: "#fff", border: "none", borderRadius: "12px", padding: "13px 0", fontSize: "1rem", fontWeight: "700", cursor: "pointer", width: "100%", marginBottom: "12px" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.88"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => setShowLoginPrompt(false)}
              style={{ background: "transparent", color: "#aaa", border: "1.5px solid #e0e0e0", borderRadius: "12px", padding: "11px 0", fontSize: "0.95rem", cursor: "pointer", width: "100%" }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = "#bbb"}
              onMouseOut={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
            >
              ยกเลิก
            </button>
          </div>
        </div>,
        document.body
      )}

      <header className="meal-top">
        <div className="meal-left">
          <div className="meal-left-icon"><LuNotebookPen /></div>
          <div className="meal-text">
            <h1>แผนการกินของฉัน</h1>
            <p>วางแผนมื้ออาหารล่วงหน้า เพื่อสุขภาพที่ดีในทุกวัน</p>
          </div>
        </div>
        <Link to="/MyPlate?mode=plan" className="create-btn" style={{ textDecoration: "none" }} onClick={() => localStorage.removeItem("plan_plate")}>
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
            <div className="past-plan-card">
              <div className="meal-list-header">
                <h3>เมนูอาหารของฉัน</h3>
                <button
                  className={`heart-icon-btn ${isPlanFav ? "active" : ""}`}
                  aria-label="Favorite"
                  onClick={handleSaveFavoritePlan}
                  style={{ backgroundColor: isPlanFav ? '#fff0f2' : 'transparent', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}
                >
                  <FaHeart size={22} style={{ color: isPlanFav ? "red" : "#ddaa9d", transition: 'color 0.3s' }} />
                </button>
              </div>

              <div className="meal-items">
                {Object.keys(groupedMeals).map((mealType) => (
                  <div className="meal-group" key={mealType}>
                    <div className="meal-type">
                      <span className={`meal-icon ${mealIcons[mealType] || ''}`}>{renderIcon(mealType)}</span>
                      <span className="meal-type-text" style={{ color: mealThemeColors[mealType] }}>มื้อ{mealType}</span>
                    </div>
                    <div className="meal-items-list">
                      {groupedMeals[mealType].map((meal, index) => (
                        <div className="meal-card" key={index}>
                          <div className="meal-detail">
                            <img src={meal.image?.startsWith("http") ? meal.image : `http://localhost:5000${meal.image}`} alt={meal.food_name} className="meal-image" />
                            <div className="meal-info">
                              <h4>{meal.food_name}</h4>
                              <span className="meal-portion">{meal.serving_size || `${Number(meal.quantity).toFixed(0)} จาน`}</span>
                            </div>
                          </div>
                          <div className="meal-stats">
                            <span className="meal-cal">{Number(meal.total_calories).toFixed(0)} kcal</span>
                            <span className="meal-review" onClick={() => handleOpenReviewModal(meal)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: reviewedStatus[meal.food_id] ? "#FDCB6E" : "#ddaa9d", fontWeight: reviewedStatus[meal.food_id] ? "500" : "400", cursor: "pointer", transition: "color 0.2s" }}>
                              <FaStar size={16} style={{ color: reviewedStatus[meal.food_id] ? "#FDCB6E" : "#ddaa9d" }} />
                              {reviewedStatus[meal.food_id] ? "แก้ไขรีวิว" : "รีวิว"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="meal-total-row">
                <span className="total-label">รวมทั้งหมด</span>
                <span className="total-value">{totalCalories.toFixed(0)} kcal</span>
              </div>

              <div className="meal-list-footer">
                <div className="global-icon-actions-group">
                  <button className="global-icon-action-btn btn-edit" title="แก้ไขแผนอาหารของวันนี้" onClick={handleEditPlan}><FaPen /></button>
                  <button className="global-icon-action-btn btn-delete" title="ลบแผนอาหารของวันนี้ทั้งหมด" onClick={() => handleDeletePlan(mealPlan[0].plan_id)}><FaTrash /></button>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="summary-card">
          <h2>สรุป{selectedDay === 0 ? "วันนี้" : `วัน${weekDays[selectedDay]?.name}`}</h2>
          <div className="circle-box">
            <div className="circle" style={circleStyle}>
              <h1>{totalCalories.toFixed(0)}</h1>
              <span>kcal</span>
            </div>
          </div>
          <div className="summary-list">
            <NutritionItem label="คาร์โบไฮเดรต" value={`${pCarb}%`} grams={`${totalCarbs.toFixed(1)} / ${Number(goalData.carb).toFixed(0)}g`} />
            <NutritionItem label="โปรตีน" value={`${pPro}%`} grams={`${totalProtein.toFixed(1)} / ${Number(goalData.protein).toFixed(0)}g`} />
            <NutritionItem label="ไขมัน" value={`${pFat}%`} grams={`${totalFat.toFixed(1)} / ${Number(goalData.fat).toFixed(0)}g`} />
            <NutritionItem label="น้ำตาล" value={`${pSug}%`} grams={`${totalSugar.toFixed(1)} / ${Number(goalData.sugar).toFixed(0)}g`} />
            <NutritionItem label="โซเดียม" value={`${pSod}%`} grams={`${totalSodium.toFixed(0)} / ${Number(goalData.sodium).toFixed(0)}mg`} />
          </div>
          <div className="goal-box">
            <div className="goal-top">
              <span>เป้าหมายรายวัน</span>
              <strong>{totalCalories.toFixed(0)} / {goalCalories > 0 ? Number(goalCalories).toFixed(0) : "0"} kcal</strong>
            </div>
            <div className="goal-bar">
              <div className="goal-fill" style={{ width: `${progressWidth}%` }}></div>
            </div>
          </div>
          <button className="nutrition-report-btn" onClick={() => navigate("/report")}>
            <FaChartPie /> ดูรายงานโภชนาการ
          </button>
        </aside>
      </main>

      {reviewTarget && createPortal(
        <div className="review-modal-overlay">
          <div className="review-modal-box">
            <h3>{reviewedStatus[reviewTarget.food_id] ? "แก้ไขรีวิวเมนู" : "เขียนรีวิวให้เมนู"} "{reviewTarget.food_name}"</h3>
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
              <button className="modal-submit-btn" onClick={handleConfirmReview}>{reviewedStatus[reviewTarget.food_id] ? "อัปเดตรีวิว" : "บันทึกรีวิว"}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const NutritionItem = ({ label, value, grams }) => (
  <div className="summary-item">
    <span>{label} <small style={{ color: "#aaa", fontSize: "0.8rem" }}>({grams})</small></span>
    <strong>{value}</strong>
  </div>
);

export default MealPlan;
