import React, { useEffect, useState } from 'react';
import './App.css';

/* ================= COMPONENTS (USER) ================= */

import Navbar from './components/User/Nav/Navbar';
import AuthPage from './components/User/Auth_page/AuthPage';
import ResetPass from "./components/User/Reset_pass/ResetPass";
import Calc from "./components/User/Cal/Calc";
import Profile from "./components/User/Pro/Profile";

/* ================= PAGES (USER) ================= */

import HomePage from "./pages/User/Home/HomePage";
import MenuFood from "./pages/User/Menu_food/MenuFood";
import MealPlan from "./pages/User/Meal_plan/MealPlan";
import NutritionReport from "./pages/User/Meal_plan/NutritionReport";
import PastPlans from "./pages/User/Past_plan/PastPlans";
import MyPlate from "./pages/User/Meal_plan/MyPlate";
import SearchFood from "./pages/User/Meal_plan/SearchFood";
import FavFood from "./pages/User/Fav_food/FavFood";

/* ================= PAGES (ADMIN) ================= */

import AdminLayout from './pages/Admin/AdminLayout';
import DashboardReport from './pages/Admin/DashboardReport';
import ManageReviews from './pages/Admin/ManageReviews';
import ManageCategories from './pages/Admin/ManageCategories';
import ManageFood from "./pages/Admin/ManageFood/ManageFood";
import AddFood from "./pages/Admin/ManageFood/AddFood";
import EditFood from "./pages/Admin/ManageFood/EditFood";
import ManageUsers from './pages/Admin/ManageUsers';

/* ================= ROUTER ================= */

import { Routes, Route, useLocation } from 'react-router-dom';

function App() {

  /* ================= STATE ================= */

  // เก็บข้อมูลผู้ใช้ที่ล็อกอิน
  const [user, setUser] = useState(null);

  // เก็บผลคำนวณโภชนาการ
  const [calcResult, setCalcResult] = useState(null);

  // เก็บข้อมูลฟอร์มคำนวณ
  const [formData, setFormData] = useState(null);

  const location = useLocation();
  
  // เช็คว่า URL ปัจจุบันเป็นของฝั่ง Admin หรือไม่
  const isAdminRoute = location.pathname.startsWith('/admin');

  /* ================= LOAD USER + CALCULATION ================= */

  useEffect(() => {

    const loadUserData = async () => {

      // โหลดข้อมูล user จาก localStorage
      const storedUser = localStorage.getItem("user");

      // ถ้าไม่มี user ให้หยุดทำงาน
      if (!storedUser) {
        setUser(null);
        return;
      }

      // แปลงข้อมูล user จาก string เป็น object
      const parsedUser = JSON.parse(storedUser);

      // เก็บข้อมูล user ลง state
      setUser(parsedUser);

      try {
        // เรียก API โหลดข้อมูลคำนวณล่าสุด
        const res = await fetch(
          `http://localhost:5000/api/get-calculation/${parsedUser.user_id}`
        );

        const data = await res.json();

        // ถ้ามีข้อมูลคำนวณ
        if (data) {

          /* ================= SET RESULT ================= */
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

          /* ================= SET FORM DATA ================= */
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

  /* ================= UPDATE STATE FROM NAVIGATE ================= */

  useEffect(() => {

    // อัปเดตผลคำนวณเมื่อ navigate มาพร้อม state
    if (location.state?.calcResult) {
      setCalcResult(location.state.calcResult);
    }

    // อัปเดตข้อมูลฟอร์มเมื่อ navigate มาพร้อม state
    if (location.state?.formData) {
      setFormData(location.state.formData);
    }

  }, [location.state]);

  return (

    <div className="main-layout">

      {/* ================= NAVBAR ================= */}
      
      {/* ซ่อน Navbar ของ User ถ้ากำลังอยู่หน้า Admin */}
      {!isAdminRoute && (
        <Navbar
          user={user}
          setUser={setUser}
          setCalcResult={setCalcResult}
        />
      )}

      {/* ================= ROUTES ================= */}

      <Routes>

        {/* ================= USER ROUTES ================= */}

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

        <Route
          path="/reset-password/:token"
          element={<ResetPass />}
        />

        <Route
          path="/calculate"
          element={<Calc />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/menu"
          element={<MenuFood />}
        />

        <Route
          path="/meal-plan"
          element={<MealPlan />}
        />

        <Route
          path="/report"
          element={<NutritionReport />}
        />

        <Route
          path="/past-plans"
          element={<PastPlans />}
        />

        <Route
          path="/MyPlate"
          element={<MyPlate />}
        />

        <Route
          path="/SearchFood"
          element={<SearchFood />}
        />

        <Route
          path="/favourite-food"
          element={<FavFood />}
        />


        {/* ================= ADMIN ROUTES ================= */}

        {/* กลุ่มหน้าแอดมินที่ต้องมี Sidebar (ใช้ AdminLayout เป็นโครงร่าง) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardReport />} /> {/* เข้า /admin จะเจอ Dashboard */}
          <Route path="manage-food" element={<ManageFood />} />
          <Route path="add-food" element={<AddFood />} />
          <Route path="/admin/edit-food/:id" element={<EditFood />}/>
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="manage-categories" element={<ManageCategories />} />
          <Route path="manage-reviews" element={<ManageReviews />} />
        </Route>


        {/* ================= NOT FOUND ================= */}

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