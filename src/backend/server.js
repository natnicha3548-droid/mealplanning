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
    try {
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

                try {
                    await transporter.sendMail({
                        to: email,
                        subject: 'สมัครสมาชิกสำเร็จ',
                        html: `<h3>ยินดีต้อนรับ</h3>`
                    });
                } catch {
                    console.log("MAIL FAIL");
                }

                res.json({ message: "สมัครสมาชิกสำเร็จ" });
            }
        );

    } catch {
        res.status(500).json({ message: "server error" });
    }
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
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;

    const token = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 15 * 60 * 1000);

    db.query(
        "UPDATE users SET reset_token=?, token_expire=? WHERE email=?",
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
                    html: `<a href="${link}">${link}</a>`
                });

                res.json({ message: "ส่งลิงก์แล้ว" });
            } catch {
                res.status(500).json({ message: "ส่งเมลไม่สำเร็จ" });
            }
        }
    );
});

// ================= RESET PASSWORD =================
app.post('/api/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: "กรอกรหัสผ่านใหม่" });
        }

        const [users] = await db.promise().query(
            "SELECT * FROM users WHERE reset_token=? AND token_expire > NOW()",
            [token]
        );

        if (!users.length) {
            return res.status(400).json({ message: "token ไม่ถูกหรือหมดอายุ" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await db.promise().query(
            "UPDATE users SET password=?, reset_token=NULL, token_expire=NULL WHERE user_id=?",
            [hashed, users[0].user_id]
        );

        res.json({ message: "รีเซ็ตรหัสผ่านสำเร็จ" });

    } catch {
        res.status(500).json({ message: "server error" });
    }
});

// ================= USER INFO =================
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

// ================= UPDATE USER =================
app.post('/api/update-user-info', (req, res) => {
    const { user_id, weight, height, age, gender, activity, disease } = req.body;

    db.query(
        `UPDATE users SET 
        weight=?, height=?, age=?, gender=?, 
        activity_level=?, chronic_disease=? 
        WHERE user_id=?`,
        [weight, height, age, gender, activity, disease, user_id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "updated" });
        }
    );
});

// ================= FOODS =================
app.get('/api/foods', (req, res) => {

    db.query(
        `
        SELECT 
            food_id,
            food_name,
            category_id,
            image,
            serving_size,
            calories
        FROM food
        `,
        (err, results) => {

            if (err)
                return res.status(500).json(err);

            res.json(results);

        }
    );

});

// ================= GET CALC =================
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

            res.json(results[0] || null);
        }
    );
});

