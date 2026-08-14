import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaChartPie, FaHamburger, FaUtensils, FaUserCog, 
  FaTags, FaComments, FaBars, FaTimes 
} from 'react-icons/fa'; // เพิ่ม FaBars และ FaTimes เข้ามา

function AdminSidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // State สำหรับควบคุมการเปิด/ปิด Sidebar

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false); // ใช้สำหรับปิดเมื่อกดเลือกเมนู (บนมือถือ)

  return (
    <>
      {/* ปุ่ม Toggle สำหรับมือถือ */}
      <button className="mobile-toggle-btn no-print" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay สำหรับกดพื้นที่ว่างเพื่อปิด Sidebar บนมือถือ */}
      {isOpen && <div className="sidebar-overlay no-print" onClick={closeSidebar}></div>}

      {/* เพิ่ม Class 'open' เมื่อ State isOpen เป็น true */}
      <div className={`admin-sidebar no-print ${isOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <FaHamburger /> MealPlan Admin
        </div>
        <ul className="admin-menu-list">
          <li className="admin-menu-item">
            <Link 
              to="/admin" 
              className={`admin-menu-link ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <FaChartPie /> Dashboard
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link 
              to="/admin/manage-food" 
              className={`admin-menu-link ${location.pathname.includes('manage-food') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <FaUtensils/> จัดการข้อมูลอาหาร
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link 
              to="/admin/manage-categories" 
              className={`admin-menu-link ${location.pathname.includes('manage-categories') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <FaTags /> จัดการหมวดหมู่อาหาร
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link 
              to="/admin/manage-users" 
              className={`admin-menu-link ${location.pathname.includes('manage-users') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <FaUserCog /> จัดการข้อมูลสมาชิก
            </Link>
          </li>
          <li className="admin-menu-item">
            <Link 
              to="/admin/manage-reviews" 
              className={`admin-menu-link ${location.pathname.includes('manage-reviews') ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <FaComments /> จัดการรีวิวจากผู้ใช้
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}

export default AdminSidebar;