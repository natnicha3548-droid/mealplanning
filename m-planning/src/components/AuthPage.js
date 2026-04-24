import React, { useState } from "react";
import {
    FaUser,
    FaLock,
    FaVenusMars,
    FaBirthdayCake,
    FaRulerVertical,
    FaWeight,
} from "react-icons/fa";

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    const [form, setForm] = useState({
        email: "",
        password: "",
        gender: "",
        age: "",
        height: "",
        weight: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = isLogin
            ? "http://localhost:5000/api/login"
            : "http://localhost:5000/api/signup";

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            alert(data.message);
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาด");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</h2>

                <form onSubmit={handleSubmit} className="auth-form">

                    <div className="input-group">
                        <i><FaUser /></i>
                        <input
                            type="email"
                            name="email"
                            placeholder="อีเมล"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <i><FaLock /></i>
                        <input
                            type="password"
                            name="password"
                            placeholder="รหัสผ่าน"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <i><FaVenusMars /></i>
                                <input
                                    type="text"
                                    name="gender"
                                    placeholder="เพศ"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group">
                                <i><FaBirthdayCake /></i>
                                <input
                                    type="number"
                                    name="age"
                                    placeholder="อายุ"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group">
                                <i><FaRulerVertical /></i>
                                <input
                                    type="number"
                                    name="height"
                                    placeholder="ส่วนสูง (cm)"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group">
                                <i><FaWeight /></i>
                                <input
                                    type="number"
                                    name="weight"
                                    placeholder="น้ำหนัก (kg)"
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}

                    <button type="submit">
                        {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีแล้ว?"}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? " สมัครสมาชิก" : " เข้าสู่ระบบ"}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;