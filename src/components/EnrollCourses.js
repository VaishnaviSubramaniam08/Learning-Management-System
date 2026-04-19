import React, { useState } from 'react';

const availableCourses = [
  { name: 'Python for Beginners', instructor: 'Dr. Smith', level: 'Beginner' },
  { name: 'Data Structures', instructor: 'Prof. Lee', level: 'Intermediate' },
  { name: 'Machine Learning', instructor: 'Dr. Patel', level: 'Advanced' },
];

export default function EnrollCourses() {
  const [search, setSearch] = useState('');
  const [enrolled, setEnrolled] = useState([]);

  const filtered = availableCourses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: 24 }}>
      <h2>Enroll in Courses</h2>
      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 16, padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 240 }}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f3e6ff' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>Course</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Instructor</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Level</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((course, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{course.name}</td>
              <td style={{ padding: 8 }}>{course.instructor}</td>
              <td style={{ padding: 8 }}>{course.level}</td>
              <td style={{ padding: 8 }}>
                {enrolled.includes(course.name) ? (
                  <span style={{ color: 'green', fontWeight: 600 }}>Enrolled</span>
                ) : (
                  <button onClick={() => setEnrolled([...enrolled, course.name])} style={{ background: '#a18cd1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', cursor: 'pointer' }}>Enroll</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 