// gamification.js - Competitive Exam Preparation Questions
export const questions = [
    {
        question: "[PLACEMENT] In a coding round, if you need to find the time complexity of nested loops where outer loop runs n times and inner loop runs n times, what is the complexity?",
        options: ["O(n)", "O(n²)", "O(n log n)", "O(2n)"],
        correct: 1,
        explanation: "Nested loops with both running n times gives O(n × n) = O(n²) time complexity. This is common in placement coding questions."
    },
    {
        question: "[JEE MATHS] If log₁₀ 2 = 0.3010, what is the value of log₁₀ 8?",
        options: ["0.6020", "0.9030", "1.2040", "2.4080"],
        correct: 1,
        explanation: "log₁₀ 8 = log₁₀ 2³ = 3 × log₁₀ 2 = 3 × 0.3010 = 0.9030. Using logarithm properties is crucial for JEE."
    },
    {
        question: "[NEET BIOLOGY] Which of the following is the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"],
        correct: 1,
        explanation: "Mitochondria is called the powerhouse of the cell because it produces ATP (energy) through cellular respiration. Essential NEET concept."
    },
    {
        question: "[PLACEMENT LOGICAL] If FRIEND is coded as HUMJTK, how is MOTHER coded?",
        options: ["PRWJGT", "OQVJGR", "PRWKHU", "OQVJHU"],
        correct: 1,
        explanation: "Each letter is shifted by +2 positions: F→H, R→T, I→K, etc. So M→O, O→Q, T→V, H→J, E→G, R→T = OQVJGT."
    },
    {
        question: "[JEE PHYSICS] A body is thrown vertically upward with velocity 20 m/s. What is the maximum height reached? (g = 10 m/s²)",
        options: ["15 m", "20 m", "25 m", "40 m"],
        correct: 1,
        explanation: "Using v² = u² - 2gh, at max height v = 0. So 0 = 20² - 2×10×h, h = 400/20 = 20 m. Classic JEE kinematics."
    },
    {
        question: "[PLACEMENT QUANTITATIVE] A data analyst finds that 60% of users click on ads. If 500 users visit, how many click on ads?",
        options: ["200", "250", "300", "350"],
        correct: 2,
        explanation: "60% of 500 = (60/100) × 500 = 0.6 × 500 = 300 users. Basic percentage calculation for placement tests."
    },
    {
        question: "[NEET CHEMISTRY] What is the molecular formula of glucose?",
        options: ["C₆H₁₂O₆", "C₆H₆O₆", "C₅H₁₀O₅", "C₇H₁₄O₇"],
        correct: 0,
        explanation: "Glucose has molecular formula C₆H₁₂O₆. It's a fundamental carbohydrate structure important for NEET biochemistry."
    },
    {
        question: "[JEE CHEMISTRY] Which of the following has the highest boiling point?",
        options: ["HF", "HCl", "HBr", "HI"],
        correct: 0,
        explanation: "HF has the highest boiling point due to strong hydrogen bonding, despite being the smallest. Important concept for JEE."
    },
    {
        question: "[PLACEMENT REASONING] Complete the series: 2, 6, 12, 20, 30, ?",
        options: ["40", "42", "45", "48"],
        correct: 1,
        explanation: "Pattern: 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42. Each term is n×(n+1). Common in aptitude tests."
    },
    {
        question: "[JEE/NEET MATHS] If sin θ = 3/5, what is the value of cos θ? (θ in first quadrant)",
        options: ["4/5", "3/4", "5/4", "5/3"],
        correct: 0,
        explanation: "Using sin²θ + cos²θ = 1: (3/5)² + cos²θ = 1, so cos²θ = 1 - 9/25 = 16/25, cos θ = 4/5 (positive in first quadrant)."
    }
];

