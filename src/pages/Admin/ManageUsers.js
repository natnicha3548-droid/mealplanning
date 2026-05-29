import React from 'react';

function ManageUsers() {
  return (
    <div>
      <h2>จัดการข้อมูลสมาชิก</h2>
      <button style={{ marginBottom: '15px', padding: '8px 15px', background: '#28a745', color: '#fff', border: 'none' }}>+ เพิ่มสมาชิก</button>
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead style={{ background: '#eee' }}>
          <tr>
            <th>User ID</th>
            <th>อีเมล</th>
            <th>สิทธิ์ผู้ใช้งาน (Role)</th>
            <th>ตรวจสอบ/จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>user@gmail.com</td>
            <td>User</td>
            <td>
              <button style={{ marginRight: '5px', background: '#17a2b8', color: '#fff' }}>ดูข้อมูล</button>
              <button style={{ marginRight: '5px', background: '#ffc107' }}>แก้ไข</button>
              <button style={{ background: '#dc3545', color: '#fff' }}>ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsers;