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
                    email: user.email
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

    const {
        user_id,
        food_id,
        rating,
        review_text
    } = req.body;

    // บันทึกรีวิว
    const sql = `
        INSERT INTO food_review
        (
            user_id,
            food_id,
            rating,
            review_text,
            review_status
        )
        VALUES (?, ?, ?, ?, 'รออนุมัติ')
    `;

    db.query(sql, [user_id, food_id, rating, review_text], (err) => {

        if (err) return res.status(500).json({
            error: err.message
        });

        res.json({
            message: "บันทึกรีวิวสำเร็จ รอการอนุมัติ"
        });

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

    // เช็กรีวิว
    const sql = "SELECT * FROM food_review WHERE user_id = ? AND food_id = ?";

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

        // ดึงข้อมูลคำนวณล่าสุด
        const [userCalc] = await connection.query(`
            SELECT uc.*
            FROM user_calculations uc
            WHERE uc.user_id = ?
            ORDER BY uc.created_at DESC
            LIMIT 1
        `, [userId]);

        // ดึงข้อมูลโภชนาการย้อนหลัง 7 วัน
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
            "ม.ค.",
            "ก.พ.",
            "มี.ค.",
            "เม.ย.",
            "พ.ค.",
            "มิ.ย.",
            "ก.ค.",
            "ส.ค.",
            "ก.ย.",
            "ต.ค.",
            "พ.ย.",
            "ธ.ค."
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

        // ส่งข้อมูลกลับ React
        res.json({
            userConfig: userCalc[0] || {
                tdee: 1600,
                sugar: 25,
                sodium: 2000
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

// ================= START =================
app.listen(5000, () => {

    console.log("Server running on http://localhost:5000");

});