import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = ({
    user,
    setUser,
    setCalcResult,
    setFormData
}) => {

    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [avatar, setAvatar] = useState(
        user?.avatar ||
        localStorage.getItem("avatar") ||
        "/avatars/0d625718d4.svg"
    );

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.avatar) {
            setAvatar(user.avatar);
        }
    }, [user]);

    useEffect(() => {
        const updateAvatar = () => {
            setAvatar(
                localStorage.getItem("avatar") ||
                "/avatars/0d625718d4.svg"
            );
        };

        window.addEventListener("avatarChanged", updateAvatar);

        return () => {
            window.removeEventListener("avatarChanged", updateAvatar);
        };
    }, []);

    const handleClose = () => setIsOpen(false);

    const handleCloseAll = () => {
        setIsOpen(false);
        setProfileOpen(false);
    };

    const toggleProfile = () => {
        setProfileOpen(prev => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("avatar");
        localStorage.removeItem("token");

        localStorage.removeItem("calcResult");
        localStorage.removeItem("myplate");
        localStorage.removeItem("plan_plate");

        sessionStorage.removeItem("activeCalcResult");
        sessionStorage.removeItem("calcForm");

        setUser(null);
        setCalcResult(null);
        setFormData(null);

        handleCloseAll();

        navigate("/", { replace: true });
    };

    const goProfile = () => {
        navigate("/profile");
        handleCloseAll();
    };

    const isActive = (path) => location.pathname === path;

    const menuItems = user
        ? [
            { path: "/menu", label: "เมนูอาหารของฉัน" },
            { path: "/meal-plan", label: "แผนการกินของฉัน" },
            { path: "/favourite-food", label: "รายการโปรดของฉัน" },
            { path: "/past-plans", label: "ประวัติการกินย้อนหลัง" }
        ]
        : [
            { path: "/menu", label: "เมนูอาหาร" },
            { path: "/meal-plan", label: "แผนการกินของฉัน" }
        ];

    const ProfileDropdown = ({ mobile = false }) => (
        <div
            className={
                mobile
                    ? "mobile-profile-dropdown"
                    : "profile-dropdown"
            }
        >
            <div
                className="profile-dropdown-item"
                onClick={goProfile}
            >
                แก้ไขโปรไฟล์
            </div>

            <div
                className="profile-dropdown-item logout"
                onClick={handleLogout}
            >
                ออกจากระบบ
            </div>
        </div>
    );

    const AvatarButton = () => (
        <img
            src={avatar}
            alt="avatar"
            className="avatar"
            onClick={toggleProfile}
        />
    );

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

                {user && (
                    <div className="mobile-avatar-wrap">

                        <AvatarButton />

                        {profileOpen && (
                            <ProfileDropdown mobile />
                        )}

                    </div>
                )}

                <div
                    className="hamburger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? "✖" : "☰"}
                </div>

                <ul className={`nav-links ${isOpen ? "active" : ""}`}>

                    <li>
                        <Link
                            to="/"
                            onClick={handleClose}
                            className={isActive("/") ? "active" : ""}
                        >
                            หน้าแรก
                        </Link>
                    </li>

                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                onClick={handleClose}
                                className={
                                    isActive(item.path)
                                        ? "active"
                                        : ""
                                }
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}

                    <li>

                        {user ? (

                            <div
                                className="profile-box desktop-only"
                                style={{ position: "relative" }}
                            >

                                <AvatarButton />

                                {profileOpen && (
                                    <ProfileDropdown />
                                )}

                            </div>

                        ) : (

                            <Link
                                to="/auth"
                                onClick={handleClose}
                                className={
                                    isActive("/auth")
                                        ? "active"
                                        : ""
                                }
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