// MyCourses.js
import React from "react";

// Helper: XP Bar
function XPBar({ xp, maxXP }) {
  const percent = Math.min(100, Math.round((xp / maxXP) * 100));
  return (
    <div style={{ background: "#eee", borderRadius: 8, height: 12, margin: "8px 0" }}>
      <div style={{
        width: `${percent}%`,
        background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
        height: "100%",
        borderRadius: 8,
        transition: "width 0.5s"
      }} />
    </div>
  );
}

// Helper: Badge Gallery
function BadgeGallery({ badges }) {
  return (
    <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
      {badges.map((b, i) => (
        <span key={i} title={b.name} style={{ fontSize: 28 }}>{b.icon}</span>
      ))}
    </div>
  );
}

// Helper: Certificate Preview
function CertificatePreview({ studentName, courseTitle, instructorName }) {
  return (
    <div style={{
      border: "2px solid #4dc0b5", borderRadius: 12, padding: 24, background: "#f9f9f9", marginTop: 16, textAlign: "center"
    }}>
      <h2 style={{ color: "#28a7a1" }}>Certificate of Completion</h2>
      <p>This certifies that</p>
      <h3>{studentName}</h3>
      <p>has successfully completed the course</p>
      <h4>{courseTitle}</h4>
      <p>Instructor: <b>{instructorName}</b></p>
      <img src="/signature.png" alt="Signature" style={{ height: 40, marginTop: 8 }} />
      <p>Date: {new Date().toLocaleDateString()}</p>
    </div>
  );
}

// Main MyCourses component
export default function MyCourses({ enrollments, studentName }) {
  if (!enrollments || enrollments.length === 0) {
    return <div>No courses enrolled yet.</div>;
  }

  return (
    <div>
      <h2>📚 My Courses</h2>
      {enrollments.map((enrollment) => {
        const modules = enrollment.course.modules || [];
        const moduleProgress = enrollment.moduleProgress || [];
        const badges = enrollment.badges || [];
        const xp = enrollment.xp || 0;
        const maxXP = modules.length * 100; // Example: 100 XP per module
        const allModulesCompleted = modules.length > 0 && moduleProgress.every(mp => mp.completed);

        return (
          <div className="course-card" key={enrollment.course._id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 32 }}>
            <h3>{enrollment.course.title}</h3>
            <XPBar xp={xp} maxXP={maxXP} />
            <BadgeGallery badges={badges} />
            <div>
              {modules.map((module, idx) => {
                const mp = moduleProgress[idx] || {};
                const locked = idx > 0 && !(moduleProgress[idx - 1]?.completed);
                return (
                  <div key={module._id || idx} style={{
                    marginBottom: 16,
                    opacity: locked ? 0.5 : 1,
                    pointerEvents: locked ? "none" : "auto",
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 12,
                    background: locked ? "#f8f8f8" : "#fff"
                  }}>
                    <h4>
                      {locked ? "🔒" : "🔓"} {module.title}
                    </h4>
                    <p>{module.description}</p>
                    {mp.completed ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>Completed</span>
                    ) : (
                      <button disabled={locked}>Start Module</button>
                    )}
                  </div>
                );
              })}
            </div>
            {allModulesCompleted && (
              <CertificatePreview
                studentName={studentName}
                courseTitle={enrollment.course.title}
                instructorName={enrollment.course.instructorName || "Instructor"}
              />
            )}
          </div>
        );
      })}
    </div>
  );
} 