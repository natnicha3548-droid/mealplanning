import React, { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function AuthPage({ setUser }) {
    const navigate = useNavigate();

    // เก็บสถานะว่าอยู่หน้า Login หรือ Signup
    const [isLogin, setIsLogin] = useState(true);

    // แสดงหรือซ่อนรหัสผ่าน
    const [showPassword, setShowPassword] = useState(false);

    // เก็บข้อมูล form
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    // เก็บรหัสผ่านยืนยัน
    const [confirmPassword, setConfirmPassword] = useState("");

    // อัปเดตค่าจาก input
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // ส่งข้อมูล Login / Signup
    const handleSubmit = async (e) => {
        e.preventDefault();

        // ตรวจสอบข้อมูลตอนสมัครสมาชิก
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

        // เลือก API ตามสถานะ
        const url = isLogin
            ? "http://localhost:5000/api/login"
            : "http://localhost:5000/api/signup";

        try {
            // ส่งข้อมูลไปยัง server
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            // ตรวจสอบ response
            if (!res.ok) {
                alert(data.message);
                return;
            }

            alert(data.message);

            // ทำงานหลัง Login สำเร็จ
            if (isLogin) {
                const userData = data.user;

                // ตรวจสอบข้อมูลผู้ใช้
                if (!userData || !userData.user_id) {
                    alert("เกิดข้อผิดพลาด");
                    return;
                }

                // เก็บ user ใน state (เพื่อให้ระบบ React รู้จัก)
                setUser(userData);

                /* ================= แก้ไขการเก็บข้อมูล: แอดมิน VS ผู้ใช้ทั่วไป ================= */
                if (userData.role === 'Admin') {
                    // 1. ถ้าเป็นแอดมิน ให้เก็บใน sessionStorage (ปิดเว็บ/ปิดแท็บ = หลุดล็อกอินทันที)
                    sessionStorage.setItem("user", JSON.stringify(userData));
                    
                    // เด้งไปหน้าแอดมินทันที
                    navigate("/admin");
                    return; 
                } else {
                    // 2. ถ้าเป็น User ทั่วไป ให้เก็บใน localStorage (ปิดเว็บแล้วเปิดใหม่ยังจำได้อยู่)
                    localStorage.setItem("user", JSON.stringify(userData));
                    localStorage.setItem(
                        "avatar",
                        userData.avatar || "/avatars/0d625718d4.svg"
                    );
                }
                /* ============================================================= */

                // ตรวจสอบว่าผู้ใช้เคยคำนวณหรือยัง (สำหรับ User ทั่วไป)
                try {
                    const calcRes = await fetch(
                        `http://localhost:5000/api/get-calculation/${userData.user_id}`
                    );

                    const calcData = await calcRes.json();

                    // ถ้าเคยคำนวณแล้ว
                    if (calcData) {
                        localStorage.setItem(
                            "calculation",
                            JSON.stringify(calcData)
                        );

                        navigate("/", {
                            state: {
                                calcResult: calcData,
                            },
                        });
                    }
                    // ถ้ายังไม่เคยคำนวณ
                    else {
                        navigate("/calculate");
                    }

                } catch (err) {
                    console.error(err);
                    alert("โหลดข้อมูลไม่สำเร็จ");
                }
            }

            // สมัครสมาชิกสำเร็จ
            else {
                alert("สมัครสำเร็จ กรุณาเข้าสู่ระบบ");
                setIsLogin(true);
            }

        } catch (error) {
            console.error(error);
            alert("เชื่อมต่อ server ไม่ได้");
        }
    };

    // ลืมรหัสผ่าน
    const handleForgotPassword = async () => {
        if (!form.email) {
            alert("กรุณากรอกอีเมลก่อน");
            return;
        }

        try {
            const res = await fetch(
                "http://localhost:5000/api/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: form.email,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            alert(data.message);

        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาด");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">

                {/* หัวข้อ */}
                <h2>
                    {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                </h2> 

                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >

                    {/* Email */}
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

                    {/* Password */}
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

                    {/* Confirm Password */}
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

                    {/* แสดงรหัสผ่าน */}
                    <div style={{ textAlign: "left", marginTop: "5px" }}>
                        <label style={{ fontSize: "0.85rem" }}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            /> แสดงรหัสผ่าน
                        </label>
                    </div>

                    {/* ลืมรหัสผ่าน */}
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

                    {/* ปุ่ม Submit */}
                    <button type="submit">
                        {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                    </button>

                </form>

                {/* Footer */}
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