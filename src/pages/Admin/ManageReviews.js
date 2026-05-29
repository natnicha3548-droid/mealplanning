import React from 'react';

function ManageReviews() {
  return (
    <div>
      <h2>ตรวจสอบและจัดการรีวิวอาหาร</h2>
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead style={{ background: '#eee' }}>
          <tr>
            <th>ID</th>
            <th>เมนูอาหาร</th>
            <th>คะแนน (1-5)</th>
            <th>ข้อความรีวิว</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>ต้มยำกุ้ง</td>
            <td>5</td>
            <td>อร่อยมาก</td>
            <td style={{ color: 'orange' }}>รออนุมัติ</td>
            <td>
              <button style={{ marginRight: '5px', background: '#28a745', color: '#fff' }}>อนุมัติ (ผ่าน)</button>
              <button style={{ background: '#dc3545', color: '#fff' }}>ลบทิ้ง</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ManageReviews;