// ================= SAVE CALC =================
app.post('/api/save-calculation', (req, res) => {

    const {
        user_id,
        weight,
        height,
        age,
        gender,
        activity,
        disease,
        bmi,
        bmr,
        tdee,
        carb,
        protein,
        fat,
        sugar,
        sodium
    } = req.body;

    // กันข้อมูลไม่ครบ
    if (!user_id || !tdee) {

        return res.status(400).json({
            message: "ข้อมูลไม่ครบ"
        });

    }

    const sql = `
        INSERT INTO user_calculations
        (
            user_id,
            weight,
            height,
            age,
            gender,
            activity,
            disease,
            bmi,
            bmr,
            tdee,
            carb,
            protein,
            fat,
            sugar,
            sodium
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            disease,
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

/// ================= GET MEALS FOR PLANNER =================
app.get('/api/meals', (req, res) => {
    const { date, userId } = req.query;

    if (!date || !userId) {
        return res.status(400).json({ message: "กรุณาส่ง date และ userId มาด้วย" });
    }

    // ✅ ใส่ ORDER BY md.meal_type ASC เพื่อบังคับให้ MySQL เรียงตามลำดับ ENUM (เช้า -> กลางวัน -> เย็น) เสมอ
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
            return res.status(500).json({ error: err.message });
        }
        res.json(results); 
    });
});


// ================= Save Plan =================
app.post('/api/save-plan', async (req, res) => {
    const { user_id, days, total_calories, details } = req.body;

    if (!user_id || !days || !details || days.length === 0) {
        return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }

    const connection = db.promise();

    try {
        await connection.query("START TRANSACTION");

        for (const day of days) {
            
            // ค้นหาแผนอาหารเก่าที่มีอยู่แล้วในวันนี้ของผู้ใช้
            const [existingPlans] = await connection.query(
                "SELECT plan_id FROM meal_plan WHERE user_id = ? AND plan_date = ?",
                [user_id, day]
            );

            let planId;

            if (existingPlans.length > 0) {
                // 🔄 เคสที่ 1: มีแผนเก่าอยู่แล้ว (ผู้ใช้กดแก้ไขแผนของวันนี้) -> ใช้ plan_id เดิม
                planId = existingPlans[0].plan_id;

                // อัปเดตพลังงานแคลอรีรวมในตารางหลัก
                await connection.query(
                    "UPDATE meal_plan SET total_calories = ? WHERE plan_id = ?",
                    [total_calories, planId]
                );

                // ล้างเฉพาะรายการอาหารชุดเก่าในตารางย่อย meal_detail ของวันนี้ทิ้ง (ตาราง favorite จะไม่พังเพราะ plan_id เดิมยังอยู่!)
                await connection.query(
                    "DELETE FROM meal_detail WHERE plan_id = ?",
                    [planId]
                );

            } else {
                // 🌟 เคสที่ 2: ยังไม่มีแผนในวันนี้เลย -> ทำการ INSERT หัวข้อแผนอันใหม่
                const [planResult] = await connection.query(
                    "INSERT INTO meal_plan (user_id, plan_date, total_calories) VALUES (?, ?, ?)",
                    [user_id, day, total_calories]
                );
                planId = planResult.insertId;
            }

            // บันทึกรายละเอียดอาหารชุดล่าสุดลงในตารางย่อย meal_detail
            for (const item of details) {
                await connection.query(
                    `INSERT INTO meal_detail 
                    (plan_id, meal_type, food_id, quantity, total_calories) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [planId, item.meal_type, item.food_id, item.quantity, item.total_calories]
                );
            }
        }

        await connection.query("COMMIT");
        res.json({ message: "บันทึกแผนอาหารสำเร็จ!" });

    } catch (error) {
        await connection.query("ROLLBACK");
        console.error("Save Plan Error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", error: error.message });
    }
});

// ================= DELETE PLAN =================
app.delete('/api/plan/:id', async (req, res) => {
    const planId = req.params.id;

    const connection = db.promise();

    try {
        await connection.query("START TRANSACTION");

        // ลบข้อมูลในตาราง meal_detail ก่อน
        await connection.query(
            "DELETE FROM meal_detail WHERE plan_id = ?",
            [planId]
        );

        // ลบข้อมูลในตาราง meal_plan
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
// ==========================================
// FAVORITE (รายการโปรด)
// ==========================================

// 1. กดหัวใจ (เพิ่ม/ลบ)
app.post('/api/favorite-plan', (req, res) => {
  const { user_id, plan_id } = req.body;

  const checkSql = "SELECT * FROM favorite WHERE user_id = ? AND plan_id = ?";
  db.query(checkSql, [user_id, plan_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      const deleteSql = "DELETE FROM favorite WHERE user_id = ? AND plan_id = ?";
      db.query(deleteSql, [user_id, plan_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "ลบออกจากรายการโปรดแล้ว", isFav: false });
      });
    } else {
      const insertSql = "INSERT INTO favorite (user_id, plan_id) VALUES (?, ?)";
      db.query(insertSql, [user_id, plan_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "เพิ่มลงรายการโปรดแล้ว", isFav: true });
      });
    }
  });
});

// 2. เช็กสถานะหัวใจตอนโหลดหน้าเว็บ (🌟 สร้างใหม่)
app.get('/api/favorite-status', (req, res) => {
    const { user_id, plan_id } = req.query;

    if (!user_id || !plan_id) {
        return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }

    const sql = "SELECT * FROM favorite WHERE user_id = ? AND plan_id = ?";
    db.query(sql, [user_id, plan_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            res.json({ isFav: true });
        } else {
            res.json({ isFav: false });
        }
    });
});

// ==========================================
// REVIEW (รีวิวเมนูอาหาร)
// ==========================================

