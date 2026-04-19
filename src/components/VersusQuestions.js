// Versus Battle Questions - Competitive Student vs Student Challenges
export const versusQuestions = [
  {
    question: "🏆 [SPEED ROUND] If a company's revenue increased from $2M to $3M, what's the percentage increase?",
    options: ["40%", "50%", "60%", "33%"],
    correct: 1,
    explanation: "Percentage increase = (3-2)/2 × 100 = 50%. Quick mental math essential for versus battles!",
    difficulty: "Medium",
    category: "Quantitative"
  },
  {
    question: "⚡ [LOGIC CHALLENGE] If all Bloops are Razzles and all Razzles are Lazzles, then all Bloops are definitely:",
    options: ["Lazzles", "Not Lazzles", "Sometimes Lazzles", "Cannot determine"],
    correct: 0,
    explanation: "Classic logical reasoning: If A→B and B→C, then A→C. All Bloops are Lazzles!",
    difficulty: "Hard",
    category: "Logical Reasoning"
  },
  {
    question: "🔥 [BRAIN TEASER] Complete the pattern: 2, 6, 12, 20, 30, ?",
    options: ["40", "42", "44", "46"],
    correct: 1,
    explanation: "Pattern: n(n+1) where n = 1,2,3,4,5,6. So 6×7 = 42. Pattern recognition wins versus battles!",
    difficulty: "Hard",
    category: "Pattern Recognition"
  },
  {
    question: "⚔️ [QUICK MATH] What is 15% of 240?",
    options: ["32", "36", "40", "42"],
    correct: 1,
    explanation: "15% of 240 = 0.15 × 240 = 36. Speed calculation crucial in battles!",
    difficulty: "Easy",
    category: "Percentage"
  },
  {
    question: "🎯 [CODING LOGIC] Which data structure uses LIFO (Last In, First Out) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correct: 1,
    explanation: "Stack follows LIFO - like a pile of plates! Essential for competitive programming.",
    difficulty: "Medium",
    category: "Data Structures"
  },
  {
    question: "🚀 [PLACEMENT PREP] If a train travels 120 km in 2 hours, what's its speed in m/s?",
    options: ["16.67 m/s", "20 m/s", "30 m/s", "60 m/s"],
    correct: 0,
    explanation: "Speed = 120 km/2 h = 60 km/h = 60 × (1000/3600) = 16.67 m/s. Unit conversion mastery!",
    difficulty: "Medium",
    category: "Physics"
  },
  {
    question: "🏁 [RAPID FIRE] What comes next: A, D, G, J, ?",
    options: ["K", "L", "M", "N"],
    correct: 2,
    explanation: "Each letter is +3 positions: A(+3)→D(+3)→G(+3)→J(+3)→M. Alphabet sequences win!",
    difficulty: "Medium",
    category: "Sequences"
  },
  {
    question: "💡 [BRAIN POWER] If 5 machines make 5 widgets in 5 minutes, how many machines needed for 100 widgets in 100 minutes?",
    options: ["5", "20", "25", "100"],
    correct: 0,
    explanation: "Each machine makes 1 widget in 5 minutes. In 100 minutes, each makes 20 widgets. So 5 machines make 100 widgets!",
    difficulty: "Hard",
    category: "Work & Time"
  },
  {
    question: "🎮 [TECH CHALLENGE] What does 'HTTP' stand for in web development?",
    options: ["Hyper Text Transfer Protocol", "High Tech Transfer Process", "Hyper Type Text Protocol", "Home Tool Transfer Protocol"],
    correct: 0,
    explanation: "HTTP = Hyper Text Transfer Protocol. Foundation of web communication!",
    difficulty: "Easy",
    category: "Technology"
  },
  {
    question: "🔥 [FINAL BATTLE] A clock shows 3:15. What is the angle between hour and minute hands?",
    options: ["0°", "7.5°", "15°", "22.5°"],
    correct: 1,
    explanation: "At 3:15, hour hand moves 7.5° (15 min × 0.5°/min) from 3. Minute hand at 90°. Angle = |90° - 97.5°| = 7.5°",
    difficulty: "Hard",
    category: "Clock Problems"
  }
];

export default versusQuestions;