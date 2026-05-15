import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import "./ResetPass.css";

function ResetPass() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password.length < 6) {
            alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัว");
            return;
        }

        if (form.password !== form.confirmPassword) {
            alert("รหัสผ่านไม่ตรงกัน");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/reset-password/${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newPassword: form.password,
                }),
            });

            const data = await res.json();

            alert(data.message);

            if (res.ok) {
                navigate("/auth");
            }

        } catch (error) {
            console.error(error);
            alert("เชื่อมต่อ server ไม่ได้");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>รีเซ็ตรหัสผ่าน</h2>

                <form onSubmit={handleSubmit} className="auth-form">

                    <div className="input-group">
                        <i><FaLock /></i>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="รหัสผ่านใหม่"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <i><FaLock /></i>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="ยืนยันรหัสผ่าน"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ textAlign: "left", marginTop: "5px" }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            แสดงรหัสผ่าน
                        </label>
                    </div>

                    <button type="submit">
                        เปลี่ยนรหัสผ่าน
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPass;