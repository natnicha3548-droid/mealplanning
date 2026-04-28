import React, { useEffect, useState } from "react";
import "../App.css";

function Profile() {
    const [user, setUser] = useState(null);
    const [calc, setCalc] = useState(null);

    const [form, setForm] = useState({
        email: "",
        password: "",
        newPassword: ""
    });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            setForm(prev => ({ ...prev, email: storedUser.email }));

            fetch(`http://localhost:5000/api/get-calculation/${storedUser.user_id}`)
                .then(res => res.json())
                .then(data => setCalc(data))
                .catch(err => console.error(err));
        }
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        if (!form.email) {
            alert("กรอกอีเมล");
            return;
        }

        const res = await fetch("http://localhost:5000/api/update-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: user.user_id,
                email: form.email,
                password: form.password,
                newPassword: form.newPassword
            })
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
            const updatedUser = { ...user, email: form.email };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
        }
    };

    if (!user) return <p style={{ textAlign: "center" }}>กรุณาเข้าสู่ระบบ</p>;

    return (
        <div className="calc-container">
            <h2>โปรไฟล์ของคุณ</h2>

            <div className="calc-form">
                <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="อีเมล"
                />

                <input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    placeholder="รหัสผ่านเดิม"
                />

                <input
                    type="password"
                    name="newPassword"
                    onChange={handleChange}
                    placeholder="รหัสผ่านใหม่"
                />

                <button onClick={handleUpdate}>
                    บันทึกข้อมูล
                </button>
            </div>

            {calc && (
                <div className="calc-result">
                    <h3>ข้อมูลสุขภาพ</h3>
                    <p>BMI: {calc.bmi}</p>
                    <p>TDEE: {calc.tdee} kcal</p>
                </div>
            )}
        </div>
    );
}

export default Profile;