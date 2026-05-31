import React, { useState, useEffect } from 'react';
import { 
  LuStar, 
  LuClock, 
  LuCircleCheck, 
  LuCircleX, 
  LuInbox
} from "react-icons/lu";
// ดึงไอคอนกล่องข้อความจากตระกูล FontAwesome
import { FaComments } from "react-icons/fa";
import './ManageReviews.css';

function ManageReviews() {
  // ใช้ชื่อสถานะให้ตรงกับใน Database เพื่อความง่ายในการกรองข้อมูล
  const [activeTab, setActiveTab] = useState('รออนุมัติ');
  const [reviews, setReviews] = useState([]);

  // ================= 1. ดึงข้อมูลจากฐานข้อมูล =================
  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/all-reviews');
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  };

  useEffect(() => {
    fetchReviews(); // โหลดข้อมูลทันทีที่เปิดหน้านี้
  }, []);

  // ฟังก์ชันแปลงวันที่ให้เป็นภาษาไทยแบบย่อ
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  // ================= 2. ฟังก์ชันกดยืนยัน/ปฏิเสธ =================
  
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        // อัปเดตข้อมูลบนหน้าเว็บทันที โดยไม่ต้องโหลดหน้าใหม่
        setReviews(reviews.map(r => r.review_id === id ? { ...r, review_status: newStatus } : r));
      }
    } catch (err) {
      console.error("Update error", err);
    }
  };

  // ================= 3. ตัวแปรสำหรับกรองข้อมูล =================

  // กรองรีวิวมาแสดงเฉพาะแท็บที่กำลังกดอยู่
  const filteredReviews = reviews.filter(review => review.review_status === activeTab);

  // นับจำนวนรีวิวแต่ละสถานะไปโชว์ที่ปุ่มแท็บ
  const countPending = reviews.filter(r => r.review_status === 'รออนุมัติ').length;
  const countApproved = reviews.filter(r => r.review_status === 'อนุมัติ').length;
  const countRejected = reviews.filter(r => r.review_status === 'ปฏิเสธ').length;

  return (
    <div className="manage-reviews-wrapper">
      <div className="page-header">
        <h2 className="page-title">
            <div className="header-icon-wrapper">
              <FaComments />
            </div>
            จัดการรีวิวจากผู้ใช้
        </h2>
      </div>

      {/* ส่วนปุ่มกดสลับแท็บ */}
      <div className="review-tabs">
        <button 
          /* เติมคลาส tab-pending เข้าไปตรงนี้ */
          className={`tab-btn tab-pending ${activeTab === 'รออนุมัติ' ? 'active' : ''}`}
          onClick={() => setActiveTab('รออนุมัติ')}
        >
          <LuClock /> รอตรวจสอบ 
          <span className="badge-count">{countPending}</span>
        </button>

        <button 
          /* เติมคลาส tab-approved เข้าไปตรงนี้ */
          className={`tab-btn tab-approved ${activeTab === 'อนุมัติ' ? 'active' : ''}`}
          onClick={() => setActiveTab('อนุมัติ')}
        >
          <LuCircleCheck /> อนุมัติแล้ว 
          <span className="badge-count">{countApproved}</span>
        </button>

        <button 
          /* เติมคลาส tab-rejected เข้าไปตรงนี้ */
          className={`tab-btn tab-rejected ${activeTab === 'ปฏิเสธ' ? 'active' : ''}`}
          onClick={() => setActiveTab('ปฏิเสธ')}
        >
          <LuCircleX /> ปฏิเสธแล้ว 
          <span className="badge-count">{countRejected}</span>
        </button>

      </div>

      {/* พื้นที่แสดงการ์ดรีวิว */}
      {filteredReviews.length > 0 ? (
        <div className="review-grid">
          {filteredReviews.map(review => (
            <div key={review.review_id} className="review-card-full">
              
              <div className="review-card-header">
                <div>
                  <h4 className="review-food-name">
                    {review.food_name} 
                    <span style={{ color: '#fca311', fontSize: '0.9rem' }}>
                      <LuStar style={{ fill: '#fca311' }}/> {review.rating}
                    </span>
                  </h4>
                  <p className="review-user-email">{review.email}</p>
                </div>
                <span className="review-date">{formatDate(review.created_at)}</span>
              </div>

              <div className="review-text-content">
                "{review.review_text}"
              </div>

              {/* สลับแสดงปุ่ม ตามสถานะของแท็บ */}
              {activeTab === 'รออนุมัติ' ? (
                <div className="review-actions">
                  <button className="action-btn-large btn-approve-lg" onClick={() => updateStatus(review.review_id, 'อนุมัติ')}>
                    <LuCircleCheck /> อนุมัติ
                  </button>
                  <button className="action-btn-large btn-reject-lg" onClick={() => updateStatus(review.review_id, 'ปฏิเสธ')}>
                    <LuCircleX /> ปฏิเสธ
                  </button>
                </div>
              ) : (
                <div className={`status-badge ${activeTab === 'อนุมัติ' ? 'status-approved' : 'status-rejected'}`}>
                   {activeTab === 'อนุมัติ' ? <><LuCircleCheck /> อนุมัติเรียบร้อย</> : <><LuCircleX /> ถูกปฏิเสธ</>}
                </div>
              )}

            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <LuInbox size={60} style={{ opacity: 0.3, marginBottom: '15px' }} />
          <h3>ไม่มีข้อมูลในหมวดหมู่นี้</h3>
          <p>เมื่อมีรีวิวใหม่เข้ามา หรือมีการเปลี่ยนสถานะ ข้อมูลจะมาแสดงที่นี่ครับ</p>
        </div>
      )}

    </div>
  );
}

export default ManageReviews;