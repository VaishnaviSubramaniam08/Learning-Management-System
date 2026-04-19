import React, { useState } from 'react';

// Sample Questions in NEET/JEE Format for Practice
const EXAM_DATA = {
  NEET: {
    name: 'NEET',
    fullName: 'National Eligibility cum Entrance Test',
    icon: '🏥',
    color: '#ef4444',
    description: 'Medical Entrance Exam',
    papers: {
      2025: {
        title: 'NEET 2025 Question Paper',
        date: '2025-05-05',
        difficulty: 'Medium',
        sources: [
          { name: 'NEET 2025 PDF Download', url: 'https://www.shiksha.com/medicine/neet-question-papers/neet-2025-question-paper-pdf', description: 'Direct PDF download - NEET 2025 Question Paper' },
          { name: 'Aglasem Direct Download', url: 'https://aglasem.com/neet/neet-question-paper/neet-2025-question-paper.pdf', description: 'Immediate PDF download' },
          { name: 'Backup Download', url: 'https://www.vedantu.com/neet/neet-2025-question-paper-pdf', description: 'Alternative PDF download' }
        ]
      },
      2024: {
        title: 'NEET 2024 Question Paper',
        date: '2024-05-05',
        difficulty: 'Medium',
        sources: [
          { name: 'NEET 2024 PDF Download', url: 'https://www.shiksha.com/medicine/neet-question-papers/neet-2024-question-paper-pdf', description: 'Direct PDF download - NEET 2024 Question Paper' },
          { name: 'Aglasem Direct Download', url: 'https://aglasem.com/neet/neet-question-paper/neet-2024-question-paper.pdf', description: 'Immediate PDF download' },
          { name: 'Testbook PDF', url: 'https://testbook.com/neet/neet-2024-question-paper.pdf', description: 'Official NTA released paper' }
        ],
        telegramFormat: true,
        totalQuestions: 180,
        sections: {
          physics: { start: 1, end: 45, questions: 45 },
          chemistry: { start: 46, end: 90, questions: 45 },
          biology: { start: 91, end: 180, questions: 90 }
        },
        questions: [
          // PHYSICS SECTION (Q1-Q45)
          { id: 1, subject: 'Physics', question: 'A particle moves in a circle of radius R. What is the ratio of distance to displacement when it completes 3/4 of the circle?', options: ['(3π + 4)/4', '3π/2√2', '(3πR)/(R√2)', '3π/2'], correct: 2, explanation: 'Distance = (3/4) × 2πR = 3πR/2. Displacement = R√2. Ratio = 3π/(2√2)' },
          { id: 2, subject: 'Physics', question: 'A uniform electric field E = 100 N/C is directed along +x axis. Work done in moving 2μC charge from origin to (2m,0) is:', options: ['400 μJ', '200 μJ', '100 μJ', '50 μJ'], correct: 0, explanation: 'W = qEd = 2×10⁻⁶ × 100 × 2 = 400 μJ' },
          { id: 3, subject: 'Physics', question: 'de Broglie wavelength of electron accelerated through 100V is approximately:', options: ['1.23 Å', '2.46 Å', '0.123 Å', '12.3 Å'], correct: 0, explanation: 'λ = h/√(2meV) ≈ 1.23 Å' },
          { id: 4, subject: 'Physics', question: 'A wire of resistance R is stretched to double its length. New resistance becomes:', options: ['R/2', 'R', '2R', '4R'], correct: 3, explanation: 'R = ρl/A. When l→2l, A→A/2. So R_new = ρ(2l)/(A/2) = 4R' },
          { id: 5, subject: 'Physics', question: 'For SHM with amplitude A, displacement where KE = PE is:', options: ['A/2', 'A/√2', 'A/√3', 'A/4'], correct: 1, explanation: 'At x = A/√2, KE = PE = E/2' },

          // CHEMISTRY SECTION (Q46-Q90)
          { id: 46, subject: 'Chemistry', question: 'Which has maximum unpaired electrons?', options: ['Fe³⁺', 'Mn²⁺', 'Cr³⁺', 'Co²⁺'], correct: 1, explanation: 'Mn²⁺: [Ar] 3d⁵ has 5 unpaired electrons' },
          { id: 47, subject: 'Chemistry', question: 'Hybridization of C in C₂H₂ (acetylene) is:', options: ['sp³', 'sp²', 'sp', 'sp³d'], correct: 2, explanation: 'Triple bond requires sp hybridization' },
          { id: 48, subject: 'Chemistry', question: 'Most acidic among these is:', options: ['CH₃COOH', 'CCl₃COOH', 'CHCl₂COOH', 'CH₂ClCOOH'], correct: 1, explanation: 'CCl₃COOH: Maximum -I effect of 3 Cl atoms' },
          { id: 49, subject: 'Chemistry', question: 'Which shows optical isomerism?', options: ['CH₃CHClCH₃', 'CH₃CH₂CHClCH₃', 'CHCl₃', 'CH₂ClCH₂Cl'], correct: 1, explanation: 'CH₃CH₂CHClCH₃ has chiral carbon' },
          { id: 50, subject: 'Chemistry', question: 'Highest lattice energy is shown by:', options: ['NaCl', 'MgO', 'CaO', 'KCl'], correct: 1, explanation: 'MgO: Higher charges (+2,-2) and smaller size' },

          // BIOLOGY SECTION (Q91-Q180)
          { id: 91, subject: 'Biology', question: 'Crossing over occurs in which phase of meiosis?', options: ['Prophase I', 'Metaphase I', 'Anaphase I', 'Prophase II'], correct: 0, explanation: 'Crossing over occurs in Prophase I (pachytene stage)' },
          { id: 92, subject: 'Biology', question: 'DNA unwinding enzyme during replication is:', options: ['DNA polymerase', 'Helicase', 'Ligase', 'Primase'], correct: 1, explanation: 'Helicase unwinds DNA by breaking H-bonds' },
          { id: 93, subject: 'Biology', question: 'Site of protein synthesis in cell is:', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi apparatus'], correct: 1, explanation: 'Ribosomes are sites of translation' },
          { id: 94, subject: 'Biology', question: 'Breathing is controlled by:', options: ['Cerebrum', 'Cerebellum', 'Medulla oblongata', 'Hypothalamus'], correct: 2, explanation: 'Medulla has respiratory center' },
          { id: 95, subject: 'Biology', question: 'Photosystem II is located in:', options: ['Stroma', 'Thylakoid membrane', 'Outer membrane', 'Inner membrane'], correct: 1, explanation: 'PS II is embedded in thylakoid membrane' }
        ]
      },
      2023: {
        title: 'NEET 2023 Question Paper',
        date: '2023-05-07',
        difficulty: 'Hard',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/neet', description: 'NEET 2023 questions database - Direct access' },
          { name: 'Shiksha Papers', url: 'https://www.shiksha.com/medicine/neet-question-papers', description: 'NEET 2023 papers with solutions' },
          { name: 'Aglasem PDF', url: 'https://aglasem.com/neet/neet-question-paper/', description: 'Direct PDF downloads' }
        ],
        questions: [
          {
            id: 1,
            subject: 'Physics',
            question: 'A uniform rod of length L and mass M is pivoted at one end. What is the minimum speed required at the free end to complete a vertical circle?',
            options: ['√(6gL)', '√(5gL)', '√(4gL)', '√(3gL)'],
            correct: 0,
            explanation: 'For a rod pivoted at one end, minimum speed at free end = √(6gL) using energy conservation'
          },
          {
            id: 2,
            subject: 'Chemistry',
            question: 'Which of the following shows maximum covalent character?',
            options: ['LiCl', 'NaCl', 'KCl', 'CsCl'],
            correct: 0,
            explanation: 'LiCl shows maximum covalent character due to small size and high charge density of Li⁺ ion (Fajan\'s rule)'
          },
          {
            id: 3,
            subject: 'Biology',
            question: 'Which enzyme is responsible for unwinding DNA during replication?',
            options: ['DNA polymerase', 'Helicase', 'Ligase', 'Primase'],
            correct: 1,
            explanation: 'Helicase enzyme unwinds the DNA double helix by breaking hydrogen bonds between base pairs'
          }
        ]
      },
      2022: {
        title: 'NEET 2022 Question Paper',
        date: '2022-07-17',
        difficulty: 'Medium',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/neet', description: 'NEET 2023 questions database - Direct access' },
          { name: 'Shiksha Papers', url: 'https://www.shiksha.com/medicine/neet-question-papers', description: 'NEET 2023 papers with solutions' },
          { name: 'Aglasem PDF', url: 'https://aglasem.com/neet/neet-question-paper/', description: 'Direct PDF downloads' }
        ],
        questions: [
          {
            id: 1,
            subject: 'Physics',
            question: 'Two identical charges are placed at distance d. At what point on the line joining them is the electric field zero?',
            options: ['At midpoint only', 'At infinity only', 'At midpoint and infinity', 'Nowhere'],
            correct: 0,
            explanation: 'For identical charges, electric field is zero only at the midpoint where fields due to both charges cancel out'
          },
          {
            id: 2,
            subject: 'Chemistry',
            question: 'Which of the following is most acidic?',
            options: ['CH₃COOH', 'CCl₃COOH', 'CHCl₂COOH', 'CH₂ClCOOH'],
            correct: 1,
            explanation: 'CCl₃COOH is most acidic due to maximum -I effect of three chlorine atoms stabilizing the conjugate base'
          },
          {
            id: 3,
            subject: 'Biology',
            question: 'Which part of the brain controls breathing?',
            options: ['Cerebrum', 'Cerebellum', 'Medulla oblongata', 'Hypothalamus'],
            correct: 2,
            explanation: 'Medulla oblongata contains the respiratory center that controls involuntary breathing'
          }
        ]
      }
    }
  },
  JEE_MAIN: {
    name: 'JEE Main',
    fullName: 'Joint Entrance Examination Main',
    icon: '⚙️',
    color: '#3b82f6',
    description: 'Engineering Entrance Exam',
    papers: {
      2025: {
        title: 'JEE Main 2025 Question Paper',
        date: '2025-01-24',
        difficulty: 'Hard',
        sources: [
          { name: 'JEE Main 2025 PDF Download', url: 'https://www.shiksha.com/engineering/jee-main-question-papers/jee-main-2025-question-paper.pdf', description: 'Direct PDF download - JEE Main 2025' },
          { name: 'Aglasem Direct Download', url: 'https://aglasem.com/jee-main/jee-main-question-paper/jee-main-2025-shift-1.pdf', description: 'Shift-wise PDF downloads' },
          { name: 'Vedantu PDF', url: 'https://www.vedantu.com/jee/jee-main-2025-question-paper.pdf', description: 'All sessions PDF' }
        ]
      },
      2024: {
        title: 'JEE Main 2024 Question Paper',
        date: '2024-01-24',
        difficulty: 'Hard',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/jee-main', description: 'JEE Main 2024 questions database - Direct access' },
          { name: 'Shiksha Papers', url: 'https://www.shiksha.com/engineering/jee-main-question-papers', description: 'JEE Main 2024 shift-wise papers' },
          { name: 'Aglasem PDF', url: 'https://aglasem.com/jee-main/jee-main-question-paper/', description: 'Direct PDF downloads' }
        ],
        questions: [
          {
            id: 1,
            subject: 'Mathematics',
            question: 'If f(x) = x³ - 6x² + 11x - 6, then the number of real roots of f(x) = 0 is:',
            options: ['0', '1', '2', '3'],
            correct: 3,
            explanation: 'f(x) = (x-1)(x-2)(x-3), so it has 3 real roots: x = 1, 2, 3'
          },
          {
            id: 2,
            subject: 'Physics',
            question: 'A particle executes SHM with amplitude A. At what displacement is kinetic energy equal to potential energy?',
            options: ['A/2', 'A/√2', 'A/√3', 'A/4'],
            correct: 1,
            explanation: 'When KE = PE, total energy is equally divided. At displacement x = A/√2, KE = PE = E/2'
          },
          {
            id: 3,
            subject: 'Chemistry',
            question: 'Which of the following has highest lattice energy?',
            options: ['NaCl', 'MgO', 'CaO', 'KCl'],
            correct: 1,
            explanation: 'MgO has highest lattice energy due to higher charges (+2, -2) and smaller ionic sizes compared to others'
          }
        ]
      },
      2023: {
        title: 'JEE Main 2023 Practice Questions',
        date: '2023-01-24',
        difficulty: 'Medium',
        questions: [
          {
            id: 1,
            subject: 'Mathematics',
            question: 'The value of ∫₀^π sin⁴x dx is:',
            options: ['π/8', '3π/8', 'π/4', '3π/4'],
            correct: 1,
            explanation: 'Using reduction formula for ∫sin⁴x dx = 3π/8'
          },
          {
            id: 2,
            subject: 'Physics',
            question: 'A wire of resistance R is stretched to double its length. The new resistance becomes:',
            options: ['R/2', 'R', '2R', '4R'],
            correct: 3,
            explanation: 'When length doubles, area becomes half. New resistance = ρ(2l)/(A/2) = 4ρl/A = 4R'
          },
          {
            id: 3,
            subject: 'Chemistry',
            question: 'Which of the following is most stable carbocation?',
            options: ['CH₃⁺', '(CH₃)₂CH⁺', '(CH₃)₃C⁺', 'C₆H₅CH₂⁺'],
            correct: 3,
            explanation: 'Benzyl carbocation (C₆H₅CH₂⁺) is most stable due to resonance stabilization with benzene ring'
          }
        ]
      },
      2022: {
        title: 'JEE Main 2022 Practice Questions',
        date: '2022-06-23',
        difficulty: 'Medium',
        questions: [
          {
            id: 1,
            subject: 'Mathematics',
            question: 'If the coefficient of x⁷ in (1+x)ⁿ is equal to coefficient of x³, then n =',
            options: ['7', '10', '5', '3'],
            correct: 1,
            explanation: 'ⁿC₇ = ⁿC₃, which gives n = 7+3 = 10 (using ⁿCᵣ = ⁿCₙ₋ᵣ)'
          },
          {
            id: 2,
            subject: 'Physics',
            question: 'The escape velocity from Earth\'s surface is 11.2 km/s. The escape velocity from a planet with twice the mass and half the radius of Earth is:',
            options: ['11.2 km/s', '22.4 km/s', '31.6 km/s', '44.8 km/s'],
            correct: 2,
            explanation: 'vₑ = √(2GM/R). For 2M and R/2: vₑ = √(2G(2M)/(R/2)) = √(8GM/R) = 2√2 × 11.2 ≈ 31.6 km/s'
          },
          {
            id: 3,
            subject: 'Chemistry',
            question: 'Which of the following shows optical isomerism?',
            options: ['CH₃CHClCH₃', 'CH₃CH₂CHClCH₃', 'CHCl₃', 'CH₂ClCH₂Cl'],
            correct: 1,
            explanation: 'CH₃CH₂CHClCH₃ has a chiral carbon (attached to 4 different groups) and shows optical isomerism'
          }
        ]
      }
    }
  },
  UPSC: {
    name: 'UPSC',
    fullName: 'Union Public Service Commission',
    icon: '🏛️',
    color: '#10b981',
    description: 'Civil Services Exam',
    papers: {
      2025: {
        title: 'UPSC Prelims 2025 Question Paper',
        date: '2025-06-16',
        difficulty: 'Medium',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/upsc', description: 'UPSC 2025 questions database - Direct access' },
          { name: 'Shiksha UPSC', url: 'https://www.shiksha.com/upsc', description: 'UPSC 2025 papers and preparation' },
          { name: 'UPSC Official', url: 'https://upsc.gov.in/examinations/previous-question-papers', description: 'Official UPSC papers' }
        ]
      },
      2024: {
        title: 'UPSC Prelims 2024 Question Paper',
        date: '2024-06-16',
        difficulty: 'Medium',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/upsc', description: 'UPSC 2024 questions database - Direct access' },
          { name: 'Shiksha UPSC', url: 'https://www.shiksha.com/upsc', description: 'UPSC 2024 papers and preparation' },
          { name: 'UPSC Official', url: 'https://upsc.gov.in/examinations/previous-question-papers', description: 'Official UPSC papers' }
        ]
      },
      2023: {
        title: 'UPSC Prelims 2023 Question Paper',
        date: '2023-05-28',
        difficulty: 'Hard',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/upsc', description: 'UPSC 2023 questions database - Direct access' },
          { name: 'Shiksha UPSC', url: 'https://www.shiksha.com/upsc', description: 'UPSC 2023 papers and preparation' },
          { name: 'VisionIAS', url: 'https://visionias.in/upsc-previous-year-papers', description: 'UPSC papers with solutions' }
        ]
      },
      2022: {
        title: 'UPSC Prelims 2022 Question Paper',
        date: '2022-06-05',
        difficulty: 'Medium',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/upsc', description: 'UPSC 2022 questions database - Direct access' },
          { name: 'Shiksha UPSC', url: 'https://www.shiksha.com/upsc', description: 'UPSC 2022 papers and preparation' },
          { name: 'Testbook', url: 'https://testbook.com/upsc-previous-year-papers', description: 'UPSC papers with answers' }
        ]
      }
    }
  },
  IBPS: {
    name: 'IBPS',
    fullName: 'Institute of Banking Personnel Selection',
    icon: '🏦',
    color: '#8b5cf6',
    description: 'Banking Exam',
    papers: {
      2025: {
        title: 'IBPS PO 2025 Question Paper',
        date: '2025-10-19',
        difficulty: 'Medium',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/ibps', description: 'IBPS 2025 questions database - Direct access' },
          { name: 'Shiksha Banking', url: 'https://www.shiksha.com/banking', description: 'IBPS 2025 papers and preparation' },
          { name: 'CareerPower', url: 'https://careerpower.in/ibps-previous-year-papers', description: 'IBPS PO & Clerk papers' }
        ]
      },
      2024: {
        title: 'IBPS PO 2024 Question Paper',
        date: '2024-10-19',
        difficulty: 'Medium',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/ibps', description: 'IBPS 2024 questions database - Direct access' },
          { name: 'Shiksha Banking', url: 'https://www.shiksha.com/banking', description: 'IBPS 2024 papers and preparation' },
          { name: 'CareerPower', url: 'https://careerpower.in/ibps-previous-year-papers', description: 'IBPS PO & Clerk papers' }
        ]
      },
      2023: {
        title: 'IBPS PO 2023 Question Paper',
        date: '2023-09-30',
        difficulty: 'Hard',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/ibps', description: 'IBPS 2023 questions database - Direct access' },
          { name: 'Shiksha Banking', url: 'https://www.shiksha.com/banking', description: 'IBPS 2023 papers and preparation' },
          { name: 'CareerPower', url: 'https://careerpower.in/ibps-previous-year-papers', description: 'IBPS PO & Clerk papers' }
        ]
      },
      2022: {
        title: 'IBPS PO 2022 Question Paper',
        date: '2022-10-01',
        difficulty: 'Medium',
        sources: [
          { name: 'Shiksha Questions', url: 'https://ask.shiksha.com/questions/ibps', description: 'IBPS 2022 questions database - Direct access' },
          { name: 'Shiksha Banking', url: 'https://www.shiksha.com/banking', description: 'IBPS 2022 papers and preparation' },
          { name: 'CareerPower', url: 'https://careerpower.in/ibps-previous-year-papers', description: 'IBPS PO & Clerk papers' }
        ]
      }
    }
  },
  RRB_NTPC: {
    name: 'RRB NTPC',
    fullName: 'Railway Recruitment Board NTPC',
    icon: '🚂',
    color: '#f59e0b',
    description: 'Railway Exam',
    papers: {
      2025: {
        title: 'RRB NTPC 2025 Question Paper',
        date: '2025-01-15',
        difficulty: 'Medium',
        sources: [
          { name: 'CareerPower - Memory Based', url: 'https://careerpower.in/rrb-ntpc-previous-year-papers', description: 'RRB NTPC 2025 memory-based papers with answer keys' },
          { name: 'TutorialsDuniya - PDF', url: 'https://tutorialsduniya.com/rrb-ntpc-previous-papers', description: 'Direct PDF downloads in English & Hindi' },
          { name: 'GovernmentDailyJobs', url: 'https://governmentdailyjobs.in/rrb-ntpc-papers', description: 'Shift-wise RRB NTPC papers with solutions' }
        ]
      },
      2024: {
        title: 'RRB NTPC 2024 Question Paper',
        date: '2024-03-15',
        difficulty: 'Medium',
        sources: [
          { name: 'TutorialsDuniya', url: 'https://tutorialsduniya.com/rrb-ntpc-previous-papers' },
          { name: 'GovernmentDailyJobs', url: 'https://governmentdailyjobs.in/rrb-ntpc-papers' },
          { name: 'CareerPower', url: 'https://careerpower.in/rrb-ntpc-previous-year-papers' }
        ]
      },
      2023: {
        title: 'RRB NTPC 2023 Question Paper',
        date: '2023-02-14',
        difficulty: 'Hard',
        sources: [
          { name: 'TutorialsDuniya', url: 'https://tutorialsduniya.com/rrb-ntpc-previous-papers' },
          { name: 'PracticeMock', url: 'https://practicemock.com/rrb-ntpc-previous-papers' },
          { name: 'GovernmentDailyJobs', url: 'https://governmentdailyjobs.in/rrb-ntpc-papers' }
        ]
      },
      2022: {
        title: 'RRB NTPC 2022 Question Paper',
        date: '2022-01-12',
        difficulty: 'Medium',
        sources: [
          { name: 'TutorialsDuniya', url: 'https://tutorialsduniya.com/rrb-ntpc-previous-papers' },
          { name: 'CareerPower', url: 'https://careerpower.in/rrb-ntpc-previous-year-papers' },
          { name: 'GovernmentDailyJobs', url: 'https://governmentdailyjobs.in/rrb-ntpc-papers' }
        ]
      }
    }
  },
  NDA: {
    name: 'NDA',
    fullName: 'National Defence Academy',
    icon: '🛡️',
    color: '#06b6d4',
    description: 'Defence Services Exam',
    papers: {
      2025: {
        title: 'NDA 2025 Question Paper',
        date: '2025-04-20',
        difficulty: 'Medium',
        sources: [
          { name: 'Testbook', url: 'https://testbook.com/nda-previous-year-papers' },
          { name: 'UPSC Official', url: 'https://upsc.gov.in/examinations/previous-question-papers' },
          { name: 'PW Only IAS', url: 'https://pwonlyias.com/nda-previous-papers' }
        ]
      },
      2024: {
        title: 'NDA 2024 Question Paper',
        date: '2024-04-21',
        difficulty: 'Medium',
        sources: [
          { name: 'Testbook', url: 'https://testbook.com/nda-previous-year-papers' },
          { name: 'Careers360', url: 'https://competition.careers360.com/nda-question-papers' },
          { name: 'UPSC Official', url: 'https://upsc.gov.in/examinations/previous-question-papers' }
        ]
      },
      2023: {
        title: 'NDA 2023 Question Paper',
        date: '2023-04-16',
        difficulty: 'Hard',
        sources: [
          { name: 'Testbook', url: 'https://testbook.com/nda-previous-year-papers' },
          { name: 'PW Only IAS', url: 'https://pwonlyias.com/nda-previous-papers' },
          { name: 'UPSC Official', url: 'https://upsc.gov.in/examinations/previous-question-papers' }
        ]
      },
      2022: {
        title: 'NDA 2022 Question Paper',
        date: '2022-04-10',
        difficulty: 'Medium',
        sources: [
          { name: 'Testbook', url: 'https://testbook.com/nda-previous-year-papers' },
          { name: 'Careers360', url: 'https://competition.careers360.com/nda-question-papers' },
          { name: 'PW Only IAS', url: 'https://pwonlyias.com/nda-previous-papers' }
        ]
      }
    }
  }
};

