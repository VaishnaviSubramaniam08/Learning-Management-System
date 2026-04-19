import React from 'react';
import StudentVersusGameification from './StudentVersusGameification';

// Test component to quickly demo the versus mode
const TestVersusMode = () => {
  const mockPlayers = {
    player1: { name: 'Alex Chen', avatar: '👨‍🎓', level: 15 },
    player2: { name: 'Sarah Khan', avatar: '👩‍🎓', level: 12 }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>
        🎮 Testing Versus Battle Mode
      </h1>
      <StudentVersusGameification 
        player1={mockPlayers.player1}
        player2={mockPlayers.player2}
      />
    </div>
  );
};

export default TestVersusMode;