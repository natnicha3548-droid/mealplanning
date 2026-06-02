import React, { useState, useEffect } from 'react'; 
import { 
  LuPlus, 
  LuEye, 
  LuPenLine, 
  LuTrash2, 
  LuSearch, 
  LuX,
  LuUserPlus,  // <--- เพิ่มไอคอนผู้ใช้ใหม่
  LuUserMinus  // <--- เพิ่มไอคอนไม่ได้ใช้งาน
} from "react-icons/lu";
import { FaUserCog } from "react-icons/fa";
import './ManageUsers.css';

function ManageUsers() {
  const [activeTab, setActiveTab] = useState('All');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');

  // ================= State สำหรับสถิติเพิ่มเติม (ใหม่/ไม่ได้ใช้งาน) =================
  const [extraStats, setExtraStats] = useState({ newUsers: 0, inactiveUsers: 0 });

  // ================= State สำหรับ Modal =================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'view', 'edit', 'add'
  const [selectedUser, setSelectedUser] = useState({
    user_id: '', email: '', password: '', role: 'User'
  }); 

  useEffect(() => {
    fetchUsersData();
  }, []); 

  const fetchUsersData = async () => {
    try {
      // 1. ดึงข้อมูลตารางผู้ใช้งาน
      const response = await fetch('http://localhost:5000/api/admin/users');
      if (!response.ok) throw new Error('ไม่สามารถดึงข้อมูลสมาชิกได้');
      const data = await response.json();
      setUsers(data); 
      setIsLoading(false);

      // 2. แอบไปดึงสถิติผู้ใช้งานใหม่/ไม่ได้ใช้งาน จาก API dashboard
      try {
        const statsRes = await fetch('http://localhost:5000/api/admin/dashboard-stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setExtraStats({
            newUsers: statsData.newUsers || 0,
            inactiveUsers: statsData.inactiveUsers || 0
          });
        }
      } catch (e) {
        console.error("Failed to fetch extra stats:", e);
      }

    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // ================= ฟังก์ชันจัดการปุ่มหลัก =================
  const handleDelete = async (id) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานรหัส #${id}?`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setUsers(users.filter(user => user.user_id !== id));
        } else {
          alert("เกิดข้อผิดพลาดในการลบข้อมูล");
        }
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser({ email: '', password: '', role: 'User' }); 
    setModalMode('add');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // ================= ฟังก์ชันบันทึกข้อมูล (เพิ่ม / แก้ไข) =================
  const handleSaveModal = async (e) => {
    e.preventDefault(); 
    
    if (modalMode === 'add') {
      try {
        const response = await fetch('http://localhost:5000/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: selectedUser.email, password: selectedUser.password, role: selectedUser.role })
        });
        const result = await response.json();
        if (response.ok) {
          alert("เพิ่มสมาชิกสำเร็จ!");
          fetchUsersData(); 
          closeModal();
        } else {
          alert(result.message || "เกิดข้อผิดพลาด");
        }
      } catch (err) {
        console.error(err);
      }
    } else if (modalMode === 'edit') {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.user_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: selectedUser.role })
        });
        if (response.ok) {
          alert("อัปเดตข้อมูลสำเร็จ!");
          fetchUsersData(); 
          closeModal();
        } else {
          alert("เกิดข้อผิดพลาดในการอัปเดต");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ================= กรองข้อมูล =================
  const filteredUsers = users.filter(user => {
    const matchTab = activeTab === 'All' || user.role === activeTab;
    const matchSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) || user.user_id.toString().includes(searchQuery);
    return matchTab && matchSearch;
  });

  return (
    <div className="manage-users-container">
      {/* ================= ส่วนหัว (Header) ================= */}
      <div className="manage-users-header">
        <h2 className="page-title">
          <div className="title-icon-wrapper"><FaUserCog /></div>
          จัดการข้อมูลสมาชิก
        </h2>
        
        <div className="header-actions">
          <div className="search-box">
            <LuSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="ค้นหาอีเมล หรือ ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-cute btn-add" onClick={handleAdd}>
            <LuPlus size={18} /> เพิ่มสมาชิก
          </button>
        </div>
      </div>

      {/* ================= Tab กรองข้อมูล & สถิติภาพรวม ================= */}
      <div className="filter-and-stats-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        
        <div className="role-filter-tabs">
          <button className={`filter-tab tab-all ${activeTab === 'All' ? 'active' : ''}`} onClick={() => setActiveTab('All')}>ทั้งหมด</button>
          <button className={`filter-tab tab-user ${activeTab === 'User' ? 'active' : ''}`} onClick={() => setActiveTab('User')}>ผู้ใช้งาน (User)</button>
          <button className={`filter-tab tab-admin ${activeTab === 'Admin' ? 'active' : ''}`} onClick={() => setActiveTab('Admin')}>แอดมิน (Admin)</button>
        </div>

        {/* ================= เพิ่มแถบสถิติใหม่ ตรงนี้ครับ ================= */}
        <div className="user-stats-summary" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <span className="stat-pill stat-user">ผู้ใช้งาน <strong>{users.filter(u => u.role === 'User').length}</strong> คน</span>
          <span className="stat-pill stat-admin">แอดมิน <strong>{users.filter(u => u.role === 'Admin').length}</strong> คน</span>
          
          <span className="stat-pill" style={{ background: '#e6f4ea', color: '#1e8e3e', border: '1px solid #cce8d6', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <LuUserPlus size={15}/> ใหม่ (30 วัน) <strong>{extraStats.newUsers}</strong> คน
          </span>
          <span className="stat-pill" style={{ background: '#fce8e6', color: '#d93025', border: '1px solid #fad2cf', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <LuUserMinus size={15}/> ไม่ได้ใช้งาน <strong>{extraStats.inactiveUsers}</strong> คน
          </span>
        </div>
        {/* ========================================================= */}

      </div>

      {/* ================= ส่วนตารางแสดงข้อมูล ================= */}
      <div className="table-wrapper">
        <table className="cute-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>อีเมล</th>
              <th>สิทธิ์ผู้ใช้งาน (Role)</th>
              <th className="text-center">ตรวจสอบ/จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" className="text-center" style={{ padding: '30px' }}>กำลังโหลดข้อมูล...</td></tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td className="user-id">{user.user_id}</td>
                  <td>{user.email}</td>
                  <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-view" title="ดูข้อมูล" onClick={() => handleView(user)}><LuEye size={16} /></button>
                      <button className="btn-action btn-edit" title="แก้ไข" onClick={() => handleEdit(user)}><LuPenLine size={16} /></button>
                      <button className="btn-action btn-delete" title="ลบ" onClick={() => handleDelete(user.user_id)}><LuTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center" style={{ padding: '30px' }}>ไม่พบข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ป๊อปอัป ================= */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            <div className="modal-header">
              <h3>
                {modalMode === 'add' ? 'เพิ่มสมาชิกใหม่' : 
                 modalMode === 'edit' ? 'แก้ไขสิทธิ์การใช้งาน' : 
                 'รายละเอียดสมาชิก'}
              </h3>
              <button className="btn-close-modal" onClick={closeModal}><LuX size={20} /></button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="modal-body">
                
                <div className="form-group">
                  <label>อีเมล (Email)</label>
                  <input 
                    type="email" 
                    required 
                    readOnly={modalMode !== 'add'} 
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    placeholder="example@email.com"
                  />
                </div>

                {modalMode === 'add' && (
                  <div className="form-group">
                    <label>รหัสผ่าน (Password)</label>
                    <input 
                      type="password" 
                      required 
                      value={selectedUser.password}
                      onChange={(e) => setSelectedUser({...selectedUser, password: e.target.value})}
                      placeholder="กำหนดรหัสผ่าน"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>สิทธิ์การใช้งาน (Role)</label>
                  <select 
                    disabled={modalMode === 'view'}
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                  >
                    <option value="User">ผู้ใช้งานทั่วไป (User)</option>
                    <option value="Admin">แอดมิน (Admin)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>ปิด</button>
                {modalMode !== 'view' && (
                  <button type="submit" className="btn-save">บันทึกข้อมูล</button>
                )}
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default ManageUsers; 