import React from 'react';
import HumanVsAIGameification from './HumanVsAIGameification';

// Test component to quickly demo the Human vs AI mode
const TestHumanVsAI = () => {
  const mockPlayer = { 
    name: 'John Student', 
    avatar: '👨‍🎓', 
    level: 15 
  };

  return (
    <div>
      <h1 style={{ 
        textAlign: 'center', 
        margin: '20px 0',
        color: '#333',
        fontSize: '2rem'
      }}>
        🤖 Testing Human vs AI Battle Mode
      </h1>
      <p style={{ 
        textAlign: 'center', 
        margin: '10px 0 30px 0',
        color: '#666',
        fontSize: '1.1rem'
      }}>
        Choose an AI opponent and battle against artificial intelligence!
      </p>
      <HumanVsAIGameification player={mockPlayer} />
    </div>
  );
};

export default TestHumanVsAI;