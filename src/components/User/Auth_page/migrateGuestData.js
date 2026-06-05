export const migrateGuestData = async (userId) => {

    const calcResult = JSON.parse(localStorage.getItem("calcResult"));

    // ไม่มีข้อมูล guest → ไม่ต้องทำอะไร
    if (!calcResult || !userId) return { skipped: false };

    try {

        // ── ขั้นที่ 1: เช็คก่อนว่า user มีข้อมูลใน DB แล้วหรือยัง ──
        const checkRes = await fetch(
            `http://localhost:5000/api/get-calculation/${userId}`
        );
        const existingData = await checkRes.json();

        if (existingData && existingData.tdee) {
            // user มีข้อมูลใน DB แล้ว → ไม่ migrate (ไม่ทับข้อมูลของ user)
            // ล้าง sessionStorage ของ guest ออก เพราะ DB คือ source of truth
            sessionStorage.removeItem("activeCalcResult");
            return { skipped: true };
        }

        // ── ขั้นที่ 2: user ยังไม่มีข้อมูลใน DB → migrate ข้อมูล guest เข้า DB ──

        await fetch("http://localhost:5000/api/update-user-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                weight: calcResult.weight,
                height: calcResult.height,
                age: calcResult.age,
                gender: calcResult.gender,
                activity: calcResult.activity,
                chronic_disease: JSON.stringify(calcResult.diseases || [])
            })
        });

        await fetch("http://localhost:5000/api/save-calculation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                ...calcResult
            })
        });

        // ล้าง sessionStorage หลัง migrate สำเร็จ (ข้อมูลอยู่ใน DB แล้ว)
        sessionStorage.removeItem("activeCalcResult");

    } catch (err) {
        console.error("migrateGuestData error:", err);
    }

    return { skipped: false };

};