// Badge system based on performance - Competitive Exam Theme
export const getBadges = (score, totalQuestions) => {
    const percentage = (score / totalQuestions) * 100;
    const badges = [];
    
    if (percentage >= 90) {
        badges.push({ name: "Exam Champion", icon: "🏆", color: "#FFD700" });
        badges.push({ name: "JEE/NEET Ready", icon: "🎓", color: "#FF6B6B" });
    } else if (percentage >= 80) {
        badges.push({ name: "Placement Pro", icon: "💼", color: "#4ECDC4" });
        badges.push({ name: "Problem Solver", icon: "🧠", color: "#45B7D1" });
    } else if (percentage >= 70) {
        badges.push({ name: "Good Performer", icon: "⚡", color: "#96CEB4" });
        badges.push({ name: "On Track", icon: "🎯", color: "#F39C12" });
    } else if (percentage >= 60) {
        badges.push({ name: "Keep Practicing", icon: "📖", color: "#FFEAA7" });
    } else if (percentage >= 50) {
        badges.push({ name: "Getting Started", icon: "🚀", color: "#DDA0DD" });
    }
    
    // Special competitive exam badges
    if (score === totalQuestions) {
        badges.push({ name: "Perfect Score", icon: "💎", color: "#E17055" });
        badges.push({ name: "Top Ranker", icon: "👑", color: "#9B59B6" });
    }
    if (score >= totalQuestions * 0.8) {
        badges.push({ name: "Merit Worthy", icon: "🌟", color: "#00B894" });
    }
    if (score >= totalQuestions * 0.5) {
        badges.push({ name: "Qualifying Score", icon: "✅", color: "#27AE60" });
    }
    
    return badges;
};

export class Gamification {
    constructor(onUpdate) {
        this.score = 0;
        this.currentIndex = 0;
        this.onUpdate = onUpdate;
        this.answered = false;
        this.selectedAnswer = null;
    }

    getCurrentQuestion() {
        if (this.currentIndex >= questions.length) return null;
        return questions[this.currentIndex];
    }

    getTotalQuestions() {
        return questions.length;
    }

    getProgress() {
        return {
            current: this.currentIndex + 1,
            total: questions.length,
            percentage: ((this.currentIndex + 1) / questions.length) * 100
        };
    }

    answerQuestion(optionIndex) {
        if (this.answered) return; // Prevent multiple answers
        
        const current = this.getCurrentQuestion();
        if (!current) return;
        
        let isCorrect = optionIndex === current.correct;
        this.selectedAnswer = optionIndex;
        this.answered = true;

        if (isCorrect) {
            this.score++;
        }

        if (this.onUpdate) {
            this.onUpdate({
                isCorrect,
                explanation: current.explanation,
                score: this.score,
                questionIndex: this.currentIndex,
                selectedAnswer: optionIndex,
                correctAnswer: current.correct,
                answered: true
            });
        }
    }

    nextQuestion() {
        this.currentIndex++;
        this.answered = false;
        this.selectedAnswer = null;
        
        if (this.currentIndex < questions.length) {
            if (this.onUpdate) {
                this.onUpdate({ 
                    nextQuestion: true,
                    answered: false 
                });
            }
        } else {
            // Quiz completed
            const badges = getBadges(this.score, questions.length);
            if (this.onUpdate) {
                this.onUpdate({ 
                    quizOver: true, 
                    score: this.score,
                    totalQuestions: questions.length,
                    badges: badges,
                    percentage: (this.score / questions.length) * 100
                });
            }
        }
    }

    getPerformanceMessage(percentage) {
        if (percentage >= 90) return "Fantastic! You're ready for JEE/NEET/Placement exams! 🏆 Keep this momentum going!";
        if (percentage >= 80) return "Excellent work! You have strong competitive exam readiness! 🌟 Focus on time management now!";
        if (percentage >= 70) return "Good performance! You're building solid foundations! 👍 Practice more challenging questions!";
        if (percentage >= 60) return "Decent attempt! Focus on weak areas and keep practicing! 📈 You can definitely improve!";
        if (percentage >= 50) return "You're making progress! Regular practice will boost your confidence! 💪 Don't give up!";
        return "Every topper started somewhere! 🚀 Focus on basics and practice daily. You've got this!";
    }

    reset() {
        this.score = 0;
        this.currentIndex = 0;
        this.answered = false;
        this.selectedAnswer = null;
    }
}
