import React from 'react';

function ManageCategories() {
  return (
    <div>
      <h2>จัดการหมวดหมู่อาหาร</h2>
      <button style={{ marginBottom: '15px', padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none' }}>+ เพิ่มหมวดหมู่</button>
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead style={{ background: '#eee' }}>
          <tr>
            <th>ID</th>
            <th>ชื่อหมวดหมู่</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>ของคาว</td>
            <td>Active</td>
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

export default ManageCategories;