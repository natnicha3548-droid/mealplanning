const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'meal_planning_db'
});

db.connect(err => {
    if (err) return console.error('DB ERROR:', err);
    console.log('Database connected');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'YOUR_EMAIL',
        pass: 'YOUR_APP_PASSWORD'
    }
});

app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
    }

    const hashed = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashed],
        (err) => {
            if (err) {
                return res.status(400).json({ message: "อีเมลซ้ำ" });
            }
            res.json({ message: "สมัครสมาชิกสำเร็จ" });
        }
    );
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) return res.status(500).json({ message: "error" });

            if (!results.length) {
                return res.status(404).json({ message: "ไม่พบผู้ใช้" });
            }

            const user = results[0];
            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.status(401).json({ message: "รหัสผ่านผิด" });
            }

            res.json({
                message: "เข้าสู่ระบบสำเร็จ",
                user: {
                    user_id: user.user_id,
                    email: user.email
                }
            });
        }
    );
});

app.post('/api/update-profile', async (req, res) => {
    const { user_id, email, password, newPassword } = req.body;

    const [users] = await db.promise().query(
        "SELECT * FROM users WHERE user_id = ?",
        [user_id]
    );

    if (!users.length) {
        return res.json({ message: "ไม่พบ user" });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return res.json({ message: "รหัสผ่านเดิมไม่ถูกต้อง" });
    }

    let updatedPassword = user.password;

    if (newPassword) {
        updatedPassword = await bcrypt.hash(newPassword, 10);
    }

    await db.promise().query(
        "UPDATE users SET email = ?, password = ? WHERE user_id = ?",
        [email, updatedPassword, user_id]
    );

    res.json({ message: "อัปเดตสำเร็จ" });
});

app.get('/api/user/:id', (req, res) => {
    db.query("SELECT * FROM users WHERE user_id = ?", [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0] || null);
    });
});

app.post('/api/update-user-info', (req, res) => {
    const { user_id, weight, height, age, gender, activity, disease } = req.body;

    const sql = `
        UPDATE users 
        SET weight = ?, height = ?, age = ?, gender = ?, 
            activity_level = ?, chronic_disease = ?
        WHERE user_id = ?
    `;

    db.query(sql, [weight, height, age, gender, activity, disease, user_id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "updated" });
    });
});

app.post('/api/save-calculation', (req, res) => {
    const {
        user_id, weight, height, age, gender, activity, disease,
        bmi, bmr, tdee, carb, protein, fat
    } = req.body;

    const sql = `
        INSERT INTO user_calculations 
        (user_id, weight, height, age, gender, activity, disease, bmi, bmr, tdee, carb, protein, fat)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        user_id, weight, height, age, gender, activity, disease,
        bmi, bmr, tdee, carb, protein, fat
    ], (err) => {
        if (err) return res.json({ message: "save error" });
        res.json({ message: "saved" });
    });
});

app.get('/api/get-calculation/:user_id', (req, res) => {
    db.query(
        `SELECT * FROM user_calculations 
         WHERE user_id = ? 
         ORDER BY created_at DESC LIMIT 1`,
        [req.params.user_id],
        (err, results) => {
            if (err) return res.json(null);
            res.json(results[0] || null);
        }
    );
});

app.get('/api/foods', (req, res) => {
    db.query("SELECT * FROM foods", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});