import React, { useState } from 'react';
import { versusQuestions } from './VersusQuestions';
import { aiBattleQuestions } from './AIBattleQuestions';
import { aiTeacherQuestions } from './AITeacherQuestions';

const QuestionSetOverview = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('versus');

  const questionSets = {
    versus: {
      title: '⚔️ Versus Battle Questions',
      description: 'Competitive challenges for student vs student battles',
      color: '#ff6b6b',
      icon: '⚔️',
      questions: versusQuestions,
      features: [
        'Speed-focused questions',
        'Competitive difficulty levels',
        'Pattern recognition challenges',
        'Quick mental math',
        'Logic puzzles'
      ]
    },
    aiBattle: {
      title: '🤖 AI Battle Questions',
      description: 'Strategic questions for human vs AI competition',
      color: '#007bff',
      icon: '🤖',
      questions: aiBattleQuestions,
      features: [
        'Algorithm knowledge',
        'AI-themed content',
        'Strategic thinking',
        'Tech industry focus',
        'AI hints for responses'
      ]
    },
    aiTeacher: {
      title: '👨‍🏫 AI Teacher Questions',
      description: 'Educational questions for learning with AI teacher',
      color: '#28a745',
      icon: '📚',
      questions: aiTeacherQuestions,
      features: [
        'Educational explanations',
        'Learning tips included',
        'Fundamental concepts',
        'Step-by-step solutions',
        'Multi-subject coverage'
      ]
    }
  };

  const renderQuestionPreview = (question, index) => (
    <div key={index} style={styles.questionCard}>
      <div style={styles.questionHeader}>
        <span style={styles.questionNumber}>Q{index + 1}</span>
        <span style={styles.questionDifficulty}>
          {question.difficulty}
        </span>
        <span style={styles.questionCategory}>
          {question.category}
        </span>
      </div>
      
      <div style={styles.questionText}>
        {question.question}
      </div>
      
      <div style={styles.optionsPreview}>
        {question.options.map((option, optIndex) => (
          <div 
            key={optIndex}
            style={{
              ...styles.optionPreview,
              backgroundColor: optIndex === question.correct ? '#d4edda' : '#f8f9fa'
            }}
          >
            {String.fromCharCode(65 + optIndex)}. {option}
            {optIndex === question.correct && <span style={styles.correctMark}>✓</span>}
          </div>
        ))}
      </div>
      
      <div style={styles.questionDetails}>
        <div style={styles.explanation}>
          <strong>💡 Explanation:</strong> {question.explanation}
        </div>
        
        {question.learningTip && (
          <div style={styles.learningTip}>
            <strong>📚 Learning Tip:</strong> {question.learningTip}
          </div>
        )}
        
        {question.aiHint && (
          <div style={styles.aiHint}>
            <strong>🤖 AI Hint:</strong> {question.aiHint}
          </div>
        )}
      </div>
    </div>
  );

  const currentSet = questionSets[activeTab];

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Gaming Hub
      </button>
      
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📝 Question Sets Overview</h1>
        <p style={styles.subtitle}>
          Each game mode now has its own unique set of 10 questions!
        </p>
      </div>

      {/* Mode Tabs */}
      <div style={styles.tabContainer}>
        {Object.entries(questionSets).map(([key, set]) => (
          <button
            key={key}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === key ? set.color : '#f8f9fa',
              color: activeTab === key ? 'white' : '#6c757d'
            }}
            onClick={() => setActiveTab(key)}
          >
            <span style={styles.tabIcon}>{set.icon}</span>
            <span style={styles.tabText}>{set.title.split(' ').slice(-2).join(' ')}</span>
            <span style={styles.questionCount}>({set.questions.length})</span>
          </button>
        ))}
      </div>

      {/* Active Set Info */}
      <div style={styles.setInfo}>
        <div style={styles.setHeader}>
          <div style={styles.setIcon} style={{backgroundColor: currentSet.color}}>
            {currentSet.icon}
          </div>
          <div>
            <h2 style={styles.setTitle}>{currentSet.title}</h2>
            <p style={styles.setDescription}>{currentSet.description}</p>
          </div>
        </div>

        <div style={styles.featuresContainer}>
          <h3 style={styles.featuresTitle}>✨ Unique Features:</h3>
          <div style={styles.featuresList}>
            {currentSet.features.map((feature, index) => (
              <div key={index} style={styles.feature}>
                <span style={styles.featureIcon}>•</span>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div style={styles.stats}>
          <div style={styles.stat}>
            <span style={styles.statNumber}>{currentSet.questions.length}</span>
            <span style={styles.statLabel}>Total Questions</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>
              {currentSet.questions.filter(q => q.difficulty === 'Easy').length}
            </span>
            <span style={styles.statLabel}>Easy</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>
              {currentSet.questions.filter(q => q.difficulty === 'Medium').length}
            </span>
            <span style={styles.statLabel}>Medium</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statNumber}>
              {currentSet.questions.filter(q => q.difficulty === 'Hard').length}
            </span>
            <span style={styles.statLabel}>Hard</span>
          </div>
        </div>
      </div>

      {/* Questions Preview */}
      <div style={styles.questionsContainer}>
        <h3 style={styles.questionsTitle}>
          📋 All Questions in {currentSet.title}
        </h3>
        <div style={styles.questionsList}>
          {currentSet.questions.map((question, index) => 
            renderQuestionPreview(question, index)
          )}
        </div>
      </div>

      {/* Usage Guide */}
      <div style={styles.usageGuide}>
        <h3 style={styles.guideTitle}>🎮 How to Experience Each Question Set</h3>
        <div style={styles.gameInstructions}>
          <div style={styles.instruction}>
            <div style={styles.instructionIcon}>⚔️</div>
            <div>
              <h4>Versus Battle</h4>
              <p>Challenge a classmate to competitive questions focused on speed and accuracy.</p>
            </div>
          </div>
          <div style={styles.instruction}>
            <div style={styles.instructionIcon}>🤖</div>
            <div>
              <h4>AI Battle</h4>
              <p>Face off against AI opponents with strategic and tech-focused challenges.</p>
            </div>
          </div>
          <div style={styles.instruction}>
            <div style={styles.instructionIcon}>📚</div>
            <div>
              <h4>AI Teacher Mode</h4>
              <p>Learn with educational questions that include detailed explanations and tips.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
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
    padding: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#64748b',
    margin: 0
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  tabIcon: {
    fontSize: '1.2rem'
  },
  tabText: {
    fontWeight: 'bold'
  },
  questionCount: {
    fontSize: '0.9rem',
    opacity: 0.8
  },
  setInfo: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  setHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px'
  },
  setIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    color: 'white'
  },
  setTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1e293b',
    margin: 0,
    marginBottom: '5px'
  },
  setDescription: {
    fontSize: '1rem',
    color: '#64748b',
    margin: 0
  },
  featuresContainer: {
    marginBottom: '20px'
  },
  featuresTitle: {
    color: '#1e293b',
    marginBottom: '10px'
  },
  featuresList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px'
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#475569'
  },
  featureIcon: {
    color: '#6366f1',
    fontWeight: 'bold'
  },
  stats: {
    display: 'flex',
    gap: '30px',
    justifyContent: 'center',
    padding: '20px',
    background: '#f8fafc',
    borderRadius: '12px'
  },
  stat: {
    textAlign: 'center'
  },
  statNumber: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#6366f1'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b'
  },
  questionsContainer: {
    marginBottom: '30px'
  },
  questionsTitle: {
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: '20px'
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  questionCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  questionHeader: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    alignItems: 'center'
  },
  questionNumber: {
    background: '#6366f1',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  questionDifficulty: {
    background: '#10b981',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  questionCategory: {
    background: '#f59e0b',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  questionText: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '15px',
    lineHeight: 1.4
  },
  optionsPreview: {
    display: 'grid',
    gap: '8px',
    marginBottom: '15px'
  },
  optionPreview: {
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  correctMark: {
    color: '#16a34a',
    fontWeight: 'bold'
  },
  questionDetails: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '15px'
  },
  explanation: {
    marginBottom: '10px',
    padding: '10px',
    background: '#f0f9ff',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#1e293b'
  },
  learningTip: {
    marginBottom: '10px',
    padding: '10px',
    background: '#f0fdf4',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#1e293b'
  },
  aiHint: {
    padding: '10px',
    background: '#fef3c7',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#1e293b'
  },
  usageGuide: {
    background: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  guideTitle: {
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: '20px'
  },
  gameInstructions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  instruction: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    background: '#f8fafc',
    borderRadius: '12px'
  },
  instructionIcon: {
    fontSize: '2rem'
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

export default QuestionSetOverview;