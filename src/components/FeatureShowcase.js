import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeatureShowcase = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'study-materials',
      title: '📚 Real-Time Study Materials',
      description: 'Upload, download, and discover study materials with real-time notifications',
      highlights: [
        'Real-time file uploads with progress tracking',
        'Advanced search and filtering by exam, subject, topic',
        'Live notifications for new materials',
        'GridFS support for large files',
        'Engagement metrics and ratings'
      ],
      route: '/study-materials',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'ai-career',
      title: '🤖 AI Career Guidance',
      description: 'Get personalized career recommendations with AI-powered assessments',
      highlights: [
        'Big Five personality assessment',
        'Comprehensive skill evaluation',
        'AI-powered career recommendations',
        'Intelligent job matching',
        'Real-time AI mentor chat'
      ],
      route: '/ai-career-guidance',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
  ];

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{
          fontSize: '3rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '20px'
        }}>
          🚀 New Features Available!
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Explore our latest AI-powered features designed to enhance your learning experience
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '30px',
        marginBottom: '50px'
      }}>
        {features.map((feature) => (
          <div
            key={feature.id}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              background: feature.color,
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '25px',
              color: 'white'
            }}>
              <h2 style={{
                margin: '0 0 10px 0',
                fontSize: '1.8rem'
              }}>
                {feature.title}
              </h2>
              <p style={{
                margin: 0,
                fontSize: '1.1rem',
                opacity: 0.9
              }}>
                {feature.description}
              </p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#333',
                fontSize: '1.2rem'
              }}>
                ✨ Key Features:
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {feature.highlights.map((highlight, index) => (
                  <li
                    key={index}
                    style={{
                      padding: '8px 0',
                      fontSize: '1rem',
                      color: '#555',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: feature.color,
                      flexShrink: 0
                    }}></span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => navigate(feature.route)}
              style={{
                background: feature.color,
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              Explore {feature.title.split(' ').slice(1).join(' ')} →
            </button>
          </div>
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '2rem'
        }}>
          🎯 How to Access These Features
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          marginTop: '30px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '25px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>1️⃣</div>
            <h3 style={{ margin: '0 0 10px 0' }}>Student Dashboard</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Access via the new tabs in your Student Dashboard
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '25px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>2️⃣</div>
            <h3 style={{ margin: '0 0 10px 0' }}>Direct Links</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Use direct URLs: /ai-career-guidance and /study-materials
            </p>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '25px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>3️⃣</div>
            <h3 style={{ margin: '0 0 10px 0' }}>Real-time Updates</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Get live notifications and updates as you use the platform
            </p>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '50px',
        textAlign: 'center'
      }}>
        <button
          onClick={() => navigate('/student-dashboard')}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            borderRadius: '10px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default FeatureShowcase;
