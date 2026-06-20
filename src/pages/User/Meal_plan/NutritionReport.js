import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, Legend
} from "recharts";
import { 
  FaArrowLeft, FaExclamationTriangle, FaCheckCircle,
  FaFire, FaBullseye, FaCalendarAlt,
  FaDna, FaHeartbeat, FaChartLine, FaChartPie,
  FaNotesMedical
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

        if (!storedUser) {
          setUserConfig(null);
          setReportData([]);
          setIsLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        const response = await fetch(`http://localhost:5000/api/report/${user.user_id}`);
        const data = await response.json();
        
        setUserConfig(data.userConfig);
        setReportData(data.weeklyData.length === 0 ? [{ dateLabel: "ไม่มีข้อมูล", calories: 0, carbs: 0, protein: 0, fat: 0, sugar: 0, sodium: 0 }] : data.weeklyData);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReportData();
  }, []);

  if (isLoading) return <div className="loading">กำลังโหลดรายงานเพื่อสุขภาพ...</div>;

  // ================= ระบบจัดการหลายโรคประจำตัว =================
  let detectedDiseases = [];
  if (userConfig?.disease) {
    const diseaseString = String(userConfig.disease).toLowerCase();
    if (diseaseString.includes("diabetes")) detectedDiseases.push("diabetes");
    if (diseaseString.includes("kidney") || diseaseString.includes("โรคไต")) detectedDiseases.push("kidney");
    if (diseaseString.includes("heart")) detectedDiseases.push("heart");
  }

  // ดึงค่าเป้าหมายอื่นๆ ตามปกติ
  const targetSugar = Number(userConfig?.sugar) || 25;
  const targetSodium = Number(userConfig?.sodium) || 2000;
  const targetFat = Number(userConfig?.fat) || 50;

  // คำนวณค่าเฉลี่ยที่กินจริงใน 7 วัน
  const avgCalories = reportData.length > 0 ? Math.round(reportData.reduce((sum, item) => sum + item.calories, 0) / reportData.length) : 0;
  const avgSugar = reportData.length > 0 ? Math.round(reportData.reduce((sum, item) => sum + item.sugar, 0) / reportData.length) : 0;
  const avgSodium = reportData.length > 0 ? Math.round(reportData.reduce((sum, item) => sum + item.sodium, 0) / reportData.length) : 0;
  const avgFat = reportData.length > 0 ? Math.round(reportData.reduce((sum, item) => sum + item.fat, 0) / reportData.length) : 0;

  // ดึงข้อมูลของ "วันนี้วันเดียว" เพื่อนำไปเปรียบเทียบรายวัน
  const getTodayLabel = () => {
    const d = new Date();
    const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${d.getDate()} ${monthNames[d.getMonth()]}`;
  };
  const todayLabel = getTodayLabel();

  // ค้นหาข้อมูลที่ตรงกับ "วันนี้เป๊ะๆ" เท่านั้น (ถ้าหาไม่เจอให้ถือเป็น 0)
  const todayData = reportData.length > 0 ? reportData.find(item => item.dateLabel === todayLabel) : null;
  
  const todayCalories = todayData ? todayData.calories : 0;
  const todaySugar = todayData ? todayData.sugar : 0;
  const todaySodium = todayData ? todayData.sodium : 0;
  const todayFat = todayData ? todayData.fat : 0;

  // ฟังก์ชันแปลงวันที่ภาษาไทย
  const formatThaiDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  // ================= วนลูปแสดงแผงควบคุม NCDs =================
  const renderAllNCDWatchSections = () => {
    if (detectedDiseases.length === 0) return null;

    return detectedDiseases.map((diseaseType) => {
      let title = "";
      let currentValue = 0; // เก็บค่าเฉลี่ยรายสัปดาห์ (หรือค่าในอดีต)
      let todayValue = 0;   // เก็บค่าของวันนี้ตรงๆ
      let targetValue = 0;
      let unit = "";
      let description = "";
      let ncdIcon = null;
      
      // 🌟 ประกาศ currentFat ไว้ตรงนี้เพื่อไม่ให้เกิด Error no-undef
      let currentFat = avgFat; 

      if (diseaseType === "diabetes") {
        title = "แผงควบคุมพิเศษ: ติดตามโรคเบาหวาน";
        ncdIcon = <FaDna className="title-icon-inline txt-danger-icon" />;
        currentValue = avgSugar;
        todayValue = todaySugar;
        targetValue = targetSugar;
        unit = "กรัม";
        description = "ผู้ป่วยเบาหวานต้องควบคุมน้ำตาลและคาร์โบไฮเดรตอย่างเข้มงวดเพื่อป้องกันระดับน้ำตาลในเลือดสะสมสูง";
      } else if (diseaseType === "kidney") {
        title = "แผงควบคุมพิเศษ: ติดตามโรคไต";
        ncdIcon = <FaNotesMedical className="title-icon-inline" />;
        currentValue = avgSodium;
        todayValue = todaySodium;
        targetValue = targetSodium;
        unit = "มิลลิกรัม";
        description = "โรคไตจำเป็นต้องจำกัดโซเดียมอย่างจริงจังเพื่อลดภาระการทำงานของไตและควบคุมภาวะบวมน้ำ";
      } else if (diseaseType === "heart") {
        title = "แผงควบคุมพิเศษ: ติดตามโรคหัวใจและหลอดเลือด";
        ncdIcon = <FaHeartbeat className="title-icon-inline" />;
        currentValue = avgSodium;
        todayValue = todaySodium;
        targetValue = targetSodium;
        unit = "มิลลิกรัม";
        description = "การควบคุมโซเดียมและไขมันช่วยลดความดันโลหิตและป้องกันการอุดตันของคอเลสเตอรอลในหลอดเลือด";
      }

      // ถ้าเป็นการเปิดดูประวัติย้อนหลัง (Past Plans)
      if (pastPlanState) {
        const d = new Date(pastPlanState.pastDate);
        const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        const targetLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;
        const dayData = reportData.find(item => item.dateLabel === targetLabel);
        
        if (dayData) {
          currentValue = diseaseType === "diabetes" ? dayData.sugar : dayData.sodium;
          currentFat = dayData.fat;
        } else {
          currentValue = 0;
          currentFat = 0;
        }
      }

      // เช็กแจ้งเตือนอันตราย (ถ้าวันนี้เกิน หรือเฉลี่ยสัปดาห์เกิน ให้แจ้งเตือนสีแดง)
      const isDanger = currentValue > targetValue || (!pastPlanState && todayValue > targetValue);

      return (
        <div key={diseaseType} className={`ncd-watch-card ${isDanger ? "danger-alert" : "safe-alert"}`} style={{ marginBottom: "20px" }}>
          <div className="ncd-watch-header">
            <h3>{ncdIcon} {title}</h3>
            <span className="ncd-badge">{isDanger ? <FaExclamationTriangle /> : <FaCheckCircle />} {isDanger ? "ควรระวัง" : "อยู่ในเกณฑ์ดี"}</span>
          </div>
          <p className="ncd-desc">{description}</p>

          {/* ---------------- เบาหวาน ---------------- */}
          {diseaseType === "diabetes" && (
            <>
              <div
                className="ncd-compare-grid"
                style={{
                  gridTemplateColumns: pastPlanState
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)"
                }}
              >
                {!pastPlanState && (
                  <div className="ncd-compare-box">
                    <span>ทานจริงวันนี้</span>
                    <strong className={todayValue > targetValue ? "txt-danger" : "txt-safe"}>
                      {todayValue} {unit}
                    </strong>
                  </div>
                )}

                <div className="ncd-compare-box">
                  <span>{pastPlanState ? "ทานจริงในวันนั้น" : "ทานเฉลี่ย 7 วัน"}</span>
                  <strong className={currentValue > targetValue ? "txt-danger" : "txt-safe"}>
                    {currentValue} {unit}
                  </strong>
                </div>

                <div className="ncd-compare-box">
                  <span>เกณฑ์แนะนำทางการแพทย์</span>
                  <strong>{targetValue} {unit}</strong>
                </div>
              </div>
            </>
          )}

          {/* ---------------- โรคไต ---------------- */}
          {diseaseType === "kidney" && (
            <>
              <div
                className="ncd-compare-grid"
                style={{
                  gridTemplateColumns: pastPlanState
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)"
                }}
              >
                {!pastPlanState && (
                  <div className="ncd-compare-box">
                    <span>ทานจริงวันนี้</span>
                    <strong className={todayValue > targetValue ? "txt-danger" : "txt-safe"}>
                      {todayValue} {unit}
                    </strong>
                  </div>
                )}

                <div className="ncd-compare-box">
                  <span>{pastPlanState ? "ทานจริงในวันนั้น" : "ทานเฉลี่ย 7 วัน"}</span>
                  <strong className={currentValue > targetValue ? "txt-danger" : "txt-safe"}>
                    {currentValue} {unit}
                  </strong>
                </div>

                <div className="ncd-compare-box">
                  <span>เกณฑ์แนะนำทางการแพทย์</span>
                  <strong>{targetValue} {unit}</strong>
                </div>
              </div>
            </>
          )}

          {/* ---------------- โรคหัวใจ ---------------- */}
          {diseaseType === "heart" && (
            <>
              <p className="nutrition-subtitle">โซเดียม</p>

              <div
                className="ncd-compare-grid"
                style={{
                  gridTemplateColumns: pastPlanState
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)"
                }}
              >
                {!pastPlanState && (
                  <div className="ncd-compare-box">
                    <span>ทานจริงวันนี้</span>
                    <strong className={todayValue > targetValue ? "txt-danger" : "txt-safe"}>
                      {Number(todayValue).toFixed(0)} {unit}
                    </strong>
                  </div>
                )}

                <div className="ncd-compare-box">
                  <span>{pastPlanState ? "ทานจริงในวันนั้น" : "ทานเฉลี่ย 7 วัน"}</span>
                  <strong className={currentValue > targetValue ? "txt-danger" : "txt-safe"}>
                    {currentValue} {unit}
                  </strong>
                </div>

                <div className="ncd-compare-box">
                  <span>เกณฑ์แนะนำทางการแพทย์</span>
                  <strong>{targetValue} {unit}</strong>
                </div>
              </div>

              <p className="nutrition-subtitle">ไขมัน</p>

              <div
                className="ncd-compare-grid"
                style={{
                  gridTemplateColumns: pastPlanState
                    ? "repeat(2, 1fr)"
                    : "repeat(3, 1fr)"
                }}
              >
                {!pastPlanState && (
                  <div className="ncd-compare-box">
                    <span>ทานจริงวันนี้</span>
                    <strong className={todayFat > targetFat ? "txt-danger" : "txt-safe"}>
                      {todayFat} กรัม
                    </strong>
                  </div>
                )}

                <div className="ncd-compare-box">
                  <span>{pastPlanState ? "ทานจริงในวันนั้น" : "ทานเฉลี่ย 7 วัน"}</span>
                  <strong className={avgFat > targetFat ? "txt-danger" : "txt-safe"}>
                    {pastPlanState ? currentFat : avgFat} กรัม
                  </strong>
                </div>

                <div className="ncd-compare-box">
                  <span>เกณฑ์แนะนำทางการแพทย์</span>
                  <strong>{targetFat} กรัม</strong>
                </div>
              </div>
            </>
          )}
        </div>
      );
    });
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

      {/* แสดงคำแนะนำโรคประจำตัวทั้งหมด */}
      {renderAllNCDWatchSections()}

      {/* การ์ดสรุปผลด้านบน */}
      <div className="report-summary-cards" style={{ gridTemplateColumns: pastPlanState ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}>
        {pastPlanState ? (
          <>
            <div className="r-card orange">
              <div className="card-icon-wrapper"><FaFire /></div>
              <h3>พลังงานวันที่ {formatThaiDate(pastPlanState.pastDate)} รวม</h3>
              <h2>{pastPlanState.totalCalories} <span>kcal</span></h2>
            </div>
            <div className="r-card outline">
              <div className="card-icon-wrapper"><FaBullseye /></div>
              <h3>เป้าหมายพลังงานส่วนบุคคล</h3>
              <h2>{Number(userConfig?.tdee).toFixed(0)} <span>kcal/วัน</span></h2>
            </div>
          </>
        ) : (
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
              <h2>{Number(userConfig?.tdee).toFixed(0)} <span>kcal/วัน</span></h2>
            </div>
            <div className="r-card outline">
              <div className="card-icon-wrapper"><FaCalendarAlt /></div>
              <h3>จำนวนวันที่บันทึก</h3>
              <h2>{reportData.length} <span>วัน</span></h2>
            </div>
          </>
        )}
      </div>

      {/* กราฟแนวโน้มพลังงาน */}
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

      {/* ---------------- กราฟน้ำตาล ---------------- */}
      {detectedDiseases.includes("diabetes") && (
        <div className="chart-section warning-chart">
          <h2>
            <FaChartLine className="title-icon-inline-h2 warning-color" />
            แนวโน้มปริมาณน้ำตาลรายวัน (กรัม)
          </h2>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="dateLabel" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="sugar"
                  stroke="#ee5253"
                  strokeWidth={3}
                  name="น้ำตาลที่กินจริง (g)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ---------------- กราฟโซเดียม (ใช้ร่วมกัน โรคไต + โรคหัวใจ) ---------------- */}
      {(detectedDiseases.includes("kidney") ||
        detectedDiseases.includes("heart")) && (
        <div className="chart-section warning-chart">
          <h2>
            <FaChartLine className="title-icon-inline-h2 warning-color" />
            แนวโน้มปริมาณโซเดียมรายวัน (มิลลิกรัม)
          </h2>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="dateLabel" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="sodium"
                  stroke="#2e86de"
                  strokeWidth={3}
                  name="โซเดียมที่กินจริง (mg)"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ---------------- กราฟไขมัน (เฉพาะโรคหัวใจ) ---------------- */}
      {detectedDiseases.includes("heart") && (
        <div className="chart-section warning-chart">
          <h2>
            <FaChartLine className="title-icon-inline-h2 warning-color" />
            แนวโน้มปริมาณไขมันรายวัน (กรัม)
          </h2>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="dateLabel" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="fat"
                  stroke="#10AC84"
                  strokeWidth={3}
                  name="ไขมันที่กินจริง (g)"
                  dot={{ r: 4 }}
                />
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