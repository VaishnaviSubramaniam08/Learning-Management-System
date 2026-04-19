import React, { useState } from 'react';
import StudentVersusGameification from './StudentVersusGameification';
import HumanVsAIGameification from './HumanVsAIGameification';
import InteractiveGameification from './InteractiveGameification';
import RealTimeLeaderboard from './RealTimeLeaderboard';

const GamificationHub = ({ user, onBack }) => {
  const [activeMode, setActiveMode] = useState('hub'); // 'hub', 'versus', 'ai-battle', 'solo', 'leaderboard'
  const [player2, setPlayer2] = useState(null);

  // Mock function to simulate finding another player
  const findOpponent = () => {
    const mockOpponents = [
      { id: 1, name: 'Alex Chen', avatar: '👨‍🎓', level: 15 },
      { id: 2, name: 'Sarah Khan', avatar: '👩‍🎓', level: 12 },
      { id: 3, name: 'Mike Johnson', avatar: '👨‍🎓', level: 18 },
      { id: 4, name: 'Priya Sharma', avatar: '👩‍🎓', level: 14 },
      { id: 5, name: 'John Williams', avatar: '👨‍🎓', level: 16 }
    ];
    
    const randomOpponent = mockOpponents[Math.floor(Math.random() * mockOpponents.length)];
    setPlayer2(randomOpponent);
    setActiveMode('versus');
  };

  const startSoloMode = () => {
    setActiveMode('solo');
  };

  const startAIBattle = () => {
    setActiveMode('ai-battle');
  };

  const showLeaderboard = () => {
    setActiveMode('leaderboard');
  };

  const returnToHub = () => {
    setActiveMode('hub');
    setPlayer2(null);
  };

  // Gamification Hub Main Screen
  const renderHub = () => (
    <div style={styles.hubContainer}>
      {/* Back Button */}
      {onBack && (
        <button style={styles.backButton} onClick={onBack}>
          ← Back to Dashboard
        </button>
      )}
      
      {/* Header */}
      <div style={styles.hubHeader}>
        <h1 style={styles.hubTitle}>🎮 Learning Arena</h1>
        <p style={styles.hubSubtitle}>Choose your gaming experience and boost your learning!</p>
      </div>

      {/* Game Mode Cards */}
      <div style={styles.gameModes}>
        {/* Versus Mode Card */}
        <div style={styles.modeCard} onClick={findOpponent}>
          <div style={styles.modeIcon}>⚔️</div>
          <h3 style={styles.modeTitle}>Versus Battle</h3>
          <p style={styles.modeDescription}>
            Challenge another student in real-time! Battle side by side and see who answers faster.
          </p>
          <div style={styles.modeFeatures}>
            <span style={styles.feature}>🏆 Competitive</span>
            <span style={styles.feature}>⚡ Real-time</span>
            <span style={styles.feature}>🎯 Head-to-head</span>
          </div>
          <div style={styles.modeButtonText}>Find Opponent & Start Battle!</div>
        </div>

        {/* AI Battle Mode Card */}
        <div style={styles.modeCard} onClick={startAIBattle}>
          <div style={styles.modeIcon}>🤖</div>
          <h3 style={styles.modeTitle}>Human vs AI Battle</h3>
          <p style={styles.modeDescription}>
            Challenge intelligent AI opponents! Battle against different AI personalities with varying difficulty levels.
          </p>
          <div style={styles.modeFeatures}>
            <span style={styles.feature}>🧠 AI Intelligence</span>
            <span style={styles.feature}>⚡ Auto-Response</span>
            <span style={styles.feature}>🎯 Multiple AIs</span>
          </div>
          <div style={styles.modeButtonText}>Challenge AI Opponent!</div>
        </div>

        {/* Solo Mode Card */}
        <div style={styles.modeCard} onClick={startSoloMode}>
          <div style={styles.modeIcon}>👨‍🏫</div>
          <h3 style={styles.modeTitle}>AI Teacher Mode</h3>
          <p style={styles.modeDescription}>
            Learn with your AI teacher in an interactive environment with detailed explanations.
          </p>
          <div style={styles.modeFeatures}>
            <span style={styles.feature}>📚 Educational</span>
            <span style={styles.feature}>🤖 AI Teacher</span>
            <span style={styles.feature}>💡 Explanations</span>
          </div>
          <div style={styles.modeButtonText}>Start Learning Session!</div>
        </div>

        {/* Leaderboard Card */}
        <div style={styles.modeCard} onClick={showLeaderboard}>
          <div style={styles.modeIcon}>🏆</div>
          <h3 style={styles.modeTitle}>Leaderboards</h3>
          <p style={styles.modeDescription}>
            See how you rank against other students and track your progress over time.
          </p>
          <div style={styles.modeFeatures}>
            <span style={styles.feature}>📊 Rankings</span>
            <span style={styles.feature}>🎯 Progress</span>
            <span style={styles.feature}>🌟 Achievements</span>
          </div>
          <div style={styles.modeButtonText}>View Rankings!</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.quickStats}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statValue}>0</div>
          <div style={styles.statLabel}>Games Played</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏆</div>
          <div style={styles.statValue}>0</div>
          <div style={styles.statLabel}>Battles Won</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔥</div>
          <div style={styles.statValue}>0</div>
          <div style={styles.statLabel}>Current Streak</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⭐</div>
          <div style={styles.statValue}>Level 1</div>
          <div style={styles.statLabel}>Current Level</div>
        </div>
      </div>

      {/* Recently Played */}
      <div style={styles.recentSection}>
        <h3 style={styles.sectionTitle}>📈 Recent Activity</h3>
        <div style={styles.recentCard}>
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎮</div>
            <div style={styles.emptyText}>No recent games</div>
            <div style={styles.emptySubtext}>Start playing to see your activity here!</div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div style={styles.tipsSection}>
        <h3 style={styles.sectionTitle}>💡 Pro Tips</h3>
        <div style={styles.tipsList}>
          <div style={styles.tip}>
            <span style={styles.tipIcon}>⚡</span>
            <span style={styles.tipText}>In Versus mode, speed matters - but accuracy matters more!</span>
          </div>
          <div style={styles.tip}>
            <span style={styles.tipIcon}>🎯</span>
            <span style={styles.tipText}>Build streaks to unlock bonus points and achievements</span>
          </div>
          <div style={styles.tip}>
            <span style={styles.tipIcon}>🧠</span>
            <span style={styles.tipText}>Use AI Teacher mode to understand concepts deeply</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Leaderboard Screen
  const renderLeaderboard = () => (
    <div style={styles.leaderboardContainer}>
      <div style={styles.backButton} onClick={returnToHub}>
        ← Back to Gaming Hub
      </div>
      
      <div style={styles.leaderboardHeader}>
        <h2 style={styles.leaderboardTitle}>🏆 Global Leaderboards</h2>
        <p style={styles.leaderboardSubtitle}>See how you rank against other students</p>
      </div>

      <RealTimeLeaderboard user={user} onBack={returnToHub} />
    </div>
  );

  // Main render
  return (
    <div style={styles.container}>
      {activeMode === 'hub' && renderHub()}
      {activeMode === 'versus' && (
        <StudentVersusGameification 
          player1={{ name: user?.firstName + ' ' + user?.lastName || 'Player 1' }}
          player2={player2}
          onBack={returnToHub}
        />
      )}
      {activeMode === 'ai-battle' && (
        <HumanVsAIGameification 
          player={{ name: user?.firstName + ' ' + user?.lastName || 'Player 1' }}
          onBack={returnToHub}
        />
      )}
      {activeMode === 'solo' && <InteractiveGameification user={user} onBack={returnToHub} />}
      {activeMode === 'leaderboard' && renderLeaderboard()}
    </div>
  );
};