// 1. บันทึกรีวิว
app.post('/api/review', (req, res) => {
  const { user_id, food_id, rating, review_text } = req.body;

  const sql = "INSERT INTO food_review (user_id, food_id, rating, review_text, review_status) VALUES (?, ?, ?, ?, 'รออนุมัติ')";
  
  db.query(sql, [user_id, food_id, rating, review_text], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "บันทึกรีวิวสำเร็จ รอการอนุมัติ" });
  });
});

// 2. เช็กสถานะรีวิวตอนโหลดหน้าเว็บ (🌟 สร้างใหม่)
app.get('/api/review-status', (req, res) => {
    const { user_id, food_id } = req.query;

    if (!user_id || !food_id) {
        return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });
    }

    const sql = "SELECT * FROM food_review WHERE user_id = ? AND food_id = ?";
    db.query(sql, [user_id, food_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length > 0) {
            res.json({ 
                isReviewed: true, 
                rating: results[0].rating,
                review_text: results[0].review_text 
            });
        } else {
            res.json({ isReviewed: false, rating: 0, review_text: "" });
        }
    });
});

// ==========================================
// อาหารที่ถูกใจ (Favorite Foods)
// ==========================================

// 1. ดึงข้อมูลว่า User คนนี้ถูกใจอาหาร (food_id) อะไรบ้าง
app.get('/api/favorite-foods', (req, res) => {
  const { user_id } = req.query;
  
  if (!user_id) return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วน" });

  // ดึงเฉพาะรายการที่กดถูกใจอาหาร (food_id ไม่เป็น null)
  const sql = "SELECT food_id FROM favorite WHERE user_id = ? AND food_id IS NOT NULL";
  db.query(sql, [user_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
  });
});

// 2. กดปุ่มถูกใจ (เพิ่ม/ลบ อาหาร)
app.post('/api/favorite-food', (req, res) => {
  const { user_id, food_id } = req.body;

  // เช็กก่อนว่าเคยกดหรือยัง
  const checkSql = "SELECT * FROM favorite WHERE user_id = ? AND food_id = ?";
  db.query(checkSql, [user_id, food_id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length > 0) {
          // ถ้ามีอยู่แล้ว -> ลบออก (Unfavorite)
          const deleteSql = "DELETE FROM favorite WHERE user_id = ? AND food_id = ?";
          db.query(deleteSql, [user_id, food_id], (err, result) => {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ message: "ลบออกจากรายการโปรดแล้ว", isFav: false });
          });
      } else {
          // ถ้ายังไม่มี -> เพิ่มลงไป (Favorite)
          const insertSql = "INSERT INTO favorite (user_id, food_id) VALUES (?, ?)";
          db.query(insertSql, [user_id, food_id], (err, result) => {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ message: "เพิ่มลงรายการโปรดแล้ว", isFav: true });
          });
      }
  });
});

// ==========================================
// 5. API รายงานโภชนาการแบบสมบูรณ์สำหรับกลุ่มโรค NCDs
// ==========================================
app.get('/api/report/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    const connection = db.promise();

    try {
        // 1. ดึงข้อมูลโรคประจำตัวและเกณฑ์สารอาหารล่าสุดของผู้ใช้
        const [userCalc] = await connection.query(`
            SELECT uc.*, u.chronic_disease 
            FROM user_calculations uc
            JOIN users u ON uc.user_id = u.user_id
            WHERE uc.user_id = ?
            ORDER BY uc.created_at DESC
            LIMIT 1
        `, [userId]);

        // 2. ดึงสถิติการกิน 7 วันย้อนหลัง (รวม น้ำตาล และ โซเดียม จริงจากตาราง food)
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

        // กลับลำดับข้อมูลจากอดีตมาปัจจุบันเพื่อให้กราฟวาดจากซ้ายไปขวา
        mealsData.reverse();

        const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
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

        // ส่งข้อมูลแพ็กคู่กลับไปให้คอมโพเนนต์ React
        res.json({
            userConfig: userCalc[0] || { chronic_disease: 'none', tdee: 1600, sugar: 25, sodium: 2000 },
            weeklyData: formattedWeekly
        });

    } catch (error) {
        console.error("Complete NCD Report Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ================= START =================
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});