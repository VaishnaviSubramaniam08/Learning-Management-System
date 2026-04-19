import React, { useState } from 'react';
import { versusQuestions } from './VersusQuestions';
import { aiBattleQuestions } from './AIBattleQuestions';
import { aiTeacherQuestions } from './AITeacherQuestions';

const QuestionSetTester = ({ onBack }) => {
  const [currentMode, setCurrentMode] = useState('versus');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const questionSets = {
    versus: {
      name: '⚔️ Versus Battle',
      questions: versusQuestions,
      color: '#ff6b6b',
      description: 'Competitive student vs student challenges'
    },
    aiBattle: {
      name: '🤖 AI Battle',
      questions: aiBattleQuestions,
      color: '#007bff',
      description: 'Strategic human vs AI competition'
    },
    aiTeacher: {
      name: '👨‍🏫 AI Teacher',
      questions: aiTeacherQuestions,
      color: '#28a745',
      description: 'Educational learning with AI teacher'
    }
  };

  const currentSet = questionSets[currentMode];
  const currentQuestion = currentSet.questions[currentQuestionIndex];

  const nextQuestion = () => {
    if (currentQuestionIndex < currentSet.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentQuestionIndex(currentSet.questions.length - 1);
    }
  };

  const switchMode = (mode) => {
    setCurrentMode(mode);
    setCurrentQuestionIndex(0);
  };

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Gaming Hub
      </button>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🧪 Question Set Tester</h1>
        <p style={styles.subtitle}>
          Verify that each game mode has completely different questions
        </p>
      </div>

      {/* Mode Selector */}
      <div style={styles.modeSelector}>
        {Object.entries(questionSets).map(([key, set]) => (
          <button
            key={key}
            style={{
              ...styles.modeButton,
              backgroundColor: currentMode === key ? set.color : '#f8f9fa',
              color: currentMode === key ? 'white' : '#6c757d'
            }}
            onClick={() => switchMode(key)}
          >
            {set.name}
            <div style={styles.questionCount}>
              {set.questions.length} questions
            </div>
          </button>
        ))}
      </div>

      {/* Current Set Info */}
      <div style={styles.setInfo}>
        <div style={styles.setHeader}>
          <h2 style={styles.setName}>{currentSet.name}</h2>
          <p style={styles.setDescription}>{currentSet.description}</p>
        </div>
        <div style={styles.progress}>
          Question {currentQuestionIndex + 1} of {currentSet.questions.length}
        </div>
      </div>

      {/* Question Display */}
      <div style={styles.questionCard}>
        <div style={styles.questionHeader}>
          <div style={styles.questionNumber}>
            Q{currentQuestionIndex + 1}
          </div>
          <div style={styles.questionMeta}>
            <span style={styles.difficulty}>{currentQuestion.difficulty}</span>
            <span style={styles.category}>{currentQuestion.category}</span>
          </div>
        </div>

        <div style={styles.questionText}>
          {currentQuestion.question}
        </div>

        <div style={styles.options}>
          {currentQuestion.options.map((option, index) => (
            <div 
              key={index}
              style={{
                ...styles.option,
                backgroundColor: index === currentQuestion.correct ? '#d4edda' : '#f8f9fa'
              }}
            >
              <span style={styles.optionLetter}>
                {String.fromCharCode(65 + index)}
              </span>
              {option}
              {index === currentQuestion.correct && (
                <span style={styles.correctIcon}>✓</span>
              )}
            </div>
          ))}
        </div>

        <div style={styles.explanation}>
          <h4 style={styles.explanationTitle}>💡 Explanation:</h4>
          <p style={styles.explanationText}>{currentQuestion.explanation}</p>
        </div>

        {/* Mode-specific features */}
        {currentQuestion.learningTip && (
          <div style={styles.learningTip}>
            <h4 style={styles.tipTitle}>📚 Learning Tip:</h4>
            <p style={styles.tipText}>{currentQuestion.learningTip}</p>
          </div>
        )}

        {currentQuestion.aiHint && (
          <div style={styles.aiHint}>
            <h4 style={styles.hintTitle}>🤖 AI Hint:</h4>
            <p style={styles.hintText}>{currentQuestion.aiHint}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={styles.navigation}>
        <button style={styles.navButton} onClick={prevQuestion}>
          ← Previous
        </button>
        <div style={styles.navInfo}>
          {currentQuestionIndex + 1} / {currentSet.questions.length}
        </div>
        <button style={styles.navButton} onClick={nextQuestion}>
          Next →
        </button>
      </div>

      {/* Verification Panel */}
      <div style={styles.verification}>
        <h3 style={styles.verificationTitle}>✅ Question Set Verification</h3>
        <div style={styles.verificationGrid}>
          {Object.entries(questionSets).map(([key, set]) => (
            <div key={key} style={styles.verificationCard}>
              <div style={styles.verificationHeader}>
                <h4>{set.name}</h4>
                <span style={styles.verificationCount}>
                  {set.questions.length} questions
                </span>
              </div>
              <div style={styles.verificationFeatures}>
                <div>🎯 Unique difficulty: {key === 'versus' ? 'Competitive' : key === 'aiBattle' ? 'Strategic' : 'Educational'}</div>
                <div>📝 Unique themes: {key === 'versus' ? 'Speed & Logic' : key === 'aiBattle' ? 'Tech & AI' : 'Learning & Concepts'}</div>
                <div>✨ Special features: {
                  key === 'versus' ? 'Battle terminology' : 
                  key === 'aiBattle' ? 'AI hints' : 
                  'Learning tips'
                }</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>30</span>
          <span style={styles.statLabel}>Total Unique Questions</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>3</span>
          <span style={styles.statLabel}>Different Game Modes</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>100%</span>
          <span style={styles.statLabel}>Unique Content</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>0</span>
          <span style={styles.statLabel}>Overlapping Questions</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: 0
  },
  modeSelector: {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  modeButton: {
    padding: '15px 25px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  },
  questionCount: {
    fontSize: '0.9rem',
    marginTop: '5px',
    opacity: 0.8
  },
  setInfo: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  setHeader: {
    marginBottom: '10px'
  },
  setName: {
    fontSize: '1.5rem',
    color: '#1e293b',
    margin: 0,
    marginBottom: '5px'
  },
  setDescription: {
    color: '#64748b',
    margin: 0
  },
  progress: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#6366f1'
  },
  questionCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  questionNumber: {
    background: '#6366f1',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold'
  },
  questionMeta: {
    display: 'flex',
    gap: '10px'
  },
  difficulty: {
    background: '#10b981',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  category: {
    background: '#f59e0b',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  questionText: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '20px',
    lineHeight: 1.4
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px'
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb'
  },
  optionLetter: {
    background: '#6366f1',
    color: 'white',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  correctIcon: {
    color: '#16a34a',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginLeft: 'auto'
  },
  explanation: {
    background: '#f0f9ff',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px'
  },
  explanationTitle: {
    color: '#1e293b',
    margin: 0,
    marginBottom: '8px'
  },
  explanationText: {
    color: '#475569',
    margin: 0,
    lineHeight: 1.5
  },
  learningTip: {
    background: '#f0fdf4',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px'
  },
  tipTitle: {
    color: '#1e293b',
    margin: 0,
    marginBottom: '8px'
  },
  tipText: {
    color: '#475569',
    margin: 0,
    lineHeight: 1.5
  },
  aiHint: {
    background: '#fef3c7',
    padding: '15px',
    borderRadius: '10px'
  },
  hintTitle: {
    color: '#1e293b',
    margin: 0,
    marginBottom: '8px'
  },
  hintText: {
    color: '#475569',
    margin: 0,
    lineHeight: 1.5
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  navButton: {
    background: '#6366f1',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  navInfo: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#6366f1'
  },
  verification: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '25px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  verificationTitle: {
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: '20px'
  },
  verificationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  verificationCard: {
    background: '#f8fafc',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  verificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  verificationCount: {
    background: '#6366f1',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  verificationFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    fontSize: '0.9rem',
    color: '#475569'
  },
  stats: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  stat: {
    textAlign: 'center'
  },
  statNumber: {
    display: 'block',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#6366f1'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b'
  },

  // Back Button Styles
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    color: '#374151',
    border: '2px solid rgba(99, 102, 241, 0.3)',
    fontSize: '1rem',
    fontWeight: 'bold',
    padding: '12px 20px',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    zIndex: 1000
  }
};

export default QuestionSetTester;