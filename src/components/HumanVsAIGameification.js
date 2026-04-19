import React, { useState, useEffect } from 'react';
import { aiBattleQuestions as questions } from './AIBattleQuestions';
import GameResultsManager from '../utils/GameResultsManager';

const HumanVsAIGameification = ({ player, onBack }) => {
  const [gameState, setGameState] = useState('setup'); // 'setup', 'ready', 'playing', 'result'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [humanScore, setHumanScore] = useState(0);
  const [aiScore, setAIScore] = useState(0);
  const [humanAnswer, setHumanAnswer] = useState(null);
  const [aiAnswer, setAIAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [humanStreak, setHumanStreak] = useState(0);
  const [aiStreak, setAIStreak] = useState(0);
  const [battleText, setBattleText] = useState('');
  const [roundResults, setRoundResults] = useState([]);
  const [aiThinking, setAIThinking] = useState(false);
  const [aiPersonality, setAIPersonality] = useState('friendly'); // 'friendly', 'competitive', 'genius'
  const [aiResponseTime, setAIResponseTime] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);

  // AI Personalities
  const AI_PERSONALITIES = {
    friendly: {
      name: 'Alex AI',
      avatar: '🤖',
      responses: {
        correct: ['Nice work! I got it too! 🎯', 'Great minds think alike! 🧠', 'We both nailed it! ⭐'],
        wrong: ['Oops, I missed that one! 😅', 'You got me there! 🤯', 'Darn, I was overthinking! 🤦‍♂️'],
        win: ['I got this one! 🎉', 'My circuits are firing! ⚡', 'Processing... Success! 💫'],
        encourage: ['You\'ll get the next one! 💪', 'Keep going! 🚀', 'I believe in you! ⭐']
      },
      accuracy: 0.75, // 75% accuracy
      responseTimeMin: 2000,
      responseTimeMax: 4000
    },
    competitive: {
      name: 'Bolt AI',
      avatar: '⚡',
      responses: {
        correct: ['Too easy! ⚡', 'My processors are superior! 🔥', 'Victory is mine! 👑'],
        wrong: ['Impossible! Recalculating... 🤯', 'My data was corrupted! 😤', 'This won\'t happen again! ⚔️'],
        win: ['Another point for Team AI! 🏆', 'Humans vs Machines: AI leads! 🤖', 'My algorithms are unbeatable! 💪'],
        encourage: ['Is that all you got? 😏', 'Try to keep up! ⚡', 'I\'m just getting started! 🔥']
      },
      accuracy: 0.85, // 85% accuracy  
      responseTimeMin: 1000,
      responseTimeMax: 2500
    },
    genius: {
      name: 'Einstein AI',
      avatar: '🧠',
      responses: {
        correct: ['Elementary! 🧠', 'As predicted by my calculations 📊', 'Logic prevails! 🎯'],
        wrong: ['Interesting... an edge case! 🤔', 'My neural networks need adjustment 🔧', 'Fascinating error pattern! 📚'],
        win: ['Probability of success: 99.7% ✨', 'Knowledge is power! 📖', 'My database serves me well! 💎'],
        encourage: ['Analyze the patterns, human! 🔍', 'Think logically! 🧩', 'Use your neural pathways! 🧠']
      },
      accuracy: 0.90, // 90% accuracy
      responseTimeMin: 1500,
      responseTimeMax: 3000
    }
  };

  const currentAI = AI_PERSONALITIES[aiPersonality];

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
    if (humanAnswer === null) {
      setHumanAnswer(-1); // Timeout answer
    }
    if (!aiThinking && aiAnswer === null) {
      generateAIAnswer();
    }
    setShowResult(true);
    setBattleText("⏰ Time's up! Let's see the results!");
    setTimeout(() => {
      checkAnswers();
    }, 1000);
  };

  const startBattle = (personality) => {
    setAIPersonality(personality);
    setGameState('ready');
    setGameStartTime(Date.now());
    setBattleText(`Get ready to battle ${AI_PERSONALITIES[personality].name}! 3... 2... 1...`);
    setTimeout(() => {
      setGameState('playing');
      setBattleText('🔥 BATTLE STARTED! Answer the question!');
      setTimeLeft(15);
    }, 3000);
  };

  const generateAIAnswer = () => {
    const question = questions[currentQuestion];
    const ai = currentAI;
    
    // Calculate AI response time
    const responseTime = Math.random() * (ai.responseTimeMax - ai.responseTimeMin) + ai.responseTimeMin;
    setAIResponseTime(responseTime);
    
    // Determine if AI gets it right based on accuracy
    const willBeCorrect = Math.random() < ai.accuracy;
    
    setTimeout(() => {
      setAIThinking(true);
      
      setTimeout(() => {
        let aiChoice;
        if (willBeCorrect) {
          aiChoice = question.correct;
        } else {
          // AI chooses wrong answer
          const wrongOptions = [0, 1, 2, 3].filter(i => i !== question.correct);
          aiChoice = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }
        
        setAIAnswer(aiChoice);
        setAIThinking(false);
        
        // If human already answered, show results
        if (humanAnswer !== null) {
          setShowResult(true);
          setTimeout(() => {
            checkAnswers();
          }, 1000);
        }
      }, 800); // AI thinking animation time
    }, responseTime);
  };

  const handleHumanAnswer = (answerIndex) => {
    if (showResult || humanAnswer !== null) return;

    setHumanAnswer(answerIndex);
    setBattleText('🤖 AI is processing your move...');
    
    // Generate AI answer if not already generated
    if (aiAnswer === null && !aiThinking) {
      generateAIAnswer();
    }
    
    // Check if both answered
    if (aiAnswer !== null) {
      setShowResult(true);
      setTimeout(() => {
        checkAnswers();
      }, 1000);
    }
  };

  const checkAnswers = () => {
    const question = questions[currentQuestion];
    const humanCorrect = humanAnswer === question.correct;
    const aiCorrect = aiAnswer === question.correct;

    let newHumanScore = humanScore;
    let newAIScore = aiScore;
    let newHumanStreak = humanStreak;
    let newAIStreak = aiStreak;
    let battleResult = '';
    let aiResponse = '';

    // Score calculation
    if (humanCorrect && !aiCorrect) {
      newHumanScore += 1;
      newHumanStreak += 1;
      newAIStreak = 0;
      battleResult = `🎉 You win this round!`;
      aiResponse = currentAI.responses.wrong[Math.floor(Math.random() * currentAI.responses.wrong.length)];
    } else if (aiCorrect && !humanCorrect) {
      newAIScore += 1;
      newAIStreak += 1;
      newHumanStreak = 0;
      battleResult = `🤖 ${currentAI.name} wins this round!`;
      // Use AI hint from question or fallback to personality response
      aiResponse = question.aiHint || currentAI.responses.win[Math.floor(Math.random() * currentAI.responses.win.length)];
    } else if (humanCorrect && aiCorrect) {
      newHumanScore += 1;
      newAIScore += 1;
      newHumanStreak += 1;
      newAIStreak += 1;
      battleResult = "🤝 It's a tie! Both correct!";
      // Use AI hint when both are correct
      aiResponse = question.aiHint || currentAI.responses.correct[Math.floor(Math.random() * currentAI.responses.correct.length)];
    } else {
      newHumanStreak = 0;
      newAIStreak = 0;
      battleResult = "😅 Both missed it!";
      aiResponse = "Well, that was unexpected! 🤖";
    }

    setHumanScore(newHumanScore);
    setAIScore(newAIScore);
    setHumanStreak(newHumanStreak);
    setAIStreak(newAIStreak);
    setBattleText(`${battleResult}\n🤖 ${currentAI.name}: "${aiResponse}"`);

    // Store round result
    setRoundResults(prev => [...prev, {
      question: currentQuestion + 1,
      humanCorrect,
      aiCorrect,
      result: battleResult,
      aiResponse,
      aiResponseTime: Math.round(aiResponseTime / 1000 * 10) / 10
    }]);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setHumanAnswer(null);
      setAIAnswer(null);
      setShowResult(false);
      setTimeLeft(15);
      setAIThinking(false);
      setBattleText('🚀 Next battle incoming!');
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameState('result');
    let finalResult = '';
    let aiEndResponse = '';
    
    if (humanScore > aiScore) {
      finalResult = `🏆 HUMAN VICTORY! You defeated ${currentAI.name}!`;
      aiEndResponse = "Well played, human! You have impressed my circuits! 🤖⚡";
    } else if (aiScore > humanScore) {
      finalResult = `🤖 AI VICTORY! ${currentAI.name} wins!`;
      aiEndResponse = currentAI.responses.win[Math.floor(Math.random() * currentAI.responses.win.length)];
    } else {
      finalResult = "🤝 EPIC TIE! Humans and AI are equally matched!";
      aiEndResponse = "A worthy opponent indeed! Humans are more capable than my initial calculations! 🤝";
    }
    
    setBattleText(`${finalResult}\n\n🤖 ${currentAI.name}: "${aiEndResponse}"`);

    // Save game results to leaderboard
    const gameData = {
      playerName: player?.name || 'Player',
      aiOpponent: currentAI.name,
      playerScore: humanScore,
      aiScore: aiScore,
      totalQuestions: questions.length,
      aiAccuracy: currentAI.accuracy,
      duration: Date.now() - gameStartTime,
      roundResults: roundResults
    };

    try {
      GameResultsManager.saveAIBattleResult(gameData);
      console.log('AI Battle result saved to leaderboard!');
    } catch (error) {
      console.error('Failed to save AI battle result:', error);
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentQuestion(0);
    setHumanScore(0);
    setAIScore(0);
    setHumanAnswer(null);
    setAIAnswer(null);
    setShowResult(false);
    setHumanStreak(0);
    setAIStreak(0);
    setBattleText('');
    setRoundResults([]);
    setTimeLeft(15);
    setAIThinking(false);
  };

  // Setup Screen
  const renderSetup = () => (
    <div style={styles.setupContainer}>
      {/* Back Button */}
      <button style={styles.backButton} onClick={onBack}>
        ← Back to Gaming Hub
      </button>
      
      <div style={styles.setupHeader}>
        <h1 style={styles.title}>🤖 HUMAN vs AI BATTLE 🤖</h1>
        <p style={styles.subtitle}>Challenge artificial intelligence! Can you outthink the machine?</p>
      </div>

      <div style={styles.opponentSelection}>
        <h3 style={styles.selectionTitle}>Choose Your AI Opponent:</h3>
        <div style={styles.aiOptions}>
          {Object.entries(AI_PERSONALITIES).map(([key, ai]) => (
            <div key={key} style={styles.aiCard} onClick={() => startBattle(key)}>
              <div style={styles.aiAvatar}>{ai.avatar}</div>
              <h3 style={styles.aiName}>{ai.name}</h3>
              <div style={styles.aiStats}>
                <div style={styles.aiAccuracy}>Accuracy: {Math.round(ai.accuracy * 100)}%</div>
                <div style={styles.aiSpeed}>
                  Speed: {ai.responseTimeMin/1000}-{ai.responseTimeMax/1000}s
                </div>
              </div>
              <div style={styles.aiPersonality}>
                {key === 'friendly' && '😊 Encouraging & Fun'}
                {key === 'competitive' && '⚡ Fast & Aggressive'}
                {key === 'genius' && '🧠 Smart & Analytical'}
              </div>
              <div style={styles.selectButton}>Battle This AI!</div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.battlePreview}>
        <div style={styles.playerPreviewCard}>
          <div style={styles.playerAvatar}>👨‍🎓</div>
          <h3 style={styles.playerName}>{player?.name || 'You'}</h3>
          <div style={styles.playerSide}>🔴 HUMAN SIDE</div>
        </div>
        
        <div style={styles.vsIndicator}>
          <div style={styles.vsText}>VS</div>
          <div style={styles.battleIcon}>⚔️</div>
        </div>
        
        <div style={styles.playerPreviewCard}>
          <div style={styles.playerAvatar}>🤖</div>
          <h3 style={styles.playerName}>AI Opponent</h3>
          <div style={styles.playerSide}>🔵 AI SIDE</div>
        </div>
      </div>
    </div>
  );

  // Ready Screen
  const renderReady = () => (
    <div style={styles.readyContainer}>
      <div style={styles.readyText}>
        <h2 style={styles.readyTitle}>⚔️ INITIALIZING BATTLE ⚔️</h2>
        <div style={styles.countdown}>Preparing to face {currentAI.name}...</div>
        <div style={styles.aiReadyMessage}>
          🤖 {currentAI.name}: "Let's see what you've got, human!"
        </div>
      </div>
    </div>
  );

  // Battle Arena
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
          {/* Human Side (LEFT) */}
          <div style={styles.playerSide}>
            <div style={styles.playerCard}>
              <div style={styles.playerHeader}>
                <div style={styles.playerPosition}>🔴 HUMAN</div>
                <div style={styles.playerAvatar}>👨‍🎓</div>
                <h3 style={styles.playerNameBattle}>{player?.name || 'You'}</h3>
              </div>
              
              <div style={styles.playerStats}>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{humanScore}</div>
                  <div style={styles.statLabel}>Score</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{humanStreak}</div>
                  <div style={styles.statLabel}>Streak</div>
                </div>
              </div>

              <div style={styles.playerStatus}>
                {humanAnswer !== null ? (
                  <div style={styles.answered}>✅ Answered!</div>
                ) : (
                  <div style={styles.waiting}>🤔 Your turn...</div>
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
                          ...styles.humanOptionBtn,
                          ...(humanAnswer === index ? styles.selectedHuman : {}),
                          ...(showResult && index === question.correct ? styles.correctOption : {}),
                          ...(showResult && humanAnswer === index && index !== question.correct ? styles.wrongOption : {})
                        }}
                        onClick={() => handleHumanAnswer(index)}
                        disabled={showResult || humanAnswer !== null}
                      >
                        YOU
                      </button>
                      
                      <div style={styles.optionText}>{option}</div>
                      
                      <div style={{
                        ...styles.aiOptionDisplay,
                        ...(aiAnswer === index ? styles.selectedAI : {}),
                        ...(showResult && index === question.correct ? styles.correctOption : {}),
                        ...(showResult && aiAnswer === index && index !== question.correct ? styles.wrongOption : {})
                      }}>
                        {aiThinking ? '🤖⚡' : aiAnswer === index ? '🤖✓' : '🤖'}
                      </div>
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

          {/* AI Side (RIGHT) */}
          <div style={styles.playerSide}>
            <div style={styles.playerCard}>
              <div style={styles.playerHeader}>
                <div style={styles.playerPosition}>🔵 AI</div>
                <div style={styles.playerAvatar}>{currentAI.avatar}</div>
                <h3 style={styles.playerNameBattle}>{currentAI.name}</h3>
              </div>
              
              <div style={styles.playerStats}>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{aiScore}</div>
                  <div style={styles.statLabel}>Score</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statValue}>{aiStreak}</div>
                  <div style={styles.statLabel}>Streak</div>
                </div>
              </div>

              <div style={styles.playerStatus}>
                {aiThinking ? (
                  <div style={styles.thinking}>🤖 Processing...</div>
                ) : aiAnswer !== null ? (
                  <div style={styles.answered}>✅ Computed!</div>
                ) : (
                  <div style={styles.waiting}>⚡ Analyzing...</div>
                )}
              </div>

              {/* AI Response Time */}
              {showResult && (
                <div style={styles.aiResponseInfo}>
                  Response: {Math.round(aiResponseTime / 1000 * 10) / 10}s
                </div>
              )}
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
          ...(humanScore > aiScore ? styles.winner : humanScore === aiScore ? styles.tie : styles.loser)
        }}>
          <div style={styles.finalPlayerAvatar}>👨‍🎓</div>
          <h3 style={styles.finalPlayerName}>{player?.name || 'You'}</h3>
          <div style={styles.finalPlayerScore}>{humanScore}</div>
          <div style={styles.finalPlayerLabel}>Final Score</div>
          {humanScore > aiScore && <div style={styles.winnerBadge}>🏆 HUMAN WINS!</div>}
        </div>

        <div style={styles.finalVs}>VS</div>

        <div style={{
          ...styles.finalPlayerCard,
          ...(aiScore > humanScore ? styles.winner : humanScore === aiScore ? styles.tie : styles.loser)
        }}>
          <div style={styles.finalPlayerAvatar}>{currentAI.avatar}</div>
          <h3 style={styles.finalPlayerName}>{currentAI.name}</h3>
          <div style={styles.finalPlayerScore}>{aiScore}</div>
          <div style={styles.finalPlayerLabel}>Final Score</div>
          {aiScore > humanScore && <div style={styles.winnerBadge}>🏆 AI WINS!</div>}
        </div>
      </div>

      <div style={styles.battleHistory}>
        <h3 style={styles.historyTitle}>📊 Battle History</h3>
        <div style={styles.historyList}>
          {roundResults.map((round, index) => (
            <div key={index} style={styles.historyItem}>
              <div style={styles.roundNumber}>Q{round.question}</div>
              <div style={styles.roundIcons}>
                <span style={round.humanCorrect ? styles.correct : styles.incorrect}>
                  {round.humanCorrect ? '✅' : '❌'}
                </span>
                <span style={round.aiCorrect ? styles.correct : styles.incorrect}>
                  {round.aiCorrect ? '✅' : '❌'}
                </span>
              </div>
              <div style={styles.aiResponseTimeDisplay}>
                AI: {round.aiResponseTime}s
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
        <button style={styles.newOpponentBtn} onClick={resetGame}>
          🤖 CHANGE AI
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

// Styles (similar to the previous component but with AI-specific modifications)
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
  
  // AI Selection
  opponentSelection: {
    marginBottom: '40px',
    width: '100%'
  },
  selectionTitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: '1.5rem',
    marginBottom: '30px'
  },
  aiOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px'
  },
  aiCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
  },
  aiAvatar: {
    fontSize: '4rem',
    marginBottom: '15px'
  },
  aiName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '15px'
  },
  aiStats: {
    marginBottom: '15px'
  },
  aiAccuracy: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '5px'
  },
  aiSpeed: {
    fontSize: '0.9rem',
    color: '#666'
  },
  aiPersonality: {
    background: '#f0f9ff',
    color: '#0369a1',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    marginBottom: '20px'
  },
  selectButton: {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: 'bold'
  },

  // Battle Preview
  battlePreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    marginBottom: '40px'
  },
  playerPreviewCard: {
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center',
    minWidth: '150px'
  },
  playerAvatar: {
    fontSize: '3rem',
    marginBottom: '10px'
  },
  playerName: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0'
  },
  playerSide: {
    background: '#f0f9ff',
    color: '#0369a1',
    padding: '6px 12px',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: 'bold'
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

  // Ready Screen
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
  aiReadyMessage: {
    fontSize: '1.2rem',
    opacity: 0.9,
    fontStyle: 'italic'
  },

  // Battle Arena
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
    color: '#333',
    whiteSpace: 'pre-line'
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
  playerStats: {
    marginBottom: '15px'
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
  thinking: {
    color: '#6366f1',
    fontWeight: 'bold',
    animation: 'pulse 1s infinite'
  },
  aiResponseInfo: {
    fontSize: '0.8rem',
    color: '#666',
    marginTop: '10px'
  },

  // Question Section
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
  humanOptionBtn: {
    width: '60px',
    height: '40px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    transition: 'all 0.3s ease',
    color: '#dc3545'
  },
  selectedHuman: {
    background: '#dc3545',
    color: 'white',
    borderColor: '#dc3545'
  },
  aiOptionDisplay: {
    width: '60px',
    height: '40px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    color: '#007bff',
    flexShrink: 0
  },
  selectedAI: {
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

  // Results
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

  // Final Results
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
    fontSize: '1.3rem',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: 'bold',
    whiteSpace: 'pre-line'
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
    gap: '8px',
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '12px'
  },
  roundNumber: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#666'
  },
  roundIcons: {
    display: 'flex',
    gap: '10px'
  },
  correct: {
    color: '#28a745'
  },
  incorrect: {
    color: '#dc3545'
  },
  aiResponseTimeDisplay: {
    fontSize: '0.7rem',
    color: '#666'
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
  newOpponentBtn: {
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

export default HumanVsAIGameification;