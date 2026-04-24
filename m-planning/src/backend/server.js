const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. เชื่อมต่อฐานข้อมูล ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'meal_planning_db'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err);
        return;
    }
    console.log('Database connection successful!');
});

// --- 2. API ดึงข้อมูลอาหาร ---
app.get('/api/foods', (req, res) => {
    const sql = `
        SELECT f.food_id, f.food_name, f.serving_size, f.image, 
               n.calories, n.protein, n.fat, n.carbohydrates
        FROM foods f
        LEFT JOIN food_nutrients n ON f.food_id = n.food_id
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- 3. API บันทึกแผนการกิน ---
app.post('/api/meal-plans', (req, res) => {
    const { user_id, plan_date, total_calories, plan_detail } = req.body;

    const sql = `
        INSERT INTO meal_plans (user_id, plan_date, total_calories, plan_detail)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [user_id, plan_date, total_calories, plan_detail], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "บันทึกแผนเรียบร้อย", id: result.insertId });
    });
});

// --- 4. API สมัครสมาชิก ---
app.post('/api/signup', (req, res) => {
    const { email, password, gender, age, height, weight } = req.body;

    const sql = `
        INSERT INTO users (email, password, gender, age, height, weight)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [email, password, gender, age, height, weight], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ message: "สมัครไม่สำเร็จ" });
        }
        res.json({ message: "สมัครสมาชิกสำเร็จ" });
    });
});

// --- 5. API เข้าสู่ระบบ ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.json({ message: "เกิดข้อผิดพลาด" });
        }

        if (results.length > 0) {
            res.json({
                message: "เข้าสู่ระบบสำเร็จ",
                user: results[0]
            });
        } else {
            res.json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }
    });
});

// --- 6. เปิด server ---
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});