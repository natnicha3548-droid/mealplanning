import React from 'react';

function DashboardReport() {
  return (
    <div>
      <h2>รายงานสรุปผล (Dashboard)</h2>
      
      {/* ส่วนแสดงตัวเลขสถิติเบื้องต้น */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', flex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>จำนวนสมาชิกรวม</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>150 คน</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', flex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>เมนูอาหารทั้งหมด</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>45 เมนู</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', flex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>รีวิวรอตรวจสอบ</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>5 รายการ</p>
        </div>
      </div>

      {/* ส่วนดาวน์โหลดรายงาน */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>ดาวน์โหลดรายงานสรุปผล</h3>
        <button style={{ marginRight: '10px', padding: '10px 15px', background: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px' }}>📥 ดาวน์โหลด PDF</button>
        <button style={{ padding: '10px 15px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: '4px' }}>📊 ดาวน์โหลด Excel</button>
      </div>
    </div>
  );
}

export default DashboardReport;