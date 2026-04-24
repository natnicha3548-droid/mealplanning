import React, { useState } from "react";

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
                    <input type="email" name="email" placeholder="อีเมล" onChange={handleChange} required />
                    <input type="password" name="password" placeholder="รหัสผ่าน" onChange={handleChange} required />

                    {!isLogin && (
                        <>
                            <input type="text" name="gender" placeholder="เพศ" onChange={handleChange} />
                            <input type="number" name="age" placeholder="อายุ" onChange={handleChange} />
                            <input type="number" name="height" placeholder="ส่วนสูง (cm)" onChange={handleChange} />
                            <input type="number" name="weight" placeholder="น้ำหนัก (kg)" onChange={handleChange} />
                        </>
                    )}

                    <button type="submit">
                        {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
                    </button>
                </form>

                <p>
                    {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีแล้ว?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="link-btn">
                        {isLogin ? " สมัครสมาชิก" : " เข้าสู่ระบบ"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default AuthPage;