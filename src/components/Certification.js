import React from 'react';

const certifications = [
  { name: 'Full Stack Developer', progress: 70, requirements: [
    { req: 'Complete React Basics', done: true },
    { req: 'Pass Final Exam', done: false },
    { req: 'Submit Capstone Project', done: false },
  ]},
];

export default function Certification() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Certification</h2>
      {certifications.map((c, i) => (
        <div key={i} style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{c.name}</div>
          <div style={{ background: '#eee', borderRadius: 8, overflow: 'hidden', width: 200, margin: '8px 0' }}>
            <div style={{ width: `${c.progress}%`, background: 'linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)', height: 12 }} />
          </div>
          <span style={{ fontSize: 12, color: '#888' }}>{c.progress}% complete</span>
          <div style={{ marginTop: 12 }}>
            <strong>Requirements:</strong>
            <ul>
              {c.requirements.map((r, j) => (
                <li key={j} style={{ color: r.done ? 'green' : 'red' }}>{r.req} {r.done ? '✓' : '✗'}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
} 