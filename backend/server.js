// ================= IMPORT LIBRARY =================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const multer = require("multer");
const path = require("path");


// ================= CREATE APP =================
const app = express();

app.use(cors());
app.use(express.json());

// ================= DATABASE CONNECTION =================
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

// ================= New plan =================
const dbPromise = db.promise();

// ================= EMAIL =================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'natnicha3548@gmail.com',
        pass: 'rvmkwklrxmznauda'
    }
});

const fpgrowth = require('node-fpgrowth');

// ================= SIGNUP API =================
app.post('/api/signup', async (req, res) => {

    try {

        const { email, password } = req.body;

        // เช็กข้อมูลว่าง
        if (!email || !password) {

            return res.status(400).json({
                message: "กรอกข้อมูลไม่ครบ"
            });

        }

        // เข้ารหัส password
        const hashed = await bcrypt.hash(password, 10);

        // บันทึกผู้ใช้
        db.query(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashed],

            async (err) => {

                if (err) {

                    return res.status(400).json({
                        message: "อีเมลซ้ำ"
                    });

                }

                // ส่งเมลต้อนรับ
                try {

                    await transporter.sendMail({
                        to: email,
                        subject: 'สมัครสมาชิกสำเร็จ',
                        html: `<h3>ยินดีต้อนรับ</h3>`
                    });

                } catch {

                    console.log("MAIL FAIL");

                }

                res.json({
                    message: "สมัครสมาชิกสำเร็จ"
                });

            }
        );

    } catch {

        res.status(500).json({
            message: "server error"
        });

    }

});

// ================= MULTER UPLOAD =================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() +
            path.extname(file.originalname)
        );

    }

});

const upload = multer({
    storage
});

// เปิดให้เข้าถึงรูปภาพ
app.use(
    "/uploads",
    express.static("uploads")
);

// ================= LOGIN API =================
app.post('/api/login', (req, res) => {

    const { email, password } = req.body;

    // ค้นหาผู้ใช้จาก email
    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],

        async (err, results) => {

            if (err) {

                return res.status(500).json({
                    message: "error"
                });

            }

            // ไม่พบผู้ใช้
            if (!results.length) {

                return res.status(404).json({
                    message: "ไม่พบผู้ใช้"
                });

            }

            const user = results[0];

            // เช็กรหัสผ่าน
            const match = await bcrypt.compare(password, user.password);

            if (!match) {

                return res.status(401).json({
                    message: "รหัสผ่านผิด"
                });

            }

            // ส่งข้อมูลกลับ
            res.json({
                message: "เข้าสู่ระบบสำเร็จ",
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            });

        }
    );

});

// ================= FORGOT PASSWORD API =================
app.post('/api/forgot-password', (req, res) => {

    const { email } = req.body;

    // สุ่ม token
    const token = crypto.randomBytes(32).toString("hex");

    // กำหนดเวลาหมดอายุ
    const expire = new Date(Date.now() + 15 * 60 * 1000);

    // บันทึก token
    db.query(
        "UPDATE users SET reset_token=?, token_expire=? WHERE email=?",
        [token, expire, email],

        async (err, result) => {

            if (err || result.affectedRows === 0) {

                return res.status(404).json({
                    message: "ไม่พบอีเมล"
                });

            }

            const link = `http://localhost:3000/reset-password/${token}`;

            // ส่งอีเมลรีเซ็ต
            try {

                await transporter.sendMail({
                    to: email,
                    subject: 'รีเซ็ตรหัสผ่าน',
                    html: `<a href="${link}">${link}</a>`
                });

                res.json({
                    message: "ส่งลิงก์แล้ว"
                });

            } catch {

                res.status(500).json({
                    message: "ส่งเมลไม่สำเร็จ"
                });

            }

        }
    );

});

// ================= RESET PASSWORD API =================
app.post('/api/reset-password/:token', async (req, res) => {

    try {

        const { token } = req.params;

        const { newPassword } = req.body;

        // เช็ก password ใหม่
        if (!newPassword) {

            return res.status(400).json({
                message: "กรอกรหัสผ่านใหม่"
            });

        }

        // ค้นหา token
        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE reset_token=? AND token_expire > NOW()",
            [token]
        );

        // token หมดอายุ
        if (!users.length) {

            return res.status(400).json({
                message: "token ไม่ถูกหรือหมดอายุ"
            });

        }

        // เข้ารหัส password ใหม่
        const hashed = await bcrypt.hash(newPassword, 10);

        // อัปเดตรหัสผ่าน
        await db.promise().query(
            "UPDATE users SET password=?, reset_token=NULL, token_expire=NULL WHERE user_id=?",
            [hashed, users[0].user_id]
        );

        res.json({
            message: "รีเซ็ตรหัสผ่านสำเร็จ"
        });

    } catch {

        res.status(500).json({
            message: "server error"
        });

    }

});

// ================= GET USER INFO API =================
app.get('/api/user/:id', (req, res) => {

    db.query(
        "SELECT * FROM users WHERE user_id=?",
        [req.params.id],

        (err, results) => {

            if (err) return res.status(500).json(err);

            res.json(results[0] || null);

        }
    );

});

// ================= UPDATE USER INFO API =================
app.post('/api/update-user-info', (req, res) => {

    const {
        user_id,
        weight,
        height,
        age,
        gender,
        activity,
        chronic_disease
    } = req.body;

    // อัปเดตข้อมูลผู้ใช้
    db.query(
        `UPDATE users SET 
        weight=?,
        height=?,
        age=?,
        gender=?,
        activity_level=?,
        chronic_disease=?
        WHERE user_id=?`,

        [
            weight,
            height,
            age,
            gender,
            activity,
            chronic_disease,
            user_id
        ],

        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({
                message: "updated"
            });

        }
    );

});

// ================= GET FOODS API =================
app.get('/api/foods', (req, res) => {

    db.query(
        `
        SELECT 
            food_id,
            food_name,
            category_id,
            image,
            serving_size,
            calories,
            protein,
            fat,
            carbohydrates,
            sugar,
            sodium,
            description,
            recipe_details,
            notes
        FROM food
        `,

        (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json(err);

            }

            res.json(results);

        }
    );

});

// ================= GET CALCULATION API =================
app.get('/api/get-calculation/:user_id', (req, res) => {

    db.query(
        `SELECT * FROM user_calculations
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,

        [req.params.user_id],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json(null);

            }

            // ส่งข้อมูลล่าสุดกลับ
            res.json(results[0] || null);

        }
    );

});

// ================= SAVE CALCULATION API =================
app.post('/api/save-calculation', (req, res) => {

    const {
        user_id,
        weight,
        height,
        age,
        gender,
        activity,
        disease_snapshot,
        bmi,
        bmr,
        tdee,
        carb,
        protein,
        fat,
        sugar,
        sodium
    } = req.body;

    if (!user_id || !tdee) {
        return res.status(400).json({ message: "ข้อมูลไม่ครบ" });
    }

    const sql = `
        INSERT INTO user_calculations
        (
            user_id, weight, height, age, gender, activity, disease,
            bmi, bmr, tdee, carb, protein, fat, sugar, sodium
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id, weight, height, age, gender, activity, disease_snapshot,
            bmi, bmr, tdee, carb, protein, fat, sugar, sodium
        ],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "save error" });
            }
            res.json({ message: "saved" });
        }
    );

}); 

// ================= GET MEALS API =================
app.get('/api/meals', (req, res) => {

    const { date, userId } = req.query;

    // เช็ก query
    if (!date || !userId) {

        return res.status(400).json({
            message: "กรุณาส่ง date และ userId มาด้วย"
        });

    }

    // ดึงรายการอาหารของวันนั้น
    const sql = `
        SELECT 
            mp.plan_id,
            mp.plan_date,
            md.meal_detail_id,
            md.meal_type,
            md.quantity,
            md.total_calories,
            f.food_id,
            f.food_name,
            f.image,
            f.calories,
            f.protein,
            f.fat,
            f.carbohydrates,
            f.sugar,
            f.sodium,
            f.serving_size
        FROM meal_plan mp
        INNER JOIN meal_detail md ON mp.plan_id = md.plan_id
        INNER JOIN food f ON md.food_id = f.food_id
        WHERE mp.user_id = ? AND mp.plan_date = ?
        ORDER BY md.meal_type ASC
    `;

    db.query(sql, [userId, date], (err, results) => {

        if (err) {

            console.error("API Meals Error:", err);

            return res.status(500).json({
                error: err.message
            });

        }

        res.json(results);

    });

});

