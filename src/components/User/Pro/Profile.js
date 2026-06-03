import React, { useEffect, useState } from "react";
import {
    FaUser,
    FaLock,
    FaEnvelope,
    FaWeight,
    FaRulerVertical,
    FaFire,
    FaSave
} from "react-icons/fa";
import "./Profile.css";

function Profile() {
    const [user, setUser] = useState(null);

    const [form, setForm] = useState({
        email: "",
        password: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (storedUser) {
            setUser(storedUser);

            setForm(prev => ({
                ...prev,
                email: storedUser.email
            }));
        }
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async () => {
        // ใช้โค้ดเดิมของคุณ
    };

    if (!user) {
        return (
            <p style={{ textAlign: "center" }}>
                กรุณาเข้าสู่ระบบ
            </p>
        );
    }

    return (
        <div className="profile-page">

            <div className="profile-card">

                <div className="profile-avatar">
                    {user.email?.charAt(0).toUpperCase()}
                </div>

                <h1 className="profile-title">
                    โปรไฟล์ของฉัน
                </h1>

                <p className="profile-email">
                    {user.email}
                </p>

                {/* ข้อมูลบัญชี */}

                <div className="section">

                    <div className="section-header">
                        <div className="section-icon">
                            <FaUser />
                        </div>

                        <div>
                            <h3>ข้อมูลบัญชี</h3>
                            <p>จัดการข้อมูลผู้ใช้งานของคุณ</p>
                        </div>
                    </div>

                    <label>อีเมล</label>

                    <div className="input-wrapper">
                        <FaEnvelope />
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                </div>

                {/* เปลี่ยนรหัสผ่าน */}

                <div className="section">

                    <div className="section-header">
                        <div className="section-icon">
                            <FaLock />
                        </div>

                        <div>
                            <h3>เปลี่ยนรหัสผ่าน</h3>
                            <p>กรอกรายละเอียดเพื่อเปลี่ยนรหัสผ่าน</p>
                        </div>
                    </div>

                    <label>รหัสผ่านเดิม</label>

                    <div className="input-wrapper">
                        <FaLock />
                        <input
                            type="password"
                            name="password"
                            placeholder="กรอกรหัสผ่านเดิม"
                            onChange={handleChange}
                        />
                    </div>

                    <label>รหัสผ่านใหม่</label>

                    <div className="input-wrapper">
                        <FaLock />
                        <input
                            type="password"
                            name="newPassword"
                            placeholder="กรอกรหัสผ่านใหม่"
                            onChange={handleChange}
                        />
                    </div>

                    <label>ยืนยันรหัสผ่านใหม่</label>

                    <div className="input-wrapper">
                        <FaLock />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="ยืนยันรหัสผ่านใหม่"
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        className="save-btn"
                        onClick={handleUpdate}
                    >
                        <FaSave />
                        บันทึกข้อมูล
                    </button>

                </div>

                {/* ข้อมูลสุขภาพ */}

                <div className="section">

                    <div className="section-header">
                        <div className="section-icon">
                            <FaFire />
                        </div>

                        <div>
                            <h3>ข้อมูลสุขภาพ</h3>
                            <p>ข้อมูลสุขภาพของคุณ</p>
                        </div>
                    </div>

                    <div className="health-grid">

                        <div className="health-card">
                            <FaWeight />
                            <h4>น้ำหนัก</h4>
                            <span>65 kg</span>
                        </div>

                        <div className="health-card">
                            <FaRulerVertical />
                            <h4>ส่วนสูง</h4>
                            <span>170 cm</span>
                        </div>

                        <div className="health-card">
                            <FaUser />
                            <h4>BMI</h4>
                            <span>22.5</span>
                        </div>

                        <div className="health-card">
                            <FaFire />
                            <h4>แคลอรี่เป้าหมาย</h4>
                            <span>1800 kcal</span>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Profile;