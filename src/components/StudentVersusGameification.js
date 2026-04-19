import React, { useState, useEffect } from 'react';
import { versusQuestions as questions } from './VersusQuestions';
import GameResultsManager from '../utils/GameResultsManager';

const StudentVersusGameification = ({ player1, player2, onBack }) => {
  const [gameState, setGameState] = useState('setup'); // 'setup', 'ready', 'playing', 'result'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1Answer, setPlayer1Answer] = useState(null);
  const [player2Answer, setPlayer2Answer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [player1Streak, setPlayer1Streak] = useState(0);
  const [player2Streak, setPlayer2Streak] = useState(0);
  const [battleText, setBattleText] = useState('');
  const [roundResults, setRoundResults] = useState([]);
  const [gameStartTime, setGameStartTime] = useState(0);

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
    setBattleText("⏰ Time's up! Let's see the results!");
    setTimeout(() => {
      checkAnswers();
    }, 1000);
  };

  const startBattle = () => {
    setGameState('ready');
    setGameStartTime(Date.now());
    setBattleText('Get ready for battle! 3... 2... 1...');
    setTimeout(() => {
      setGameState('playing');
      setBattleText('Fight! Answer the question!');
      setTimeLeft(15);
    }, 3000);
  };

  const handleAnswer = (playerNum, answerIndex) => {
    if (showResult) return;

    if (playerNum === 1) {
      setPlayer1Answer(answerIndex);
    } else {
      setPlayer2Answer(answerIndex);
    }

    // Check if both players answered
    const bothAnswered = (playerNum === 1 && player2Answer !== null) || 
                        (playerNum === 2 && player1Answer !== null);
    
    if (bothAnswered) {
      setShowResult(true);
      setBattleText('Both players answered! Checking results...');
      setTimeout(() => {
        checkAnswers();
      }, 1000);
    }
  };

  const checkAnswers = () => {
    const question = questions[currentQuestion];
    const p1Correct = player1Answer === question.correct;
    const p2Correct = player2Answer === question.correct;

    let newP1Score = player1Score;
    let newP2Score = player2Score;
    let newP1Streak = player1Streak;
    let newP2Streak = player2Streak;
    let battleResult = '';

    // Score calculation
    if (p1Correct && !p2Correct) {
      newP1Score += 1;
      newP1Streak += 1;
      newP2Streak = 0;
      battleResult = `${player1?.name || 'Player 1'} wins this round! 🎉`;
    } else if (p2Correct && !p1Correct) {
      newP2Score += 1;
      newP2Streak += 1;
      newP1Streak = 0;
      battleResult = `${player2?.name || 'Player 2'} wins this round! 🎉`;
    } else if (p1Correct && p2Correct) {
      newP1Score += 1;
      newP2Score += 1;
      newP1Streak += 1;
      newP2Streak += 1;
      battleResult = "It's a tie! Both got it right! 🤝";
    } else {
      newP1Streak = 0;
      newP2Streak = 0;
      battleResult = "Both missed it! Better luck next time! 😅";
    }

    setPlayer1Score(newP1Score);
    setPlayer2Score(newP2Score);
    setPlayer1Streak(newP1Streak);
    setPlayer2Streak(newP2Streak);
    setBattleText(battleResult);

    // Store round result
    setRoundResults(prev => [...prev, {
      question: currentQuestion + 1,
      player1Correct: p1Correct,
      player2Correct: p2Correct,
      result: battleResult
    }]);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setPlayer1Answer(null);
      setPlayer2Answer(null);
      setShowResult(false);
      setTimeLeft(15);
      setBattleText('Next battle! Get ready!');
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameState('result');
    let finalResult = '';
    if (player1Score > player2Score) {
      finalResult = `🏆 ${player1?.name || 'Player 1'} WINS THE BATTLE!`;
    } else if (player2Score > player1Score) {
      finalResult = `🏆 ${player2?.name || 'Player 2'} WINS THE BATTLE!`;
    } else {
      finalResult = "🤝 IT'S A TIE! Both players fought well!";
    }
    setBattleText(finalResult);

    // Save versus battle results to leaderboard
    const gameData = {
      player1Name: player1?.name || 'Player 1',
      player2Name: player2?.name || 'Player 2',
      player1Score: player1Score,
      player2Score: player2Score,
      totalQuestions: questions.length,
      duration: Date.now() - gameStartTime,
      roundResults: roundResults
    };

    try {
      GameResultsManager.saveVersusResult(gameData);
      console.log('Versus battle result saved to leaderboard!');
    } catch (error) {
      console.error('Failed to save versus battle result:', error);
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentQuestion(0);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setPlayer1Answer(null);
    setPlayer2Answer(null);
    setShowResult(false);
    setPlayer1Streak(0);
    setPlayer2Streak(0);
    setBattleText('');
    setRoundResults([]);
    setTimeLeft(15);
  };

  // Setup Screen
  const renderSetup = () => (
    <div style={styles.setupContainer}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Gaming Hub
      </button>
      
      <div style={styles.setupHeader}>
        <h1 style={styles.title}>⚔️ STUDENT VERSUS BATTLE ⚔️</h1>
        <p style={styles.subtitle}>Two students enter, one champion emerges!</p>
      </div>

      <div style={styles.playersSetup}>
        <div style={styles.playerSetupCard}>
          <div style={styles.playerAvatar}>👨‍🎓</div>
          <h3 style={styles.playerName}>{player1?.name || 'Player 1'}</h3>
          <div style={styles.playerSide}>LEFT SIDE</div>
          <div style={styles.playerStats}>
            <div style={styles.statItem}>🎯 Ready to Fight!</div>
          </div>
        </div>

        <div style={styles.vsIndicator}>
          <div style={styles.vsText}>VS</div>
          <div style={styles.battleIcon}>⚔️</div>
        </div>

        <div style={styles.playerSetupCard}>
          <div style={styles.playerAvatar}>👩‍🎓</div>
          <h3 style={styles.playerName}>{player2?.name || 'Player 2'}</h3>
          <div style={styles.playerSide}>RIGHT SIDE</div>
          <div style={styles.playerStats}>
            <div style={styles.statItem}>🎯 Ready to Fight!</div>
          </div>
        </div>
      </div>

      <div style={styles.battleRules}>
        <h3 style={styles.rulesTitle}>⚡ Battle Rules</h3>
        <ul style={styles.rulesList}>
          <li>🕐 15 seconds per question</li>
          <li>🎯 First to answer correctly gets extra points</li>
          <li>🔥 Build streaks for bonus points</li>
          <li>🏆 Highest score wins the battle</li>
        </ul>
      </div>

      <button style={styles.startBattleBtn} onClick={startBattle}>
        🚀 START BATTLE!
      </button>
    </div>
  );

  // Ready Screen
  const renderReady = () => (
    <div style={styles.readyContainer}>
      <div style={styles.readyText}>
        <h2 style={styles.readyTitle}>⚔️ BATTLE STARTING ⚔️</h2>
        <div style={styles.countdown}>Get Ready!</div>
        <div style={styles.readyInstruction}>
          Position yourselves: Player 1 on LEFT, Player 2 on RIGHT
        </div>
      </div>
    </div>
  );

  // Game Battle Arena
  const renderBattle = () => {
    const question = questions[currentQuestion];
    
    return (
      <div style={styles.battleArena}>
        {/* Battle Header */}
        <div style={styles.battleHeader}>
          <div style={styles.battleInfo}>
            <div style={styles.questionCounter}>
              Question {currentQuestion + 1}/{questions.length}
            </div>
            <div style={styles.battleTimer}>
              <span style={{color: timeLeft <= 5 ? '#dc3545' : '#28a745'}}>
                ⏱️ {timeLeft}s
              </span>
            </div>
          </div>
          <div style={styles.battleStatusText}>{battleText}</div>
        </div>

        {/* Main Battle Arena */}
        <div style={styles.mainArena}>
          {/* Player 1 Side (LEFT) */}
          <div style={styles.playerSide}>
            <div style={styles.playerCard}>
              <div style={styles.playerHeader}>
                <div style={styles.playerPosition}>🔴 LEFT</div>
                <div style={styles.playerAvatar}>👨‍🎓</div>
                <h3 style={styles.playerNameBattle}>{player1?.name || 'Player 1'}</h3>
              </div>
              
              <div style={styles.playerStats}>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{player1Score}</div>
                  <div style={styles.statLabel}>Score</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{player1Streak}</div>
                  <div style={styles.statLabel}>Streak</div>
                </div>
              </div>

              <div style={styles.playerStatus}>
                {player1Answer !== null ? (
                  <div style={styles.answered}>✅ Answered!</div>
                ) : (
                  <div style={styles.waiting}>⏳ Thinking...</div>
                )}
              </div>
            </div>
          </div>

          {/* Question Area (CENTER) */}
          <div style={styles.questionSection}>
            <div style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <span style={styles.questionCategory}>
                  {question.question.match(/\[(.*?)\]/)?.[1] || 'General'}
                </span>
              </div>
              
              <h3 style={styles.questionText}>
                {question.question.replace(/\[.*?\]\s*/, '')}
              </h3>
              
              <div style={styles.optionsGrid}>
                {question.options.map((option, index) => (
                  <div key={index} style={styles.optionContainer}>
                    <div style={styles.optionLabel}>{String.fromCharCode(65 + index)}</div>
                    <div style={styles.optionButtons}>
                      <button
                        style={{
                          ...styles.playerOptionBtn,
                          ...styles.leftPlayerBtn,
                          ...(player1Answer === index ? styles.selectedLeft : {}),
                          ...(showResult && index === question.correct ? styles.correctOption : {}),
                          ...(showResult && player1Answer === index && index !== question.correct ? styles.wrongOption : {})
                        }}
                        onClick={() => handleAnswer(1, index)}
                        disabled={showResult || player1Answer !== null}
                      >
                        P1
                      </button>
                      
                      <div style={styles.optionText}>{option}</div>
                      
                      <button
                        style={{
                          ...styles.playerOptionBtn,
                          ...styles.rightPlayerBtn,
                          ...(player2Answer === index ? styles.selectedRight : {}),
                          ...(showResult && index === question.correct ? styles.correctOption : {}),
                          ...(showResult && player2Answer === index && index !== question.correct ? styles.wrongOption : {})
                        }}
                        onClick={() => handleAnswer(2, index)}
                        disabled={showResult || player2Answer !== null}
                      >
                        P2
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Result Section */}
              {showResult && (
                <div style={styles.resultSection}>
                  <div style={styles.answerExplanation}>
                    <h4 style={styles.explanationTitle}>📝 Explanation:</h4>
                    <p style={styles.explanationText}>{question.explanation}</p>
                  </div>
                  
                  <button style={styles.nextBtn} onClick={nextQuestion}>
                    {currentQuestion < questions.length - 1 ? '➡️ Next Battle' : '🏁 Final Results'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Player 2 Side (RIGHT) */}
          <div style={styles.playerSide}>
            <div style={styles.playerCard}>
              <div style={styles.playerHeader}>
                <div style={styles.playerPosition}>🔵 RIGHT</div>
                <div style={styles.playerAvatar}>👩‍🎓</div>
                <h3 style={styles.playerNameBattle}>{player2?.name || 'Player 2'}</h3>
              </div>
              
              <div style={styles.playerStats}>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{player2Score}</div>
                  <div style={styles.statLabel}>Score</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{player2Streak}</div>
                  <div style={styles.statLabel}>Streak</div>
                </div>
              </div>

              <div style={styles.playerStatus}>
                {player2Answer !== null ? (
                  <div style={styles.answered}>✅ Answered!</div>
                ) : (
                  <div style={styles.waiting}>⏳ Thinking...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Final Results
  const renderResults = () => (
    <div style={styles.resultsContainer}>
      <div style={styles.resultsHeader}>
        <h1 style={styles.resultsTitle}>🏆 BATTLE RESULTS 🏆</h1>
        <div style={styles.finalBattleText}>{battleText}</div>
      </div>

      <div style={styles.finalScore}>
        <div style={{
          ...styles.finalPlayerCard,
          ...(player1Score > player2Score ? styles.winner : player1Score === player2Score ? styles.tie : styles.loser)
        }}>
          <div style={styles.finalPlayerAvatar}>👨‍🎓</div>
          <h3 style={styles.finalPlayerName}>{player1?.name || 'Player 1'}</h3>
          <div style={styles.finalPlayerScore}>{player1Score}</div>
          <div style={styles.finalPlayerLabel}>Final Score</div>
          {player1Score > player2Score && <div style={styles.winnerBadge}>🏆 WINNER!</div>}
        </div>

        <div style={styles.finalVs}>VS</div>

        <div style={{
          ...styles.finalPlayerCard,
          ...(player2Score > player1Score ? styles.winner : player1Score === player2Score ? styles.tie : styles.loser)
        }}>
          <div style={styles.finalPlayerAvatar}>👩‍🎓</div>
          <h3 style={styles.finalPlayerName}>{player2?.name || 'Player 2'}</h3>
          <div style={styles.finalPlayerScore}>{player2Score}</div>
          <div style={styles.finalPlayerLabel}>Final Score</div>
          {player2Score > player1Score && <div style={styles.winnerBadge}>🏆 WINNER!</div>}
        </div>
      </div>

      <div style={styles.battleHistory}>
        <h3 style={styles.historyTitle}>📊 Battle History</h3>
        <div style={styles.historyList}>
          {roundResults.map((round, index) => (
            <div key={index} style={styles.historyItem}>
              <div style={styles.roundNumber}>Q{round.question}</div>
              <div style={styles.roundIcons}>
                <span style={round.player1Correct ? styles.correct : styles.incorrect}>
                  {round.player1Correct ? '✅' : '❌'}
                </span>
                <span style={round.player2Correct ? styles.correct : styles.incorrect}>
                  {round.player2Correct ? '✅' : '❌'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.resultsActions}>
        <button style={styles.backButtonSecondary} onClick={onBack}>
          ← Back to Hub
        </button>
        <button style={styles.rematchBtn} onClick={resetGame}>
          🔄 REMATCH
        </button>
        <button style={styles.newBattleBtn} onClick={() => window.location.reload()}>
          🆕 NEW BATTLE
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div style={styles.container}>
      {gameState === 'setup' && renderSetup()}
      {gameState === 'ready' && renderReady()}
      {gameState === 'playing' && renderBattle()}
      {gameState === 'result' && renderResults()}
    </div>
  );
};

// Comprehensive Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'Arial, sans-serif',
    padding: '20px'
  },

  // Setup Styles
  setupContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  setupHeader: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    margin: 0,
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '1.3rem',
    color: 'rgba(255,255,255,0.9)',
    margin: 0
  },
  playersSetup: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    marginBottom: '40px'
  },
  playerSetupCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    minWidth: '200px'
  },
  playerAvatar: {
    fontSize: '4rem',
    marginBottom: '15px'
  },
  playerName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0'
  },
  playerSide: {
    background: '#f0f9ff',
    color: '#0369a1',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    marginBottom: '15px'
  },
  playerStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  statItem: {
    fontSize: '0.9rem',
    color: '#666'
  },
  vsIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  vsText: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  battleIcon: {
    fontSize: '2rem'
  },
  battleRules: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    maxWidth: '500px'
  },
  rulesTitle: {
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px'
  },
  rulesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  startBattleBtn: {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
    color: 'white',
    border: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    padding: '20px 40px',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(238, 90, 82, 0.4)',
    transition: 'all 0.3s ease'
  },

  // Ready Styles
  readyContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  readyText: {
    textAlign: 'center',
    color: 'white'
  },
  readyTitle: {
    fontSize: '3rem',
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  countdown: {
    fontSize: '2rem',
    marginBottom: '20px'
  },
  readyInstruction: {
    fontSize: '1.2rem',
    opacity: 0.9
  },

  // Battle Arena Styles
  battleArena: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  battleHeader: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  battleInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginBottom: '15px'
  },
  questionCounter: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333'
  },
  battleTimer: {
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  battleStatusText: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333'
  },
  mainArena: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gap: '20px',
    alignItems: 'start'
  },
  playerSide: {
    display: 'flex',
    flexDirection: 'column'
  },
  playerCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  playerHeader: {
    marginBottom: '20px'
  },
  playerPosition: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    background: '#f0f9ff',
    color: '#0369a1'
  },
  playerNameBattle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '10px 0'
  },
  statBox: {
    display: 'inline-block',
    margin: '0 10px',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#666'
  },
  playerStatus: {
    marginTop: '15px'
  },
  answered: {
    color: '#28a745',
    fontWeight: 'bold'
  },
  waiting: {
    color: '#ffc107',
    fontWeight: 'bold'
  },

  // Question Styles
  questionSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  questionCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  questionHeader: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  questionCategory: {
    background: '#6366f1',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  },
  questionText: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '30px',
    lineHeight: '1.4'
  },
  optionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  optionContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  optionLabel: {
    background: '#6366f1',
    color: 'white',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    flexShrink: 0
  },
  optionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: 1
  },
  playerOptionBtn: {
    width: '50px',
    height: '40px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease'
  },
  leftPlayerBtn: {
    color: '#dc3545'
  },
  rightPlayerBtn: {
    color: '#007bff'
  },
  selectedLeft: {
    background: '#dc3545',
    color: 'white',
    borderColor: '#dc3545'
  },
  selectedRight: {
    background: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  },
  correctOption: {
    background: '#28a745',
    color: 'white',
    borderColor: '#28a745'
  },
  wrongOption: {
    background: '#dc3545',
    color: 'white',
    borderColor: '#dc3545'
  },
  optionText: {
    flex: 1,
    fontSize: '1rem',
    color: '#333',
    textAlign: 'center'
  },

  // Result Styles
  resultSection: {
    marginTop: '30px',
    paddingTop: '30px',
    borderTop: '2px solid #e5e7eb'
  },
  answerExplanation: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  },
  explanationTitle: {
    color: '#333',
    marginBottom: '10px'
  },
  explanationText: {
    color: '#666',
    lineHeight: '1.5',
    margin: 0
  },
  nextBtn: {
    background: 'linear-gradient(135deg, #28a745, #20c997)',
    color: 'white',
    border: 'none',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    padding: '15px 30px',
    borderRadius: '50px',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)'
  },

  // Final Results Styles
  resultsContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center'
  },
  resultsHeader: {
    marginBottom: '40px'
  },
  resultsTitle: {
    fontSize: '3rem',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    marginBottom: '20px'
  },
  finalBattleText: {
    fontSize: '1.5rem',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 'bold'
  },
  finalScore: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    marginBottom: '40px'
  },
  finalPlayerCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    minWidth: '200px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
  },
  winner: {
    border: '4px solid #ffd700',
    transform: 'scale(1.05)'
  },
  tie: {
    border: '4px solid #6c757d'
  },
  loser: {
    opacity: 0.8
  },
  finalPlayerAvatar: {
    fontSize: '3rem',
    marginBottom: '15px'
  },
  finalPlayerName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 15px 0'
  },
  finalPlayerScore: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px'
  },
  finalPlayerLabel: {
    fontSize: '1rem',
    color: '#666'
  },
  winnerBadge: {
    background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
    color: '#333',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  finalVs: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },

  // Battle History
  battleHistory: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px'
  },
  historyTitle: {
    color: '#333',
    marginBottom: '20px'
  },
  historyList: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  historyItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  roundNumber: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#666'
  },
  roundIcons: {
    display: 'flex',
    gap: '5px'
  },
  correct: {
    color: '#28a745'
  },
  incorrect: {
    color: '#dc3545'
  },

  // Action Buttons
  resultsActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px'
  },
  rematchBtn: {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
    color: 'white',
    border: 'none',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    padding: '15px 30px',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(238, 90, 82, 0.4)'
  },
  newBattleBtn: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    border: 'none',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    padding: '15px 30px',
    borderRadius: '50px',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
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

export default StudentVersusGameification;