// Comprehensive Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif'
  },

  // Hub Styles
  hubContainer: {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  hubHeader: {
    textAlign: 'center',
    marginBottom: '50px'
  },
  hubTitle: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
    margin: 0,
    marginBottom: '15px'
  },
  hubSubtitle: {
    fontSize: '1.4rem',
    color: 'rgba(255,255,255,0.9)',
    margin: 0
  },

  // Game Mode Cards
  gameModes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
    marginBottom: '50px'
  },
  modeCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    transition: 'all 0.4s ease',
    border: '3px solid transparent',
    position: 'relative',
    overflow: 'hidden'
  },
  modeIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    display: 'block'
  },
  modeTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px'
  },
  modeDescription: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  modeFeatures: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '25px',
    flexWrap: 'wrap'
  },
  feature: {
    background: '#f0f9ff',
    color: '#0369a1',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  modeButtonText: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '10px'
  },

  // Quick Stats
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  statCard: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '25px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  statIcon: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    display: 'block'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666'
  },

  // Recent Section
  recentSection: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    marginBottom: '20px',
    textAlign: 'center'
  },
  recentCard: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  emptyState: {
    textAlign: 'center',
    color: '#666'
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
    display: 'block'
  },
  emptyText: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  emptySubtext: {
    fontSize: '1rem'
  },

  // Tips Section
  tipsSection: {
    marginBottom: '40px'
  },
  tipsList: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  tip: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '12px'
  },
  tipIcon: {
    fontSize: '1.5rem',
    flexShrink: 0
  },
  tipText: {
    fontSize: '1rem',
    color: '#333',
    lineHeight: '1.4'
  },

  // Leaderboard Styles
  leaderboardContainer: {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  backButton: {
    background: 'rgba(255,255,255,0.9)',
    color: '#333',
    padding: '12px 24px',
    borderRadius: '50px',
    cursor: 'pointer',
    display: 'inline-block',
    fontWeight: 'bold',
    marginBottom: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  leaderboardHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  leaderboardTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    marginBottom: '10px'
  },
  leaderboardSubtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.9)'
  },

};

export default GamificationHub;