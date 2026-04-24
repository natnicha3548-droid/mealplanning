import React, { useEffect, useState } from 'react';
import './App.css';
import FoodCard from './components/FoodCard';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import { Routes, Route } from 'react-router-dom';

function App() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/foods')
      .then(res => res.json())
      .then(data => setFoods(data))
      .catch(err => console.error("Error connecting to backend:", err));
  }, []);

  const HomePage = () => (
    <div className="app-container">
      <header className="app-header">
        <h1>MealPlan</h1>
        <p>
          ระบบช่วยวางแผนการรับประทานอาหารในชีวิตประจำวัน
        </p>
      </header>

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
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </div>
  );
}

export default App;