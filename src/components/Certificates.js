import React from 'react';

const certificates = [
  { name: 'React Basics', date: '2024-05-20', file: '#' },
  { name: 'UI/UX Design', date: '2024-04-15', file: '#' },
];

export default function Certificates() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Certificates</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3e6ff' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>Certificate</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Date</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((cert, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{cert.name}</td>
              <td style={{ padding: 8 }}>{cert.date}</td>
              <td style={{ padding: 8 }}>
                <a href={cert.file} style={{ marginRight: 12, color: '#6c47b6' }}>Download</a>
                <button style={{ background: '#fbc2eb', color: '#6c47b6', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Share</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 24 }}>
        <strong>Certificate Preview (Coming Soon)</strong>
      </div>
    </div>
  );
} 