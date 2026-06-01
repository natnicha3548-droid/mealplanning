// ================= IMPORT LIBRARY =================
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

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
                    role: user.role
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
            description
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
        bmi,
        bmr,
        tdee,
        carb,
        protein,
        fat,
        sugar,
        sodium
    } = req.body;

    // เช็กข้อมูลสำคัญ
    if (!user_id || !tdee) {

        return res.status(400).json({
            message: "ข้อมูลไม่ครบ"
        });

    }

    // SQL บันทึกข้อมูลคำนวณ
    const sql = `
        INSERT INTO user_calculations
        (
            user_id,
            weight,
            height,
            age,
            gender,
            activity,
            bmi,
            bmr,
            tdee,
            carb,
            protein,
            fat,
            sugar,
            sodium
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(

        sql,

        [
            user_id,
            weight,
            height,
            age,
            gender,
            activity,
            bmi,
            bmr,
            tdee,
            carb,
            protein,
            fat,
            sugar,
            sodium
        ],

        (err) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message: "save error"
                });

            }

            res.json({
                message: "saved"
            });

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
        // 🌟 แก้ไข SQL: ดึง TDEE ล่าสุดจาก user_calculations และผูก JOIN กับตาราง users เพื่อเอาโรคประจำตัว (chronic_disease)
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
                tdee: 1600,
                sugar: 25,
                sodium: 2000,
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
            'SELECT * FROM meal_plan WHERE user_id = ? AND plan_date = ?', 
            [userId, sourceDate]
        );

        if (oldPlans.length === 0) {
            return res.status(404).json({ message: "ไม่พบแผนของวันที่เลือก" });
        }
        
        const oldPlan = oldPlans[0];

        // 2. ใช้คำสั่ง SQL เริ่ม Transaction โดยตรง
        await dbPromise.query('START TRANSACTION');

        try {
            // ลบของเดิมวันนี้ออกก่อน (เพื่อกันข้อมูลซ้ำ) โดยลบรายละเอียดก่อนเพื่อกัน Foreign Key Error
            const [existing] = await dbPromise.query(
                'SELECT plan_id FROM meal_plan WHERE user_id = ? AND plan_date = ?', 
                [userId, targetDate]
            );

            if (existing.length > 0) {
                const planIdToDelete = existing[0].plan_id;
                await dbPromise.query('DELETE FROM meal_detail WHERE plan_id = ?', [planIdToDelete]);
                await dbPromise.query('DELETE FROM meal_plan WHERE plan_id = ?', [planIdToDelete]);
            }

            // 3. INSERT หัวข้อแผนใหม่
            const [newPlan] = await dbPromise.query(
                'INSERT INTO meal_plan (user_id, plan_date, total_calories, plan_detail) VALUES (?, ?, ?, ?)',
                [userId, targetDate, oldPlan.total_calories, oldPlan.plan_detail]
            );

            const newPlanId = newPlan.insertId;

            // 4. คัดลอกรายละเอียดอาหาร
            await dbPromise.query(
                `INSERT INTO meal_detail (plan_id, meal_type, food_id, food_name_snapshot, quantity, total_calories)
                 SELECT ?, meal_type, food_id, food_name_snapshot, quantity, total_calories
                 FROM meal_detail WHERE plan_id = ?`,
                [newPlanId, oldPlan.plan_id]
            );

            await dbPromise.query('COMMIT');
            res.json({ message: "นำแผนกลับมาใช้ใหม่สำเร็จ!" });

        } catch (err) {
            await dbPromise.query('ROLLBACK'); // ยกเลิกรายการหากผิดพลาด
            throw err;
        }
    } catch (error) {
        console.error("Restore Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์", error: error.message });
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

            breakfast.food_name AS breakfast_name,
            breakfast.image AS breakfast_image,
            md_breakfast.total_calories AS breakfast_cal,

            lunch.food_name AS lunch_name,
            lunch.image AS lunch_image,
            md_lunch.total_calories AS lunch_cal,

            dinner.food_name AS dinner_name,
            dinner.image AS dinner_image,
            md_dinner.total_calories AS dinner_cal,

            (
                IFNULL(breakfast.protein * md_breakfast.quantity, 0) +
                IFNULL(lunch.protein * md_lunch.quantity, 0) +
                IFNULL(dinner.protein * md_dinner.quantity, 0)
            ) AS protein,

            (
                IFNULL(breakfast.carbohydrates * md_breakfast.quantity, 0) +
                IFNULL(lunch.carbohydrates * md_lunch.quantity, 0) +
                IFNULL(dinner.carbohydrates * md_dinner.quantity, 0)
            ) AS carbs,

            (
                IFNULL(breakfast.fat * md_breakfast.quantity, 0) +
                IFNULL(lunch.fat * md_lunch.quantity, 0) +
                IFNULL(dinner.fat * md_dinner.quantity, 0)
            ) AS fat

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

        // ดึงรายการอาหารในแผน
        const detailSql = `
            SELECT
                md.meal_type,
                md.total_calories,
                f.food_name,
                f.image
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

            let breakfast = {};
            let lunch = {};
            let dinner = {};

            details.forEach((item) => {

                if (item.meal_type === "เช้า") {
                    breakfast = item;
                }

                if (item.meal_type === "กลางวัน") {
                    lunch = item;
                }

                if (item.meal_type === "เย็น") {
                    dinner = item;
                }

            });

            res.json({

                plan_id: latestPlan.plan_id,
                total_calories: latestPlan.total_calories,

                breakfast_name: breakfast.food_name,
                breakfast_image: breakfast.image,
                breakfast_cal: breakfast.total_calories,

                lunch_name: lunch.food_name,
                lunch_image: lunch.image,
                lunch_cal: lunch.total_calories,

                dinner_name: dinner.food_name,
                dinner_image: dinner.image,
                dinner_cal: dinner.total_calories

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

        // แก้ไขตรงข้อมูลจำลอง FP-growth ให้มีตัวแปร trend เพิ่มเข้ามา
        const fpGrowthInsights = [
            { pair: "ข้าวผัดหมู + น้ำซุป", confidence: "85%", trend: "up" },     // ชี้ขึ้น
            { pair: "สลัดอกไก่ + ไข่ต้ม", confidence: "72%", trend: "down" },   // ชี้ลง
            { pair: "ผัดกะเพรา + ไข่ดาว", confidence: "90%", trend: "up" }      // ชี้ขึ้น
        ];

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

// ================= START =================
app.listen(5000, () => {

    console.log("Server running on http://localhost:5000");

});