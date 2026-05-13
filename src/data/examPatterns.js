// ─────────────────────────────────────────────
// examPatterns.js
// Real exam pattern data based on previous year
// papers analysis. Used to generate questions
// that exactly match current year exam pattern.
// ─────────────────────────────────────────────

const EXAM_PATTERNS = {

  "SSC CGL": {
    examInfo: "SSC CGL Tier 1 — 100 questions, 60 minutes, +2/-0.5 marking",
    currentYear: "2024-2025",
    overallDifficulty: "Moderate to Difficult",

    topics: {
      "Quantitative Aptitude": {
        questionsInExam: 25,
        difficulty: "Moderate-Difficult",
        frequentSubtopics: [
          { name: "Ratio & Proportion", frequency: "Very High", questionsPerPaper: "3-4" },
          { name: "Percentage", frequency: "Very High", questionsPerPaper: "2-3" },
          { name: "Profit Loss & Discount", frequency: "Very High", questionsPerPaper: "2-3" },
          { name: "Geometry", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Trigonometry", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Data Interpretation", frequency: "High", questionsPerPaper: "4-5" },
          { name: "Time & Work", frequency: "Medium", questionsPerPaper: "1-2" },
          { name: "Simple & Compound Interest", frequency: "Medium", questionsPerPaper: "1-2" },
          { name: "Algebra", frequency: "Medium", questionsPerPaper: "2-3" },
          { name: "Mensuration", frequency: "Medium", questionsPerPaper: "1-2" },
        ],
        questionStyle: `
- Questions involve 2-3 step calculations
- Algebra questions: if x + 1/x = k, find x² + 1/x² type
- Geometry: properties of triangles, circles, parallel lines
- Trigonometry: values of sin/cos/tan, identities
- DI: table/bar graph with 3-4 calculation questions
- Options are close to each other — within 5-10% difference
- Common traps: wrong formula application, unit conversion errors
- Time pressure: each question should take 1-2 minutes
        `,
        sampleQuestions: [
          "If the ratio of ages of A and B is 3:5 and sum of their ages is 48, what will be ratio of their ages after 6 years?",
          "A shopkeeper marks price 40% above cost price and gives 25% discount. What is profit/loss percentage?",
          "In triangle ABC, angle A = 90°, AB = 6cm, BC = 10cm. Find AC.",
          "If sin θ + cos θ = √2, find sin θ × cos θ",
        ]
      },

      "General Intelligence & Reasoning": {
        questionsInExam: 25,
        difficulty: "Moderate",
        frequentSubtopics: [
          { name: "Analogy", frequency: "Very High", questionsPerPaper: "3-4" },
          { name: "Series (Number/Letter/Figure)", frequency: "Very High", questionsPerPaper: "3-4" },
          { name: "Coding Decoding", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Blood Relations", frequency: "High", questionsPerPaper: "1-2" },
          { name: "Direction Sense", frequency: "High", questionsPerPaper: "1-2" },
          { name: "Syllogism", frequency: "Medium", questionsPerPaper: "2" },
          { name: "Venn Diagram", frequency: "Medium", questionsPerPaper: "1-2" },
          { name: "Matrix", frequency: "Medium", questionsPerPaper: "1-2" },
          { name: "Cube & Dice", frequency: "Medium", questionsPerPaper: "1" },
        ],
        questionStyle: `
- Analogy: word pair or number pair relationships
- Series: find missing number or letter in sequence
- Coding: letter shifted by fixed number, symbol substitution
- Blood relations: family tree with 3-4 people
- Direction: person walks in multiple directions, find final position
- Options are designed to confuse — similar looking answers
- Syllogism: 2 statements, 2 conclusions
        `,
        sampleQuestions: [
          "Doctor : Hospital :: Teacher : ?",
          "2, 6, 12, 20, 30, ?",
          "In a code language MANGO is written as OCPIQ. How is APPLE written?",
          "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?",
        ]
      },

      "English Language": {
        questionsInExam: 25,
        difficulty: "Moderate",
        frequentSubtopics: [
          { name: "Reading Comprehension", frequency: "Very High", questionsPerPaper: "5" },
          { name: "Cloze Test", frequency: "Very High", questionsPerPaper: "5" },
          { name: "Error Spotting", frequency: "High", questionsPerPaper: "3" },
          { name: "Para Jumbles", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Synonyms & Antonyms", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Idioms & Phrases", frequency: "Medium", questionsPerPaper: "2" },
          { name: "One Word Substitution", frequency: "Medium", questionsPerPaper: "2" },
          { name: "Active Passive", frequency: "Medium", questionsPerPaper: "1-2" },
        ],
        questionStyle: `
- RC passage: 200-250 words, 5 questions including vocabulary
- Cloze test: 200 word passage with 5 blanks
- Error spotting: identify grammatical error in underlined parts
- Vocabulary: advanced words used in formal context
- Idioms: common English idioms with tricky meanings
        `,
        sampleQuestions: [
          "Choose the word most similar in meaning to ELOQUENT",
          "Find the error: He (A) is one of (B) the best student (C) in the class (D)",
          "One word substitution: A person who cannot be corrected",
        ]
      },

      "General Awareness": {
        questionsInExam: 25,
        difficulty: "Moderate",
        frequentSubtopics: [
          { name: "Current Affairs", frequency: "Very High", questionsPerPaper: "8-10" },
          { name: "History — Ancient, Medieval, Modern", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Indian Polity & Constitution", frequency: "High", questionsPerPaper: "3-4" },
          { name: "General Science (Physics, Chemistry, Bio)", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Indian Geography & World Geography", frequency: "Medium", questionsPerPaper: "2-3" },
          { name: "Indian Economy", frequency: "Medium", questionsPerPaper: "2" },
        ],
        questionStyle: `
- Current affairs: last 6 months events, appointments, awards
- History: specific dates, events, personalities
- Polity: articles of constitution, amendments, bodies
- Science: definitions, formulas, applications
- Questions are factual and specific — not general
        `,
        sampleQuestions: [
          "Which article of Indian Constitution deals with Right to Education?",
          "Who was the first Governor General of independent India?",
          "What is the SI unit of electric resistance?",
        ]
      }
    }
  },

  "SSC CHSL": {
    examInfo: "SSC CHSL Tier 1 — 100 questions, 60 minutes, +2/-0.5 marking",
    currentYear: "2024-2025",
    overallDifficulty: "Easy to Moderate",

    topics: {
      "Quantitative Aptitude": {
        questionsInExam: 25,
        difficulty: "Easy-Moderate",
        frequentSubtopics: [
          { name: "Percentage", frequency: "Very High", questionsPerPaper: "3-4" },
          { name: "Ratio & Proportion", frequency: "Very High", questionsPerPaper: "2-3" },
          { name: "Profit & Loss", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Time & Work", frequency: "High", questionsPerPaper: "2" },
          { name: "Simple & Compound Interest", frequency: "High", questionsPerPaper: "2" },
          { name: "Geometry", frequency: "Medium", questionsPerPaper: "2-3" },
          { name: "Mensuration", frequency: "Medium", questionsPerPaper: "2" },
          { name: "Data Interpretation", frequency: "Medium", questionsPerPaper: "3-4" },
        ],
        questionStyle: `
- Slightly easier than CGL — direct formula application
- Profit loss: single step with given cost/sell price
- Percentage: find value after given percentage change
- Time & Work: 2 people working together
- Options: 4 different values, one clearly correct after calculation
- Each question solvable in 60-90 seconds
        `,
        sampleQuestions: [
          "A sells an article at 20% profit. If cost price is Rs 500, find selling price.",
          "If 40% of a number is 160, what is 25% of that number?",
          "A can do work in 10 days, B in 15 days. Together they finish in how many days?",
        ]
      },

      "General Intelligence": {
        questionsInExam: 25,
        difficulty: "Easy-Moderate",
        frequentSubtopics: [
          { name: "Analogy", frequency: "Very High", questionsPerPaper: "4-5" },
          { name: "Series", frequency: "Very High", questionsPerPaper: "3-4" },
          { name: "Coding Decoding", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Blood Relations", frequency: "High", questionsPerPaper: "2" },
          { name: "Direction Sense", frequency: "Medium", questionsPerPaper: "1-2" },
          { name: "Venn Diagram", frequency: "Medium", questionsPerPaper: "2" },
          { name: "Syllogism", frequency: "Medium", questionsPerPaper: "2" },
        ],
        questionStyle: `
- Easier than CGL — more straightforward patterns
- Analogy: simple word or number relationships
- Series: arithmetic or geometric patterns
- Coding: simple letter shift or number substitution
        `,
        sampleQuestions: [
          "Cat : Kitten :: Dog : ?",
          "3, 7, 13, 21, 31, ?",
          "If COLD is coded as DPME, how is HEAT coded?",
        ]
      },

      "English Language": {
        questionsInExam: 25,
        difficulty: "Easy-Moderate",
        frequentSubtopics: [
          { name: "Reading Comprehension", frequency: "Very High", questionsPerPaper: "5" },
          { name: "Cloze Test", frequency: "High", questionsPerPaper: "5" },
          { name: "Error Detection", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Fill in the Blanks", frequency: "High", questionsPerPaper: "3" },
          { name: "Synonyms Antonyms", frequency: "Medium", questionsPerPaper: "2-3" },
          { name: "Para Jumbles", frequency: "Medium", questionsPerPaper: "2-3" },
        ],
        questionStyle: `
- Simpler vocabulary than CGL
- RC passage: 150-200 words
- Fill in blanks: grammar based
- Error detection: basic grammar rules
        `
      },

      "General Awareness": {
        questionsInExam: 25,
        difficulty: "Easy-Moderate",
        frequentSubtopics: [
          { name: "Current Affairs", frequency: "Very High", questionsPerPaper: "8-10" },
          { name: "History", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Science", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Polity", frequency: "Medium", questionsPerPaper: "2-3" },
          { name: "Geography", frequency: "Medium", questionsPerPaper: "2" },
        ],
        questionStyle: `
- Similar to CGL but slightly easier
- Current affairs: major national events
- Science: basic facts and definitions
        `
      }
    }
  },

  "RRB NTPC": {
    examInfo: "RRB NTPC CBT 1 — 100 questions, 90 minutes, +1/-0.33 marking",
    currentYear: "2024-2025",
    overallDifficulty: "Easy to Moderate",

    topics: {
      "Mathematics": {
        questionsInExam: 30,
        difficulty: "Easy-Moderate",
        frequentSubtopics: [
          { name: "Number System", frequency: "Very High", questionsPerPaper: "4-5" },
          { name: "Simplification", frequency: "Very High", questionsPerPaper: "3-4" },
          { name: "Ratio & Proportion", frequency: "High", questionsPerPaper: "3" },
          { name: "Percentage", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Profit & Loss", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Time & Work", frequency: "High", questionsPerPaper: "2" },
          { name: "Time Speed Distance", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Simple & Compound Interest", frequency: "Medium", questionsPerPaper: "2" },
        ],
        questionStyle: `
- Railway exam focus: train problems in speed/distance
- Number system: HCF LCM, divisibility rules
- Simplification: BODMAS with fractions and decimals
- Moderate difficulty — solvable in 1-1.5 minutes each
- Train related word problems appear frequently
        `,
        sampleQuestions: [
          "Two trains of length 120m and 80m running at 60 and 40 kmph towards each other. Time to cross?",
          "HCF of 36, 48, 60 is?",
          "A sum amounts to Rs 1200 in 2 years at 10% SI. Find principal.",
        ]
      },

      "General Intelligence & Reasoning": {
        questionsInExam: 30,
        difficulty: "Easy-Moderate",
        frequentSubtopics: [
          { name: "Analogies", frequency: "Very High", questionsPerPaper: "4-5" },
          { name: "Number Series", frequency: "Very High", questionsPerPaper: "3-4" },
          { name: "Coding Decoding", frequency: "High", questionsPerPaper: "3" },
          { name: "Mathematical Operations", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Blood Relations", frequency: "Medium", questionsPerPaper: "2" },
          { name: "Direction & Distance", frequency: "Medium", questionsPerPaper: "2" },
          { name: "Venn Diagram", frequency: "Medium", questionsPerPaper: "2" },
        ],
        questionStyle: `
- Straightforward patterns — less tricky than SSC
- Number series: simple arithmetic/geometric progressions
- Analogies: word pairs, number pairs, letter pairs
- Mathematical operations: BODMAS with symbols replaced
        `
      },

      "General Awareness": {
        questionsInExam: 40,
        difficulty: "Easy-Moderate",
        frequentSubtopics: [
          { name: "Railway GK", frequency: "Very High", questionsPerPaper: "8-10" },
          { name: "Current Affairs", frequency: "Very High", questionsPerPaper: "10-12" },
          { name: "Indian History", frequency: "High", questionsPerPaper: "4-5" },
          { name: "Indian Geography", frequency: "High", questionsPerPaper: "3-4" },
          { name: "General Science", frequency: "High", questionsPerPaper: "4-5" },
          { name: "Indian Polity & Constitution", frequency: "Medium", questionsPerPaper: "2-3" },
          { name: "Sports", frequency: "Medium", questionsPerPaper: "2-3" },
        ],
        questionStyle: `
- Railway specific GK: zones, headquarters, train records
- Current affairs: last 1 year important events
- Science: basic physics, chemistry, biology facts
- History: freedom struggle, important personalities
        `
      }
    }
  },

  "RRB Group D": {
    examInfo: "RRB Group D — 100 questions, 90 minutes, +1/-0.33 marking",
    currentYear: "2024-2025",
    overallDifficulty: "Easy",

    topics: {
      "Mathematics": {
        questionsInExam: 25,
        difficulty: "Easy",
        frequentSubtopics: [
          { name: "Number System", frequency: "Very High", questionsPerPaper: "4-5" },
          { name: "Simplification", frequency: "Very High", questionsPerPaper: "3-4" },
          { name: "Percentage", frequency: "High", questionsPerPaper: "3" },
          { name: "Ratio & Proportion", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Profit & Loss", frequency: "High", questionsPerPaper: "2" },
          { name: "Time & Work", frequency: "Medium", questionsPerPaper: "2" },
          { name: "Mensuration", frequency: "Medium", questionsPerPaper: "2" },
        ],
        questionStyle: `
- Basic level — direct formula application
- Number system: simple LCM HCF problems
- Percentage: straightforward calculations
- No DI — pure calculation questions
        `
      },

      "General Science": {
        questionsInExam: 25,
        difficulty: "Easy-Moderate",
        frequentSubtopics: [
          { name: "Physics — Motion, Force, Energy", frequency: "Very High", questionsPerPaper: "5-6" },
          { name: "Chemistry — Matter, Atoms, Molecules", frequency: "Very High", questionsPerPaper: "4-5" },
          { name: "Biology — Human Body Systems", frequency: "High", questionsPerPaper: "4-5" },
          { name: "Chemistry — Acids, Bases, Salts", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Biology — Cell, Tissues", frequency: "Medium", questionsPerPaper: "2-3" },
          { name: "Everyday Science Applications", frequency: "Medium", questionsPerPaper: "2-3" },
        ],
        questionStyle: `
- Science facts and definitions
- Physics: Newton's laws, basic formulas
- Chemistry: periodic table, common reactions
- Biology: organ functions, diseases
- Applications: why does X happen in daily life
        `
      }
    }
  },

  "IBPS PO": {
    examInfo: "IBPS PO Prelims — 100 questions, 60 minutes, +1/-0.25 marking",
    currentYear: "2024-2025",
    overallDifficulty: "Difficult",

    topics: {
      "Reasoning Ability": {
        questionsInExam: 35,
        difficulty: "Difficult",
        frequentSubtopics: [
          { name: "Puzzles & Seating Arrangement", frequency: "Very High", questionsPerPaper: "15-20" },
          { name: "Syllogism", frequency: "High", questionsPerPaper: "3-5" },
          { name: "Inequality", frequency: "High", questionsPerPaper: "3-5" },
          { name: "Coding Decoding", frequency: "Medium", questionsPerPaper: "3-5" },
          { name: "Blood Relations", frequency: "Medium", questionsPerPaper: "2-3" },
          { name: "Direction Sense", frequency: "Medium", questionsPerPaper: "2-3" },
        ],
        questionStyle: `
- Puzzles dominate — 3-4 sets of 4-5 questions each
- Linear arrangement: 7-8 people facing north/south
- Circular arrangement: 8 people facing centre/outside
- Floor puzzle: 8 floors, 8 people with different attributes
- Syllogism: all/some/no statements with conclusions
- Inequality: coded inequalities A > B = C type
- Very time consuming — each set takes 3-4 minutes
        `,
        sampleQuestions: [
          "8 persons A B C D E F G H sit in circular arrangement facing centre. A sits 3rd to left of B...",
          "All cats are dogs. Some dogs are birds. Conclusion: I. Some cats are birds II. All birds are dogs",
          "If A > B ≥ C = D < E, then which is true: I. A > D II. E > B",
        ]
      },

      "Quantitative Aptitude": {
        questionsInExam: 35,
        difficulty: "Difficult",
        frequentSubtopics: [
          { name: "Data Interpretation", frequency: "Very High", questionsPerPaper: "15-20" },
          { name: "Number Series", frequency: "High", questionsPerPaper: "5" },
          { name: "Quadratic Equations", frequency: "High", questionsPerPaper: "5" },
          { name: "Simplification", frequency: "Medium", questionsPerPaper: "5" },
          { name: "Percentage", frequency: "Medium", questionsPerPaper: "2-3" },
          { name: "Profit & Loss", frequency: "Medium", questionsPerPaper: "2" },
        ],
        questionStyle: `
- DI sets dominate: table, bar graph, pie chart, line graph
- Each DI set has 5 questions with heavy calculations
- Number series: complex patterns, find missing number
- Quadratic: x² - 5x + 6 = 0 type, compare roots
- Approximation: calculate approximate value quickly
        `
      },

      "English Language": {
        questionsInExam: 30,
        difficulty: "Moderate-Difficult",
        frequentSubtopics: [
          { name: "Reading Comprehension", frequency: "Very High", questionsPerPaper: "10" },
          { name: "Cloze Test", frequency: "High", questionsPerPaper: "5" },
          { name: "Para Jumbles", frequency: "High", questionsPerPaper: "5" },
          { name: "Error Spotting", frequency: "Medium", questionsPerPaper: "5" },
          { name: "Fill in the Blanks", frequency: "Medium", questionsPerPaper: "5" },
        ],
        questionStyle: `
- RC: 2 passages of 300-400 words each
- Vocabulary: advanced banking related words
- Para jumbles: 5-6 sentences to arrange
- Error: complex grammatical structures
        `
      }
    }
  },

  "UPSC Prelims": {
    examInfo: "UPSC CSE Prelims GS Paper 1 — 100 questions, 120 minutes, +2/-0.66 marking",
    currentYear: "2024-2025",
    overallDifficulty: "Very Difficult",

    topics: {
      "Indian History": {
        questionsInExam: 15,
        difficulty: "Difficult",
        frequentSubtopics: [
          { name: "Modern India — British Rule", frequency: "Very High", questionsPerPaper: "5-7" },
          { name: "Indian National Movement", frequency: "Very High", questionsPerPaper: "3-5" },
          { name: "Ancient India — Vedic, Maurya, Gupta", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Art, Culture & Architecture", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Medieval India — Delhi Sultanate, Mughal", frequency: "Medium", questionsPerPaper: "2-3" },
        ],
        questionStyle: `
- Statement based questions: which of following is correct
- Multiple correct statements — select all that apply
- Connect events with their causes or consequences
- Art & culture: architecture styles, paintings, dance forms
- UPSC never asks direct dates — always conceptual
- Options designed to confuse — 3 options look correct
        `,
        sampleQuestions: [
          "Consider the following statements about Quit India Movement: 1. It was launched in 1942 2. Gandhi gave the slogan Do or Die 3. It was the last major movement before independence. Which are correct?",
          "The Gandhara school of art was influenced by which of the following?",
        ]
      },

      "Indian Polity & Governance": {
        questionsInExam: 20,
        difficulty: "Difficult",
        frequentSubtopics: [
          { name: "Indian Constitution — Basics & Features", frequency: "Very High", questionsPerPaper: "4-5" },
          { name: "Fundamental Rights & Duties", frequency: "Very High", questionsPerPaper: "3-4" },
          { name: "Parliament & State Legislature", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Constitutional Bodies", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Government Schemes & Policies", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Judiciary — Supreme Court, HC", frequency: "Medium", questionsPerPaper: "2-3" },
        ],
        questionStyle: `
- Article numbers and their provisions
- Constitutional amendments and their effects
- Powers and functions of constitutional bodies
- Recent Supreme Court judgements
- Government schemes: objectives, beneficiaries, ministry
- Statement based: which statements are correct about X
        `
      },

      "Current Affairs": {
        questionsInExam: 20,
        difficulty: "Difficult",
        frequentSubtopics: [
          { name: "National Events & Government Schemes", frequency: "Very High", questionsPerPaper: "6-8" },
          { name: "International Relations & Summits", frequency: "Very High", questionsPerPaper: "4-5" },
          { name: "Science & Technology News", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Environment News", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Awards & Honours", frequency: "Medium", questionsPerPaper: "2" },
        ],
        questionStyle: `
- Last 1 year events — focus on policy implications
- International summits: location, outcomes, participants
- Science: ISRO missions, new discoveries, their significance
- Environment: COP meetings, endangered species, treaties
- UPSC links current affairs with static knowledge
        `
      }
    }
  },

  "IBPS Clerk": {
    examInfo: "IBPS Clerk Prelims — 100 questions, 60 minutes, +1/-0.25 marking",
    currentYear: "2024-2025",
    overallDifficulty: "Moderate",
    topics: {
      "Reasoning Ability": {
        questionsInExam: 35,
        difficulty: "Moderate",
        frequentSubtopics: [
          { name: "Puzzles & Seating Arrangement", frequency: "Very High", questionsPerPaper: "10-15" },
          { name: "Syllogism", frequency: "High", questionsPerPaper: "3-5" },
          { name: "Inequality", frequency: "High", questionsPerPaper: "3-5" },
          { name: "Alphanumeric Series", frequency: "Medium", questionsPerPaper: "3-5" },
          { name: "Blood Relations", frequency: "Medium", questionsPerPaper: "2-3" },
        ],
        questionStyle: `
- Simpler puzzles than IBPS PO
- Linear arrangement: 5-6 people
- Syllogism: 2 statements 2 conclusions
- Inequality: direct symbol based
        `
      },
      "Quantitative Aptitude": {
        questionsInExam: 35,
        difficulty: "Moderate",
        frequentSubtopics: [
          { name: "Number Series", frequency: "Very High", questionsPerPaper: "5" },
          { name: "Simplification", frequency: "Very High", questionsPerPaper: "10-15" },
          { name: "Data Interpretation", frequency: "High", questionsPerPaper: "5-10" },
          { name: "Percentage", frequency: "Medium", questionsPerPaper: "2-3" },
          { name: "Average & Ages", frequency: "Medium", questionsPerPaper: "2-3" },
        ],
        questionStyle: `
- Heavy simplification section — 10-15 questions
- Number series: moderate complexity
- DI: one set of 5 questions
        `
      }
    }
  },

  "SBI PO": {
    examInfo: "SBI PO Prelims — 100 questions, 60 minutes, +1/-0.25 marking",
    currentYear: "2024-2025",
    overallDifficulty: "Very Difficult",
    topics: {
      "Reasoning & Computer Aptitude": {
        questionsInExam: 35,
        difficulty: "Very Difficult",
        frequentSubtopics: [
          { name: "Puzzles & Seating Arrangement", frequency: "Very High", questionsPerPaper: "20-25" },
          { name: "Logical Reasoning", frequency: "High", questionsPerPaper: "5" },
          { name: "Input Output", frequency: "Medium", questionsPerPaper: "5" },
          { name: "Data Sufficiency", frequency: "Medium", questionsPerPaper: "3-5" },
        ],
        questionStyle: `
- Hardest reasoning in banking exams
- Complex puzzles: multiple variables, conditions
- Input output: word and number arrangement machine
- Data sufficiency: two statements, is data enough to answer
        `
      },
      "Data Analysis & Interpretation": {
        questionsInExam: 35,
        difficulty: "Very Difficult",
        frequentSubtopics: [
          { name: "Data Interpretation — Tables", frequency: "Very High", questionsPerPaper: "10-15" },
          { name: "Data Interpretation — Charts", frequency: "Very High", questionsPerPaper: "10-15" },
          { name: "Number Series", frequency: "Medium", questionsPerPaper: "5" },
          { name: "Quadratic Equations", frequency: "Medium", questionsPerPaper: "5" },
        ],
        questionStyle: `
- Very complex DI sets — 3-4 sets of 5 questions each
- Missing data DI — calculate missing values first
- Caselet DI — paragraph based data
- Heavy calculations required
        `
      }
    }
  },

  "SSC MTS": {
    examInfo: "SSC MTS — 90 questions, 90 minutes, +1/-0.25 marking",
    currentYear: "2024-2025",
    overallDifficulty: "Easy",
    topics: {
      "Numerical & Mathematical Ability": {
        questionsInExam: 20,
        difficulty: "Easy",
        frequentSubtopics: [
          { name: "Number System", frequency: "Very High", questionsPerPaper: "4-5" },
          { name: "Percentage", frequency: "High", questionsPerPaper: "3-4" },
          { name: "Ratio & Proportion", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Profit & Loss", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Basic Mensuration", frequency: "Medium", questionsPerPaper: "2" },
        ],
        questionStyle: `
- Very basic level — class 8-10 math
- Direct formula application
- Simple word problems
- No multi-step calculations
        `
      }
    }
  },

  "SSC GD": {
    examInfo: "SSC GD Constable — 80 questions, 60 minutes, +1/-0.25 marking",
    currentYear: "2024-2025",
    overallDifficulty: "Easy",
    topics: {
      "Elementary Mathematics": {
        questionsInExam: 20,
        difficulty: "Easy",
        frequentSubtopics: [
          { name: "Number System", frequency: "Very High", questionsPerPaper: "4" },
          { name: "Percentage", frequency: "High", questionsPerPaper: "3" },
          { name: "Profit & Loss", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Ratio & Proportion", frequency: "High", questionsPerPaper: "2-3" },
          { name: "Basic Mensuration", frequency: "Medium", questionsPerPaper: "2" },
        ],
        questionStyle: `
- Easiest among SSC exams
- Basic arithmetic only
- Class 8 level math
        `
      }
    }
  },

}

export default EXAM_PATTERNS