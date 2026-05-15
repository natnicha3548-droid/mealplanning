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
import PastPlans from "./pages/Past_plan/PastPlans";
import FavFood from "./pages/Fav_food/FavFood";
import { Routes, Route, useLocation } from 'react-router-dom';

function App() {

  const [user, setUser] = useState(null);

  const [calcResult, setCalcResult] = useState(null);

  const [formData, setFormData] = useState(null);

  const location = useLocation();

  // ================= LOAD USER + CALC =================

  useEffect(() => {

    const loadUserData = async () => {

      const storedUser = localStorage.getItem("user");

      if (!storedUser) {

        setUser(null);
        return;

      }

      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);

      try {

        const res = await fetch(
          `http://localhost:5000/api/get-calculation/${parsedUser.user_id}`
        );

        const data = await res.json();

        if (data) {

          setCalcResult({
            bmi: data.bmi,
            bmr: data.bmr,
            tdee: data.tdee,
            carb: data.carb,
            protein: data.protein,
            fat: data.fat
          });

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

        console.error(err);

      }

    };

    loadUserData();

  }, []);

 
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
          element={
            <HomePage
              calcResult={calcResult}
              formData={formData}
            />
          }
        />

        <Route
          path="/auth"
          element={
            <AuthPage
              setUser={setUser}
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
        <Route path="*" element={<HomePage />} />

      </Routes>

    </div>

  );
}

export default App;