import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { FaArrowLeft } from "react-icons/fa";
import "./NutritionReport.css";

function NutritionReport() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : { user_id: 1 };

        const response = await fetch(`http://localhost:5000/api/report/${user.user_id}`);
        const data = await response.json();
        
        // ถ้าไม่มีข้อมูลเลย ให้สร้างข้อมูลเปล่า 7 วันให้กราฟไม่โล่ง
        if (data.length === 0) {
           setReportData([
             { dateLabel: "ไม่มีข้อมูล", calories: 0, carbs: 0, protein: 0, fat: 0 }
           ]);
        } else {
           setReportData(data);
        }
        
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // คำนวณค่าเฉลี่ย
  const avgCalories = reportData.length > 0 
    ? (reportData.reduce((sum, item) => sum + Number(item.calories), 0) / reportData.length).toFixed(0) 
    : 0;

  if (isLoading) return <div className="loading">กำลังโหลดรายงาน...</div>;

  return (
    <div className="report-container">
      <header className="report-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> ย้อนกลับ
        </button>
        <div>
          <h1>รายงานโภชนาการ</h1>
          <p>สถิติการรับประทานอาหาร 7 วันย้อนหลัง</p>
        </div>
      </header>

      <div className="report-summary-cards">
        <div className="r-card orange">
          <h3>แคลอรี่เฉลี่ยต่อวัน</h3>
          <h2>{avgCalories} <span>kcal</span></h2>
        </div>
        <div className="r-card outline">
          <h3>วันที่บันทึก</h3>
          <h2>{reportData.length} <span>วัน</span></h2>
        </div>
      </div>

      <div className="chart-section">
        <h2>ปริมาณแคลอรี่ (kcal)</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="dateLabel" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#fff4e8' }}
                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="calories" fill="#ff8c42" radius={[8, 8, 0, 0]} name="แคลอรี่" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-section">
        <h2>สัดส่วนสารอาหารหลัก (กรัม)</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={reportData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="dateLabel" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="carbs" stackId="1" stroke="#FF9F43" fill="#FF9F43" name="คาร์บ" />
              <Area type="monotone" dataKey="protein" stackId="1" stroke="#EE5253" fill="#EE5253" name="โปรตีน" />
              <Area type="monotone" dataKey="fat" stackId="1" stroke="#10AC84" fill="#10AC84" name="ไขมัน" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

export default NutritionReport;