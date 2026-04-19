// Comprehensive Exam Configuration for Competitive Exam Preparation System

export const EXAM_CATEGORIES = {
  MEDICAL: {
    key: 'MEDICAL',
    title: 'Medical Entrance',
    icon: '🏥',
    color: '#ef4444',
    exams: ['NEET', 'AIIMS', 'JIPMER']
  },
  ENGINEERING: {
    key: 'ENGINEERING', 
    title: 'Engineering Entrance',
    icon: '⚙️',
    color: '#3b82f6',
    exams: ['JEE_MAIN', 'JEE_ADVANCED', 'GATE', 'BITSAT']
  },
  GOVERNMENT: {
    key: 'GOVERNMENT',
    title: 'Government Jobs',
    icon: '🏛️',
    color: '#10b981',
    exams: ['UPSC', 'SSC', 'TNPSC', 'KPSC', 'MPPSC']
  },
  BANKING: {
    key: 'BANKING',
    title: 'Banking & Finance',
    icon: '🏦',
    color: '#8b5cf6',
    exams: ['IBPS', 'SBI', 'RBI', 'NABARD']
  },
  RAILWAY: {
    key: 'RAILWAY',
    title: 'Railway Jobs',
    icon: '🚂',
    color: '#f59e0b',
    exams: ['RRB_NTPC', 'RRB_JE', 'RRB_GROUP_D']
  },
  DEFENSE: {
    key: 'DEFENSE',
    title: 'Defense Services',
    icon: '🛡️',
    color: '#06b6d4',
    exams: ['NDA', 'CDS', 'AFCAT']
  }
};

export const EXAM_DETAILS = {
  // Medical Exams
  NEET: {
    name: 'NEET',
    fullName: 'National Eligibility cum Entrance Test',
    category: 'MEDICAL',
    duration: 180, // minutes
    totalQuestions: 180,
    totalMarks: 720,
    subjects: ['Physics', 'Chemistry', 'Biology'],
    pattern: 'MCQ',
    negativeMarking: true,
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    syllabus: {
      Physics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity', 'Modern Physics'],
      Chemistry: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'],
      Biology: ['Botany', 'Zoology', 'Human Physiology', 'Genetics', 'Ecology']
    }
  },
  
  // Engineering Exams
  JEE_MAIN: {
    name: 'JEE Main',
    fullName: 'Joint Entrance Examination Main',
    category: 'ENGINEERING',
    duration: 180,
    totalQuestions: 90,
    totalMarks: 300,
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    pattern: 'MCQ + Numerical',
    negativeMarking: true,
    markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
    syllabus: {
      Physics: ['Mechanics', 'Heat & Thermodynamics', 'Waves & Optics', 'Electricity & Magnetism', 'Modern Physics'],
      Chemistry: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'],
      Mathematics: ['Algebra', 'Trigonometry', 'Coordinate Geometry', 'Calculus', 'Statistics']
    }
  },

  GATE: {
    name: 'GATE',
    fullName: 'Graduate Aptitude Test in Engineering',
    category: 'ENGINEERING',
    duration: 180,
    totalQuestions: 65,
    totalMarks: 100,
    subjects: ['Technical', 'Aptitude', 'Mathematics'],
    pattern: 'MCQ + NAT',
    negativeMarking: true,
    markingScheme: { correct_1: 1, correct_2: 2, incorrect_1: -0.33, incorrect_2: -0.67, unattempted: 0 }
  },

  // Government Exams
  UPSC: {
    name: 'UPSC',
    fullName: 'Union Public Service Commission',
    category: 'GOVERNMENT',
    stages: ['Prelims', 'Mains', 'Interview'],
    subjects: ['General Studies', 'CSAT', 'Optional Subject'],
    pattern: 'MCQ + Descriptive',
    syllabus: {
      'General Studies': ['History', 'Geography', 'Polity', 'Economics', 'Environment', 'Science & Technology'],
      'CSAT': ['Comprehension', 'Logical Reasoning', 'Analytical Ability', 'Decision Making', 'Problem Solving'],
      'Current Affairs': ['National', 'International', 'Economic', 'Scientific', 'Environmental']
    }
  },

  SSC: {
    name: 'SSC',
    fullName: 'Staff Selection Commission',
    category: 'GOVERNMENT',
    exams: ['SSC_CGL', 'SSC_CHSL', 'SSC_MTS', 'SSC_CPO'],
    subjects: ['General Intelligence', 'General Awareness', 'Quantitative Aptitude', 'English'],
    pattern: 'MCQ',
    negativeMarking: true
  },

  TNPSC: {
    name: 'TNPSC',
    fullName: 'Tamil Nadu Public Service Commission',
    category: 'GOVERNMENT',
    duration: 150,
    totalQuestions: 200,
    subjects: ['General Studies', 'Aptitude', 'Tamil'],
    pattern: 'MCQ',
    negativeMarking: true
  },

  // Banking Exams
  IBPS: {
    name: 'IBPS',
    fullName: 'Institute of Banking Personnel Selection',
    category: 'BANKING',
    exams: ['IBPS_PO', 'IBPS_CLERK', 'IBPS_SO', 'IBPS_RRB'],
    subjects: ['Reasoning', 'Quantitative Aptitude', 'English', 'General Awareness', 'Computer Knowledge'],
    pattern: 'MCQ',
    stages: ['Prelims', 'Mains', 'Interview']
  },

  SBI: {
    name: 'SBI',
    fullName: 'State Bank of India',
    category: 'BANKING',
    exams: ['SBI_PO', 'SBI_CLERK', 'SBI_SO'],
    subjects: ['Reasoning', 'Quantitative Aptitude', 'English', 'General Awareness'],
    pattern: 'MCQ',
    stages: ['Prelims', 'Mains', 'Interview']
  },

  // Railway Exams
  RRB_NTPC: {
    name: 'RRB NTPC',
    fullName: 'Railway Recruitment Board Non-Technical Popular Categories',
    category: 'RAILWAY',
    duration: 90,
    totalQuestions: 100,
    subjects: ['General Awareness', 'Mathematics', 'General Intelligence'],
    pattern: 'MCQ',
    negativeMarking: true
  },

  // Defense Exams
  NDA: {
    name: 'NDA',
    fullName: 'National Defence Academy',
    category: 'DEFENSE',
    duration: 150,
    subjects: ['Mathematics', 'General Ability Test'],
    pattern: 'MCQ',
    negativeMarking: true
  }
};

