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

    // เก็บข้อมูล form
    const [form, setForm] = useState({
        weight: "",
        height: "",
        age: "",
        gender: "",
        activity: "",
        diseases: []
    });

    // เก็บผลลัพธ์การคำนวณ
    const [result, setResult] = useState(null);

    // โหลดข้อมูลผู้ใช้
    useEffect(() => {

        const user = JSON.parse(
            localStorage.getItem("user")
        );

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

                            diseases: data.chronic_disease
                                ? (
                                    data.chronic_disease.startsWith("[")
                                        ? JSON.parse(data.chronic_disease)
                                        : [data.chronic_disease]
                                )
                                : []
                        });

                    }

                })
                .catch(err => console.error(err));

        }

    }, []);

    // โหลดผลการคำนวณเดิม
    useEffect(() => {

        const user = JSON.parse(
            localStorage.getItem("user")
        );

        if (user) {

            fetch(`http://localhost:5000/api/get-calculation/${user.user_id}`)
                .then(res => res.json())
                .then(data => {

                    if (data) {

                        setResult(data);

                    }

                })
                .catch(err => console.error(err));

        }

    }, []);

    // อัปเดตค่าจาก input
    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    // จัดการ checkbox โรคประจำตัว
    const handleDiseaseChange = (e) => {

        const value = e.target.value;

        let updatedDiseases = [...form.diseases];

        // ถ้าเลือก "ไม่มี"
        if (value === "none") {

            if (e.target.checked) {

                updatedDiseases = ["none"];

            } else {

                updatedDiseases = [];

            }

        } else {

            // ลบ none ออกก่อน
            updatedDiseases =
                updatedDiseases.filter(
                    disease => disease !== "none"
                );

            // เพิ่มหรือลบโรค
            if (e.target.checked) {

                updatedDiseases.push(value);

            } else {

                updatedDiseases =
                    updatedDiseases.filter(
                        disease => disease !== value
                    );

            }

        }

        setForm({
            ...form,
            diseases: updatedDiseases
        });

    };

    // คำนวณพลังงาน
    const calculate = () => {

        const weight = parseFloat(form.weight);
        const height = parseFloat(form.height) / 100;
        const age = parseInt(form.age);
        const activity = parseFloat(form.activity);

        // ตรวจสอบข้อมูล
        if (
            !weight ||
            !height ||
            !age ||
            !form.gender ||
            !form.activity ||
            form.diseases.length === 0
        ) {

            alert("กรอกข้อมูลให้ครบ");
            return;

        }

        // คำนวณ BMI
        const bmi = weight / (height * height);

        // คำนวณ BMR
        let bmr = 0;

        if (form.gender === "male") {

            if (age >= 18 && age <= 30)
                bmr = (15.057 * weight) + 692.2;

            else if (age > 30 && age <= 60)
                bmr = (11.472 * weight) + 873.1;

            else
                bmr = (11.711 * weight) + 587.7;

        } else {

            if (age >= 18 && age <= 30)
                bmr = (14.818 * weight) + 486.6;

            else if (age > 30 && age <= 60)
                bmr = (8.126 * weight) + 845.6;

            else
                bmr = (9.082 * weight) + 658.5;

        }

        // คำนวณ TDEE
        const tdee = bmr * activity;

        // กำหนดค่าเริ่มต้น
        let carbPercent = 55;
        let proteinPercent = 20;
        let fatPercent = 25;
        let sugar = 25;
        let sodium = 2500;

        // กรณีเป็นเบาหวาน
        if (form.diseases.includes("diabetes")) {

            carbPercent = 45;
            proteinPercent = 20;
            fatPercent = 35;

            sugar = 20;

        }

        // กรณีโรคหัวใจ
        if (form.diseases.includes("heart")) {

            fatPercent = 20;
            sodium = 2000;

        }

        // คำนวณพลังงานสารอาหาร
        const carbKcal = (carbPercent * tdee) / 100;
        let proteinKcal = (proteinPercent * tdee) / 100;
        const fatKcal = (fatPercent * tdee) / 100;

        // คำนวณโปรตีน
        let proteinGram = 0;

        // กรณีโรคไต
        if (form.diseases.includes("kidney")) {

            const proteinMin = weight * 0.6;
            const proteinMax = weight * 0.8;

            proteinGram = (proteinMin + proteinMax) / 2;

            proteinKcal = proteinGram * 4;

            sodium = 2000;

        } else {

            proteinGram = proteinKcal / 4;

        }

        // คำนวณกรัมสารอาหาร
        const carbGram = carbKcal / 4;
        const fatGram = fatKcal / 9;

        // สร้างผลลัพธ์
        const finalResult = {

            ...form,

            bmi: Number(
                bmi.toFixed(2)
            ),

            bmr: Math.round(
                bmr
            ),

            tdee: Math.round(
                tdee
            ),

            carb: Math.round(
                carbGram
            ),

            protein: Math.round(
                proteinGram
            ),

            fat: Math.round(
                fatGram
            ),

            sugar: Math.round(
                sugar
            ),

            sodium

        };

        // เก็บผลลัพธ์
        setResult(finalResult);

        localStorage.setItem(
            "calcResult",
            JSON.stringify(finalResult)
        );

    };

    // บันทึกข้อมูลและไปหน้าหลัก
    const handleFinish = async () => {

        const user = JSON.parse(
            localStorage.getItem("user")
        );

        if (user && result) {

            // อัปเดตข้อมูลผู้ใช้
            await fetch(
                "http://localhost:5000/api/update-user-info",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        user_id: user.user_id,

                        weight: form.weight,
                        height: form.height,
                        age: form.age,
                        gender: form.gender,
                        activity: form.activity,

                        chronic_disease: JSON.stringify(form.diseases)
                    })
                }
            );

            // บันทึกผลคำนวณ
            await fetch(
                "http://localhost:5000/api/save-calculation",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        user_id: user.user_id,
                        ...result
                    })
                }
            );

        }

        // กลับหน้าหลัก
        navigate("/", {
            state: {
                calcResult: result
            }
        });

    };

    return (

        <div className="calc-container">

            {/* Header */}
            <div className="calc-header">

                <button
                    className="calc-back-btn"
                    onClick={() => navigate("/")}
                >
                    ← กลับ
                </button>

                <div className="calc-title-area">

                    <div className="calc-fire">
                        <FaFire />
                    </div>

                    <h2>
                        คำนวณพลังงาน
                    </h2>

                    <div className="title-line"></div>

                </div>

            </div>

            <div className="calc-form">

                {/* น้ำหนัก */}
                <div className="input-card">

                    <div className="input-icon orange">
                        <FaWeightHanging />
                    </div>

                    <div className="input-content">

                        <label>
                            น้ำหนัก (kg)
                        </label>

                        <input
                            name="weight"
                            value={form.weight}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                {/* ส่วนสูง */}
                <div className="input-card">

                    <div className="input-icon yellow">
                        <FaRuler />
                    </div>

                    <div className="input-content">

                        <label>
                            ส่วนสูง (cm)
                        </label>

                        <input
                            name="height"
                            value={form.height}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                {/* อายุ */}
                <div className="input-card">

                    <div className="input-icon gold">
                        <FaCalendarAlt />
                    </div>

                    <div className="input-content">

                        <label>
                            อายุ (ปี)
                        </label>

                        <input
                            name="age"
                            value={form.age}
                            onChange={handleChange}
                        />

                    </div>

                </div>

                {/* เพศ */}
                <div className="input-card">

                    <div className="input-icon pink">
                        <FaRegUser />
                    </div>

                    <div className="input-content">

                        <label>
                            เพศ
                        </label>

                        <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                        >

                            <option value="">
                                เลือกเพศ
                            </option>

                            <option value="male">
                                ชาย
                            </option>

                            <option value="female">
                                หญิง
                            </option>

                        </select>

                    </div>

                </div>

                {/* ระดับกิจกรรม */}
                <div className="input-card">

                    <div className="input-icon green">
                        <FaRunning />
                    </div>

                    <div className="input-content">

                        <label>
                            ระดับกิจกรรม
                        </label>

                        <select
                            name="activity"
                            value={form.activity}
                            onChange={handleChange}
                        >

                            <option value="">
                                ระดับกิจกรรม
                            </option>

                            <option value="1.4">
                                กิจกรรมเบา
                            </option>

                            <option value="1.7">
                                กิจกรรมปานกลาง
                            </option>

                            <option value="2.0">
                                กิจกรรมหนัก
                            </option>

                        </select>

                    </div>

                </div>

                {/* รายละเอียดกิจกรรม */}
                <div className="activity-box">

                    <div className="activity-info-icon">
                        <FaInfoCircle />
                    </div>

                    <div>

                        {form.activity === "1.4" && (
                            <>
                                <h4>
                                    กิจกรรมเบา
                                </h4>

                                <p>
                                    กิจกรรมที่ใช้แรงน้อย เช่น นั่งทำงาน อ่านหนังสือ ดูทีวี
                                </p>
                            </>
                        )}

                        {form.activity === "1.7" && (
                            <>
                                <h4>
                                    กิจกรรมปานกลาง
                                </h4>

                                <p>
                                    กิจกรรมที่ใช้แรงพอประมาณ เช่น เดิน วิ่ง ปั่นจักรยาน
                                </p>
                            </>
                        )}

                        {form.activity === "2.0" && (
                            <>
                                <h4>
                                    กิจกรรมหนัก
                                </h4>

                                <p>
                                    กิจกรรมที่ใช้แรงมากและต่อเนื่องหลายชั่วโมง เช่น ซ้อมกีฬา
                                    <span style={{ whiteSpace: "nowrap" }}>
                                        งานเกษตรหนัก
                                    </span>
                                </p>
                            </>
                        )}

                    </div>

                </div>

                {/* โรคประจำตัว */}
                <div className="disease-group">

                    <div className="disease-title">
                        <FaHeartbeat />
                        <span>โรคประจำตัว</span>
                    </div>

                    <div className="disease-list">

                        {/* ไม่มีโรค */}
                        <label className="disease-box green">

                            <div className="disease-left">

                                <div className="disease-icon">
                                    <FaShieldAlt />
                                </div>

                                <span>
                                    ไม่มี
                                </span>

                            </div>

                            <input
                                type="checkbox"
                                value="none"
                                checked={
                                    form.diseases.includes("none")
                                }
                                onChange={handleDiseaseChange}
                            />

                        </label>

                        {/* เบาหวาน */}
                        <label className="disease-box purple">

                            <div className="disease-left">

                                <div className="disease-icon">
                                    <FaDrop />
                                </div>

                                <span>
                                    เบาหวาน
                                </span>

                            </div>

                            <input
                                type="checkbox"
                                value="diabetes"
                                checked={
                                    form.diseases.includes("diabetes")
                                }
                                onChange={handleDiseaseChange}
                            />

                        </label>

                        {/* โรคหัวใจ */}
                        <label className="disease-box pink">

                            <div className="disease-left">

                                <div className="disease-icon">
                                    <FaHeart />
                                </div>

                                <span>
                                    หัวใจและหลอดเลือด
                                </span>

                            </div>

                            <input
                                type="checkbox"
                                value="heart"
                                checked={
                                    form.diseases.includes("heart")
                                }
                                onChange={handleDiseaseChange}
                            />

                        </label>

                        {/* โรคไต */}
                        <label className="disease-box blue">

                            <div className="disease-left">

                                <div className="disease-icon">
                                    <FaNotesMedical />
                                </div>

                                <span>
                                    โรคไต
                                </span>

                            </div>

                            <input
                                type="checkbox"
                                value="kidney"
                                checked={
                                    form.diseases.includes("kidney")
                                }
                                onChange={handleDiseaseChange}
                            />

                        </label>

                    </div>

                </div>

                {/* ปุ่มคำนวณ */}
                <button
                    className="calculate-btn"
                    onClick={calculate}
                >
                    <FaCalculator />
                    คำนวณ
                </button>

            </div>

            {/* แสดงผลลัพธ์ */}
            {result && (

                <div className="calc-result">

                    <h3>
                        ผลลัพธ์การคำนวณ
                    </h3>

                    <div className="result-list">

                        <div className="result-card">

                            <div className="result-left">
                                <FaWeight />
                                <span>BMI</span>
                            </div>

                            <strong>
                                {result.bmi}
                            </strong>

                        </div>

                        <div className="result-card">

                            <div className="result-left">
                                <FaHeartbeat />
                                <span>BMR</span>
                            </div>

                            <strong>
                                {result.bmr} kcal
                            </strong>

                        </div>

                        <div className="result-card">

                            <div className="result-left">
                                <FaFire />
                                <span>TDEE</span>
                            </div>

                            <strong>
                                {result.tdee} kcal
                            </strong>

                        </div>

                        <div className="result-card">

                            <div className="result-left">
                                <FaBreadSlice />
                                <span>คาร์บ</span>
                            </div>

                            <strong>
                                {result.carb} g
                            </strong>

                        </div>

                        <div className="result-card">

                            <div className="result-left">
                                <FaDrumstickBite />
                                <span>โปรตีน</span>
                            </div>

                            <strong>
                                {result.protein} g
                            </strong>

                        </div>

                        <div className="result-card">

                            <div className="result-left">
                                <FaTint />
                                <span>ไขมัน</span>
                            </div>

                            <strong>
                                {result.fat} g
                            </strong>

                        </div>

                        <div className="result-card">

                            <div className="result-left">
                                <FaCandyCane />
                                <span>น้ำตาล</span>
                            </div>

                            <strong>
                                {result.sugar} g
                            </strong>

                        </div>

                        <div className="result-card">

                            <div className="result-left">
                                <FaMortarPestle />
                                <span>โซเดียม</span>
                            </div>

                            <strong>
                                {result.sodium} mg
                            </strong>

                        </div>

                    </div>

                    {/* ปุ่มเสร็จสิ้น */}
                    <button
                        className="finish-btn"
                        onClick={handleFinish}
                    >
                        เสร็จสิ้น
                    </button>

                </div>

            )}

        </div>

    );

}

export default Calc;