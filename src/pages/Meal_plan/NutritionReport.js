import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, Legend
} from "recharts";
import { 
  FaArrowLeft, FaExclamationTriangle, FaCheckCircle,
  FaFire, FaBullseye, FaCalendarAlt,
  FaDna, FaHeartbeat, FaChartLine, FaChartPie 
} from "react-icons/fa";
import "./NutritionReport.css";

function NutritionReport() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const pastPlanState = location.state; 

  const [reportData, setReportData] = useState([]);
  const [userConfig, setUserConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : { user_id: 1 };

        const response = await fetch(`http://localhost:5000/api/report/${user.user_id}`);
        const data = await response.json();
        
        setUserConfig(data.userConfig);
        
        if (data.weeklyData.length === 0) {
           setReportData([{ dateLabel: "ไม่มีข้อมูล", calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0, sodium: 0 }]);
        } else {
           setReportData(data.weeklyData);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (isLoading) return <div className="loading">กำลังโหลดรายงานเพื่อสุขภาพ...</div>;

  // ดึงค่าเป้าหมายและโรคประจำตัว
  const disease = userConfig?.chronic_disease || "none";
  const targetSugar = Number(userConfig?.sugar) || 25;
  const targetSodium = Number(userConfig?.sodium) || 2000;
  const targetFat = Number(userConfig?.fat) || 50;

  // คำนวณค่าเฉลี่ยที่กินจริงใน 7 วัน
  const avgCalories = reportData.length > 0 ? Math.round(reportData.reduce((sum, item) => sum + item.calories, 0) / reportData.length) : 0;
  const avgSugar = reportData.length > 0 ? Math.round(reportData.reduce((sum, item) => sum + item.sugar, 0) / reportData.length) : 0;
  const avgSodium = reportData.length > 0 ? Math.round(reportData.reduce((sum, item) => sum + item.sodium, 0) / reportData.length) : 0;
  const avgFat = reportData.length > 0 ? Math.round(reportData.reduce((sum, item) => sum + item.fat, 0) / reportData.length) : 0;

  // หาพลังงานของ "วันนี้" (เอาจากข้อมูลล่าสุดในอาเรย์)
  const todayData = reportData.length > 0 ? reportData[reportData.length - 1] : null;
  const todayCalories = todayData ? todayData.calories : 0;

  // ฟังก์ชันแปลงวันที่ภาษาไทย
  const formatThaiDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  // 🌟 ฟังก์ชันแสดงแผงควบคุม NCDs (ปรับให้ฉลาดขึ้น แสดงข้อมูลตามบริบท)
  const renderNCDWatchSection = () => {
    let title = "";
    let currentValue = 0;
    let targetValue = 0;
    let unit = "";
    let description = "";
    let ncdIcon = null;

    // เลือกตัวแปรเพื่อเช็กว่าเป็นการดูแบบ "เฉลี่ย" หรือ "ดูแค่วันนี้"
    let currentSugar = avgSugar;
    let currentSodium = avgSodium;
    let currentFat = avgFat;
    let valueLabel = "ทานเฉลี่ยจริง";

    // 🌟 ถ้าเข้าจากหน้า PastPlans (ดูย้อนหลัง) ให้ดึงข้อมูลของวันนั้นๆ มาโชว์แทนค่าเฉลี่ย
    if (pastPlanState) {
      valueLabel = "ทานจริงในวันนี้";
      const d = new Date(pastPlanState.pastDate);
      const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const targetLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      const dayData = reportData.find(item => item.dateLabel === targetLabel);
      
      if (dayData) {
        currentSugar = dayData.sugar;
        currentSodium = dayData.sodium;
        currentFat = dayData.fat;
      } else {
        currentSugar = 0;
        currentSodium = 0;
        currentFat = 0;
      }
    }

    if (disease === "diabetes") {
      title = "แผงควบคุมพิเศษ: ติดตามโรคเบาหวาน";
      ncdIcon = <FaDna className="title-icon-inline txt-danger-icon" />;
      currentValue = currentSugar;
      targetValue = targetSugar;
      unit = "กรัม";
      description = "ผู้ป่วยเบาหวานต้องควบคุมน้ำตาลและคาร์โบไฮเดรตอย่างเข้มงวดเพื่อป้องกันระดับน้ำตาลในเลือดสะสมสูง";
    } else if (disease === "kidney") {
      title = "แผงควบคุมพิเศษ: ติดตามโรคไต";
      ncdIcon = <FaHeartbeat className="title-icon-inline" />;
      currentValue = currentSodium;
      targetValue = targetSodium;
      unit = "มิลลิกรัม (mg)";
      description = "โรคไตจำเป็นต้องจำกัดโซเดียมอย่างจริงจังเพื่อลดภาระการทำงานของไตและควบคุมภาวะบวมน้ำ";
    } else if (disease === "heart") {
      title = "แผงควบคุมพิเศษ: ติดตามโรคหัวใจและหลอดเลือด";
      ncdIcon = <FaHeartbeat className="title-icon-inline" />;
      currentValue = currentSodium;
      targetValue = targetSodium;
      unit = "mg";
      description = "การควบคุมโซเดียมและไขมันช่วยลดความดันโลหิตและป้องกันการอุดตันของคอเลสเตอรอลในหลอดเลือด";
    } else {
      return null; // ถ้าเป็น none (ไม่มีโรค) จะไม่แสดง
    }

    const isDanger = currentValue > targetValue;

    return (
      <div className={`ncd-watch-card ${isDanger ? "danger-alert" : "safe-alert"}`}>
        <div className="ncd-watch-header">
          <h3>{ncdIcon} {title}</h3>
          <span className="ncd-badge">{isDanger ? <FaExclamationTriangle /> : <FaCheckCircle />} {isDanger ? "ควรระวัง" : "อยู่ในเกณฑ์ดี"}</span>
        </div>
        <p className="ncd-desc">{description}</p>
        <div className="ncd-compare-grid">
          <div className="ncd-compare-box">
            <span>{valueLabel}</span>
            <strong className={isDanger ? "txt-danger" : "txt-safe"}>{currentValue} {unit}</strong>
          </div>
          <div className="ncd-compare-box">
            <span>เกณฑ์แนะนำทางการแพทย์</span>
            <strong>{targetValue} {unit}</strong>
          </div>
        </div>
        {disease === "heart" && (
          <div className="heart-extra-info">
            <p>💡 ไขมันที่ได้รับอยู่ที่ <strong>{currentFat}g</strong> จากเกณฑ์จำกัดสูงสุดที่ <strong>{targetFat}g</strong></p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="report-container">
      <header className="report-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> ย้อนกลับ
        </button>
        <div className="report-header-text">
          <h1>{pastPlanState ? `รายงานโภชนาการวันที่ ${formatThaiDate(pastPlanState.pastDate)}` : "รายงานโภชนาการสุขภาพ"}</h1>
          <p>{pastPlanState ? "สรุปผลพลังงานของแผนการกินย้อนหลังที่คุณเลือก" : "สรุปผลและพฤติกรรมการทานอาหารรายสัปดาห์ย้อนหลัง"}</p>
        </div>
      </header>

      {/* 🌟 แสดงคำแนะนำโรคประจำตัวเสมอ ไม่ว่าจะดูจากหน้าไหน */}
      {renderNCDWatchSection()}

      {/* แสดงการ์ดสรุปผลตามบริบท (มาจากหน้าไหน) */}
      <div className="report-summary-cards" style={{ gridTemplateColumns: pastPlanState ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}>
        
        {pastPlanState ? (
          /* ================= แสดงเฉพาะการดูย้อนหลัง (PastPlans) ================= */
          <>
            <div className="r-card orange">
              <div className="card-icon-wrapper"><FaFire /></div>
              <h3>พลังงานวันที่ {formatThaiDate(pastPlanState.pastDate)} รวม</h3>
              <h2>{pastPlanState.totalCalories} <span>kcal</span></h2>
            </div>
            <div className="r-card outline">
              <div className="card-icon-wrapper"><FaBullseye /></div>
              <h3>เป้าหมายพลังงานส่วนบุคคล</h3>
              <h2>{userConfig?.tdee || 1600} <span>kcal/วัน</span></h2>
            </div>
          </>
        ) : (
          /* ================= แสดงตอนเปิดหน้าปกติ (MealPlan) ================= */
          <>
            <div className="r-card orange">
              <div className="card-icon-wrapper"><FaFire /></div>
              <h3>พลังงานวันนี้รวม</h3>
              <h2>{todayCalories} <span>kcal</span></h2>
            </div>
            <div className="r-card outline">
              <div className="card-icon-wrapper"><FaChartLine /></div>
              <h3>พลังงานเฉลี่ยที่ได้รับ</h3>
              <h2>{avgCalories} <span>kcal/วัน</span></h2>
            </div>
            <div className="r-card outline">
              <div className="card-icon-wrapper"><FaBullseye /></div>
              <h3>เป้าหมายพลังงานส่วนบุคคล</h3>
              <h2>{userConfig?.tdee || 1600} <span>kcal/วัน</span></h2>
            </div>
            <div className="r-card outline">
              <div className="card-icon-wrapper"><FaCalendarAlt /></div>
              <h3>จำนวนวันที่บันทึก</h3>
              <h2>{reportData.length} <span>วัน</span></h2>
            </div>
          </>
        )}
      </div>

      {/* กราฟที่ 1: พลังงาน */}
      <div className="chart-section">
        <h2>
          <FaChartLine className="title-icon-inline-h2" /> กราฟแสดงแนวโน้มพลังงาน (kcal)
        </h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={reportData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="dateLabel" tick={{ fill: '#888', fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#fff4e8' }} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
              <Bar dataKey="calories" fill="#ff8c42" radius={[6, 6, 0, 0]} name="พลังงานที่ทาน" barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* กราฟเจาะลึกเฉพาะโรค NCDs */}
      {disease !== "none" && (
        <div className="chart-section warning-chart">
          <h2>
            <FaChartLine className="title-icon-inline-h2 warning-color" />
            {disease === "diabetes" ? "แนวโน้มปริมาณน้ำตาลรายวัน (กรัม)" : "แนวโน้มปริมาณโซเดียมรายวัน (mg)"}
          </h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={reportData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="dateLabel" tick={{ fill: '#888', fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
                <Legend />
                {disease === "diabetes" ? (
                  <Line type="monotone" dataKey="sugar" stroke="#ee5253" strokeWidth={3} name="น้ำตาลที่กินจริง (g)" dot={{ r: 4 }} />
                ) : (
                  <Line type="monotone" dataKey="sodium" stroke="#2e86de" strokeWidth={3} name="โซเดียมที่กินจริง (mg)" dot={{ r: 4 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* กราฟสัดส่วนสารอาหารหลัก */}
      <div className="chart-section">
        <h2>
          <FaChartPie className="title-icon-inline-h2 groups-color" /> สัดส่วนสารอาหารที่ได้รับ (กรัม)
        </h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={reportData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="dateLabel" tick={{ fill: '#888', fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
              <Legend />
              <Area type="monotone" dataKey="carbs" stackId="1" stroke="#FF9F43" fill="#FF9F43" name="คาร์บ" opacity={0.8} />
              <Area type="monotone" dataKey="protein" stackId="1" stroke="#EE5253" fill="#EE5253" name="โปรตีน" opacity={0.8} />
              <Area type="monotone" dataKey="fat" stackId="1" stroke="#10AC84" fill="#10AC84" name="ไขมัน" opacity={0.8} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default NutritionReport;