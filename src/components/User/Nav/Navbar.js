import React, { useState, useEffect } from 'react';
import "./Navbar.css";
import logo from "../../../assets/logo.png";
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser, setCalcResult }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [avatar, setAvatar] = useState(
        user?.avatar ||
        localStorage.getItem("avatar") ||
        "/avatars/0d625718d4.svg"
    );
    useEffect(() => {

        if (user?.avatar) {

            setAvatar(user.avatar);

        }

    }, [user]);

    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {

        const updateAvatar = () => {

            const newAvatar =
                localStorage.getItem("avatar") ||
                "/avatars/0d625718d4.svg";

            console.log("AVATAR UPDATED:", newAvatar);

            setAvatar(newAvatar);

        };

        window.addEventListener(
            "avatarChanged",
            updateAvatar
        );

        return () => {

            window.removeEventListener(
                "avatarChanged",
                updateAvatar
            );

        };

    }, []);

    const handleClose = () => setIsOpen(false);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("avatar");

        setUser(null);
        setCalcResult(null);
        setProfileOpen(false);

        navigate("/");
    };

    const isActive = (path) => location.pathname === path;
    

    return (
        <nav className="main-nav">
            <div className="nav-top">

                <div
                    className="nav-logo"
                    onClick={() => navigate("/")}
                >
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
                        <Link
                            to="/"
                            onClick={handleClose}
                            className={isActive("/") ? "active" : ""}
                        >
                            หน้าแรก
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/menu"
                            onClick={handleClose}
                            className={isActive("/menu") ? "active" : ""}
                        >
                            เมนูอาหารของฉัน
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/meal-plan"
                            onClick={handleClose}
                            className={isActive("/meal-plan") ? "active" : ""}
                        >
                            แผนการกินของฉัน
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/favourite-food"
                            onClick={handleClose}
                            className={isActive("/favourite-food") ? "active" : ""}
                        >
                            รายการโปรดของฉัน
                        </Link>
                    </li>

                    <li>
                        <Link
                            to="/past-plans"
                            onClick={handleClose}
                            className={isActive("/past-plans") ? "active" : ""}
                        >
                            แผนการกินย้อนหลัง
                        </Link>
                    </li>

                    <li>
                        {user ? (
                            <div
                                className="profile-box"
                                style={{ position: "relative" }}
                            >
                                <img
                                    src={avatar}
                                    alt="avatar"
                                    className="avatar"
                                    onClick={() => setProfileOpen(!profileOpen)}
                                />
                                {profileOpen && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "45px",
                                            right: "0",
                                            background: "#fff",
                                            borderRadius: "12px",
                                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                            padding: "10px",
                                            minWidth: "140px"
                                        }}
                                    >
                                        <div
                                            style={{
                                                padding: "8px",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => {
                                                navigate("/profile");
                                                setProfileOpen(false);
                                            }}
                                        >
                                            โปรไฟล์
                                        </div>

                                        <div
                                            style={{
                                                padding: "8px",
                                                cursor: "pointer",
                                                color: "#ff4d4f"
                                            }}
                                            onClick={handleLogout}
                                        >
                                            ออกจากระบบ
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/auth"
                                onClick={handleClose}
                                className={isActive("/auth") ? "active" : ""}
                            >
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