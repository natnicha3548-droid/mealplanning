import React from 'react';
import { Link, useLocation } from 'react-router-dom';
  import { FaChartPie, FaHamburger, FaUtensils, FaUserCog, FaFolderOpen, FaUsers, FaStar, FaTags, FaComments } from 'react-icons/fa';

function AdminSidebar() {
  const location = useLocation(); // เอาไว้เช็คว่าตอนนี้อยู่หน้าไหน จะได้ทำสีไฮไลท์ถูก

  return (
    <div className="admin-sidebar no-print">
      <div className="admin-logo">
        <FaHamburger /> MealPlan Admin
      </div>
      <ul className="admin-menu-list">
        <li className="admin-menu-item">
          <Link to="/admin" className={`admin-menu-link ${location.pathname === '/admin' ? 'active' : ''}`}>
            <FaChartPie /> Dashboard
          </Link>
        </li>
        <li className="admin-menu-item">
          <Link to="/admin/manage-food" className={`admin-menu-link ${location.pathname.includes('manage-food') ? 'active' : ''}`}>
            <FaUtensils/> จัดการข้อมูลอาหาร
          </Link>
        </li>
        <li className="admin-menu-item">
          <Link to="/admin/manage-categories" className={`admin-menu-link ${location.pathname.includes('manage-categories') ? 'active' : ''}`}>
            <FaTags /> จัดการหมวดหมู่อาหาร
          </Link>
        </li>
        <li className="admin-menu-item">
          <Link to="/admin/manage-users" className={`admin-menu-link ${location.pathname.includes('manage-users') ? 'active' : ''}`}>
            <FaUserCog /> จัดการข้อมูลสมาชิก
          </Link>
        </li>
        <li className="admin-menu-item">
          <Link to="/admin/manage-reviews" className={`admin-menu-link ${location.pathname.includes('manage-reviews') ? 'active' : ''}`}>
            <FaComments /> จัดการรีวิวจากผู้ใช้
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default AdminSidebar;