export const DIFFICULTY_LEVELS = {
  BEGINNER: { key: 'beginner', label: 'Beginner', color: '#10b981' },
  INTERMEDIATE: { key: 'intermediate', label: 'Intermediate', color: '#f59e0b' },
  ADVANCED: { key: 'advanced', label: 'Advanced', color: '#ef4444' },
  EXPERT: { key: 'expert', label: 'Expert', color: '#8b5cf6' }
};

export const QUESTION_TYPES = {
  MCQ: 'Multiple Choice Question',
  MSQ: 'Multiple Select Question', 
  NAT: 'Numerical Answer Type',
  DESCRIPTIVE: 'Descriptive Answer',
  TRUE_FALSE: 'True/False',
  FILL_BLANKS: 'Fill in the Blanks',
  MATCH_FOLLOWING: 'Match the Following'
};

export const STUDY_MATERIALS = {
  NOTES: { type: 'notes', icon: '📝', label: 'Notes' },
  VIDEO: { type: 'video', icon: '🎥', label: 'Video Lectures' },
  EBOOK: { type: 'ebook', icon: '📚', label: 'E-Books' },
  PRACTICE: { type: 'practice', icon: '✏️', label: 'Practice Sets' },
  FORMULA: { type: 'formula', icon: '🧮', label: 'Formula Sheets' },
  PREVIOUS_YEAR: { type: 'previous_year', icon: '📋', label: 'Previous Year Papers' }
};

export const PERFORMANCE_METRICS = {
  ACCURACY: 'accuracy',
  SPEED: 'speed', 
  CONSISTENCY: 'consistency',
  IMPROVEMENT: 'improvement',
  RANK: 'rank',
  PERCENTILE: 'percentile'
};

export const ADAPTIVE_LEARNING_LEVELS = {
  WEAK: { threshold: 40, recommendation: 'Focus on basics, more practice needed' },
  AVERAGE: { threshold: 60, recommendation: 'Good progress, maintain consistency' },
  GOOD: { threshold: 80, recommendation: 'Excellent! Try advanced level questions' },
  EXCELLENT: { threshold: 95, recommendation: 'Outstanding! Ready for exam' }
};
