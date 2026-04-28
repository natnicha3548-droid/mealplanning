import React, { useEffect, useState } from 'react';
import './App.css';
import FoodCard from './components/FoodCard';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import ResetPass from "./components/ResetPass";
import Calc from "./components/Calc";
import Profile from "./components/Profile";
import { Routes, Route, useLocation, Link } from 'react-router-dom';

function App() {
  const [foods, setFoods] = useState([]);
  const [user, setUser] = useState(null);
  const [calcResult, setCalcResult] = useState(null);

  const location = useLocation();

  // โหลดรายการอาหาร
  useEffect(() => {
    fetch('http://localhost:5000/api/foods')
      .then(res => res.json())
      .then(data => setFoods(data))
      .catch(err => console.error(err));
  }, []);

  // โหลด user + ผลคำนวณ
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      fetch(`http://localhost:5000/api/get-calculation/${userData.user_id}`)
        .then(res => res.json())
        .then(data => {
          if (data) setCalcResult(data);
        })
        .catch(err => console.error(err));

    } else {
      setUser(null);
      setCalcResult(null);
    }
  }, []);

  // รับค่าจากหน้า Calc (redirect กลับมา)
  useEffect(() => {
    if (location.state?.calcResult) {
      setCalcResult(location.state.calcResult);
    }
  }, [location.state]);

  // หน้า Home
  const HomePage = () => (
    <div className="app-container">
      <header className="app-header">
        <h1>MealPlan</h1>
        <p>ระบบช่วยวางแผนการรับประทานอาหารในชีวิตประจำวัน</p>

        <Link to="/calculate">
          <button className="calc-btn">
            คำนวณพลังงาน
          </button>
        </Link>
      </header>

      {calcResult && (
        <div style={{
          background: "#fff",
          padding: "15px",
          borderRadius: "15px",
          marginBottom: "20px",
          textAlign: "center",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
        }}>
          <h3>พลังงานที่คุณควรได้รับ</h3>
          <p><b>{calcResult.tdee}</b> kcal / วัน</p>
        </div>
      )}

      <main className="food-grid">
        {foods.length > 0 ? (
          foods.map(food => (
            <FoodCard key={food.food_id} food={food} />
          ))
        ) : (
          <p>กำลังโหลดข้อมูลอาหาร...</p>
        )}
      </main>
    </div>
  );

  return (
    <div className="main-layout">
      <Navbar
        user={user}
        setUser={setUser}
        setCalcResult={setCalcResult}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage setUser={setUser} />} />
        <Route path="/reset-password/:token" element={<ResetPass />} />
        <Route path="/calculate" element={<Calc />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;