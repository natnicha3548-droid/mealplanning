const mysql = require('mysql2');

// การตั้งค่าเชื่อมต่อฐานข้อมูล [cite: 187, 189, 194]
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // ยูสเซอร์เนมปกติของ XAMPP
    password: '',      // รหัสผ่านปกติจะว่างไว้
    database: 'meal_planning_db' // ชื่อฐานข้อมูลที่คุณสร้าง 
});

db.connect((err) => {
    if (err) {
        console.error('Failed to connect: ' + err.message);
        return;
    }
    console.log('Database connection successful!');
});

module.exports = db;