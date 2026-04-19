// GamificationDashboard.js
import React from "react";

const GamificationDashboard = ({ score, total }) => {
    return (
        <div style={styles.dashboard}>
            <h2>📊 Quiz Dashboard</h2>
            <p>Score: {score} / {total}</p>
            <p>Progress: {Math.round((score / total) * 100)}%</p>
        </div>
    );
};

const styles = {
    dashboard: {
        background: "#f4f4f4",
        padding: "10px",
        borderRadius: "8px",
        textAlign: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        marginBottom: "20px"
    }
};

export default GamificationDashboard;
