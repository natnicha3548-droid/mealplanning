import React from "react";

function MealAdmin() {
  return (
    <div style={styles.container}>
      
      <aside style={styles.sidebar}>
        <h2>Admin Panel</h2>

        <ul style={styles.menu}>
          <li>Dashboard</li>
          <li>จัดการผู้ใช้</li>
          <li>จัดการอาหาร</li>
          <li>จัดการโรค</li>
          <li>ออกจากระบบ</li>
        </ul>
      </aside>

      <main style={styles.content}>
        <h1>หน้าผู้ดูแลระบบ</h1>

        <div style={styles.cardContainer}>

          <div style={styles.card}>
            <h3>ผู้ใช้งาน</h3>
            <p>120 คน</p>
          </div>

          <div style={styles.card}>
            <h3>เมนูอาหาร</h3>
            <p>85 เมนู</p>
          </div>

          <div style={styles.card}>
            <h3>โรคทั้งหมด</h3>
            <p>12 โรค</p>
          </div>

        </div>
      </main>

    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "sans-serif"
  },

  sidebar: {
    width: "250px",
    background: "#2c3e50",
    color: "white",
    padding: "20px"
  },

  menu: {
    listStyle: "none",
    padding: 0,
    marginTop: "30px",
    lineHeight: "40px",
    cursor: "pointer"
  },

  content: {
    flex: 1,
    padding: "30px",
    background: "#f4f6f9"
  },

  cardContainer: {
    display: "flex",
    gap: "20px",
    marginTop: "30px"
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "200px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  }
};

export default MealAdmin;