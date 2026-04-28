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

            const data = await res.json();
            alert(data.message);

            if (res.ok && isLogin) {
                const userData = data.user;

                if (!userData || !userData.user_id) {
                    alert("เกิดข้อผิดพลาด");
                    return;
                }

                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);

                const res2 = await fetch(`http://localhost:5000/api/get-calculation/${userData.user_id}`);
                const calcData = await res2.json();

                if (calcData) {
                    navigate("/");
                } else {
                    navigate("/calculate");
                }
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
                        <label style={{ fontSize: "0.85rem", color: "#7a5c4d" }}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                style={{ marginRight: "6px" }}
                            />
                            แสดงรหัสผ่าน
                        </label>
                    </div>

                    {isLogin && (
                        <div style={{ textAlign: "right", marginTop: "5px" }}>
                            <span
                                style={{
                                    fontSize: "0.85rem",
                                    color: "#ff8c42",
                                    cursor: "pointer",
                                }}
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