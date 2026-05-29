import React, { useState, useEffect } from 'react';

function ManageFood() {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    // TODO: ดึงข้อมูลจาก API (SELECT * FROM food)
    // setFoods(data);
  }, []);

  return (
    <div>
      <h2>จัดการฐานข้อมูลอาหาร</h2>
      <button style={{ marginBottom: '15px', padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none' }}>+ เพิ่มเมนูอาหาร</button>
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead style={{ background: '#eee' }}>
          <tr>
            <th>ID</th>
            <th>ชื่ออาหาร</th>
            <th>หมวดหมู่</th>
            <th>แคลอรี</th>
            <th>โปรตีน</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {/* ตัวอย่างข้อมูลจำลอง */}
          <tr>
            <td>1</td>
            <td>ข้าวผัดหมู</td>
            <td>ของคาว</td>
            <td>550</td>
            <td>23</td>
            <td>
              <button style={{ marginRight: '5px', background: '#ffc107' }}>แก้ไข</button>
              <button style={{ background: '#dc3545', color: '#fff' }}>ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ManageFood;