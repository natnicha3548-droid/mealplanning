import React, { useEffect, useState } from "react";
import {
    FaUser,
    FaLock,
    FaEnvelope,
    FaWeight,
    FaRulerVertical,
    FaFire,
    FaSave,
    FaEdit,
    FaEye,
    FaEyeSlash
} from "react-icons/fa";

import "./Profile.css";

const avatars = [
    "/avatars/0d625718d4.svg",
    "/avatars/1a45d3c9d0.svg",
    "/avatars/3e028494a4.svg",
    "/avatars/5d0a632c84.svg",
    "/avatars/8acb2d394c.svg",
    "/avatars/18b8385cef.svg",
    "/avatars/28e472d082.svg",
    "/avatars/44d3e84246.svg",
    "/avatars/46ea0c5776.svg",
    "/avatars/77c1b1d163.svg",
    "/avatars/82a9d62df5.svg",
    "/avatars/96ecfa6ee2.svg",
    "/avatars/561fbe6338.svg",
    "/avatars/7125e34119.svg",
    "/avatars/9473d70c32.svg",
    "/avatars/39959acaba.svg",
    "/avatars/a226f271a1.svg",
    "/avatars/bd51b3202c.svg",
    "/avatars/beab43e87c.svg",
    "/avatars/cec5d18000.svg"
];

