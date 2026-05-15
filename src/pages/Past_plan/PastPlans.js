import React, { useState, useEffect } from "react";

function PastPlans() {
    const [pastPlans, setPastPlans] = useState([]);
    useEffect(() => {
        const stored = localStorage.getItem("pastPlans");
        if (stored) {
            setPastPlans(JSON.parse(stored));
        } else {            setPastPlans([]);
        }   
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2>แผนการกินในอดีตของคุณ</h2>
            {pastPlans.length === 0 ? (
                <p>คุณยังไม่มีแผนการกินในอดีตเลย ลองสร้างแผนการกินใหม่ดูสิ!</p>
            ) : (
                <ul>
                    {pastPlans.map((plan, index) => (
                        <li key={index}>
                            <strong>{plan.name}</strong> - {plan.calories} kcal
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
export default PastPlans;