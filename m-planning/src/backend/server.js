const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// ================= DATABASE =================
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

// ================= EMAIL =================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'natnicha3548@gmail.com',
        pass: 'rvmkwklrxmznauda'
    }
});

// ================= SIGNUP =================
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "กรอกข้อมูลไม่ครบ" });
    }

    const hashed = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashed],
        async (err) => {
            if (err) {
                return res.status(400).json({ message: "อีเมลซ้ำ" });
            }

            // 🔥 เพิ่มตรงนี้
            try {
                await transporter.sendMail({
                    to: email,
                    subject: 'สมัครสมาชิกสำเร็จ 🎉',
                    html: `
                        <h2>สมัครสมาชิกสำเร็จ</h2>
                        <p>ยินดีต้อนรับสู่ระบบ MealPlan</p>
                    `
                });

                console.log("SEND MAIL SUCCESS");
            } catch (e) {
                console.error("MAIL ERROR:", e);
            }

            res.json({ message: "สมัครสมาชิกสำเร็จ" });
        }
    );
});

// ================= LOGIN =================
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

// ================= FORGOT PASSWORD =================
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    const token = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 1000 * 60 * 15); // 15 นาที

    db.query(
        "UPDATE users SET reset_token = ?, token_expire = ? WHERE email = ?",
        [token, expire, email],
        async (err, result) => {
            if (err || result.affectedRows === 0) {
                return res.status(404).json({ message: "ไม่พบอีเมล" });
            }

            const link = `http://localhost:3000/reset-password/${token}`;

            try {
                await transporter.sendMail({
                    to: email,
                    subject: 'รีเซ็ตรหัสผ่าน',
                    html: `
                        <h3>รีเซ็ตรหัสผ่าน</h3>
                        <p>คลิกลิงก์ด้านล่าง:</p>
                        <a href="${link}">${link}</a>
                        <p>ลิงก์หมดอายุใน 15 นาที</p>
                    `
                });

                res.json({ message: "ส่งลิงก์รีเซ็ตแล้ว" });

            } catch (e) {
                console.error(e);
                res.status(500).json({ message: "ส่งเมลไม่สำเร็จ" });
            }
        }
    );
});

// ================= RESET PASSWORD (FIXED 100%) =================
app.post('/api/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        console.log("TOKEN FROM URL:", token);

        if (!token || !newPassword) {
            return res.status(400).json({ message: "ข้อมูลไม่ครบ" });
        }

        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE reset_token = ? AND token_expire > NOW()",
            [token]
        );

        console.log("USER FOUND:", users);

        if (!users.length) {
            return res.status(400).json({ message: "token ไม่ถูกหรือหมดอายุ" });
        }

        const user = users[0];
        const hashed = await bcrypt.hash(newPassword, 10);

        await db.promise().query(
            "UPDATE users SET password = ?, reset_token = NULL, token_expire = NULL WHERE user_id = ?",
            [hashed, user.user_id]
        );

        res.json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });

    } catch (error) {
        console.error("RESET ERROR:", error);
        res.status(500).json({ message: "server error" });
    }
});

// ================= USER INFO =================
app.get('/api/user/:id', (req, res) => {
    db.query(
        "SELECT * FROM users WHERE user_id = ?",
        [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results[0] || null);
        }
    );
});

// ================= UPDATE USER BODY =================
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

// ================= SAVE CALC =================
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

// ================= GET CALC =================
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

// ================= FOODS =================
app.get('/api/foods', (req, res) => {
    const sql = `
        SELECT 
            f.food_id,
            f.food_name,
            f.image,
            f.serving_size,
            n.calories
        FROM foods f
        LEFT JOIN food_nutrients n 
        ON f.food_id = n.food_id
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// ================= START SERVER =================
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});