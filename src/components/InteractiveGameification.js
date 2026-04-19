import React, { useState, useEffect } from 'react';
import { aiTeacherQuestions as questions } from './AITeacherQuestions';
import GameResultsManager from '../utils/GameResultsManager';

const InteractiveGameification = ({ user, onBack }) => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'result'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [teacherSpeaking, setTeacherSpeaking] = useState(false);
  const [studentSpeaking, setStudentSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameMode, setGameMode] = useState('friendly'); // 'friendly', 'competitive', 'learning'
  const [gameStartTime, setGameStartTime] = useState(0);
  
  // Get player name from user prop
  const playerName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.name || 'Student';

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, showResult]);

  const handleTimeUp = () => {
    setShowResult(true);
    addConversation('teacher', "⏰ Time's up! Let me show you the correct answer.");
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const addConversation = (speaker, message) => {
    setConversation(prev => [...prev, { speaker, message, timestamp: Date.now() }]);
    if (speaker === 'teacher') {
      setTeacherSpeaking(true);
      setTimeout(() => setTeacherSpeaking(false), 2000);
    } else {
      setStudentSpeaking(true);
      setTimeout(() => setStudentSpeaking(false), 2000);
    }
  };

  const startGame = (mode) => {
    setGameMode(mode);
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setGameStartTime(Date.now());
    setConversation([]);
    addConversation('teacher', `Welcome! Let's start with ${mode} mode. Ready for your first question?`);
  };

  const handleAnswer = (answerIndex) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;

    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      addConversation('student', "I think this is correct!");
      addConversation('teacher', "🎉 Excellent! You got it right!");
    } else {
      setStreak(0);
      addConversation('student', "Hmm, I'm not sure about this one...");
      addConversation('teacher', `❌ Not quite right. The correct answer is: ${question.options[question.correct]}`);
    }

    // Show explanation immediately
    setTimeout(() => {
      addConversation('teacher', question.explanation);
      
      // Add learning tip if available
      if (question.learningTip) {
        setTimeout(() => {
          addConversation('teacher', `💡 Learning Tip: ${question.learningTip}`);
        }, 2000);
      }
    }, 1000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
      addConversation('teacher', "Ready for the next challenge?");
    } else {
      setGameState('result');
      addConversation('teacher', `🎊 Game complete! Your final score: ${score}/${questions.length}`);
      
      // Save AI Teacher results to leaderboard
      const gameData = {
        playerName: playerName,
        score: score,
        totalQuestions: questions.length,
        timeSpent: Math.floor((Date.now() - gameStartTime) / 1000), // in seconds
        hintsUsed: 0, // Could track hints if implemented
        topicsCompleted: [gameMode],
        sessionData: {
          mode: gameMode,
          conversationLength: conversation.length,
          bestStreak: streak
        }
      };

      try {
        GameResultsManager.saveAITeacherResult(gameData);
        console.log('AI Teacher result saved to leaderboard!');
      } catch (error) {
        console.error('Failed to save AI teacher result:', error);
      }
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setConversation([]);
    setStreak(0);
    setTimeLeft(30);
  };

  // Game Menu
  const renderMenu = () => (
    <div style={styles.gameContainer}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Gaming Hub
      </button>
      
      <div style={styles.menuHeader}>
        <h1 style={styles.title}>🎮 Interactive Learning Arena</h1>
        <p style={styles.subtitle}>Learn with your AI teacher and compete with friends!</p>
      </div>

      <div style={styles.charactersPreview}>
        <div style={styles.character}>
          <div style={styles.teacherAvatar}>👨‍🏫</div>
          <p style={styles.characterName}>Professor Alex</p>
          <p style={styles.characterRole}>Your AI Teacher</p>
        </div>
        <div style={styles.vsText}>VS</div>
        <div style={styles.character}>
          <div style={styles.studentAvatar}>👨‍🎓</div>
          <p style={styles.characterName}>You</p>
          <p style={styles.characterRole}>The Student</p>
        </div>
      </div>

      <div style={styles.gameModes}>
        <div style={styles.modeCard} onClick={() => startGame('friendly')}>
          <div style={styles.modeIcon}>🤝</div>
          <h3 style={styles.modeTitle}>Friendly Mode</h3>
          <p style={styles.modeDesc}>Learn at your own pace with helpful hints</p>
        </div>
        <div style={styles.modeCard} onClick={() => startGame('competitive')}>
          <div style={styles.modeIcon}>⚡</div>
          <h3 style={styles.modeTitle}>Competitive Mode</h3>
          <p style={styles.modeDesc}>Timed challenges with streak bonuses</p>
        </div>
        <div style={styles.modeCard} onClick={() => startGame('learning')}>
          <div style={styles.modeIcon}>📚</div>
          <h3 style={styles.modeTitle}>Learning Mode</h3>
          <p style={styles.modeDesc}>Detailed explanations and step-by-step solutions</p>
        </div>
      </div>
    </div>
  );

  // Game Interface
  const renderGame = () => {
    const question = questions[currentQuestion];
    
    return (
      <div style={styles.gameArena}>
        {/* Game Header */}
        <div style={styles.gameHeader}>
          <div style={styles.gameStats}>
            <div style={styles.stat}>
              <span style={styles.statIcon}>🎯</span>
              <span>{currentQuestion + 1}/{questions.length}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statIcon}>⭐</span>
              <span>{score}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statIcon}>🔥</span>
              <span>{streak}</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statIcon}>⏱️</span>
              <span style={{color: timeLeft <= 10 ? '#dc3545' : '#28a745'}}>{timeLeft}s</span>
            </div>
          </div>
          <button style={styles.exitBtn} onClick={resetGame}>🏠 Menu</button>
        </div>

        {/* Characters Arena */}
        <div style={styles.arena}>
          {/* Teacher Side */}
          <div style={styles.teacherSide}>
            <div style={{
              ...styles.teacherCharacter,
              transform: teacherSpeaking ? 'scale(1.1)' : 'scale(1)',
              animation: teacherSpeaking ? 'bounce 0.5s ease-in-out' : 'none'
            }}>
              <div style={styles.teacherFace}>👨‍🏫</div>
              <div style={styles.characterLabel}>Professor Alex</div>
            </div>
            {teacherSpeaking && (
              <div style={styles.speechBubble}>
                {conversation[conversation.length - 1]?.speaker === 'teacher' && 
                 conversation[conversation.length - 1]?.message}
              </div>
            )}
          </div>

          {/* Question Area */}
          <div style={styles.questionArea}>
            <div style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <span style={styles.questionCategory}>{question.question.match(/\[(.*?)\]/)?.[1] || 'General'}</span>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`
                  }}></div>
                </div>
              </div>
              
              <h3 style={styles.questionText}>
                {question.question.replace(/\[.*?\]\s*/, '')}
              </h3>
              
              <div style={styles.optionsGrid}>
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    style={{
                      ...styles.optionBtn,
                      ...(selectedAnswer === index ? styles.selectedOption : {}),
                      ...(showResult && index === question.correct ? styles.correctOption : {}),
                      ...(showResult && selectedAnswer === index && index !== question.correct ? styles.wrongOption : {})
                    }}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                  >
                    <span style={styles.optionLetter}>{String.fromCharCode(65 + index)}</span>
                    <span style={styles.optionText}>{option}</span>
                  </button>
                ))}
              </div>

              {/* Answer Result and Next Button */}
              {showResult && (
                <div style={styles.resultSection}>
                  <div style={{
                    ...styles.answerResult,
                    backgroundColor: selectedAnswer === question.correct ? '#d4edda' : '#f8d7da',
                    borderColor: selectedAnswer === question.correct ? '#28a745' : '#dc3545',
                    color: selectedAnswer === question.correct ? '#155724' : '#721c24'
                  }}>
                    <div style={styles.resultIcon}>
                      {selectedAnswer === question.correct ? '✅' : '❌'}
                    </div>
                    <div style={styles.resultText}>
                      <h4 style={styles.resultTitle}>
                        {selectedAnswer === question.correct ? 'Correct!' : 'Incorrect!'}
                      </h4>
                      {selectedAnswer !== question.correct && (
                        <p style={styles.correctAnswerText}>
                          Correct Answer: <strong>{String.fromCharCode(65 + question.correct)}. {question.options[question.correct]}</strong>
                        </p>
                      )}
                      <p style={styles.explanationText}>
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  </div>

                  <button
                    style={styles.nextButton}
                    onClick={nextQuestion}
                  >
                    {currentQuestion < questions.length - 1 ? '➡️ Next Question' : '🏁 Finish Game'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Student Side */}
          <div style={styles.studentSide}>
            <div style={{
              ...styles.studentCharacter,
              transform: studentSpeaking ? 'scale(1.1)' : 'scale(1)',
              animation: studentSpeaking ? 'bounce 0.5s ease-in-out' : 'none'
            }}>
              <div style={styles.studentFace}>👨‍🎓</div>
              <div style={styles.characterLabel}>You</div>
            </div>
            {studentSpeaking && (
              <div style={styles.speechBubbleStudent}>
                {conversation[conversation.length - 1]?.speaker === 'student' && 
                 conversation[conversation.length - 1]?.message}
              </div>
            )}
          </div>
        </div>

        {/* Conversation Log */}
        <div style={styles.conversationLog}>
          {conversation.slice(-3).map((msg, index) => (
            <div key={index} style={{
              ...styles.conversationItem,
              alignSelf: msg.speaker === 'teacher' ? 'flex-start' : 'flex-end'
            }}>
              <span style={styles.speaker}>
                {msg.speaker === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
              </span>
              <span style={styles.message}>{msg.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Result Screen
  const renderResult = () => (
    <div style={styles.resultScreen}>
      <div style={styles.resultHeader}>
        <h2 style={styles.resultTitle}>🎉 Game Complete!</h2>
        <div style={styles.finalScore}>
          <span style={styles.scoreNumber}>{score}</span>
          <span style={styles.scoreTotal}>/{questions.length}</span>
        </div>
        <div style={styles.percentage}>
          {Math.round((score / questions.length) * 100)}% Correct
        </div>
      </div>

      <div style={styles.resultCharacters}>
        <div style={styles.resultTeacher}>
          <div style={styles.teacherFace}>👨‍🏫</div>
          <div style={styles.teacherComment}>
            {score >= questions.length * 0.8 ? "Outstanding performance! 🌟" :
             score >= questions.length * 0.6 ? "Good job! Keep practicing! 👍" :
             "Don't worry, practice makes perfect! 💪"}
          </div>
        </div>
      </div>

      <div style={styles.resultActions}>
        <button style={styles.backButtonSecondary} onClick={onBack}>
          ← Back to Hub
        </button>
        <button style={styles.playAgainBtn} onClick={resetGame}>
          🔄 Play Again
        </button>
        <button style={styles.menuBtn} onClick={resetGame}>
          🏠 Main Menu
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div style={styles.container}>
      {gameState === 'menu' && renderMenu()}
      {gameState === 'playing' && renderGame()}
      {gameState === 'result' && renderResult()}
    </div>
  );
};

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif'
  },
  gameContainer: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  menuHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '3rem',
    color: 'white',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '0'
  },
  charactersPreview: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    marginBottom: '40px'
  },
  character: {
    textAlign: 'center',
    color: 'white'
  },
  teacherAvatar: {
    fontSize: '4rem',
    marginBottom: '10px',
    animation: 'float 3s ease-in-out infinite'
  },
  studentAvatar: {
    fontSize: '4rem',
    marginBottom: '10px',
    animation: 'float 3s ease-in-out infinite reverse'
  },
  characterName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '5px 0'
  },
  characterRole: {
    fontSize: '0.9rem',
    opacity: 0.8,
    margin: '0'
  },
  vsText: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffd700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  },
  gameModes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '40px'
  },
  modeCard: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white'
  },
  modeIcon: {
    fontSize: '3rem',
    marginBottom: '15px'
  },
  modeTitle: {
    fontSize: '1.5rem',
    marginBottom: '10px',
    color: 'white'
  },
  modeDesc: {
    fontSize: '1rem',
    opacity: 0.9,
    lineHeight: '1.5'
  },
  gameArena: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  gameHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '15px 25px'
  },
  gameStats: {
    display: 'flex',
    gap: '30px'
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 'bold'
  },
  statIcon: {
    fontSize: '1.3rem'
  },
  exitBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  arena: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gap: '20px',
    alignItems: 'start',
    marginBottom: '20px'
  },
  teacherSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  studentSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  teacherCharacter: {
    textAlign: 'center',
    transition: 'all 0.3s ease'
  },
  studentCharacter: {
    textAlign: 'center',
    transition: 'all 0.3s ease'
  },
  teacherFace: {
    fontSize: '5rem',
    marginBottom: '10px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
  },
  studentFace: {
    fontSize: '5rem',
    marginBottom: '10px',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
  },
  characterLabel: {
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
  },
  speechBubble: {
    background: 'white',
    borderRadius: '20px',
    padding: '15px',
    marginTop: '15px',
    maxWidth: '200px',
    position: 'relative',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    fontSize: '0.9rem',
    lineHeight: '1.4'
  },
  speechBubbleStudent: {
    background: '#007bff',
    color: 'white',
    borderRadius: '20px',
    padding: '15px',
    marginTop: '15px',
    maxWidth: '200px',
    position: 'relative',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    fontSize: '0.9rem',
    lineHeight: '1.4'
  },
  questionArea: {
    display: 'flex',
    justifyContent: 'center'
  },
  questionCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '600px'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  questionCategory: {
    background: '#007bff',
    color: 'white',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  progressBar: {
    width: '200px',
    height: '8px',
    background: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: '#28a745',
    transition: 'width 0.3s ease'
  },
  questionText: {
    fontSize: '1.3rem',
    lineHeight: '1.5',
    marginBottom: '25px',
    color: '#333'
  },
  optionsGrid: {
    display: 'grid',
    gap: '15px'
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 20px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '1rem'
  },
  selectedOption: {
    borderColor: '#007bff',
    background: '#f0f8ff'
  },
  correctOption: {
    borderColor: '#28a745',
    background: '#f0fff0'
  },
  wrongOption: {
    borderColor: '#dc3545',
    background: '#fff0f0'
  },
  optionLetter: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  },
  optionText: {
    flex: 1,
    textAlign: 'left'
  },
  resultSection: {
    marginTop: '25px',
    textAlign: 'center'
  },
  answerResult: {
    border: '2px solid',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    textAlign: 'left'
  },
  resultIcon: {
    fontSize: '2rem',
    minWidth: '40px'
  },
  resultText: {
    flex: 1
  },
  resultTitle: {
    margin: '0 0 10px 0',
    fontSize: '1.3rem'
  },
  correctAnswerText: {
    margin: '5px 0',
    fontSize: '1rem'
  },
  explanationText: {
    margin: '10px 0 0 0',
    fontSize: '0.95rem',
    lineHeight: '1.4'
  },
  nextButton: {
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 30px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
  },
  conversationLog: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '20px',
    maxHeight: '150px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    maxWidth: '80%'
  },
  speaker: {
    fontSize: '1.5rem'
  },
  message: {
    background: 'rgba(255,255,255,0.9)',
    padding: '8px 12px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    lineHeight: '1.3'
  },
  resultScreen: {
    padding: '40px',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto'
  },
  resultHeader: {
    marginBottom: '40px'
  },
  resultTitle: {
    fontSize: '2.5rem',
    color: 'white',
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  finalScore: {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: '#ffd700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
    marginBottom: '10px'
  },
  scoreNumber: {
    fontSize: '5rem'
  },
  scoreTotal: {
    fontSize: '3rem',
    opacity: 0.8
  },
  percentage: {
    fontSize: '1.5rem',
    color: 'white',
    opacity: 0.9
  },
  resultCharacters: {
    marginBottom: '40px'
  },
  resultTeacher: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  teacherComment: {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  resultActions: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center'
  },
  playAgainBtn: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 30px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  menuBtn: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 30px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  // Back Button Styles
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    fontSize: '1rem',
    fontWeight: 'bold',
    padding: '12px 20px',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
  },
  backButtonSecondary: {
    background: 'linear-gradient(135deg, #6c757d, #5a6268)',
    color: 'white',
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    padding: '12px 24px',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(108, 117, 125, 0.4)',
    transition: 'all 0.3s ease'
  }
};

export default InteractiveGameification;
