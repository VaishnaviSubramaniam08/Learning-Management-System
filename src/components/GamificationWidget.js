// GamificationWidget.js
import React, { useState, useEffect } from "react";
import { Gamification, questions } from "./Gamification";

const GamificationWidget = () => {
    const [gameMode, setGameMode] = useState('menu'); // 'menu', 'quiz', 'completed'
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [quiz] = useState(new Gamification(handleUpdate));
    const [currentQ, setCurrentQ] = useState(quiz.getCurrentQuestion());
    const [feedback, setFeedback] = useState(null);
    const [score, setScore] = useState(0);
    const [quizOver, setQuizOver] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [badges, setBadges] = useState([]);
    const [percentage, setPercentage] = useState(0);
    const [progress, setProgress] = useState(quiz.getProgress());
    const [timeLeft, setTimeLeft] = useState(30);
    const [timerActive, setTimerActive] = useState(false);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);

    function handleUpdate(update) {
        if (update.answered !== undefined) {
            setAnswered(update.answered);
        }
        if (update.isCorrect !== undefined) {
            setIsCorrect(update.isCorrect);
            setFeedback(update.explanation);
            setScore(update.score);
            setSelectedAnswer(update.selectedAnswer);
            setCorrectAnswer(update.correctAnswer);
        }
        if (update.nextQuestion) {
            setCurrentQ(quiz.getCurrentQuestion());
            setFeedback(null);
            setAnswered(false);
            setSelectedAnswer(null);
            setCorrectAnswer(null);
            setIsCorrect(null);
            setProgress(quiz.getProgress());
        }
        if (update.quizOver) {
            setQuizOver(true);
            setBadges(update.badges || []);
            setPercentage(update.percentage || 0);
        }
    }

    const handleAnswer = (index) => {
        if (!answered) {
            quiz.answerQuestion(index);
        }
    };

    const handleNext = () => {
        quiz.nextQuestion();
    };

    const handleRestart = () => {
        quiz.reset();
        setCurrentQ(quiz.getCurrentQuestion());
        setFeedback(null);
        setScore(0);
        setQuizOver(false);
        setAnswered(false);
        setSelectedAnswer(null);
        setCorrectAnswer(null);
        setIsCorrect(null);
        setBadges([]);
        setPercentage(0);
        setProgress(quiz.getProgress());
        setGameMode('menu');
        setStreak(0);
        setTotalPoints(0);
    };

    const startGame = (category = 'all') => {
        setSelectedCategory(category);
        setGameMode('quiz');
        setTimerActive(true);
        setTimeLeft(30);
    };

    const categories = [
        { id: 'all', name: 'All Topics', icon: '🎯', color: '#007bff', description: 'Mixed questions from all subjects' },
        { id: 'placement', name: 'Placement Prep', icon: '💼', color: '#28a745', description: 'Coding, logical, and quantitative questions' },
        { id: 'jee', name: 'JEE Preparation', icon: '🔬', color: '#dc3545', description: 'Physics, Chemistry, and Mathematics' },
        { id: 'neet', name: 'NEET Preparation', icon: '🧬', color: '#6f42c1', description: 'Biology, Chemistry, and Physics' },
        { id: 'competitive', name: 'Competitive Exams', icon: '🏆', color: '#fd7e14', description: 'General knowledge and reasoning' }
    ];

    // Game Menu Interface
    const renderGameMenu = () => (
        <div style={styles.gameMenu}>
            <div style={styles.menuHeader}>
                <h2 style={styles.menuTitle}>🎮 Learning Games</h2>
                <p style={styles.menuSubtitle}>Choose your challenge and test your knowledge!</p>
            </div>

            <div style={styles.statsBar}>
                <div style={styles.statItem}>
                    <span style={styles.statIcon}>🏆</span>
                    <span style={styles.statLabel}>Best Score</span>
                    <span style={styles.statValue}>{maxStreak}</span>
                </div>
                <div style={styles.statItem}>
                    <span style={styles.statIcon}>⚡</span>
                    <span style={styles.statLabel}>Total Points</span>
                    <span style={styles.statValue}>{totalPoints}</span>
                </div>
                <div style={styles.statItem}>
                    <span style={styles.statIcon}>🎯</span>
                    <span style={styles.statLabel}>Games Played</span>
                    <span style={styles.statValue}>{badges.length}</span>
                </div>
            </div>

            <div style={styles.categoryGrid}>
                {categories.map(category => (
                    <div
                        key={category.id}
                        style={{...styles.categoryCard, borderColor: category.color}}
                        onClick={() => startGame(category.id)}
                    >
                        <div style={styles.categoryIcon}>{category.icon}</div>
                        <h3 style={{...styles.categoryName, color: category.color}}>{category.name}</h3>
                        <p style={styles.categoryDesc}>{category.description}</p>
                        <button style={{...styles.playButton, backgroundColor: category.color}}>
                            🎮 Play Now
                        </button>
                    </div>
                ))}
            </div>

            <div style={styles.gameFeatures}>
                <h3 style={styles.featuresTitle}>🌟 Game Features</h3>
                <div style={styles.featuresList}>
                    <div style={styles.feature}>
                        <span style={styles.featureIcon}>⏱️</span>
                        <span>Timed Challenges</span>
                    </div>
                    <div style={styles.feature}>
                        <span style={styles.featureIcon}>🔥</span>
                        <span>Streak System</span>
                    </div>
                    <div style={styles.feature}>
                        <span style={styles.featureIcon}>🏅</span>
                        <span>Achievement Badges</span>
                    </div>
                    <div style={styles.feature}>
                        <span style={styles.featureIcon}>📊</span>
                        <span>Performance Analytics</span>
                    </div>
                </div>
            </div>
        </div>
    );

    // Game mode routing
    if (gameMode === 'menu') {
        return renderGameMenu();
    }

    if (quizOver) {
        return (
            <div style={styles.completionWidget}>
                <div style={styles.completionHeader}>
                    <h2 style={styles.completionTitle}>🎉 Quiz Completed!</h2>
                    <div style={styles.scoreDisplay}>
                        <div style={styles.finalScore}>{score}/{questions.length}</div>
                        <div style={styles.percentage}>{percentage.toFixed(1)}%</div>
                    </div>
                </div>

                <div style={styles.performanceMessage}>
                    {quiz.getPerformanceMessage(percentage)}
                </div>

                {badges.length > 0 && (
                    <div style={styles.badgeSection}>
                        <h3 style={styles.badgeTitle}>🏆 Badges Earned</h3>
                        <div style={styles.badgeContainer}>
                            {badges.map((badge, index) => (
                                <div key={index} style={{...styles.badge, backgroundColor: badge.color}}>
                                    <div style={styles.badgeIcon}>{badge.icon}</div>
                                    <div style={styles.badgeName}>{badge.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div style={styles.completionActions}>
                    <button style={styles.restartButton} onClick={handleRestart}>
                        🔄 Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.gameInterface}>
            {/* Game Header */}
            <div style={styles.gameHeader}>
                <div style={styles.gameStats}>
                    <div style={styles.statBox}>
                        <span style={styles.statIcon}>🎯</span>
                        <span style={styles.statLabel}>Question</span>
                        <span style={styles.statValue}>{progress.current}/{progress.total}</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statIcon}>⭐</span>
                        <span style={styles.statLabel}>Score</span>
                        <span style={styles.statValue}>{score}</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statIcon}>🔥</span>
                        <span style={styles.statLabel}>Streak</span>
                        <span style={styles.statValue}>{streak}</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statIcon}>⏱️</span>
                        <span style={styles.statLabel}>Time</span>
                        <span style={{...styles.statValue, color: timeLeft <= 10 ? '#dc3545' : '#28a745'}}>{timeLeft}s</span>
                    </div>
                </div>
                <button
                    style={styles.exitButton}
                    onClick={() => setGameMode('menu')}
                >
                    🏠 Menu
                </button>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressSection}>
                <div style={styles.progressBar}>
                    <div
                        style={{
                            ...styles.progressFill,
                            width: `${progress.percentage}%`
                        }}
                    ></div>
                </div>
            </div>

            {/* Question */}
            <div style={styles.questionSection}>
                <h3 style={styles.question}>{currentQ?.question}</h3>
            </div>

            {/* Options */}
            <div style={styles.optionsSection}>
                {currentQ?.options.map((opt, i) => {
                    let buttonStyle = styles.optionButton;
                    
                    if (answered) {
                        if (i === correctAnswer) {
                            buttonStyle = {...styles.optionButton, ...styles.correctOption};
                        } else if (i === selectedAnswer && !isCorrect) {
                            buttonStyle = {...styles.optionButton, ...styles.wrongOption};
                        } else {
                            buttonStyle = {...styles.optionButton, ...styles.disabledOption};
                        }
                    }
                    
                    return (
                        <button
                            key={i}
                            style={buttonStyle}
                            onClick={() => handleAnswer(i)}
                            disabled={answered}
                        >
                            <span style={styles.optionLetter}>
                                {String.fromCharCode(65 + i)}.
                            </span>
                            <span style={styles.optionText}>{opt}</span>
                        </button>
                    );
                })}
            </div>

            {/* Feedback */}
            {answered && (
                <div style={styles.feedbackSection}>
                    <div style={{
                        ...styles.feedbackCard,
                        backgroundColor: isCorrect ? '#d4edda' : '#f8d7da',
                        borderColor: isCorrect ? '#28a745' : '#dc3545'
                    }}>
                        <div style={styles.feedbackHeader}>
                            <span style={styles.feedbackIcon}>
                                {isCorrect ? '✅' : '❌'}
                            </span>
                            <span style={styles.feedbackStatus}>
                                {isCorrect ? 'Correct!' : 'Incorrect!'}
                            </span>
                        </div>
                        {!isCorrect && (
                            <div style={styles.explanation}>
                                <strong>Explanation:</strong> {feedback}
                            </div>
                        )}
                    </div>
                    
                    <button style={styles.nextButton} onClick={handleNext}>
                        {progress.current === progress.total ? 'View Results' : 'Next Question'} →
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    widget: {
        background: "#fff",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    progressSection: {
        marginBottom: "24px",
        textAlign: "center"
    },
    progressText: {
        fontSize: "14px",
        color: "#666",
        marginBottom: "8px",
        fontWeight: "500"
    },
    progressBar: {
        width: "100%",
        height: "8px",
        backgroundColor: "#e9ecef",
        borderRadius: "4px",
        overflow: "hidden",
        marginBottom: "8px"
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#007bff",
        transition: "width 0.3s ease",
        borderRadius: "4px"
    },
    scoreText: {
        fontSize: "14px",
        color: "#28a745",
        fontWeight: "600"
    },
    questionSection: {
        marginBottom: "24px",
        textAlign: "center"
    },
    question: {
        fontSize: "20px",
        color: "#343a40",
        lineHeight: "1.4",
        fontWeight: "600",
        margin: "0"
    },
    optionsSection: {
        marginBottom: "24px"
    },
    optionButton: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        margin: "12px 0",
        padding: "16px",
        fontSize: "16px",
        borderRadius: "12px",
        cursor: "pointer",
        background: "#f8f9fa",
        color: "#495057",
        border: "2px solid #dee2e6",
        transition: "all 0.2s ease",
        textAlign: "left"
    },
    correctOption: {
        backgroundColor: "#d4edda",
        borderColor: "#28a745",
        color: "#155724"
    },
    wrongOption: {
        backgroundColor: "#f8d7da",
        borderColor: "#dc3545",
        color: "#721c24"
    },
    disabledOption: {
        opacity: "0.6",
        cursor: "not-allowed"
    },
    optionLetter: {
        fontWeight: "bold",
        marginRight: "12px",
        minWidth: "20px"
    },
    optionText: {
        flex: "1"
    },
    feedbackSection: {
        textAlign: "center"
    },
    feedbackCard: {
        padding: "16px",
        borderRadius: "12px",
        border: "2px solid",
        marginBottom: "16px",
        textAlign: "left"
    },
    feedbackHeader: {
        display: "flex",
        alignItems: "center",
        marginBottom: "8px"
    },
    feedbackIcon: {
        fontSize: "20px",
        marginRight: "8px"
    },
    feedbackStatus: {
        fontSize: "16px",
        fontWeight: "600"
    },
    explanation: {
        fontSize: "14px",
        color: "#495057",
        lineHeight: "1.4"
    },
    nextButton: {
        background: "#007bff",
        color: "#fff",
        border: "none",
        padding: "12px 24px",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background-color 0.2s ease"
    },
    // Completion Screen Styles
    completionWidget: {
        background: "#fff",
        padding: "32px",
        borderRadius: "20px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    completionHeader: {
        marginBottom: "24px"
    },
    completionTitle: {
        fontSize: "28px",
        color: "#343a40",
        marginBottom: "16px",
        fontWeight: "700"
    },
    scoreDisplay: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        marginBottom: "16px"
    },
    finalScore: {
        fontSize: "48px",
        fontWeight: "bold",
        color: "#007bff"
    },
    percentage: {
        fontSize: "24px",
        color: "#28a745",
        fontWeight: "600"
    },
    performanceMessage: {
        fontSize: "18px",
        color: "#495057",
        marginBottom: "32px",
        padding: "16px",
        backgroundColor: "#f8f9fa",
        borderRadius: "12px",
        lineHeight: "1.4"
    },
    badgeSection: {
        marginBottom: "32px"
    },
    badgeTitle: {
        fontSize: "20px",
        color: "#343a40",
        marginBottom: "16px",
        fontWeight: "600"
    },
    badgeContainer: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "12px"
    },
    badge: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px",
        borderRadius: "12px",
        minWidth: "100px",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
    },
    badgeIcon: {
        fontSize: "24px",
        marginBottom: "4px"
    },
    badgeName: {
        fontSize: "12px",
        fontWeight: "600",
        textAlign: "center"
    },
    completionActions: {
        marginTop: "24px"
    },
    restartButton: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        border: "none",
        padding: "14px 28px",
        fontSize: "16px",
        fontWeight: "600",
        borderRadius: "12px",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
    }
};

export default GamificationWidget;