// ================= SAVE PLAN API =================
app.post('/api/save-plan', async (req, res) => {

    const {
        user_id,
        days,
        total_calories,
        details
    } = req.body;

    // เช็กข้อมูล
    if (!user_id || !days || !details || days.length === 0) {

        return res.status(400).json({
            message: "ข้อมูลไม่ครบถ้วน"
        });

    }

    const connection = db.promise();

    try {

        await connection.query("START TRANSACTION");

        for (const day of days) {

            // เช็กว่ามีแผนเก่าหรือยัง
            const [existingPlans] = await connection.query(
                "SELECT plan_id FROM meal_plan WHERE user_id = ? AND plan_date = ?",
                [user_id, day]
            );

            let planId;

            // มีแผนเก่า
            if (existingPlans.length > 0) {

                planId = existingPlans[0].plan_id;

                // อัปเดตแคลอรีรวม
                await connection.query(
                    "UPDATE meal_plan SET total_calories = ? WHERE plan_id = ?",
                    [total_calories, planId]
                );

                // ลบรายการอาหารเก่า
                await connection.query(
                    "DELETE FROM meal_detail WHERE plan_id = ?",
                    [planId]
                );

            } else {

                // สร้างแผนใหม่
                const [planResult] = await connection.query(
                    "INSERT INTO meal_plan (user_id, plan_date, total_calories) VALUES (?, ?, ?)",
                    [user_id, day, total_calories]
                );

                planId = planResult.insertId;

            }

            // เพิ่มรายการอาหาร
            for (const item of details) {

                await connection.query(
                    `INSERT INTO meal_detail 
                    (
                        plan_id,
                        meal_type,
                        food_id,
                        quantity,
                        total_calories
                    ) 
                    VALUES (?, ?, ?, ?, ?)`,

                    [
                        planId,
                        item.meal_type,
                        item.food_id,
                        item.quantity,
                        item.total_calories
                    ]
                );

            }

        }

        await connection.query("COMMIT");

        res.json({
            message: "บันทึกแผนอาหารสำเร็จ!"
        });

    } catch (error) {

        await connection.query("ROLLBACK");

        console.error("Save Plan Error:", error);

        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
            error: error.message
        });

    }

});

// ================= DELETE PLAN API =================
app.delete('/api/plan/:id', async (req, res) => {

    const planId = req.params.id;

    const connection = db.promise();

    try {

        await connection.query("START TRANSACTION");

        // ลบ meal_detail
        await connection.query(
            "DELETE FROM meal_detail WHERE plan_id = ?",
            [planId]
        );

        // ลบ meal_plan
        const [result] = await connection.query(
            "DELETE FROM meal_plan WHERE plan_id = ?",
            [planId]
        );

        await connection.query("COMMIT");

        if (result.affectedRows > 0) {

            res.json({
                success: true,
                message: "ลบแผนอาหารสำเร็จ"
            });

        } else {

            res.status(404).json({
                success: false,
                message: "ไม่พบแผนอาหาร"
            });

        }

    } catch (error) {

        await connection.query("ROLLBACK");

        console.error("Delete Plan Error:", error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในการลบข้อมูล",
            error: error.message
        });

    }

});

// ================= FAVORITE PLAN API =================
app.post('/api/favorite-plan', (req, res) => {

    const { user_id, plan_id } = req.body;

    // เช็กว่ากดหัวใจแล้วหรือยัง
    const checkSql = "SELECT * FROM favorite WHERE user_id = ? AND plan_id = ?";

    db.query(checkSql, [user_id, plan_id], (err, results) => {

        if (err) return res.status(500).json({
            error: err.message
        });

        // ถ้ามีแล้ว -> ลบ
        if (results.length > 0) {

            const deleteSql = "DELETE FROM favorite WHERE user_id = ? AND plan_id = ?";

            db.query(deleteSql, [user_id, plan_id], (err) => {

                if (err) return res.status(500).json({
                    error: err.message
                });

                res.json({
                    message: "ลบออกจากรายการโปรดแล้ว",
                    isFav: false
                });

            });

        } else {

            // ยังไม่มี -> เพิ่ม
            const insertSql = "INSERT INTO favorite (user_id, plan_id) VALUES (?, ?)";

            db.query(insertSql, [user_id, plan_id], (err) => {

                if (err) return res.status(500).json({
                    error: err.message
                });

                res.json({
                    message: "เพิ่มลงรายการโปรดแล้ว",
                    isFav: true
                });

            });

        }

    });

});

// ================= FAVORITE STATUS API =================
app.get('/api/favorite-status', (req, res) => {

    const {
        user_id,
        plan_id
    } = req.query;

    // เช็กข้อมูล
    if (!user_id || !plan_id) {

        return res.status(400).json({
            message: "ข้อมูลไม่ครบถ้วน"
        });

    }

    // เช็กสถานะหัวใจ
    const sql = "SELECT * FROM favorite WHERE user_id = ? AND plan_id = ?";

    db.query(sql, [user_id, plan_id], (err, results) => {

        if (err) return res.status(500).json({
            error: err.message
        });

        if (results.length > 0) {

            res.json({
                isFav: true
            });

        } else {

            res.json({
                isFav: false
            });

        }

    });

});

// ================= REVIEW API =================
app.post('/api/review', (req, res) => {
    const { user_id, food_id, rating, review_text } = req.body;

    // 1. เช็กก่อนว่าเคยรีวิวเมนูนี้หรือยัง
    const checkSql = "SELECT review_id FROM food_review WHERE user_id = ? AND food_id = ?";

    db.query(checkSql, [user_id, food_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            // 2. ถ้าเคยรีวิวแล้ว -> ให้อัปเดต (UPDATE) ข้อมูลเดิมแทนการเพิ่มใหม่
            const updateSql = `
                UPDATE food_review 
                SET rating = ?, review_text = ?, review_status = 'รออนุมัติ', created_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND food_id = ?
            `;
            db.query(updateSql, [rating, review_text, user_id, food_id], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: updateErr.message });
                res.json({ message: "อัปเดตรีวิวสำเร็จ รอแอดมินอนุมัติ" });
            });
        } else {
            // 3. ถ้ายังไม่เคยรีวิว -> ให้เพิ่มข้อมูลใหม่ (INSERT)
            const insertSql = `
                INSERT INTO food_review (user_id, food_id, rating, review_text, review_status)
                VALUES (?, ?, ?, ?, 'รออนุมัติ')
            `;
            db.query(insertSql, [user_id, food_id, rating, review_text], (insertErr) => {
                if (insertErr) return res.status(500).json({ error: insertErr.message });
                res.json({ message: "บันทึกรีวิวใหม่สำเร็จ รอแอดมินอนุมัติ" });
            });
        }
    });
});

// ================= REVIEW STATUS API =================
app.get('/api/review-status', (req, res) => {

    const {
        user_id,
        food_id
    } = req.query;

    // เช็กข้อมูล
    if (!user_id || !food_id) {

        return res.status(400).json({
            message: "ข้อมูลไม่ครบถ้วน"
        });

    }

    // ดึงรีวิวล่าสุดที่ผู้ใช้เคยเขียนไว้
    const sql = "SELECT * FROM food_review WHERE user_id = ? AND food_id = ? ORDER BY created_at DESC LIMIT 1";

    db.query(sql, [user_id, food_id], (err, results) => {

        if (err) return res.status(500).json({
            error: err.message
        });

        if (results.length > 0) {

            res.json({
                isReviewed: true,
                rating: results[0].rating,
                review_text: results[0].review_text
            });

        } else {

            res.json({
                isReviewed: false,
                rating: 0,
                review_text: ""
            });

        }

    });

});

app.get('/api/reviews/:food_id', (req, res) => {

    const { food_id } = req.params;

    const sql = `
        SELECT 
            fr.review_id,
            u.email,
            fr.rating,
            fr.review_text,
            fr.created_at
        FROM food_review fr
        JOIN users u ON fr.user_id = u.user_id
        WHERE fr.food_id = ?
        AND fr.review_status NOT IN ('รออนุมัติ', 'ปฏิเสธ')
        ORDER BY fr.created_at DESC
    `;

    db.query(sql, [food_id], (err, results) => {

        if (err) {
            console.error("Get Reviews Error:", err);
            return res.status(500).json({ error: err.message });
        }

        res.json(results);

    });

});

// ================= GET FAVORITE FOODS API =================
app.get('/api/favorite-foods', (req, res) => {

    const { user_id } = req.query;

    // เช็ก user
    if (!user_id) {

        return res.status(400).json({
            message: "ข้อมูลไม่ครบถ้วน"
        });

    }

    // ดึง food_id ที่ถูกใจ
    const sql = `
        SELECT food_id
        FROM favorite
        WHERE user_id = ?
        AND food_id IS NOT NULL
    `;

    db.query(sql, [user_id], (err, results) => {

        if (err) return res.status(500).json({
            error: err.message
        });

        res.json(results);

    });

});