function Profile() {

    const [user, setUser] = useState(null);

    const [form, setForm] = useState({
        email: "",
        password: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [countdown, setCountdown] = useState(180);
    const [healthData, setHealthData] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState(
        localStorage.getItem("avatar") || avatars[0]
    );
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    useEffect(() => {

        const storedUser = JSON.parse(
            localStorage.getItem("user")
        );

        if (storedUser) {

            setUser(storedUser);

            setForm(prev => ({
                ...prev,
                email: storedUser.email || ""
            }));

            loadHealthData(storedUser.user_id);
        }

    }, []);

    useEffect(() => {

        if (!showOtpModal) return;

        const timer = setInterval(() => {

            setCountdown(prev => {

                if (prev <= 1) {

                    clearInterval(timer);

                    alert("OTP หมดอายุ");

                    setShowOtpModal(false);

                    return 0;
                }

                return prev - 1;

            });

        }, 1000);

        return () => clearInterval(timer);

    }, [showOtpModal]);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleUpdate = async () => {

        if (!form.password) {
            alert("กรุณากรอกรหัสผ่านเดิม");
            return;
        }

        if (!form.newPassword) {
            alert("กรุณากรอกรหัสผ่านใหม่");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            alert("ยืนยันรหัสผ่านใหม่ไม่ตรงกัน");
            return;
        }

        try {

            const res = await fetch(
                "http://localhost:5000/api/change-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: user.user_id,
                        oldPassword: form.password,
                        newPassword: form.newPassword
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            alert(data.message);

            setForm({
                email: user.email,
                password: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (err) {

            console.error(err);
            alert("เกิดข้อผิดพลาด");

        }

    };

    if (!user) {

        return (
            <div className="profile-page">
                <div className="profile-card">
                    <h2 style={{ textAlign: "center" }}>
                        กรุณาเข้าสู่ระบบ
                    </h2>
                </div>
            </div>
        );

    }

    const handleSendOtp = async () => {

        if (!newEmail) {

            alert("กรุณากรอกอีเมลใหม่");
            return;

        }

        try {

            const res = await fetch(
                "http://localhost:5000/api/send-email-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: user.user_id,
                        newEmail
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {

                alert(data.message);
                return;

            }

            alert(data.message);

            setCountdown(180);
            setShowOtpModal(true);

        } catch (err) {

            console.log(err);
            alert("เกิดข้อผิดพลาด");

        }

    };

    const handleVerifyOtp = async () => {

        if (!otp) {

            alert("กรุณากรอก OTP");
            return;

        }

        try {

            const res = await fetch(
                "http://localhost:5000/api/verify-email-otp",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: user.user_id,
                        otp
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {

                alert(data.message);
                return;

            }

            alert(data.message);

            const updatedUser = {
                ...user,
                email: data.email
            };

            localStorage.setItem(
                "user",
                JSON.stringify(updatedUser)
            );

            setUser(updatedUser);

            setForm(prev => ({
                ...prev,
                email: data.email
            }));

            setNewEmail("");
            setOtp("");
            setShowOtpModal(false);

        } catch (err) {

            console.log(err);

            alert("เกิดข้อผิดพลาด");

        }

    };

    async function loadHealthData(userId) {

        try {

            const res = await fetch(
                `http://localhost:5000/api/get-calculation/${userId}`
            );

            const data = await res.json();

            setHealthData(data);

        } catch (err) {

            console.log(err);

        }

    }

    

    return (

        <div className="profile-page">

            <div className="profile-card">

                <div className="profile-avatar">

                    <img
                        src={selectedAvatar}
                        alt="avatar"
                        className="profile-avatar-img"
                    />

                    <button
                        className="avatar-edit-btn"
                        onClick={() => setShowAvatarModal(true)}
                    >
                        <FaEdit />
                    </button>

                </div>

                {
                    showAvatarModal && (

                        <div
                            className="avatar-modal-overlay"
                            onClick={() => setShowAvatarModal(false)}
                        >

                            <div
                                className="avatar-modal"
                                onClick={(e) => e.stopPropagation()}
                            >

                                <h3>เลือกรูปโปรไฟล์</h3>

                                <div className="avatar-modal-grid">

                                    {avatars.map((avatar, index) => (

                                        <img
                                            key={index}
                                            src={avatar}
                                            alt=""
                                            className={
                                                selectedAvatar === avatar
                                                    ? "avatar-item active"
                                                    : "avatar-item"
                                            }
                                            onClick={() => {

                                                setSelectedAvatar(avatar);

                                                localStorage.setItem(
                                                    "avatar",
                                                    avatar
                                                );

                                                window.dispatchEvent(
                                                    new Event("avatarChanged")
                                                );

                                                setShowAvatarModal(false);

                                            }}
                                        />

                                    ))}

                                </div>

                            </div>

                        </div>

                    )
                }

                <h1 className="profile-title">
                    โปรไฟล์ของฉัน
                </h1>

                <p className="profile-email">
                    {user?.email}
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
                            type="email"
                            value={form.email}
                            disabled
                        />

                    </div>
                    <label>อีเมลใหม่</label>

                    <div className="input-wrapper">

                        <FaEnvelope />

                        <input
                            type="email"
                            placeholder="กรอกอีเมลใหม่"
                            value={newEmail}
                            onChange={(e) =>
                                setNewEmail(e.target.value)
                            }
                        />

                    </div>

                    <button
                        className="save-btn"
                        onClick={handleSendOtp}
                    >
                        ส่ง OTP
                    </button>


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
                            type={showOldPassword ? "text" : "password"}
                            name="password"
                            value={form.password}
                            placeholder="กรอกรหัสผ่านเดิม"
                            onChange={handleChange}
                        />

                        <span
                            className="password-toggle"
                            onClick={() =>
                                setShowOldPassword(!showOldPassword)
                            }
                        >
                            {
                                showOldPassword
                                    ? <FaEyeSlash />
                                    : <FaEye />
                            }
                        </span>

                    </div>

                    <label>รหัสผ่านใหม่</label>

                    <div className="input-wrapper">

                        <FaLock />

                        <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={form.newPassword}
                            placeholder="กรอกรหัสผ่านใหม่"
                            onChange={handleChange}
                        />

                        <span
                            className="password-toggle"
                            onClick={() =>
                                setShowNewPassword(!showNewPassword)
                            }
                        >
                            {
                                showNewPassword
                                    ? <FaEyeSlash />
                                    : <FaEye />
                            }
                        </span>

                    </div>

                    <label>ยืนยันรหัสผ่านใหม่</label>

                    <div className="input-wrapper">

                        <FaLock />

                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={form.confirmPassword}
                            placeholder="ยืนยันรหัสผ่านใหม่"
                            onChange={handleChange}
                        />

                        <span
                            className="password-toggle"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                        >
                            {
                                showConfirmPassword
                                    ? <FaEyeSlash />
                                    : <FaEye />
                            }
                        </span>

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
                            <span>
                                {healthData?.weight ? Math.round(healthData.weight) : "-"} kg
                            </span>
                        </div>

                        <div className="health-card">
                            <FaRulerVertical />
                            <h4>ส่วนสูง</h4>
                            <span>
                                {healthData?.height ? Math.round(healthData.height) : "-"} cm
                            </span>
                        </div>

                        <div className="health-card">
                            <FaUser />
                            <h4>BMI</h4>
                            <span>{healthData?.bmi || "-"}</span>
                        </div>

                        <div className="health-card">
                            <FaFire />
                            <h4>เป้าหมาย</h4>
                            <span>
                                {healthData?.tdee ? Math.round(healthData.tdee) : "-"} kcal
                            </span>
                        </div>

                    </div>

                </div>
                
                {/* OTP Modal */}
                {showOtpModal && (
                    <div className="otp-modal-overlay">

                        <div className="otp-modal">

                            <h3>ยืนยัน OTP</h3>

                            <p>
                                กรุณากรอกรหัส OTP ที่ส่งไปยังอีเมลใหม่ของคุณ
                            </p>

                            <p>
                                หมดอายุใน {Math.floor(countdown / 60)}:
                                {(countdown % 60).toString().padStart(2, "0")}
                            </p>

                            <input
                                type="text"
                                placeholder="กรอก OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                            />

                            <div className="otp-btn-group">

                                <button
                                    className="otp-cancel"
                                    onClick={() => {
                                        setShowOtpModal(false);
                                        setOtp("");
                                    }}
                                >
                                    ยกเลิก
                                </button>

                                <button
                                    className="otp-confirm"
                                    onClick={handleVerifyOtp}
                                >
                                    ยืนยัน OTP
                                </button>

                            </div>

                        </div>

                    </div>
                )}

            </div>
            

        </div>
        

    );

}

export default Profile;