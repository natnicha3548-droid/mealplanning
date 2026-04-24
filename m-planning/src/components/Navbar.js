import React, { useState } from 'react';
import '../App.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="main-nav">
            <div className="nav-top">

                <div className="nav-logo">
                    MealPlan
                </div>

                <div
                    className="hamburger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? '✖' : '☰'}
                </div>

                <ul className={`nav-links ${isOpen ? 'active' : ''}`}>

                    <li>
                        <Link to="/" onClick={() => setIsOpen(false)}>
                            หน้าแรก
                        </Link>
                    </li>

                    <li>
                        <Link to="/" onClick={() => setIsOpen(false)}>
                            เมนูอาหาร
                        </Link>
                    </li>

                    <li>
                        <Link to="/" onClick={() => setIsOpen(false)}>
                            แผนการกิน
                        </Link>
                    </li>

                    <li>
                        <Link to="/" onClick={() => setIsOpen(false)}>
                            รายการโปรด
                        </Link>
                    </li>

                    <li>
                        <Link to="/" onClick={() => setIsOpen(false)}>
                            แผนการกินย้อนหลัง
                        </Link>
                    </li>

                    <li className="auth-buttons">
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                            เข้าสู่ระบบ
                        </Link>
                    </li>

                </ul>
            </div>
        </nav>
    );
};

export default Navbar;