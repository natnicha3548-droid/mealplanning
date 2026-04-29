import React, { useState } from 'react';
import '../App.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";

const Navbar = ({ user, setUser, setCalcResult }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleClose = () => setIsOpen(false);

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        setCalcResult(null);
        setProfileOpen(false);
        navigate("/");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="main-nav">
            <div className="nav-top">

                <div className="nav-logo" onClick={() => navigate("/")}>
                    <img src={logo} alt="logo" />
                    <span>MealPlan</span>
                </div>

                <div
                    className="hamburger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? '✖' : '☰'}
                </div>

                <ul className={`nav-links ${isOpen ? 'active' : ''}`}>

                    <li>
                        <Link to="/" onClick={handleClose} className={isActive("/") ? "active" : ""}>
                            หน้าแรก
                        </Link>
                    </li>

                    <li>
                        <Link to="/menu" onClick={handleClose}>
                            เมนูอาหาร
                        </Link>
                    </li>

                    <li>
                        <Link to="/plan" onClick={handleClose}>
                            แผนการกิน
                        </Link>
                    </li>

                    <li>
                        <Link to="/favorites" onClick={handleClose}>
                            รายการโปรด
                        </Link>
                    </li>

                    <li>
                        <Link to="/history" onClick={handleClose}>
                            แผนการกินย้อนหลัง
                        </Link>
                    </li>

                    <li>
                        {user ? (
                            <div className="profile-box" style={{ position: "relative" }}>
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.email}&background=ff8c42&color=fff`}
                                    alt="avatar"
                                    className="avatar"
                                    onClick={() => setProfileOpen(!profileOpen)}
                                />

                                {profileOpen && (
                                    <div style={{
                                        position: "absolute",
                                        top: "45px",
                                        right: "0",
                                        background: "#fff",
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                        padding: "10px",
                                        minWidth: "140px"
                                    }}>
                                        <div
                                            style={{ padding: "8px", cursor: "pointer" }}
                                            onClick={() => {
                                                navigate("/profile");
                                                setProfileOpen(false);
                                            }}
                                        >
                                            โปรไฟล์
                                        </div>

                                        <div
                                            style={{ padding: "8px", cursor: "pointer", color: "#ff4d4f" }}
                                            onClick={handleLogout}
                                        >
                                            ออกจากระบบ
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/auth" onClick={handleClose}>
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </li>

                </ul>
            </div>
        </nav>
    );
};

export default Navbar;