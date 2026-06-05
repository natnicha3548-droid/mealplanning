import React, { useEffect, useState, useRef } from 'react';
import './App.css';

import Navbar from './components/User/Nav/Navbar';
import AuthPage from './components/User/Auth_page/AuthPage';
import ResetPass from "./components/User/Reset_pass/ResetPass";
import Calc from "./components/User/Cal/Calc";
import Profile from "./components/User/Pro/Profile";

import HomePage from "./pages/User/Home/HomePage";
import MealPlanCard from "./pages/User/Home/MealPlanCard";
import MenuFood from "./pages/User/Menu_food/MenuFood";
import MealPlan from "./pages/User/Meal_plan/MealPlan";
import NutritionReport from "./pages/User/Meal_plan/NutritionReport";
import PastPlans from "./pages/User/Past_plan/PastPlans";
import MyPlate from "./pages/User/Meal_plan/MyPlate";
import SearchFood from "./pages/User/Meal_plan/SearchFood";
import FavFood from "./pages/User/Fav_food/FavFood";

import AdminLayout from './pages/Admin/AdminLayout';
import DashboardReport from './pages/Admin/DashboardReport';
import ManageReviews from './pages/Admin/ManageReviews';
import ManageCategories from "./pages/Admin/ManageCategories/ManageCategories";
import AddCategory from "./pages/Admin/ManageCategories/AddCategory";
import EditCategory from "./pages/Admin/ManageCategories/EditCategory";
import ManageFood from "./pages/Admin/ManageFood/ManageFood";
import AddFood from "./pages/Admin/ManageFood/AddFood";
import EditFood from "./pages/Admin/ManageFood/EditFood";
import ManageUsers from './pages/Admin/ManageUsers';

import { Routes, Route, useLocation } from 'react-router-dom';

function App() {

  const [user, setUser] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [formData, setFormData] = useState(null);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // ใช้ ref เพื่อกัน useEffect([user]) รันซ้ำตอน mount ครั้งแรก
  const isFirstMount = useRef(true);

  // ---- โหลดข้อมูลตอนเปิดแอปครั้งแรก ----
  useEffect(() => {

    const loadUserData = async () => {

      const storedUser = localStorage.getItem("user");

      // GUEST — ไม่มี user ใน localStorage
      if (!storedUser) {
        setUser(null);

        const guestCalc = JSON.parse(sessionStorage.getItem("activeCalcResult"));

        if (guestCalc) {
          setCalcResult({
            bmi: guestCalc.bmi,
            bmr: guestCalc.bmr,
            tdee: guestCalc.tdee,
            carb: guestCalc.carb,
            protein: guestCalc.protein,
            fat: guestCalc.fat,
            sugar: guestCalc.sugar,
            sodium: guestCalc.sodium
          });
          setFormData({
            weight: guestCalc.weight,
            height: guestCalc.height,
            age: guestCalc.age,
            gender: guestCalc.gender,
            activity: guestCalc.activity,
            disease: guestCalc.diseases
          });
        }

        return;
      }

      // MEMBER — มี user ใน localStorage
      const parsedUser = JSON.parse(storedUser);

      try {
        const userRes = await fetch(`http://localhost:5000/api/user/${parsedUser.user_id}`);
        const latestUser = await userRes.json();
        setUser(latestUser);
        localStorage.setItem("user", JSON.stringify(latestUser));
      } catch (err) {
        console.error("LOAD USER ERROR:", err);
        setUser(parsedUser);
      }

      try {
        const res = await fetch(`http://localhost:5000/api/get-calculation/${parsedUser.user_id}`);
        const data = await res.json();

        if (data) {
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

  // ---- Watch user เปลี่ยน (login / logout หลัง mount) ----
  useEffect(() => {

    // ข้าม render แรก — useEffect([]) จัดการแล้ว
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (!user) {
      // LOGOUT → กลับไปดู sessionStorage (guest mode)
      const guestCalc = JSON.parse(sessionStorage.getItem("activeCalcResult"));
      if (guestCalc) {
        setCalcResult({
          bmi: guestCalc.bmi,
          bmr: guestCalc.bmr,
          tdee: guestCalc.tdee,
          carb: guestCalc.carb,
          protein: guestCalc.protein,
          fat: guestCalc.fat,
          sugar: guestCalc.sugar,
          sodium: guestCalc.sodium
        });
        setFormData({
          weight: guestCalc.weight,
          height: guestCalc.height,
          age: guestCalc.age,
          gender: guestCalc.gender,
          activity: guestCalc.activity,
          disease: guestCalc.diseases
        });
      } else {
        setCalcResult(null);
        setFormData(null);
      }
      return;
    }

    // LOGIN → ดึงข้อมูลจาก DB ทันที + ล้าง guest session
    const fetchUserCalcAfterLogin = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/get-calculation/${user.user_id}`);
        const data = await res.json();

        if (data) {
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
          setFormData({
            weight: data.weight,
            height: data.height,
            age: data.age,
            gender: data.gender,
            activity: data.activity,
            disease: data.disease
          });
        } else {
          setCalcResult(null);
          setFormData(null);
        }

        // ล้างข้อมูล guest ออกหลัง login
        sessionStorage.removeItem("activeCalcResult");

      } catch (err) {
        console.error("LOAD CALC ERROR after login:", err);
      }
    };

    fetchUserCalcAfterLogin();

  }, [user]);

  // ---- รับ calcResult/formData จาก navigation state (เช่น หลังคำนวณใหม่) ----
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

      {!isAdminRoute && (
        <Navbar
          user={user}
          setUser={setUser}
          setCalcResult={setCalcResult}
          setFormData={setFormData}
        />
      )}

      <Routes>

        <Route path="/" element={<HomePage user={user} calcResult={calcResult} formData={formData} />} />
        <Route path="/auth" element={<AuthPage setUser={setUser} />} />
        <Route path="/reset-password/:token" element={<ResetPass />} />
        <Route path="/calculate" element={<Calc />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
        <Route path="/menu" element={<MenuFood />} />
        <Route path="/meal-plan" element={<MealPlan />} />
        <Route path="/report" element={<NutritionReport />} />
        <Route path="/past-plans" element={<PastPlans />} />
        <Route path="/MyPlate" element={<MyPlate />} />
        <Route path="/SearchFood" element={<SearchFood />} />
        <Route path="/favourite-food" element={<FavFood />} />
        <Route path="/meal-plan-card" element={<MealPlanCard />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardReport />} />
          <Route path="manage-food" element={<ManageFood />} />
          <Route path="add-food" element={<AddFood />} />
          <Route path="/admin/edit-food/:id" element={<EditFood />} />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-categories" element={<ManageCategories />} />
          <Route path="/admin/add-category" element={<AddCategory />} />
          <Route path="/admin/edit-category/:id" element={<EditCategory />} />
          <Route path="manage-reviews" element={<ManageReviews />} />
        </Route>

        <Route path="*" element={<HomePage user={user} calcResult={calcResult} formData={formData} />} />

      </Routes>

    </div>

  );

}

export default App;