// ================= FAVORITE FOOD API =================
app.post('/api/favorite-food', (req, res) => {

    const {
        user_id,
        food_id
    } = req.body;

    // เช็กว่ากดถูกใจแล้วหรือยัง
    const checkSql = "SELECT * FROM favorite WHERE user_id = ? AND food_id = ?";

    db.query(checkSql, [user_id, food_id], (err, results) => {

        if (err) return res.status(500).json({
            error: err.message
        });

        // มีอยู่แล้ว -> ลบ
        if (results.length > 0) {

            const deleteSql = "DELETE FROM favorite WHERE user_id = ? AND food_id = ?";

            db.query(deleteSql, [user_id, food_id], (err) => {

                if (err) return res.status(500).json({
                    error: err.message
                });

                res.json({
                    message: "ลบออกจากรายการโปรดแล้ว",
                    isFav: false
                });

            });

        } else {

            // ยังไม่มี -> เพิ่ม
            const insertSql = "INSERT INTO favorite (user_id, food_id) VALUES (?, ?)";

            db.query(insertSql, [user_id, food_id], (err) => {

                if (err) return res.status(500).json({
                    error: err.message
                });

                res.json({
                    message: "เพิ่มลงรายการโปรดแล้ว",
                    isFav: true
                });

            });

        }

    });

});

