import React, { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import ResetPass from "./components/ResetPass";
import Calc from "./components/Calc";
import Profile from "./components/Profile";
import HomePage from "./pages/HomePage";
import MenuFood from "./pages/MenuFood";
import MealPlan from "./pages/MealPlan";
import PastPlans from "./pages/PastPlans";
import FavFood from "./pages/FavFood";
import { Routes, Route, useLocation } from 'react-router-dom';

function App() {

  const [user, setUser] = useState(null);
  const [calcResult, setCalcResult] = useState(null);

  const [formData, setFormData] = useState(null);

  const location = useLocation();

  // โหลด user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  }, []);

  // โหลดผลคำนวณ
  useEffect(() => {

    if (!user) {
      setCalcResult(null);
      return;
    }

    fetch(`http://localhost:5000/api/get-calculation/${user.user_id}`)
      .then(res => {
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        return res.json();
      })
      .then(data => {
        if (data && data.tdee) {
          setCalcResult(data);
        } else {
          setCalcResult(null);
        }
      })
      .catch(err => {
        console.error("Error:", err);
        setCalcResult(null);
      });

  }, [user]);

  // รับค่าจากหน้า Calc
  useEffect(() => {
    if (location.state?.calcResult) {
      setCalcResult(location.state.calcResult);
    }

    if (location.state?.formData) {
      setFormData(location.state.formData);
    }
  }, [location.state]);

  return (
    <div className="main-layout">

      <Navbar
        user={user}
        setUser={setUser}
        setCalcResult={setCalcResult}
      />

      <Routes>

        <Route
          path="/"
          element={<HomePage calcResult={calcResult} formData={formData} />}
        />

        <Route
          path="/auth"
          element={
            <AuthPage
              setUser={setUser}
              setCalcResult={setCalcResult}
            />
          }
        />

        <Route path="/reset-password/:token" element={<ResetPass />} />
        <Route path="/calculate" element={<Calc />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/menu" element={<MenuFood />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/past-plans" element={<PastPlans />} />
        <Route path="/favourite-food" element={<FavFood />} />
      </Routes>
    </div>
  );
}

export default App;