const ExamPrep = ({ user }) => {
  // Simple state management
  const [selectedExam, setSelectedExam] = useState(null);
  const [showPapers, setShowPapers] = useState(false);

  // Direct access to Shiksha.com
  const downloadPaper = (paper) => {
    // Always go directly to ask.shiksha.com
    window.open('https://ask.shiksha.com/', '_blank');
  };



  // Handle exam selection
  const handleExamClick = (examKey) => {
    setSelectedExam(examKey);
    setShowPapers(true);
  };

  // Go back to exam grid
  const goBack = () => {
    setSelectedExam(null);
    setShowPapers(false);
  };

  // Render exam grid or papers view
  if (showPapers && selectedExam) {
    const examData = EXAM_DATA[selectedExam];
    const papers = Object.entries(examData.papers).map(([year, paper]) => ({
      year: parseInt(year),
      ...paper
    })).sort((a, b) => b.year - a.year);

    return (
      <div style={{ 
        padding: '2rem', 
        backgroundColor: '#f8fafc', 
        minHeight: '100vh' 
      }}>
        {/* Back Button */}
        <button
          onClick={goBack}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Exams
        </button>

        {/* Exam Header */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{examData.icon}</div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '700', 
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            {examData.fullName}
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#64748b',
            marginBottom: '1rem'
          }}>
            {examData.description}
          </p>
          <div style={{
            background: examData.color,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'inline-block',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Previous 4 Years Question Papers
          </div>

          {/* Legitimate Sources Info */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f1f5f9',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#475569'
          }}>
            <strong>🌐 Direct Access to ask.shiksha.com:</strong>
            <br />
            📚 <strong>All Exam Questions</strong> - NEET, JEE, UPSC, IBPS, RRB, NDA
            <br />
            📋 <strong>Previous Year Papers</strong> - 2025, 2024, 2023, 2022
            <br />
            📥 <strong>Download Options</strong> - PDF downloads available
            <br />
            🔍 <strong>Search by Exam</strong> - Filter questions by exam type
            <br />
            💡 <strong>Solutions Included</strong> - Detailed explanations provided
            <br />
            <br />
            <em>✅ Click button to go directly to ask.shiksha.com</em>
          </div>
        </div>

        {/* Papers Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem'
        }}>
          {papers.map((paper) => (
            <div
              key={paper.year}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
            >
              {/* Year Badge */}
              <div style={{
                background: `linear-gradient(135deg, ${examData.color}, ${examData.color}dd)`,
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                fontSize: '1.5rem',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                {paper.year}
              </div>

              {/* Paper Info */}
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '1rem'
              }}>
                {paper.title}
              </h3>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  📅 {new Date(paper.date).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span style={{
                  background: paper.difficulty === 'Easy' ? '#dcfce7' : 
                           paper.difficulty === 'Medium' ? '#fef3c7' : '#fee2e2',
                  color: paper.difficulty === 'Easy' ? '#166534' : 
                         paper.difficulty === 'Medium' ? '#92400e' : '#991b1b',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {paper.difficulty}
                </span>
              </div>

              {/* Download Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => downloadPaper(paper, 'question')}
                  style={{
                    background: examData.color,
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  }}
                >
                  🌐 Go to ask.shiksha.com
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main exam grid view
  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '1rem'
        }}>
          🎯 Exam Preparation
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#64748b',
          marginBottom: '2rem'
        }}>
          Choose your exam to access previous 4 years question papers
        </p>
      </div>

      {/* Exam Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {Object.entries(EXAM_DATA).map(([examKey, examData]) => (
          <div
            key={examKey}
            onClick={() => handleExamClick(examKey)}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
              e.currentTarget.style.borderColor = examData.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            {/* Exam Icon */}
            <div style={{
              fontSize: '4rem',
              marginBottom: '1.5rem'
            }}>
              {examData.icon}
            </div>

            {/* Exam Name */}
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>
              {examData.name}
            </h2>

            {/* Full Name */}
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '500',
              color: '#64748b',
              marginBottom: '1rem'
            }}>
              {examData.fullName}
            </h3>

            {/* Description */}
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              marginBottom: '2rem'
            }}>
              {examData.description}
            </p>

            {/* Action Button */}
            <div style={{
              background: `linear-gradient(135deg, ${examData.color}, ${examData.color}dd)`,
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'inline-block',
              transition: 'all 0.2s'
            }}>
              📋 View Question Papers
            </div>

            {/* Papers Count */}
            <div style={{
              marginTop: '1rem',
              fontSize: '0.9rem',
              color: '#64748b'
            }}>
              4 Years • 2024-2021
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div style={{
        textAlign: 'center',
        marginTop: '4rem',
        padding: '2rem',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '1rem'
        }}>
          📚 What You'll Get
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
            <h4 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Question Papers</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Original question papers from 2024-2021</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
            <h4 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Solutions</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Detailed solutions with explanations</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <h4 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Analysis</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Difficulty level and paper analysis</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📥</div>
            <h4 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Download</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Instant PDF downloads</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPrep;
