import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Calc() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        weight: "",
        height: "",
        age: "",
        gender: "",
        activity: "",
        disease: ""
    });

    const [result, setResult] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            fetch(`http://localhost:5000/api/user/${user.user_id}`)
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        setForm({
                            weight: data.weight || "",
                            height: data.height || "",
                            age: data.age || "",
                            gender: data.gender || "",
                            activity: data.activity_level || "",
                            disease: data.chronic_disease || ""
                        });
                    }
                });
        }
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const calculate = () => {
        const weight = parseFloat(form.weight);
        const height = parseFloat(form.height) / 100;
        const age = parseInt(form.age);
        const activity = parseFloat(form.activity);

        if (!weight || !height || !age || !form.gender || !form.activity || !form.disease) {
            alert("กรอกข้อมูลให้ครบ");
            return;
        }

        const bmi = weight / (height * height);

        let bmr = 0;
        if (form.gender === "male") {
            if (age >= 18 && age <= 30) bmr = 15.057 * weight + 692.2;
            else if (age > 30 && age <= 60) bmr = 11.472 * weight + 873.1;
            else bmr = 11.711 * weight + 587.7;
        } else {
            if (age >= 18 && age <= 30) bmr = 14.818 * weight + 486.6;
            else if (age > 30 && age <= 60) bmr = 8.126 * weight + 845.6;
            else bmr = 9.082 * weight + 658.5;
        }

        const tdee = bmr * activity;

        let carbPercent = 50;
        let proteinPercent = 20;
        let fatPercent = 30;
        let proteinGram = 0;

        if (form.disease === "diabetes") {
            carbPercent = 45;
            proteinPercent = 25;
        }

        if (form.disease === "heart") {
            fatPercent = 25;
        }

        if (form.disease === "kidney") {
            const proteinMin = weight * 0.6;
            const proteinMax = weight * 0.8;
            proteinGram = (proteinMin + proteinMax) / 2;
        }

        let carbGram, fatGram;

        if (form.disease === "kidney") {
            const proteinKcal = proteinGram * 4;
            const remain = tdee - proteinKcal;
            carbGram = (remain * 0.6) / 4;
            fatGram = (remain * 0.4) / 9;
        } else {
            carbGram = ((carbPercent / 100) * tdee) / 4;
            proteinGram = ((proteinPercent / 100) * tdee) / 4;
            fatGram = ((fatPercent / 100) * tdee) / 9;
        }

        setResult({
            ...form,
            bmi: bmi.toFixed(2),
            bmr: bmr.toFixed(0),
            tdee: tdee.toFixed(0),
            carb: carbGram.toFixed(1),
            protein: proteinGram.toFixed(1),
            fat: fatGram.toFixed(1)
        });
    };

    const handleFinish = async () => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (user && result) {
            await fetch("http://localhost:5000/api/update-user-info", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    ...form
                })
            });

            await fetch("http://localhost:5000/api/save-calculation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    ...result
                })
            });
        }

        navigate("/", { state: { calcResult: result } });
    };

    return (
        <div className="calc-container">
            <button className="calc-back-btn" onClick={() => navigate("/")}>
                ← กลับ
            </button>

            <h2>🍽 คำนวณพลังงาน</h2>

            <div className="calc-form">
                <input name="weight" value={form.weight} placeholder="น้ำหนัก (kg)" onChange={handleChange} />
                <input name="height" value={form.height} placeholder="ส่วนสูง (cm)" onChange={handleChange} />
                <input name="age" value={form.age} placeholder="อายุ" onChange={handleChange} />

                <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">เลือกเพศ</option>
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                </select>

                <select name="activity" value={form.activity} onChange={handleChange}>
                    <option value="">ระดับกิจกรรม</option>
                    <option value="1.4">เบา</option>
                    <option value="1.7">ปานกลาง</option>
                    <option value="2.0">หนัก</option>
                </select>

                <select name="disease" value={form.disease} onChange={handleChange}>
                    <option value="">โรคประจำตัว</option>
                    <option value="none">ไม่มี</option>
                    <option value="diabetes">เบาหวาน</option>
                    <option value="heart">หัวใจและหลอดเลือด</option>
                    <option value="kidney">ไต</option>
                </select>

                <button onClick={calculate}>คำนวณ</button>
            </div>

            {result && (
                <div className="calc-result">
                    <h3>✨ ผลลัพธ์</h3>
                    <p>BMI: {result.bmi}</p>
                    <p>BMR: {result.bmr} kcal</p>
                    <p>TDEE: {result.tdee} kcal</p>
                    <p>คาร์บ: {result.carb} g</p>
                    <p>โปรตีน: {result.protein} g</p>
                    <p>ไขมัน: {result.fat} g</p>

                    <button className="finish-btn" onClick={handleFinish}>
                        เสร็จสิ้น
                    </button>
                </div>
            )}
        </div>
    );
}

export default Calc;