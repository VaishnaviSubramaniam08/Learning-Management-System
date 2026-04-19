import React from 'react';

const performance = [
  { course: 'React Basics', grade: 85 },
  { course: 'JavaScript Advanced', grade: 70 },
  { course: 'UI/UX Design', grade: 95 },
];

export default function PerformanceTracking() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Performance Tracking</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3e6ff' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>Course</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Grade (%)</th>
          </tr>
        </thead>
        <tbody>
          {performance.map((p, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{p.course}</td>
              <td style={{ padding: 8 }}>
                <div style={{ background: '#eee', borderRadius: 8, overflow: 'hidden', width: 120, display: 'inline-block', marginRight: 8 }}>
                  <div style={{ width: `${p.grade}%`, background: 'linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)', height: 12 }} />
                </div>
                <span style={{ fontSize: 12, color: '#888' }}>{p.grade}%</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 24 }}>
        <strong>Analytics (Coming Soon)</strong>
      </div>
    </div>
  );
} 