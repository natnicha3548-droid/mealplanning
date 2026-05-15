import React, { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import ResetPass from "./components/ResetPass";
import Calc from "./components/Calc";
import Profile from "./components/Profile";
import HomePage from "./pages/Home/HomePage";
import MenuFood from "./pages/Menu_food/MenuFood";
import MealPlan from "./pages/Meal_plan/MealPlan";
import PastPlans from "./pages/Past_plan/PastPlans";
import FavFood from "./pages/Fav_food/FavFood";
import MyPlate from "./pages/Meal_plan/MyPlate";
import { Routes, Route, useLocation } from 'react-router-dom';

function App() {

  const [user, setUser] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [formData, setFormData] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
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
          element={<HomePage calcResult={calcResult} formData={formData} />}
        />

        <Route
          path="/auth"
          element={<AuthPage setUser={setUser} />}
        />

        <Route path="/reset-password/:token" element={<ResetPass />} />
        <Route path="/calculate" element={<Calc />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/menu" element={<MenuFood />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/past-plans" element={<PastPlans />} />
        <Route path="/favourite-food" element={<FavFood />} />
        <Route path="/MyPlate" element={<MyPlate />} />
        <Route path="*" element={<HomePage />} />

      </Routes>
    </div>
  );
}

export default App;