import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AuthPage({ setUser }) {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [confirmPassword, setConfirmPassword] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLogin) {
            if (form.password.length < 6) {
                alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");
                return;
            }

            if (form.password !== confirmPassword) {
                alert("รหัสผ่านไม่ตรงกัน");
                return;
            }
        }

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

            if (!res.ok) {
                const text = await res.text();
                alert(text);
                return;
            }

            const data = await res.json();
            alert(data.message);

            if (isLogin) {
                const userData = data.user;

                if (!userData || !userData.user_id) {
                    alert("เกิดข้อผิดพลาด");
                    return;
                }

                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);

                navigate("/calculate");
            } else {
                alert("สมัครสำเร็จ กรุณาเข้าสู่ระบบ");
                setIsLogin(true);
            }

        } catch (error) {
            console.error(error);
            alert("เชื่อมต่อ server ไม่ได้");
        }
    };

    const handleForgotPassword = async () => {
        if (!form.email) {
            alert("กรุณากรอกอีเมลก่อน");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: form.email }),
            });

            if (!res.ok) {
                const text = await res.text();
                alert(text);
                return;
            }

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
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="รหัสผ่าน"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <i><FaLock /></i>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="ยืนยันรหัสผ่าน"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div style={{ textAlign: "left", marginTop: "5px" }}>
                        <label style={{ fontSize: "0.85rem" }}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            แสดงรหัสผ่าน
                        </label>
                    </div>

                    {isLogin && (
                        <div style={{ textAlign: "right", marginTop: "5px" }}>
                            <span
                                style={{ cursor: "pointer", color: "orange" }}
                                onClick={handleForgotPassword}
                            >
                                ลืมรหัสผ่าน?
                            </span>
                        </div>
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