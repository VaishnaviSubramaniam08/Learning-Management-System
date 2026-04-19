import React from 'react';

const sampleSummary = [
  { label: 'Enrolled Courses', value: 3 },
  { label: 'Completed Courses', value: 1 },
  { label: 'Average Progress', value: '45%' },
  { label: 'Certificates Earned', value: 2 },
];

const recentActivity = [
  { activity: 'Enrolled in React Basics', date: '2024-06-01' },
  { activity: 'Completed Quiz 1', date: '2024-05-30' },
  { activity: 'Joined Live Session', date: '2024-05-28' },
];

const upcomingDeadlines = [
  { task: 'Assignment 2 Due', due: '2024-06-05' },
  { task: 'Live Class: JavaScript', due: '2024-06-07' },
];

export default function Overview() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Overview</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {sampleSummary.map((item) => (
          <div key={item.label} style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', borderRadius: 12, padding: 24, minWidth: 180, color: '#fff', boxShadow: '0 2px 8px #eee' }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{item.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{item.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <h3>Recent Activity</h3>
          <ul>
            {recentActivity.map((a, i) => (
              <li key={i}>{a.activity} <span style={{ color: '#888', fontSize: 12 }}>({a.date})</span></li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Upcoming Deadlines</h3>
          <ul>
            {upcomingDeadlines.map((d, i) => (
              <li key={i}>{d.task} <span style={{ color: '#888', fontSize: 12 }}>({d.due})</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 