// ================= REPORT API =================
app.get('/api/report/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    const connection = db.promise();

    try {
        // แก้ไข SQL: ดึง TDEE ล่าสุดจาก user_calculations และผูก JOIN กับตาราง users เพื่อเอาโรคประจำตัว (chronic_disease)
        const [userCalc] = await connection.query(`
            SELECT 
                uc.*,
                u.chronic_disease AS disease
            FROM user_calculations uc
            INNER JOIN users u ON uc.user_id = u.user_id
            WHERE uc.user_id = ?
            ORDER BY uc.created_at DESC
            LIMIT 1
        `, [userId]);

        // ดึงข้อมูลโภชนาการย้อนหลัง 7 วัน (คงเดิม)
        const [mealsData] = await connection.query(`
            SELECT 
                mp.plan_date,
                IFNULL(mp.total_calories, 0) AS calories,
                SUM(IFNULL(f.carbohydrates, 0) * IFNULL(md.quantity, 1)) AS carbs,
                SUM(IFNULL(f.protein, 0) * IFNULL(md.quantity, 1)) AS protein,
                SUM(IFNULL(f.fat, 0) * IFNULL(md.quantity, 1)) AS fat,
                SUM(IFNULL(f.sugar, 0) * IFNULL(md.quantity, 1)) AS sugar,
                SUM(IFNULL(f.sodium, 0) * IFNULL(md.quantity, 1)) AS sodium
            FROM meal_plan mp
            LEFT JOIN meal_detail md ON mp.plan_id = md.plan_id
            LEFT JOIN food f ON md.food_id = f.food_id
            WHERE mp.user_id = ?
            GROUP BY mp.plan_id, mp.plan_date
            HAVING COUNT(md.meal_detail_id) > 0
            ORDER BY mp.plan_date DESC
            LIMIT 7
        `, [userId]);

        // เรียงข้อมูลจากเก่าไปใหม่
        mealsData.reverse();

        // ชื่อเดือนภาษาไทย
        const monthNames = [
            "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
            "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
        ];

        // แปลงข้อมูลสำหรับกราฟ
        const formattedWeekly = mealsData.map(row => {
            const d = new Date(row.plan_date);
            return {
                dateLabel: `${d.getDate()} ${monthNames[d.getMonth()]}`,
                calories: Math.round(row.calories),
                carbs: Math.round(row.carbs),
                protein: Math.round(row.protein),
                fat: Math.round(row.fat),
                sugar: Math.round(row.sugar),
                sodium: Math.round(row.sodium)
            };
        });

        // คืนค่าข้อมูลกลับไปยัง React หน้าบ้าน
        res.json({
            userConfig: userCalc[0] || {
                tdee: 0,
                sugar: 0,
                sodium: 0,
                disease: "none"
            },
            weeklyData: formattedWeekly
        });

    } catch (error) {
        console.error("Complete NCD Report Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ================= RESTORE PLAN (ฟังก์ชันใหม่ที่เพิ่มให้) =================
app.post('/api/restore-plan', async (req, res) => {
    const { userId, sourceDate, targetDate } = req.body;

    try {
        // 1. ดึงข้อมูลแผนต้นฉบับ
        const [oldPlans] = await dbPromise.query(
            'SELECT * FROM meal_plan WHERE user_id = ? AND DATE(plan_date) = ?',
            [userId, sourceDate]
        );

        if (oldPlans.length === 0) {
            return res.status(404).json({ message: "ไม่พบแผนของวันที่เลือก" });
        }

        const oldPlan = oldPlans[0];

        // 2. ใช้คำสั่ง SQL เริ่ม Transaction โดยตรง
        await dbPromise.query('START TRANSACTION');

        try {
            // 1. ตรวจสอบว่าวันนี้มีแผนอยู่แล้วหรือยัง?
            const [existing] = await dbPromise.query(
                'SELECT plan_id FROM meal_plan WHERE user_id = ? AND plan_date = ?',
                [userId, targetDate]
            );

            let targetPlanId;

            if (existing.length > 0) {
                // ถ้าวันนี้มีแผนอยู่แล้ว ให้ใช้ ID เดิม แล้วแค่เคลียร์เมนูเก่าทิ้ง
                targetPlanId = existing[0].plan_id;
                await dbPromise.query('DELETE FROM meal_detail WHERE plan_id = ?', [targetPlanId]);
            } else {
                // ถ้าวันนี้ยังไม่มีแผน ให้สร้างแผนใหม่ขึ้นมา
                const [newPlan] = await dbPromise.query(
                    'INSERT INTO meal_plan (user_id, plan_date, total_calories) VALUES (?, ?, ?)',
                    [userId, targetDate, oldPlan.total_calories]
                );
                targetPlanId = newPlan.insertId;
            }

            // 2. คัดลอกรายละเอียดอาหารจากแผนเก่า (sourceDate) มาใส่ในแผนของวันนี้
            await dbPromise.query(
                `INSERT INTO meal_detail (plan_id, meal_type, food_id, total_calories)
                 SELECT ?, meal_type, food_id, total_calories
                 FROM meal_detail WHERE plan_id = ?`,
                [targetPlanId, oldPlan.plan_id]
            );

            // 3. อัปเดตยอดแคลอรี่รวมของแผนวันนี้ให้ตรง
            await dbPromise.query(
                'UPDATE meal_plan SET total_calories = ? WHERE plan_id = ?',
                [oldPlan.total_calories, targetPlanId]
            );

            await dbPromise.query('COMMIT');
            res.json({ message: "นำแผนกลับมาใช้ใหม่สำเร็จ!" });

        } catch (err) {
            await dbPromise.query('ROLLBACK');
            throw err;
        }
    } catch (error) {
        console.error("Restore Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์", error: error.message });
    }
});

// ================= RESTORE FROM FAVORITE =================
app.post('/api/restore-from-favorite', async (req, res) => {
    const { userId, planId, targetDate } = req.body;

    try {
        await dbPromise.query('START TRANSACTION');

        // 1. ดึงรายละเอียด รวมถึง quantity
        const [details] = await dbPromise.query(
            'SELECT meal_type, food_id, quantity, total_calories FROM meal_detail WHERE plan_id = ?',
            [planId]
        );

        // 2. เช็คแผนของวันนี้
        const [existingPlans] = await dbPromise.query(
            'SELECT plan_id FROM meal_plan WHERE user_id = ? AND plan_date = ?',
            [userId, targetDate]
        );

        let targetPlanId;
        if (existingPlans.length > 0) {
            targetPlanId = existingPlans[0].plan_id;
            await dbPromise.query('DELETE FROM meal_detail WHERE plan_id = ?', [targetPlanId]);
        } else {
            const [newPlan] = await dbPromise.query(
                'INSERT INTO meal_plan (user_id, plan_date, total_calories) VALUES (?, ?, ?)',
                [userId, targetDate, 0]
            );
            targetPlanId = newPlan.insertId;
        }

        // 3. วนลูป Insert พร้อม quantity
        let totalCal = 0;
        for (const item of details) {
            await dbPromise.query(
                'INSERT INTO meal_detail (plan_id, meal_type, food_id, quantity, total_calories) VALUES (?, ?, ?, ?, ?)',
                [targetPlanId, item.meal_type, item.food_id, item.quantity, item.total_calories]
            );
            totalCal += item.total_calories;
        }

        await dbPromise.query('UPDATE meal_plan SET total_calories = ? WHERE plan_id = ?', [totalCal, targetPlanId]);

        await dbPromise.query('COMMIT');
        res.json({ message: "นำแผนโปรดมาใช้ใหม่สำเร็จ!", newPlanId: targetPlanId });
    } catch (error) {
        await dbPromise.query('ROLLBACK');
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
});

// ================= RESTORE LATEST PLAN =================
app.post('/api/restore-latest-plan', async (req, res) => {
    const { userId, planId, targetDate } = req.body;

    try {
        await dbPromise.query('START TRANSACTION');

        // 1. ดึงรายละเอียด รวมถึง quantity
        const [details] = await dbPromise.query(
            'SELECT meal_type, food_id, quantity, total_calories FROM meal_detail WHERE plan_id = ?',
            [planId]
        );

        // 2. เช็คแผนของวันนี้
        const [existingPlans] = await dbPromise.query(
            'SELECT plan_id FROM meal_plan WHERE user_id = ? AND plan_date = ?',
            [userId, targetDate]
        );

        let targetPlanId;
        if (existingPlans.length > 0) {
            targetPlanId = existingPlans[0].plan_id;
            await dbPromise.query('DELETE FROM meal_detail WHERE plan_id = ?', [targetPlanId]);
        } else {
            const [newPlan] = await dbPromise.query(
                'INSERT INTO meal_plan (user_id, plan_date, total_calories) VALUES (?, ?, ?)',
                [userId, targetDate, 0]
            );
            targetPlanId = newPlan.insertId;
        }

        // 3. วนลูป Insert พร้อม quantity
        let totalCal = 0;
        for (const item of details) {
            await dbPromise.query(
                'INSERT INTO meal_detail (plan_id, meal_type, food_id, quantity, total_calories) VALUES (?, ?, ?, ?, ?)',
                [targetPlanId, item.meal_type, item.food_id, item.quantity, item.total_calories]
            );
            totalCal += item.total_calories;
        }

        await dbPromise.query('UPDATE meal_plan SET total_calories = ? WHERE plan_id = ?', [totalCal, targetPlanId]);

        await dbPromise.query('COMMIT');
        res.json({ message: "กู้คืนแผนล่าสุดสำเร็จ!" });
    } catch (error) {
        await dbPromise.query('ROLLBACK');
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: error.message });
    }
});
// เพิ่ม API นี้ใน server.js
app.get('/api/meal-status', async (req, res) => {
    const { userId, planId } = req.query;
    try {
        // ดึงสถานะหัวใจของแผนนี้
        const [fav] = await db.promise().query(
            "SELECT * FROM favorite WHERE user_id = ? AND plan_id = ?",
            [userId, planId]
        );

        // ดึงรีวิวของอาหารทั้งหมดในแผนนี้ (ถ้ามี)
        const [reviews] = await db.promise().query(
            "SELECT food_id, rating, review_text FROM food_review WHERE user_id = ?",
            [userId]
        );

        res.json({ isFav: fav.length > 0, reviews });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================= ADD TO MEAL PLAN API =================

app.post(
    "/api/add-to-meal-plan",
    async (req, res) => {

        const {
            user_id,
            food_id,
            meal_type,
            quantity,
            plan_date
        } = req.body;

        // ================= VALIDATE =================

        if (
            !user_id ||
            !food_id ||
            !meal_type ||
            !quantity
        ) {

            return res.status(400).json({
                message: "ข้อมูลไม่ครบ"
            });

        }

        try {

            // ใช้วันที่ส่งมา
            const today =
                plan_date ||
                new Date()
                    .toISOString()
                    .split("T")[0];

            // ================= FIND FOOD =================

            const [foods] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM food
                    WHERE food_id = ?
                    `,
                    [food_id]
                );

            if (foods.length === 0) {

                return res.status(404).json({
                    message: "ไม่พบอาหาร"
                });

            }

            const food = foods[0];

            // ================= FIND TODAY PLAN =================

            const [plans] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM meal_plan
                    WHERE user_id = ?
                    AND plan_date = ?
                    `,
                    [user_id, today]
                );

            let planId;

            // ================= CREATE PLAN =================

            if (plans.length === 0) {

                const [newPlan] =
                    await db.promise().query(
                        `
                        INSERT INTO meal_plan
                        (
                            user_id,
                            plan_date,
                            total_calories
                        )
                        VALUES (?, ?, ?)
                        `,
                        [
                            user_id,
                            today,
                            0
                        ]
                    );

                planId =
                    newPlan.insertId;

            } else {

                planId =
                    plans[0].plan_id;

            }

            // ================= CALCULATE =================

            const totalCalories =
                Number(food.calories) *
                Number(quantity);

            // ================= INSERT DETAIL =================

            await db.promise().query(
                `
                INSERT INTO meal_detail
                (
                    plan_id,
                    meal_type,
                    food_id,
                    quantity,
                    total_calories
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    planId,
                    meal_type,
                    food_id,
                    quantity,
                    totalCalories
                ]
            );

            // ================= UPDATE TOTAL =================

            await db.promise().query(
                `
                UPDATE meal_plan

                SET total_calories =
                (
                    SELECT
                        IFNULL(
                            SUM(total_calories),
                            0
                        )
                    FROM meal_detail
                    WHERE plan_id = ?
                )

                WHERE plan_id = ?
                `,
                [
                    planId,
                    planId
                ]
            );

            // ================= SUCCESS =================

            res.json({
                success: true,
                message:
                    "เพิ่มอาหารสำเร็จ"
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "server error"
            });

        }

    }
);

// ================= GET FAVORITES =================

app.get("/api/favorites/:userId", (req, res) => {

    const userId = req.params.userId;

    const foodQuery = `

    SELECT 
            f.favorite_id,
            food.food_id,
            food.food_name,
            food.image,
            food.calories,
            food.protein,
            food.fat,
            food.carbohydrates,
            food.sugar,
            food.sodium,
            food.serving_size,
            food.description,
            food.recipe_details,
            food.notes,
            fc.category_name AS category

        FROM favorite f

        JOIN food
        ON f.food_id = food.food_id

        LEFT JOIN food_category fc
        ON food.category_id = fc.category_id

        WHERE f.user_id = ?
        AND f.food_id IS NOT NULL

        ORDER BY f.favorite_id DESC

    `;

    const planQuery = `

        SELECT
            f.favorite_id,
            mp.plan_id,
            mp.plan_date,
            mp.total_calories,

            /* ข้อมูลมื้อเช้า */
            breakfast.food_name AS breakfast_name,
            breakfast.image AS breakfast_image,
            md_breakfast.total_calories AS breakfast_cal,
            breakfast.serving_size AS breakfast_serving,

            /* ข้อมูลมื้อกลางวัน */
            lunch.food_name AS lunch_name,
            lunch.image AS lunch_image,
            md_lunch.total_calories AS lunch_cal,
            lunch.serving_size AS lunch_serving,

            /* ข้อมูลมื้อเย็น */
            dinner.food_name AS dinner_name,
            dinner.image AS dinner_image,
            md_dinner.total_calories AS dinner_cal,
            dinner.serving_size AS dinner_serving,

            /* คำนวณโปรตีนรวม */
            (
                IFNULL(breakfast.protein * md_breakfast.quantity, 0) +
                IFNULL(lunch.protein * md_lunch.quantity, 0) +
                IFNULL(dinner.protein * md_dinner.quantity, 0)
            ) AS protein,

            /* คำนวณคาร์บรวม */
            (
                IFNULL(breakfast.carbohydrates * md_breakfast.quantity, 0) +
                IFNULL(lunch.carbohydrates * md_lunch.quantity, 0) +
                IFNULL(dinner.carbohydrates * md_dinner.quantity, 0)
            ) AS carbs,

            /* คำนวณไขมันรวม */
            (
                IFNULL(breakfast.fat * md_breakfast.quantity, 0) +
                IFNULL(lunch.fat * md_lunch.quantity, 0) +
                IFNULL(dinner.fat * md_dinner.quantity, 0)
            ) AS fat,

            /* 🌟 คำนวณน้ำตาลรวม (ที่เพิ่มใหม่) */
            (
                IFNULL(breakfast.sugar * md_breakfast.quantity, 0) +
                IFNULL(lunch.sugar * md_lunch.quantity, 0) +
                IFNULL(dinner.sugar * md_dinner.quantity, 0)
            ) AS sugar,

            /* 🌟 คำนวณโซเดียมรวม (ที่เพิ่มใหม่) */
            (
                IFNULL(breakfast.sodium * md_breakfast.quantity, 0) +
                IFNULL(lunch.sodium * md_lunch.quantity, 0) +
                IFNULL(dinner.sodium * md_dinner.quantity, 0)
            ) AS sodium

        FROM favorite f

        JOIN meal_plan mp
        ON f.plan_id = mp.plan_id

        LEFT JOIN meal_detail md_breakfast
        ON mp.plan_id = md_breakfast.plan_id
        AND md_breakfast.meal_type = 'เช้า'

        LEFT JOIN food breakfast
        ON md_breakfast.food_id = breakfast.food_id

        LEFT JOIN meal_detail md_lunch
        ON mp.plan_id = md_lunch.plan_id
        AND md_lunch.meal_type = 'กลางวัน'

        LEFT JOIN food lunch
        ON md_lunch.food_id = lunch.food_id

        LEFT JOIN meal_detail md_dinner
        ON mp.plan_id = md_dinner.plan_id
        AND md_dinner.meal_type = 'เย็น'

        LEFT JOIN food dinner
        ON md_dinner.food_id = dinner.food_id

        WHERE f.user_id = ?
        AND f.plan_id IS NOT NULL

        ORDER BY f.favorite_id DESC

    `;

    db.query(foodQuery, [userId], (err, foods) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "food query error"
            });

        }

        db.query(planQuery, [userId], (err2, plans) => {

            if (err2) {

                console.log(err2);

                return res.status(500).json({
                    error: "plan query error"
                });

            }

            res.json({
                foods,
                plans
            });

        });

    });

});

// ================= DELETE FAVORITE FOOD =================

app.delete("/api/favorites/food/:favoriteId", (req, res) => {

    const favoriteId = req.params.favoriteId;

    const query = `
    
        DELETE FROM favorite
        WHERE favorite_id = ?
    
    `;

    db.query(query, [favoriteId], (err) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "delete favorite food failed"
            });

        }

        res.json({
            message: "favorite food deleted"
        });

    });

});

// ================= DELETE FAVORITE PLAN =================

app.delete("/api/favorites/plan/:favoriteId", (req, res) => {

    const favoriteId = req.params.favoriteId;

    const query = `
    
        DELETE FROM favorite
        WHERE favorite_id = ?
    
    `;

    db.query(query, [favoriteId], (err) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "delete favorite plan failed"
            });

        }

        res.json({
            message: "favorite plan deleted"
        });

    });

});


// ================= LATEST MEAL PLAN =================

app.get("/api/latest-meal-plan/:userId", (req, res) => {

    const { userId } = req.params;

    // ดึงแผนล่าสุดจริง
    const sql = `
        SELECT *
        FROM meal_plan
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.json(null);
        }

        const latestPlan = result[0];

        // ดึงรายการอาหารในแผน (เปลี่ยนชื่อตัวแปรให้ตรงกับที่ React คาดหวัง)
        const detailSql = `
            SELECT
                md.meal_type,
                md.total_calories AS calories,
                f.food_name AS name,
                f.image,
                f.serving_size
            FROM meal_detail md
            JOIN food f
            ON md.food_id = f.food_id
            WHERE md.plan_id = ?
        `;

        db.query(detailSql, [latestPlan.plan_id], (err2, details) => {

            if (err2) {
                console.log(err2);
                return res.status(500).json(err2);
            }

            // เปลี่ยนจาก Object {} เป็น Array [] เพื่อเก็บหลายเมนู
            let breakfast = [];
            let lunch = [];
            let dinner = [];

            details.forEach((item) => {
                if (item.meal_type === "เช้า") {
                    breakfast.push(item);
                } else if (item.meal_type === "กลางวัน") {
                    lunch.push(item);
                } else if (item.meal_type === "เย็น") {
                    dinner.push(item);
                }
            });

            // ส่งข้อมูลกลับไปเป็น Array
            res.json({
                plan_id: latestPlan.plan_id,
                total_calories: latestPlan.total_calories,
                breakfast: breakfast,
                lunch: lunch,
                dinner: dinner
            });

        });

    });

});

// ================= FAVORITE FOODS =================

app.get("/api/favorite-foods/:userId", (req, res) => {

    const { userId } = req.params;

    const sql = `
        SELECT
            ff.favorite_id,
            f.food_id,
            f.food_name,
            f.image,
            f.calories
        FROM favorite ff
        JOIN food f
        ON ff.food_id = f.food_id
        WHERE ff.user_id = ?
        ORDER BY ff.favorite_id DESC
    `;

    db.query(sql, [userId], (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result);

    });

});

// ================= FAVORITE PLANS =================
app.get("/api/favorite-plans/:userId", (req, res) => {
    const { userId } = req.params;

    // 1. ค้นหาแผนอาหารที่ user คนนี้กดใจไว้ (ดึงเฉพาะที่ plan_id ไม่เป็น null)
    const planSql = `
        SELECT 
            mp.plan_id, 
            mp.total_calories, 
            mp.plan_date, 
            f.favorite_id
        FROM favorite f
        JOIN meal_plan mp ON f.plan_id = mp.plan_id
        WHERE f.user_id = ? AND f.plan_id IS NOT NULL
        ORDER BY f.favorite_id DESC
    `;

    db.query(planSql, [userId], (err, plans) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        // ถ้าไม่มีแผนโปรดเลย ให้ส่ง Array ว่างกลับไป (เพื่อไม่ให้ React พัง)
        if (plans.length === 0) {
            return res.json([]);
        }

        // 2. นำ plan_id ทั้งหมดไปค้นหาเมนูอาหารย่อยๆ ในแผนนั้น
        const planIds = plans.map(p => p.plan_id);
        const detailSql = `
            SELECT 
                md.plan_id, 
                md.meal_type, 
                md.total_calories AS calories, 
                f.food_name AS name, 
                f.image, 
                f.serving_size
            FROM meal_detail md
            JOIN food f ON md.food_id = f.food_id
            WHERE md.plan_id IN (?)
        `;

        db.query(detailSql, [planIds], (err, details) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }

            // 3. จัดกลุ่มอาหารแยกตามมื้อ (เช้า, กลางวัน, เย็น) เพื่อให้ React นำไปแสดงผลได้ทันที
            const formattedPlans = plans.map(plan => {
                const planDetails = details.filter(d => d.plan_id === plan.plan_id);

                return {
                    ...plan,
                    breakfast: planDetails.filter(d => d.meal_type === 'เช้า'),
                    lunch: planDetails.filter(d => d.meal_type === 'กลางวัน'),
                    dinner: planDetails.filter(d => d.meal_type === 'เย็น')
                };
            });

            res.json(formattedPlans); // ส่งข้อมูลกลับให้ Frontend
        });
    });
});


