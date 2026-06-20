import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Calc.css";

import {
    FaWeight,
    FaHeartbeat,
    FaFire,
    FaBreadSlice,
    FaDrumstickBite,
    FaTint,
    FaCandyCane,
    FaMortarPestle,
    FaShieldAlt,
    FaTint as FaDrop,
    FaHeart,
    FaNotesMedical,
    FaWeightHanging,
    FaRuler,
    FaCalendarAlt,
    FaRegUser,
    FaRunning,
    FaInfoCircle,
    FaCalculator
} from "react-icons/fa";

function Calc() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        weight: "",
        height: "",
        age: "",
        gender: "",
        activity: "",
        diseases: []
    });

    const [result, setResult] = useState(null);

    useEffect(() => {

        const loadData = async () => {

            const user = JSON.parse(localStorage.getItem("user"));

            // ================= GUEST =================
            if (!user) {
                // อ่านจาก localStorage["calcResult"] เพื่อ pre-fill form และแสดงผลลัพธ์เก่า
                // ไม่แตะ sessionStorage เพราะ sessionStorage ถูกล้างตอน logout แล้ว
                const savedResult = JSON.parse(localStorage.getItem("calcResult"));

                if (savedResult) {
                    setResult(savedResult);
                    setForm({
                        weight: savedResult.weight || "",
                        height: savedResult.height || "",
                        age: savedResult.age || "",
                        gender: savedResult.gender || "",
                        activity: savedResult.activity || "",
                        diseases: savedResult.diseases || []
                    });
                }

                return;
            }

            // ================= USER (สมาชิก) =================

            try {
                const userRes = await fetch(`http://localhost:5000/api/user/${user.user_id}`);
                const userData = await userRes.json();

                if (userData) {
                    setForm({
                        weight: userData.weight || "",
                        height: userData.height || "",
                        age: userData.age || "",
                        gender: userData.gender || "",
                        activity: userData.activity_level || "",
                        diseases: userData.chronic_disease
                            ? (
                                userData.chronic_disease.startsWith("[")
                                    ? JSON.parse(userData.chronic_disease)
                                    : [userData.chronic_disease]
                            )
                            : []
                    });
                }
            } catch (err) {
                console.error("Load User Error:", err);
            }

            const activeCalc = JSON.parse(sessionStorage.getItem("activeCalcResult"));
            if (activeCalc) {
                setResult(activeCalc);
                setForm(prev => ({
                    weight: prev.weight || String(activeCalc.weight || ""),
                    height: prev.height || String(activeCalc.height || ""),
                    age: prev.age || String(activeCalc.age || ""),
                    gender: prev.gender || activeCalc.gender || "",
                    activity: prev.activity || String(activeCalc.activity || ""),
                    diseases: prev.diseases.length > 0 ? prev.diseases : (activeCalc.diseases || [])
                }));
                return;
            }

            try {
                const calcRes = await fetch(`http://localhost:5000/api/get-calculation/${user.user_id}`);
                const calcData = await calcRes.json();
                if (calcData) {
                    setResult(calcData);
                }
            } catch (err) {
                console.error("Load Calculation Error:", err);
            }
        };

        loadData();

    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDiseaseChange = (e) => {
        const value = e.target.value;
        let updatedDiseases = [...form.diseases];

        if (value === "none") {
            updatedDiseases = e.target.checked ? ["none"] : [];
        } else {
            updatedDiseases = updatedDiseases.filter(d => d !== "none");
            if (e.target.checked) {
                updatedDiseases.push(value);
            } else {
                updatedDiseases = updatedDiseases.filter(d => d !== value);
            }
        }

        setForm({ ...form, diseases: updatedDiseases });
    };

    const calculate = () => {

        const weight = parseFloat(form.weight);
        const height = parseFloat(form.height) / 100;
        const age = parseInt(form.age);
        const activity = parseFloat(form.activity);

        if (!weight || !height || !age || !form.gender || !form.activity || form.diseases.length === 0) {
            alert("กรอกข้อมูลให้ครบ");
            return;
        }

        const bmi = weight / (height * height);

        let bmr = 0;
        if (form.gender === "male") {
            if (age >= 18 && age <= 30) bmr = (15.057 * weight) + 692.2;
            else if (age > 30 && age <= 60) bmr = (11.472 * weight) + 873.1;
            else bmr = (11.711 * weight) + 587.7;
        } else {
            if (age >= 18 && age <= 30) bmr = (14.818 * weight) + 486.6;
            else if (age > 30 && age <= 60) bmr = (8.126 * weight) + 845.6;
            else bmr = (9.082 * weight) + 658.5;
        }

        const tdee = bmr * activity;

        let carbPercent = 55, proteinPercent = 20, fatPercent = 25, sugar = 25, sodium = 2500;

        if (form.diseases.includes("diabetes")) {
            carbPercent = 45; proteinPercent = 20; fatPercent = 35; sugar = 20;
        }
        if (form.diseases.includes("heart")) {
            fatPercent = 20; sodium = 2000;
        }

        const carbKcal = (carbPercent * tdee) / 100;
        let proteinKcal = (proteinPercent * tdee) / 100;
        const fatKcal = (fatPercent * tdee) / 100;

        let proteinGram = 0;
        if (form.diseases.includes("kidney")) {
            const proteinMin = weight * 0.6;
            const proteinMax = weight * 0.8;
            proteinGram = (proteinMin + proteinMax) / 2;
            proteinKcal = proteinGram * 4;
            sodium = 2000;
        } else {
            proteinGram = proteinKcal / 4;
        }

        const carbGram = carbKcal / 4;
        const fatGram = fatKcal / 9;

        const finalResult = {
            ...form,
            bmi: Number(bmi.toFixed(2)),
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            carb: Math.round(carbGram),
            protein: Math.round(proteinGram),
            fat: Math.round(fatGram),
            sugar: Math.round(sugar),
            sodium
        };

        setResult(finalResult);

        // บันทึก localStorage["calcResult"] เฉพาะ guest เท่านั้น
        // สมาชิกที่ login อยู่ไม่บันทึก เพื่อป้องกันข้อมูลตกค้างหลัง logout
        const currentUser = JSON.parse(localStorage.getItem("user"));
        if (!currentUser) {
            localStorage.setItem("calcResult", JSON.stringify(finalResult));
        }

    };

    const handleFinish = async () => {

        const user = JSON.parse(localStorage.getItem("user"));

        if (user && result) {

            await fetch("http://localhost:5000/api/update-user-info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.user_id,
                    weight: form.weight,
                    height: form.height,
                    age: form.age,
                    gender: form.gender,
                    activity: form.activity,
                    chronic_disease: JSON.stringify(form.diseases)
                })
            });

            await fetch("http://localhost:5000/api/save-calculation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.user_id,
                    ...result
                })
            });

        }

        // ใช้ทั้ง Guest และ Member หลังจากกด "เสร็จสิ้น"
        sessionStorage.setItem(
            "activeCalcResult",
            JSON.stringify(result)
        );

        sessionStorage.setItem(
            "calcForm",
            JSON.stringify(form)
        );

        navigate("/", {
            state: {
                calcResult: result,
                formData: form
            }
        });

    };

    return (

        <div className="calc-container">

            <div className="calc-header">
                <button className="calc-back-btn" onClick={() => navigate("/")}>← กลับ</button>
                <div className="calc-title-area">
                    <div className="calc-fire"><FaFire /></div>
                    <h2>คำนวณพลังงาน</h2>
                    <div className="title-line"></div>
                </div>
            </div>

            <div className="calc-form">

                <div className="input-card">
                    <div className="input-icon orange"><FaWeightHanging /></div>
                    <div className="input-content">
                        <label>น้ำหนัก (kg)</label>
                        <input name="weight" value={form.weight} onChange={handleChange} />
                    </div>
                </div>

                <div className="input-card">
                    <div className="input-icon yellow"><FaRuler /></div>
                    <div className="input-content">
                        <label>ส่วนสูง (cm)</label>
                        <input name="height" value={form.height} onChange={handleChange} />
                    </div>
                </div>

                <div className="input-card">
                    <div className="input-icon gold"><FaCalendarAlt /></div>
                    <div className="input-content">
                        <label>อายุ (ปี)</label>
                        <input name="age" value={form.age} onChange={handleChange} />
                    </div>
                </div>

                <div className="input-card">
                    <div className="input-icon pink"><FaRegUser /></div>
                    <div className="input-content">
                        <label>เพศ</label>
                        <select name="gender" value={form.gender} onChange={handleChange}>
                            <option value="">เลือกเพศ</option>
                            <option value="male">ชาย</option>
                            <option value="female">หญิง</option>
                        </select>
                    </div>
                </div>

                <div className="input-card">
                    <div className="input-icon green"><FaRunning /></div>
                    <div className="input-content">
                        <label>ระดับกิจกรรม</label>
                        <select name="activity" value={form.activity} onChange={handleChange}>
                            <option value="">ระดับกิจกรรม</option>
                            <option value="1.4">กิจกรรมเบา</option>
                            <option value="1.7">กิจกรรมปานกลาง</option>
                            <option value="2.0">กิจกรรมหนัก</option>
                        </select>
                    </div>
                </div>

                <div className="activity-box">
                    <div className="activity-info-icon"><FaInfoCircle /></div>
                    <div>
                        {form.activity === "1.4" && (<><h4>กิจกรรมเบา</h4><p>กิจกรรมที่ใช้แรงน้อย เช่น นั่งทำงาน อ่านหนังสือ ดูทีวี</p></>)}
                        {form.activity === "1.7" && (<><h4>กิจกรรมปานกลาง</h4><p>กิจกรรมที่ใช้แรงพอประมาณ เช่น เดิน วิ่ง ปั่นจักรยาน</p></>)}
                        {form.activity === "2.0" && (<><h4>กิจกรรมหนัก</h4><p>กิจกรรมที่ใช้แรงมากและต่อเนื่องหลายชั่วโมง เช่น ซ้อมกีฬา <span style={{ whiteSpace: "nowrap" }}>งานเกษตรหนัก</span></p></>)}
                    </div>
                </div>

                <div className="disease-group">
                    <div className="disease-title"><FaHeartbeat /><span>โรคประจำตัว</span></div>
                    <div className="disease-list">
                        <label className="disease-box green">
                            <div className="disease-left"><div className="disease-icon"><FaShieldAlt /></div><span>ไม่มี</span></div>
                            <input type="checkbox" value="none" checked={form.diseases.includes("none")} onChange={handleDiseaseChange} />
                        </label>
                        <label className="disease-box purple">
                            <div className="disease-left"><div className="disease-icon"><FaDrop /></div><span>เบาหวาน</span></div>
                            <input type="checkbox" value="diabetes" checked={form.diseases.includes("diabetes")} onChange={handleDiseaseChange} />
                        </label>
                        <label className="disease-box pink">
                            <div className="disease-left"><div className="disease-icon"><FaHeart /></div><span>หัวใจและหลอดเลือด</span></div>
                            <input type="checkbox" value="heart" checked={form.diseases.includes("heart")} onChange={handleDiseaseChange} />
                        </label>
                        <label className="disease-box blue">
                            <div className="disease-left"><div className="disease-icon"><FaNotesMedical /></div><span>โรคไต</span></div>
                            <input type="checkbox" value="kidney" checked={form.diseases.includes("kidney")} onChange={handleDiseaseChange} />
                        </label>
                    </div>
                </div>

                <button className="calculate-btn" onClick={calculate}>
                    <FaCalculator /> คำนวณ
                </button>

            </div>

            {result && (
                <div className="calc-result">
                    <h3>ผลลัพธ์การคำนวณ</h3>
                    <div className="result-list">
                        <div className="result-card"><div className="result-left"><FaWeight /><span>BMI</span></div><strong>{result.bmi}</strong></div>
                        <div className="result-card"><div className="result-left"><FaHeartbeat /><span>BMR</span></div><strong>{result.bmr} kcal</strong></div>
                        <div className="result-card"><div className="result-left"><FaFire /><span>TDEE</span></div><strong>{result.tdee} kcal</strong></div>
                        <div className="result-card"><div className="result-left"><FaBreadSlice /><span>คาร์บ</span></div><strong>{result.carb} g</strong></div>
                        <div className="result-card"><div className="result-left"><FaDrumstickBite /><span>โปรตีน</span></div><strong>{result.protein} g</strong></div>
                        <div className="result-card"><div className="result-left"><FaTint /><span>ไขมัน</span></div><strong>{result.fat} g</strong></div>
                        <div className="result-card"><div className="result-left"><FaCandyCane /><span>น้ำตาล</span></div><strong>{result.sugar} g</strong></div>
                        <div className="result-card"><div className="result-left"><FaMortarPestle /><span>โซเดียม</span></div><strong>{result.sodium} mg</strong></div>
                    </div>
                    <button className="finish-btn" onClick={handleFinish}>เสร็จสิ้น</button>
                </div>
            )}

        </div>

    );
}

export default Calc;