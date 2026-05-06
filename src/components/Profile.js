import React, { useEffect, useState } from "react";
import "../App.css";

function Profile() {
    const [user, setUser] = useState(null);

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

        try {
            const res = await fetch("http://localhost:5000/api/update-user-info", {
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

            if (!res.ok) {
                const text = await res.text();
                alert(text);
                return;
            }

            const data = await res.json();
            alert(data.message);

            if (res.ok) {
                const updatedUser = { ...user, email: form.email };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
            }

        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาด");
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
        </div>
    );
}

export default Profile;