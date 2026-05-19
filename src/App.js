import React, { useEffect, useState } from 'react';
import './App.css';

import Navbar from './components/Nav/Navbar';
import AuthPage from './components/Auth_page/AuthPage';
import ResetPass from "./components/Reset_pass/ResetPass";
import Calc from "./components/Cal/Calc";
import Profile from "./components/Pro/Profile";

import HomePage from "./pages/Home/HomePage";
import MenuFood from "./pages/Menu_food/MenuFood";
import MealPlan from "./pages/Meal_plan/MealPlan";
import NutritionReport from "./pages/Meal_plan/NutritionReport";
import PastPlans from "./pages/Past_plan/PastPlans";
import MyPlate from "./pages/Meal_plan/MyPlate";
import SearchFood from "./pages/Meal_plan/SearchFood";
import FavFood from "./pages/Fav_food/FavFood";

import { Routes, Route, useLocation } from 'react-router-dom';

function App() {

  // ================= STATE =================

  const [user, setUser] = useState(null);

  const [calcResult, setCalcResult] = useState(null);

  const [formData, setFormData] = useState(null);

  const location = useLocation();

  // ================= LOAD USER + CALC =================

  useEffect(() => {

    const loadUserData = async () => {

      // โหลด user จาก localStorage
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {

        setUser(null);
        return;

      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      // โหลดค่าคำนวณล่าสุด
      try {

        const res = await fetch(
          `http://localhost:5000/api/get-calculation/${parsedUser.user_id}`
        );

        const data = await res.json();

        // ถ้ามีข้อมูล
        if (data) {

          // เก็บผลคำนวณ
          setCalcResult({

            bmi: data.bmi,
            bmr: data.bmr,
            tdee: data.tdee,
            carb: data.carb,
            protein: data.protein,
            fat: data.fat,
            sugar: data.sugar,
            sodium: data.sodium

          });

          // เก็บข้อมูลฟอร์ม
          setFormData({

            weight: data.weight,
            height: data.height,
            age: data.age,
            gender: data.gender,
            activity: data.activity,
            disease: data.disease

          });

        }

      } catch (err) {

        console.error("LOAD CALC ERROR:", err);

      }

    };

    loadUserData();

  }, []);

  // ================= UPDATE FROM NAVIGATE =================

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

      {/* ================= NAVBAR ================= */}

      <Navbar
        user={user}
        setUser={setUser}
        setCalcResult={setCalcResult}
      />

      {/* ================= ROUTES ================= */}

      <Routes>

        {/* HOME */}

        <Route
          path="/"
          element={
            <HomePage
              calcResult={calcResult}
              formData={formData}
            />
          }
        />

        {/* AUTH */}

        <Route
          path="/auth"
          element={
            <AuthPage
              setUser={setUser}
            />
          }
        />

        {/* RESET PASSWORD */}

        <Route
          path="/reset-password/:token"
          element={<ResetPass />}
        />

        {/* CALCULATE */}

        <Route
          path="/calculate"
          element={<Calc />}
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* MENU FOOD */}

        <Route
          path="/menu"
          element={<MenuFood />}
        />

        {/* MEAL PLAN */}

        <Route
          path="/meal-plan"
          element={<MealPlan />}
        />

        {/* NUTRITION REPORT */}

        <Route
          path="/report"
          element={<NutritionReport />}
        />

        {/* PAST PLAN */}

        <Route
          path="/past-plans"
          element={<PastPlans />}
        />

        {/* MY PLATE */}

        <Route
          path="/MyPlate"
          element={<MyPlate />}
        />

        {/* SEARCH FOOD */}

        <Route
          path="/SearchFood"
          element={<SearchFood />}
        />

        {/* FAV FOOD */}

        <Route
          path="/favourite-food"
          element={<FavFood />}
        />

        {/* NOT FOUND */}

        <Route
          path="*"
          element={
            <HomePage
              calcResult={calcResult}
              formData={formData}
            />
          }
        />

      </Routes>

    </div>

  );
}

export default App;