import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";

function Calc() {

    const navigate = useNavigate();
    const location = useLocation();

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
        if (location.state?.formData) {
            setForm(location.state.formData);
        } else {
            const saved = localStorage.getItem("formData");
            if (saved) {
                setForm(JSON.parse(saved));
            }
        }
    }, [location.state]);

    const handleChange = (e) => {
        const newForm = { ...form, [e.target.name]: e.target.value };
        setForm(newForm);

        localStorage.setItem("formData", JSON.stringify(newForm));
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
            if (age <= 30) bmr = 15.057 * weight + 692.2;
            else if (age <= 60) bmr = 11.472 * weight + 873.1;
            else bmr = 11.711 * weight + 587.7;
        } else {
            if (age <= 30) bmr = 14.818 * weight + 486.6;
            else if (age <= 60) bmr = 8.126 * weight + 845.6;
            else bmr = 9.082 * weight + 658.5;
        }

        const tdee = bmr * activity;

        const carb = ((0.5 * tdee) / 4).toFixed(1);
        const protein = ((0.2 * tdee) / 4).toFixed(1);
        const fat = ((0.3 * tdee) / 9).toFixed(1);

        setResult({
            ...form,
            bmi: bmi.toFixed(2),
            bmr: bmr.toFixed(0),
            tdee: tdee.toFixed(0),
            carb,
            protein,
            fat
        });
    };

    const handleFinish = () => {
        navigate("/", {
            state: {
                calcResult: result,
                formData: form
            }
        });
    };

    return (
        <div className="calc-container">

            <button className="calc-back-btn" onClick={() => navigate("/")}>
                ← กลับ
            </button>

            <h2>คำนวณพลังงาน</h2>

            <div className="calc-form">
                <input name="weight" value={form.weight} placeholder="น้ำหนัก" onChange={handleChange} />
                <input name="height" value={form.height} placeholder="ส่วนสูง" onChange={handleChange} />
                <input name="age" value={form.age} placeholder="อายุ" onChange={handleChange} />

                <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">เพศ</option>
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                </select>

                <select name="activity" value={form.activity} onChange={handleChange}>
                    <option value="">กิจกรรม</option>
                    <option value="1.4">เบา</option>
                    <option value="1.7">ปานกลาง</option>
                    <option value="2.0">หนัก</option>
                </select>

                <select name="disease" value={form.disease} onChange={handleChange}>
                    <option value="">โรค</option>
                    <option value="none">ไม่มี</option>
                    <option value="diabetes">เบาหวาน</option>
                    <option value="heart">หัวใจ</option>
                    <option value="kidney">ไต</option>
                </select>

                <button onClick={calculate}>คำนวณ</button>
            </div>

            {result && (
                <div className="calc-result">
                    <p>TDEE: {result.tdee}</p>
                    <p>คาร์บ: {result.carb}</p>
                    <p>โปรตีน: {result.protein}</p>
                    <p>ไขมัน: {result.fat}</p>

                    <button className="finish-btn" onClick={handleFinish}>
                        เสร็จสิ้น
                    </button>
                </div>
            )}
        </div>
    );
}

export default Calc;