// ================= ฝั่งการทำงาน admin =================
// ================= ADMIN DASHBOARD STATS API =================
app.get('/api/admin/dashboard-stats', async (req, res) => {
    const connection = db.promise();
    const filter = req.query.filter || '7days'; // รับค่า filter จาก Frontend (ค่าเริ่มต้นคือ 7 วัน)

    try {
        // 1. นับจำนวนภาพรวม
        const [users] = await connection.query("SELECT COUNT(*) AS total FROM users WHERE role = 'User'");

        // ================= ส่วนที่เพิ่มใหม่: คำนวณผู้ใช้ใหม่ & ผู้ไม่ได้ใช้งาน =================
        let newUsersTotal = 0;
        let inactiveUsersTotal = 0;
        try {
            // สมมติ: ผู้ใช้งานใหม่ = สมัครใน 30 วันล่าสุด (ใช้ created_at)
            const [newUsers] = await connection.query("SELECT COUNT(*) AS total FROM users WHERE role = 'User' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)");
            newUsersTotal = newUsers[0].total;

            // สมมติ: ผู้ที่ไม่ได้ใช้งาน = สมาชิกที่ "ไม่มีการสร้างแผนอาหาร" ใน 30 วันล่าสุด
            const [inactiveUsers] = await connection.query("SELECT COUNT(*) AS total FROM users WHERE role = 'User' AND user_id NOT IN (SELECT DISTINCT user_id FROM meal_plan WHERE plan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY))");
            inactiveUsersTotal = inactiveUsers[0].total;
        } catch (e) {
            // กรณีที่ตาราง users ไม่มีคอลัมน์ created_at ให้ส่งค่าจำลองไปก่อน (ระบบจะได้ไม่พัง)
            console.log("Database fallback for new/inactive users");
            newUsersTotal = Math.floor(users[0].total * 0.2); // จำลอง 20%
            inactiveUsersTotal = Math.floor(users[0].total * 0.15); // จำลอง 15%
        }

        const [foods] = await connection.query("SELECT COUNT(*) AS total FROM food");
        const [reviews] = await connection.query("SELECT COUNT(*) AS total FROM food_review WHERE review_status = 'รออนุมัติ'");

        // 2. ข้อมูลกราฟ: ดึงข้อมูลตาม Filter ที่เลือก (อัปเดตรวมแบบใหม่ไว้ตรงนี้เลยครับ)
        let chartQuery = "";
        if (filter === '7days') {
            chartQuery = `SELECT DATE_FORMAT(plan_date, '%d %b') as name, COUNT(*) as plans FROM meal_plan GROUP BY plan_date ORDER BY plan_date DESC LIMIT 7`;
        } else if (filter === 'month') {
            chartQuery = `SELECT DATE_FORMAT(plan_date, '%d %b') as name, COUNT(*) as plans FROM meal_plan WHERE plan_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY plan_date ORDER BY plan_date DESC`;
        } else if (filter === 'year') {
            chartQuery = `SELECT DATE_FORMAT(plan_date, '%b %Y') as name, COUNT(*) as plans FROM meal_plan WHERE plan_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) GROUP BY YEAR(plan_date), MONTH(plan_date) ORDER BY YEAR(plan_date) DESC, MONTH(plan_date) DESC`;
        } else if (filter === 'all') {
            // แบบดูภาพรวมทั้งหมดทุกปี
            chartQuery = `SELECT DATE_FORMAT(plan_date, '%b %Y') as name, COUNT(*) as plans FROM meal_plan GROUP BY YEAR(plan_date), MONTH(plan_date) ORDER BY YEAR(plan_date) DESC, MONTH(plan_date) DESC`;
        } else if (filter.match(/^\d{4}-\d{2}$/)) {
            // แบบดูเฉพาะเดือนที่ระบุ (เช่น "2026-05")
            chartQuery = `SELECT DATE_FORMAT(plan_date, '%d %b') as name, COUNT(*) as plans FROM meal_plan WHERE DATE_FORMAT(plan_date, '%Y-%m') = '${filter}' GROUP BY plan_date ORDER BY plan_date DESC`;
        }
        const [chartData] = await connection.query(chartQuery);

        // 3. 5 อันดับเมนูยอดฮิต
        const [topFoods] = await connection.query(`
            SELECT f.food_name, COUNT(md.food_id) as count 
            FROM meal_detail md JOIN food f ON md.food_id = f.food_id 
            GROUP BY md.food_id ORDER BY count DESC LIMIT 5
        `);

        // === เพิ่มลอจิกจำลองทิศทางลูกศร (Trend) ===
        const topFoodsWithTrend = topFoods.map((item, index) => {
            let trend = 'neutral';
            if (index < 2) trend = 'up'; // อันดับ 1 และ 2 ให้ลูกศรชี้ขึ้น (กำลังฮิต)
            else if (index > 2) trend = 'down'; // อันดับ 4 และ 5 ให้ลูกศรชี้ลง (ความนิยมลดลง)

            return { ...item, trend };
        });

        // 4. รายการรีวิวด่วน
        const [recentReviews] = await connection.query(`
            SELECT fr.review_id, u.email, f.food_name, fr.rating, fr.review_text 
            FROM food_review fr JOIN users u ON fr.user_id = u.user_id JOIN food f ON fr.food_id = f.food_id
            WHERE fr.review_status = 'รออนุมัติ' ORDER BY fr.created_at DESC LIMIT 3
        `);

        // ================= FP-GROWTH แยกตามมื้อ =================

        const [fpRows] = await connection.query(`
    SELECT
        md.plan_id,
        md.meal_type,
        f.food_name
    FROM meal_detail md
    JOIN food f
        ON md.food_id = f.food_id
    ORDER BY md.plan_id, md.meal_type
`);

        const grouped = {};

        fpRows.forEach(row => {

            const key = `${row.plan_id}_${row.meal_type}`;

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(row.food_name);

        });

        const mealTypes = ['เช้า', 'กลางวัน', 'เย็น'];
        const fpGrowthInsights = {};

        for (const meal of mealTypes) {
            const mealTransactions = Object.entries(grouped)
                .filter(([key]) => key.endsWith(`_${meal}`))
                .map(([, foods]) => foods);

            if (mealTransactions.length < 2) {
                fpGrowthInsights[meal] = [];
                continue;
            }

            const fp = new fpgrowth.FPGrowth(0.1);
            const itemsets = await fp.exec(mealTransactions);

            fpGrowthInsights[meal] = itemsets
                .filter(item => item.items.length === 2 && item.items[0] !== item.items[1])
                .sort((a, b) => b.support - a.support)
                .slice(0, 5)
                .map((item, index) => {
                    // คำนวณเปอร์เซ็นต์
                    const supportPct = Math.round((item.support / mealTransactions.length) * 100);

                    // ✨ ลอจิกจำลองลูกศร (Trend)
                    let currentTrend = 'neutral';
                    if (supportPct >= 30) {
                        currentTrend = 'up'; // มากกว่าหรือเท่ากับ 30% ให้ลูกศรชี้ขึ้น
                    } else if (supportPct <= 15) {
                        currentTrend = 'down'; // น้อยกว่าหรือเท่ากับ 15% ให้ลูกศรชี้ลง
                    }

                    return {
                        pair: item.items.join(' + '),
                        support: item.support,
                        supportPct: supportPct,
                        trend: currentTrend // ✨ ส่งค่า trend กลับไปให้ UI
                    };
                });
        }

        // 5. ส่งข้อมูลกลับไปให้ Frontend
        res.json({
            totalUsers: users[0].total,
            newUsers: newUsersTotal,
            inactiveUsers: inactiveUsersTotal,
            totalFoods: foods[0].total,
            pendingReviews: reviews[0].total,
            chartData: chartData.reverse(), // กลับด้านให้วันที่เก่าอยู่ซ้าย ใหม่ยู่ขวา
            topFoods: topFoodsWithTrend,
            recentReviews: recentReviews,
            fpGrowthInsights: fpGrowthInsights
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ================= ADMIN: MANAGE REVIEWS API =================

// 1. API สำหรับดึงข้อมูลรีวิวทั้งหมด (พร้อมชื่ออาหารและอีเมลผู้ใช้)
app.get('/api/admin/all-reviews', async (req, res) => {
    const connection = db.promise();
    try {
        const [reviews] = await connection.query(`
            SELECT fr.review_id, u.email, f.food_name, fr.rating, fr.review_text, fr.review_status, fr.created_at 
            FROM food_review fr
            JOIN users u ON fr.user_id = u.user_id
            JOIN food f ON fr.food_id = f.food_id
            ORDER BY fr.created_at DESC
        `);
        res.json(reviews);
    } catch (error) {
        console.error("Fetch All Reviews Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. API สำหรับอัปเดตสถานะรีวิว (อนุมัติ / ปฏิเสธ)
app.put('/api/admin/reviews/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const connection = db.promise();
    try {
        // อัปเดตสถานะในตาราง food_review
        await connection.query("UPDATE food_review SET review_status = ? WHERE review_id = ?", [status, id]);
        res.json({ message: "อัปเดตสถานะเรียบร้อย" });
    } catch (error) {
        console.error("Update Review Status Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

// ================= ADMIN: MANAGE USERS API =================
// API สำหรับดึงรายชื่อผู้ใช้ทั้งหมด
app.get('/api/admin/users', async (req, res) => {
    const connection = db.promise();
    try {
        // ดึงข้อมูล user_id, email, และ role มาโชว์ในตาราง
        const [users] = await connection.query(`
            SELECT user_id, email, role 
            FROM users 
            ORDER BY user_id ASC
        `);
        res.json(users);
    } catch (error) {
        console.error("Fetch Users Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสมาชิก" });
    }
});

// ================= ADMIN: DELETE USER API =================
app.delete('/api/admin/users/:id', async (req, res) => {
    const userId = req.params.id;
    const connection = db.promise();

    try {
        await connection.query("START TRANSACTION"); // เริ่มกระบวนการ

        // 1. ลบข้อมูลที่ผูกกับ User ในตารางย่อยต่างๆ ออกก่อน (เพื่อป้องกัน Foreign Key Error)
        await connection.query("DELETE FROM food_review WHERE user_id = ?", [userId]);
        await connection.query("DELETE FROM favorite WHERE user_id = ?", [userId]);
        await connection.query("DELETE FROM user_calculations WHERE user_id = ?", [userId]);

        // 2. ลบข้อมูลแผนอาหาร (ต้องลบ meal_detail ข้างในออกก่อน)
        const [plans] = await connection.query("SELECT plan_id FROM meal_plan WHERE user_id = ?", [userId]);
        if (plans.length > 0) {
            const planIds = plans.map(p => p.plan_id);
            // ลบรายละเอียดย่อยในแผน
            await connection.query("DELETE FROM meal_detail WHERE plan_id IN (?)", [planIds]);
        }
        // ลบหัวข้อแผนอาหาร
        await connection.query("DELETE FROM meal_plan WHERE user_id = ?", [userId]);

        // 3. ท้ายสุด ลบข้อมูลผู้ใช้งานในตารางหลัก
        await connection.query("DELETE FROM users WHERE user_id = ?", [userId]);

        await connection.query("COMMIT"); // ยืนยันการลบ
        res.json({ message: "ลบผู้ใช้งานและข้อมูลที่เกี่ยวข้องทั้งหมดสำเร็จ" });

    } catch (error) {
        await connection.query("ROLLBACK"); // หากพังกลางคัน ให้ยกเลิกการลบทั้งหมด
        console.error("Delete User Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูล" });
    }
});

// ================= ADMIN: UPDATE USER ROLE API =================
app.put('/api/admin/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role) return res.status(400).json({ message: "ไม่ได้ระบุสิทธิ์ที่ต้องการเปลี่ยน" });

    try {
        await db.promise().query(
            "UPDATE users SET role = ? WHERE user_id = ?",
            [role, userId]
        );
        res.json({ message: "อัปเดตสิทธิ์สำเร็จ" });
    } catch (error) {
        console.error("Update Role Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดต" });
    }
});

// ================= DELETE FOOD API =================

app.delete('/api/foods/:id', async (req, res) => {

    const foodId = req.params.id;

    try {

        await db.promise().query(
            "DELETE FROM food WHERE food_id = ?",
            [foodId]
        );

        res.json({
            success: true,
            message: "ลบอาหารสำเร็จ"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "ลบอาหารไม่สำเร็จ"
        });

    }

});

// ================= ADD FOOD API =================

app.post(
    "/api/foods",
    upload.single("image"),
    (req, res) => {

        try {

            const {
                food_name,
                category_id,
                serving_size,
                calories,
                protein,
                fat,
                carbohydrates,
                sugar,
                sodium,
                description,
                recipe_details, // 🌟 เพิ่มบรรทัดนี้
                notes           // 🌟 เพิ่มบรรทัดนี้
            } = req.body;

            const image = req.file
                ? `/uploads/${req.file.filename}`
                : null;

            // 🌟 แก้ไข SQL ให้เพิ่มคอลัมน์ recipe_details และ notes
            const sql = `
                INSERT INTO food
                (
                    food_name,
                    category_id,
                    serving_size,
                    calories,
                    protein,
                    fat,
                    carbohydrates,
                    sugar,
                    sodium,
                    description,
                    recipe_details,
                    notes,
                    image
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    food_name,
                    category_id,
                    serving_size,
                    calories,
                    protein,
                    fat,
                    carbohydrates,
                    sugar,
                    sodium,
                    description,
                    recipe_details, // 🌟 เพิ่มตัวแปรนี้
                    notes,          // 🌟 เพิ่มตัวแปรนี้
                    image
                ],
                (err, result) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            success: false,
                            message: "เพิ่มอาหารไม่สำเร็จ"
                        });

                    }

                    res.json({
                        success: true,
                        message: "เพิ่มอาหารสำเร็จ",
                        food_id: result.insertId
                    });

                }
            );

        } catch (error) {

            console.log(error);

            res.status(500).json({
                success: false,
                message: "Server Error"
            });

        }

    }
);

// ================= GET FOOD BY ID API =================

app.get('/api/foods/:id', (req, res) => {

    const foodId = req.params.id;

    db.query(
        `
        SELECT *
        FROM food
        WHERE food_id = ?
        `,
        [foodId],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false
                });

            }

            if (results.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "ไม่พบข้อมูลอาหาร"
                });

            }

            res.json({
                success: true,
                food: results[0]
            });

        }
    );

});

// ================= UPDATE FOOD API =================

app.put(
    "/api/foods/:id",
    upload.single("image"),
    async (req, res) => {

        console.log("BODY =", req.body);

        const foodId = req.params.id;

        try {

            const {
                food_name,
                category_id,
                serving_size,
                calories,
                protein,
                fat,
                carbohydrates,
                sugar,
                sodium,
                description,
                recipe_details, // 🌟 เพิ่มบรรทัดนี้
                notes           // 🌟 เพิ่มบรรทัดนี้
            } = req.body;

            console.log("CALORIES =", calories);
            console.log("PROTEIN =", protein);
            console.log("FAT =", fat);

            // ดึงรูปเดิม
            const [foods] = await db.promise().query(
                `
                SELECT image
                FROM food
                WHERE food_id = ?
                `,
                [foodId]
            );

            if (foods.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "ไม่พบอาหาร"
                });

            }

            let image = foods[0].image;

            // ถ้ามีอัปโหลดรูปใหม่
            if (req.file) {

                image =
                    `/uploads/${req.file.filename}`;

            }

            // 🌟 แก้ไข SQL ให้ UPDATE คอลัมน์ recipe_details และ notes ด้วย
            await db.promise().query(
                `
                UPDATE food
                SET
                    food_name = ?,
                    category_id = ?,
                    serving_size = ?,
                    calories = ?,
                    protein = ?,
                    fat = ?,
                    carbohydrates = ?,
                    sugar = ?,
                    sodium = ?,
                    description = ?,
                    recipe_details = ?,
                    notes = ?,
                    image = ?
                WHERE food_id = ?
                `,
                [
                    food_name,
                    category_id,
                    serving_size,
                    calories,
                    protein,
                    fat,
                    carbohydrates,
                    sugar,
                    sodium,
                    description,
                    recipe_details, // 🌟 เพิ่มตัวแปรนี้
                    notes,          // 🌟 เพิ่มตัวแปรนี้
                    image,
                    foodId
                ]
            );

            res.json({
                success: true,
                message: "แก้ไขอาหารสำเร็จ"
            });

        } catch (error) {

            console.log(error);

            res.status(500).json({
                success: false,
                message: "Server Error"
            });

        }

    }
);

// ================= GET ALL CATEGORIES =================
app.get("/api/categories", async (req, res) => {

    try {

        // ดึงข้อมูลหมวดหมู่ทั้งหมด
        const [rows] = await db.promise().query(`
            SELECT *
            FROM food_category
            ORDER BY category_id DESC
        `);

        // ส่งข้อมูลกลับไปยัง Frontend
        res.json(rows);

    } catch (error) {

        console.log(error);

        // Server Error
        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});


// ================= CREATE CATEGORY =================
app.post("/api/categories", async (req, res) => {

    try {

        // รับข้อมูลจาก Frontend
        const {
            category_name,
            description,
            status
        } = req.body;

        // เพิ่มหมวดหมู่ใหม่
        await db.promise().query(
            `
            INSERT INTO food_category
            (
                category_name,
                description,
                status
            )
            VALUES (?, ?, ?)
            `,
            [
                category_name,
                description,
                status
            ]
        );

        // ส่งผลลัพธ์กลับ
        res.json({
            success: true,
            message: "เพิ่มหมวดหมู่สำเร็จ"
        });

    } catch (error) {

        console.log(error);

        // Server Error
        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});


// ================= DELETE CATEGORY =================
app.delete("/api/categories/:id", async (req, res) => {

    try {

        // รับ ID จาก URL
        const categoryId = req.params.id;

        // ลบข้อมูลหมวดหมู่
        await db.promise().query(
            `
            DELETE FROM food_category
            WHERE category_id = ?
            `,
            [categoryId]
        );

        // ส่งผลลัพธ์กลับ
        res.json({
            success: true,
            message: "ลบหมวดหมู่สำเร็จ"
        });

    } catch (error) {

        console.log(error);

        // Server Error
        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});


// ================= GET CATEGORY BY ID =================
app.get("/api/categories/:id", async (req, res) => {

    try {

        // รับ ID จาก URL
        const { id } = req.params;

        // ค้นหาหมวดหมู่ตาม ID
        const [rows] = await db.promise().query(
            `
            SELECT *
            FROM food_category
            WHERE category_id = ?
            `,
            [id]
        );

        // ไม่พบข้อมูล
        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "ไม่พบข้อมูล"
            });

        }

        // ส่งข้อมูลกลับ
        res.json(rows[0]);

    } catch (error) {

        console.log(error);

        // Server Error
        res.status(500).json({
            success: false
        });

    }

});


// ================= UPDATE CATEGORY =================
app.put("/api/categories/:id", async (req, res) => {

    try {

        // รับ ID จาก URL
        const { id } = req.params;

        // รับข้อมูลใหม่
        const {
            category_name,
            description,
            status
        } = req.body;

        // อัปเดตข้อมูลหมวดหมู่
        await db.promise().query(
            `
            UPDATE food_category
            SET
                category_name = ?,
                description = ?,
                status = ?
            WHERE category_id = ?
            `,
            [
                category_name,
                description,
                status,
                id
            ]
        );

        // ส่งผลลัพธ์กลับ
        res.json({
            success: true,
        });

    } catch (error) {

        console.log(error);

        // Server Error
        res.status(500).json({
            success: false
        });

    }

});

// ================= CHANGE PASSWORD API =================
app.post("/api/change-password", async (req, res) => {

    const {
        user_id,
        oldPassword,
        newPassword
    } = req.body;

    try {

        // ตรวจสอบข้อมูล
        if (!user_id || !oldPassword || !newPassword) {

            return res.status(400).json({
                message: "กรอกข้อมูลไม่ครบ"
            });

        }

        // ค้นหาผู้ใช้
        db.query(
            "SELECT * FROM users WHERE user_id = ?",
            [user_id],

            async (err, result) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        message: "Server Error"
                    });

                }

                if (result.length === 0) {

                    return res.status(404).json({
                        message: "ไม่พบผู้ใช้"
                    });

                }

                const user = result[0];

                // ตรวจสอบรหัสผ่านเดิม
                const match = await bcrypt.compare(
                    oldPassword,
                    user.password
                );

                if (!match) {

                    return res.status(400).json({
                        message: "รหัสผ่านเดิมไม่ถูกต้อง"
                    });

                }

                // เข้ารหัสรหัสผ่านใหม่
                const hashedPassword =
                    await bcrypt.hash(newPassword, 10);

                // อัปเดตรหัสผ่าน
                db.query(
                    "UPDATE users SET password = ? WHERE user_id = ?",
                    [hashedPassword, user_id],

                    async (updateErr) => {

                        if (updateErr) {

                            console.log(updateErr);

                            return res.status(500).json({
                                message: "ไม่สามารถอัปเดตรหัสผ่านได้"
                            });

                        }

                        // ส่งอีเมลแจ้งเตือน
                        try {

                            await transporter.sendMail({

                                to: user.email,

                                subject:
                                    "MealPlan - เปลี่ยนรหัสผ่านสำเร็จ",

                                html: `
                                    <div style="font-family: Arial; padding:20px;">
                                        <h2 style="color:#ff8c42;">
                                            เปลี่ยนรหัสผ่านสำเร็จ
                                        </h2>

                                        <p>
                                            บัญชี MealPlan ของคุณมีการเปลี่ยนรหัสผ่านเรียบร้อยแล้ว
                                        </p>

                                        <p>
                                            เวลา:
                                            ${new Date().toLocaleString("th-TH")}
                                        </p>

                                        <hr>

                                        <p>
                                            หากคุณไม่ได้เป็นผู้ดำเนินการ
                                            กรุณารีเซ็ตรหัสผ่านทันที
                                        </p>

                                        <p>
                                            MealPlan Team
                                        </p>
                                    </div>
                                `
                            });

                        } catch (mailErr) {

                            console.log(
                                "MAIL ERROR:",
                                mailErr
                            );

                        }

                        res.json({
                            message:
                                "เปลี่ยนรหัสผ่านสำเร็จ"
                        });

                    }
                );

            }
        );

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

// ================= SEND EMAIL OTP =================
app.post("/api/send-email-otp", async (req, res) => {

    const { user_id, newEmail } = req.body;

    if (!newEmail) {

        return res.status(400).json({
            message: "กรุณากรอกอีเมลใหม่"
        });

    }

    // ================= CHECK EMAIL EXISTS =================

    db.query(
        "SELECT user_id FROM users WHERE email = ?",
        [newEmail],

        async (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Server Error"
                });

            }

            // อีเมลนี้มีอยู่แล้ว และไม่ใช่ของผู้ใช้คนปัจจุบัน
            if (
                result.length > 0 &&
                Number(result[0].user_id) !== Number(user_id)
            ) {

                return res.status(400).json({
                    message: "อีเมลนี้ถูกใช้งานแล้ว"
                });

            }

            const otp = Math.floor(
                100000 + Math.random() * 900000
            );

            // ลบ OTP เก่าออกก่อน
            db.query(
                "DELETE FROM email_otp WHERE user_id = ?",
                [user_id]
            );

            db.query(
                `
                INSERT INTO email_otp
                (
                    user_id,
                    new_email,
                    otp
                )
                VALUES (?, ?, ?)
                `,
                [
                    user_id,
                    newEmail,
                    otp
                ],

                async (err) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            message: "Server Error"
                        });

                    }

                    try {

                        await transporter.sendMail({

                            to: newEmail,

                            subject: "MealPlan OTP Verification",

                            html: `
                                <h2>ยืนยันการเปลี่ยนอีเมล</h2>

                                <p>OTP ของคุณคือ</p>

                                <h1>${otp}</h1>

                                <p>OTP นี้ใช้ได้ครั้งเดียว</p>
                            `
                        });

                        res.json({
                            message: "ส่ง OTP สำเร็จ"
                        });

                    } catch (mailErr) {

                        console.log(mailErr);

                        res.status(500).json({
                            message: "ส่งอีเมลไม่สำเร็จ"
                        });

                    }

                }
            );

        }
    );

});

app.post("/api/update-avatar", (req, res) => {

    const { user_id, avatar } = req.body;

    db.query(
        "UPDATE users SET avatar = ? WHERE user_id = ?",
        [avatar, user_id],
        (err) => {

            if (err) {
                return res.status(500).json({
                    message: "error"
                });
            }

            res.json({
                success: true
            });

        }
    );

});

// ================= VERIFY EMAIL OTP =================
app.post("/api/verify-email-otp", (req, res) => {

    const { user_id, otp } = req.body;

    db.query(
        `
        SELECT *
        FROM email_otp
        WHERE user_id = ?
        AND otp = ?
        AND created_at >= NOW() - INTERVAL 3 MINUTE
        ORDER BY id DESC
        LIMIT 1
        `,
        [user_id, otp],

        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Server Error"
                });

            }

            if (result.length === 0) {

                return res.status(400).json({
                    message: "OTP ไม่ถูกต้องหรือหมดอายุแล้ว"
                });

            }

            const row = result[0];

            return res.json({
                message: "เปลี่ยนอีเมลสำเร็จ",
                email: row.new_email
            });

        }
    );

});



app.get('/api/fp-transactions', (req, res) => {

    const sql = `
        SELECT
            md.plan_id,
            md.meal_type,
            f.food_name
        FROM meal_detail md
        JOIN food f
            ON md.food_id = f.food_id
        ORDER BY md.plan_id, md.meal_type
    `;

    db.query(sql, (err, rows) => {

        if (err) {
            return res.status(500).json(err);
        }

        const grouped = {};

        rows.forEach(row => {

            const key = `${row.plan_id}_${row.meal_type}`;

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(row.food_name);

        });

        const transactions = Object.values(grouped);

        res.json(transactions);

    });

});

app.get('/api/fp-growth', (req, res) => {

    const sql = `
        SELECT
            md.plan_id,
            md.meal_type,
            f.food_name
        FROM meal_detail md
        JOIN food f
            ON md.food_id = f.food_id
        ORDER BY md.plan_id, md.meal_type
    `;

    db.query(sql, (err, rows) => {

        if (err) {
            return res.status(500).json(err);
        }

        const grouped = {};

        rows.forEach(row => {

            const key = `${row.plan_id}_${row.meal_type}`;

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(row.food_name);

        });

        const transactions = Object.values(grouped);

        const fp = new fpgrowth.FPGrowth(0.1);

        fp.exec(transactions)
            .then(itemsets => {

                res.json(itemsets);

            })
            .catch(error => {

                res.status(500).json(error);

            });

    });

});

app.get('/api/recommend/:foodName', (req, res) => {

    const targetFood = req.params.foodName;
    const targetMealType = req.query.meal_type || null;

    const sql = `
        SELECT
            md.plan_id,
            md.meal_type,
            f.food_name
        FROM meal_detail md
        JOIN food f
            ON md.food_id = f.food_id
        ORDER BY md.plan_id, md.meal_type
    `;

    db.query(sql, (err, rows) => {

        if (err) {
            return res.status(500).json(err);
        }

        const grouped = {};

        rows.forEach(row => {

            const key = `${row.plan_id}_${row.meal_type}`;

            if (!grouped[key]) {
                grouped[key] = [];
            }

            grouped[key].push(row.food_name);

        });

        // กรองเฉพาะ transactions ของมื้อที่ผู้ใช้กำลังเพิ่ม
        const transactions = targetMealType
            ? Object.entries(grouped)
                .filter(([key]) => key.endsWith(`_${targetMealType}`))
                .map(([, foods]) => foods)
            : Object.values(grouped);

        const fp = new fpgrowth.FPGrowth(0.1);

        fp.exec(transactions)
            .then(itemsets => {

                const recommendations = [];

                itemsets.forEach(itemset => {

                    if (
                        itemset.items.includes(targetFood) &&
                        itemset.items.length > 1
                    ) {

                        itemset.items.forEach(food => {

                            if (food !== targetFood) {

                                recommendations.push({
                                    food,
                                    support: itemset.support
                                });

                            }

                        });

                    }

                });

                // ตัดรายการซ้ำ เก็บ support สูงสุดของแต่ละเมนู
                const seen = {};
                recommendations.forEach(r => {
                    if (!seen[r.food] || r.support > seen[r.food]) {
                        seen[r.food] = r.support;
                    }
                });
                const unique = Object.entries(seen)
                    .map(([food, support]) => ({ food, support }))
                    .sort((a, b) => b.support - a.support);

                res.json(
                    unique.slice(0, 3)
                );

            });

    });

});

// ================= START =================
app.listen(5000, () => {

    console.log("Server running on http://localhost:5000");

});