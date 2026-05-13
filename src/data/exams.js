const EXAMS = {

  // ─────────────────────────────────────────────
  // RAILWAY EXAMS
  // ─────────────────────────────────────────────

  "RRB NTPC": {
    fullName: "Railway Recruitment Board — NTPC",
    totalQuestions: 100,
    duration: 90,
    topics: [
      {
        id: "math",
        name: "Mathematics",
        tag: "tag-blue",
        weightage: "20%",
        subtopics: [
          "Number System", "Simplification", "HCF & LCM",
          "Ratio & Proportion", "Percentage", "Profit & Loss",
          "Simple & Compound Interest", "Time & Work",
          "Time Speed Distance", "Mensuration", "Algebra",
          "Trigonometry", "Statistics"
        ]
      },
      {
        id: "reasoning",
        name: "General Intelligence & Reasoning",
        tag: "tag-purple",
        weightage: "30%",
        subtopics: [
          "Analogies", "Alphabetical Series", "Number Series",
          "Coding Decoding", "Mathematical Operations",
          "Relationships", "Syllogism", "Jumbling",
          "Venn Diagram", "Data Interpretation",
          "Statements & Conclusions", "Blood Relations",
          "Direction & Distance", "Puzzle"
        ]
      },
      {
        id: "gk",
        name: "General Awareness",
        tag: "tag-orange",
        weightage: "30%",
        subtopics: [
          "Current Affairs", "Indian History",
          "Indian Geography", "Indian Polity & Constitution",
          "Indian Economy", "General Science",
          "Sports", "Awards & Honours",
          "Books & Authors", "Important Dates",
          "Railway GK", "Inventions & Discoveries"
        ]
      },
      {
        id: "hindi",
        name: "Hindi",
        tag: "tag-red",
        weightage: "20%",
        optional: true,
        subtopics: [
          "संधि और संधि विच्छेद", "उपसर्ग और प्रत्यय",
          "समास", "विलोम शब्द", "पर्यायवाची शब्द",
          "मुहावरे और लोकोक्तियाँ", "वाक्य शुद्धि",
          "रिक्त स्थान भरें", "अनेक शब्दों के लिए एक शब्द",
          "वर्तनी शुद्धि", "रेलवे संबंधी हिंदी प्रश्न",
          "व्याकरण — काल, क्रिया"
        ]
      },
      {
        id: "english_opt",
        name: "General English",
        tag: "tag-green",
        weightage: "20%",
        optional: true,
        subtopics: [
          "Reading Comprehension", "Fill in the Blanks",
          "Error Spotting", "Synonyms & Antonyms",
          "One Word Substitution", "Sentence Rearrangement",
          "Idioms & Phrases", "Cloze Test",
          "Active Passive Voice", "Direct Indirect Speech"
        ]
      }
    ]
  },

  "RRB Group D": {
    fullName: "Railway Recruitment Board — Group D",
    totalQuestions: 100,
    duration: 90,
    topics: [
      {
        id: "math",
        name: "Mathematics",
        tag: "tag-blue",
        weightage: "25%",
        subtopics: [
          "Number System", "Decimals & Fractions", "LCM & HCF",
          "Ratio & Proportion", "Percentage", "Mensuration",
          "Time & Work", "Time Speed Distance",
          "Simple & Compound Interest", "Profit & Loss",
          "Elementary Algebra", "Geometry & Trigonometry",
          "Elementary Statistics"
        ]
      },
      {
        id: "reasoning",
        name: "General Intelligence & Reasoning",
        tag: "tag-purple",
        weightage: "30%",
        subtopics: [
          "Analogies", "Alphabetical & Number Series",
          "Coding & Decoding", "Mathematical Operations",
          "Venn Diagram", "Data Interpretation",
          "Conclusions & Decision Making",
          "Similarities & Differences",
          "Analytical Reasoning", "Classification",
          "Directions", "Statement & Arguments"
        ]
      },
      {
        id: "science",
        name: "General Science",
        tag: "tag-green",
        weightage: "25%",
        subtopics: [
          "Physics — Motion, Force, Energy",
          "Physics — Light, Sound, Electricity",
          "Chemistry — Matter, Atoms, Molecules",
          "Chemistry — Acids, Bases, Salts",
          "Biology — Cell, Tissues",
          "Biology — Human Body Systems",
          "Biology — Plants & Nutrition",
          "Environment & Ecology",
          "Everyday Science Applications"
        ]
      },
      {
        id: "gk",
        name: "General Awareness & Current Affairs",
        tag: "tag-orange",
        weightage: "20%",
        subtopics: [
          "Current Affairs (last 1 year)",
          "Indian History & Freedom Struggle",
          "Indian Geography", "Indian Polity & Constitution",
          "Sports & Games", "Indian Economy",
          "Science & Technology", "Awards & Honours",
          "Railway Awareness"
        ]
      },
      {
        id: "hindi",
        name: "Hindi",
        tag: "tag-red",
        weightage: "20%",
        optional: true,
        subtopics: [
          "संधि और संधि विच्छेद", "उपसर्ग और प्रत्यय",
          "समास", "विलोम शब्द", "पर्यायवाची शब्द",
          "मुहावरे और लोकोक्तियाँ", "वाक्य शुद्धि",
          "रिक्त स्थान भरें", "अनेक शब्दों के लिए एक शब्द",
          "वर्तनी शुद्धि", "व्याकरण — संज्ञा, सर्वनाम",
          "लिंग और वचन"
        ]
      },
      {
        id: "english_opt",
        name: "General English",
        tag: "tag-green",
        weightage: "20%",
        optional: true,
        subtopics: [
          "Reading Comprehension", "Fill in the Blanks",
          "Error Spotting", "Synonyms & Antonyms",
          "One Word Substitution", "Sentence Rearrangement",
          "Idioms & Phrases", "Cloze Test",
          "Active Passive Voice", "Direct Indirect Speech"
        ]
      }
    ]
  },

  "RRB ALP": {
    fullName: "Railway Recruitment Board — Assistant Loco Pilot",
    totalQuestions: 75,
    duration: 60,
    topics: [
      {
        id: "math",
        name: "Mathematics",
        tag: "tag-blue",
        weightage: "25%",
        subtopics: [
          "Number System", "BODMAS", "Decimals & Fractions",
          "LCM & HCF", "Ratio & Proportion", "Percentage",
          "Mensuration", "Time & Work", "Time Speed Distance",
          "Simple & Compound Interest", "Profit & Loss",
          "Elementary Algebra", "Geometry & Trigonometry"
        ]
      },
      {
        id: "reasoning",
        name: "General Intelligence & Reasoning",
        tag: "tag-purple",
        weightage: "25%",
        subtopics: [
          "Analogies", "Alphabetical Series", "Number Series",
          "Coding Decoding", "Mathematical Operations",
          "Venn Diagram", "Data Interpretation",
          "Conclusions & Decision Making",
          "Similarities & Differences",
          "Analytical Reasoning", "Directions",
          "Blood Relations", "Syllogism"
        ]
      },
      {
        id: "science",
        name: "Basic Science & Engineering",
        tag: "tag-green",
        weightage: "35%",
        subtopics: [
          "Engineering Drawing & Basics",
          "Units & Measurements",
          "Mass Weight & Density",
          "Work Power & Energy",
          "Speed & Velocity",
          "Heat & Temperature",
          "Basic Electricity",
          "Levers & Simple Machines",
          "Occupational Safety & Health",
          "Environment Education",
          "IT Literacy"
        ]
      },
      {
        id: "gk",
        name: "General Awareness",
        tag: "tag-orange",
        weightage: "15%",
        subtopics: [
          "Current Affairs", "Indian History",
          "Indian Geography", "Indian Polity",
          "Science & Technology", "Sports & Awards",
          "Railway Awareness"
        ]
      },
      {
        id: "hindi",
        name: "Hindi",
        tag: "tag-red",
        weightage: "15%",
        optional: true,
        subtopics: [
          "संधि और संधि विच्छेद", "उपसर्ग और प्रत्यय",
          "समास", "विलोम शब्द", "पर्यायवाची शब्द",
          "मुहावरे और लोकोक्तियाँ", "वाक्य शुद्धि",
          "रिक्त स्थान भरें", "वर्तनी शुद्धि",
          "व्याकरण — काल, क्रिया"
        ]
      },
      {
        id: "english_opt",
        name: "General English",
        tag: "tag-green",
        weightage: "15%",
        optional: true,
        subtopics: [
          "Reading Comprehension", "Fill in the Blanks",
          "Error Spotting", "Synonyms & Antonyms",
          "One Word Substitution", "Sentence Rearrangement",
          "Idioms & Phrases", "Cloze Test"
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────
  // SSC EXAMS
  // ─────────────────────────────────────────────

  "SSC CGL": {
    fullName: "Staff Selection Commission — Combined Graduate Level",
    totalQuestions: 100,
    duration: 60,
    topics: [
      {
        id: "math",
        name: "Quantitative Aptitude",
        tag: "tag-blue",
        weightage: "25%",
        subtopics: [
          "Number System", "Percentage", "Ratio & Proportion",
          "Average", "Profit Loss & Discount",
          "Simple & Compound Interest", "Time & Work",
          "Pipe & Cistern", "Speed Time Distance",
          "Boat & Stream", "Algebra", "Geometry",
          "Mensuration", "Trigonometry",
          "Data Interpretation", "Statistics"
        ]
      },
      {
        id: "reasoning",
        name: "General Intelligence & Reasoning",
        tag: "tag-purple",
        weightage: "25%",
        subtopics: [
          "Classification", "Analogy", "Matrix",
          "Word Formation", "Arrangement",
          "Venn Diagram", "Missing Number",
          "Series (Number/Letter/Figure)",
          "Coding Decoding", "Blood Relations",
          "Direction Sense", "Syllogism",
          "Statement & Conclusions", "Cube & Dice"
        ]
      },
      {
        id: "english",
        name: "English Language",
        tag: "tag-green",
        weightage: "25%",
        subtopics: [
          "Reading Comprehension", "Cloze Test",
          "Para Jumbles", "Fill in the Blanks",
          "Error Spotting", "Phrase Replacement",
          "Synonyms & Antonyms", "One Word Substitution",
          "Idioms & Phrases", "Active Passive",
          "Direct Indirect"
        ]
      },
      {
        id: "gk",
        name: "General Awareness",
        tag: "tag-orange",
        weightage: "25%",
        subtopics: [
          "History — Ancient, Medieval, Modern",
          "Indian Geography & World Geography",
          "Indian Polity & Constitution",
          "Indian Economy",
          "General Science (Physics, Chemistry, Bio)",
          "Current Affairs", "Sports", "Awards",
          "Books & Authors",
          "Important Schemes & Policies",
          "Art & Culture"
        ]
      }
    ]
  },

  "SSC CHSL": {
    fullName: "Staff Selection Commission — CHSL",
    totalQuestions: 100,
    duration: 60,
    topics: [
      {
        id: "math",
        name: "Quantitative Aptitude",
        tag: "tag-blue",
        weightage: "25%",
        subtopics: [
          "Number System", "Percentage", "Ratio & Proportion",
          "Average", "Profit & Loss", "Interest",
          "Time & Work", "Speed Distance Time",
          "Algebra", "Geometry", "Mensuration",
          "Trigonometry", "Data Interpretation"
        ]
      },
      {
        id: "reasoning",
        name: "General Intelligence",
        tag: "tag-purple",
        weightage: "25%",
        subtopics: [
          "Analogy", "Classification", "Series",
          "Coding Decoding", "Blood Relations",
          "Direction Sense", "Venn Diagram",
          "Syllogism", "Matrix", "Cube & Dice"
        ]
      },
      {
        id: "english",
        name: "English Language",
        tag: "tag-green",
        weightage: "25%",
        subtopics: [
          "Reading Comprehension", "Cloze Test",
          "Error Detection", "Fill in the Blanks",
          "Synonyms Antonyms", "Idioms & Phrases",
          "One Word Substitution", "Para Jumbles"
        ]
      },
      {
        id: "gk",
        name: "General Awareness",
        tag: "tag-orange",
        weightage: "25%",
        subtopics: [
          "History", "Geography", "Polity",
          "Economy", "Science", "Current Affairs",
          "Sports", "Awards & Honours"
        ]
      }
    ]
  },

  "SSC MTS": {
    fullName: "Staff Selection Commission — Multi Tasking Staff",
    totalQuestions: 90,
    duration: 90,
    topics: [
      {
        id: "math",
        name: "Numerical & Mathematical Ability",
        tag: "tag-blue",
        weightage: "25%",
        subtopics: [
          "Number System", "Whole Numbers",
          "Decimals & Fractions", "Percentage",
          "Ratio & Proportion", "Average",
          "Simple Interest", "Profit & Loss",
          "Discount", "Time & Work",
          "Time Speed Distance", "Basic Mensuration",
          "Tables & Graphs"
        ]
      },
      {
        id: "reasoning",
        name: "Reasoning Ability & Problem Solving",
        tag: "tag-purple",
        weightage: "25%",
        subtopics: [
          "Non Verbal Reasoning", "Analogy",
          "Classification", "Series",
          "Coding Decoding", "Direction Sense",
          "Blood Relations", "Venn Diagram",
          "Mirror & Water Image", "Figure Completion",
          "Embedded Figures", "Paper Folding"
        ]
      },
      {
        id: "gk",
        name: "General Awareness",
        tag: "tag-orange",
        weightage: "25%",
        subtopics: [
          "India & its Neighbouring Countries",
          "Sports", "History", "Culture", "Geography",
          "Economic Scene", "General Polity",
          "Indian Constitution", "Scientific Research",
          "Current Affairs"
        ]
      },
      {
        id: "hindi",
        name: "Hindi",
        tag: "tag-red",
        weightage: "25%",
        optional: true,
        subtopics: [
          "संधि और संधि विच्छेद", "उपसर्ग और प्रत्यय",
          "समास", "विलोम शब्द", "पर्यायवाची शब्द",
          "मुहावरे और लोकोक्तियाँ", "वाक्य शुद्धि",
          "रिक्त स्थान भरें", "अनेक शब्दों के लिए एक शब्द",
          "वर्तनी शुद्धि", "व्याकरण — संज्ञा, सर्वनाम, विशेषण",
          "लिंग और वचन"
        ]
      },
      {
        id: "english_opt",
        name: "General English",
        tag: "tag-green",
        weightage: "25%",
        optional: true,
        subtopics: [
          "Vocabulary", "Grammar", "Sentence Structure",
          "Synonyms & Antonyms", "Fill in the Blanks",
          "Error Spotting", "Reading Comprehension",
          "Idioms & Phrases", "One Word Substitution"
        ]
      }
    ]
  },

  "SSC GD": {
    fullName: "Staff Selection Commission — General Duty Constable",
    totalQuestions: 80,
    duration: 60,
    topics: [
      {
        id: "math",
        name: "Elementary Mathematics",
        tag: "tag-blue",
        weightage: "25%",
        subtopics: [
          "Number System", "LCM & HCF",
          "Ratio & Proportion", "Percentage",
          "Average", "Profit & Loss",
          "Simple Interest", "Time & Work",
          "Time Speed Distance", "Basic Mensuration",
          "Fractions & Decimals"
        ]
      },
      {
        id: "reasoning",
        name: "General Intelligence & Reasoning",
        tag: "tag-purple",
        weightage: "25%",
        subtopics: [
          "Analogy", "Classification", "Series",
          "Coding Decoding", "Direction Sense",
          "Blood Relations", "Venn Diagram",
          "Syllogism", "Non Verbal Reasoning",
          "Mathematical Operations", "Arrangement"
        ]
      },
      {
        id: "gk",
        name: "General Knowledge & Awareness",
        tag: "tag-orange",
        weightage: "25%",
        subtopics: [
          "Current Affairs", "Indian History",
          "Indian Geography", "Indian Polity",
          "Indian Economy", "General Science",
          "Sports & Games", "Awards & Honours",
          "Important Days & Events"
        ]
      },
      {
        id: "hindi",
        name: "Hindi",
        tag: "tag-red",
        weightage: "25%",
        optional: true,
        subtopics: [
          "संधि और संधि विच्छेद", "उपसर्ग और प्रत्यय",
          "समास", "विलोम शब्द", "पर्यायवाची शब्द",
          "मुहावरे और लोकोक्तियाँ", "वाक्य शुद्धि",
          "रिक्त स्थान भरें", "अनेक शब्दों के लिए एक शब्द",
          "वर्तनी शुद्धि", "क्रिया और क्रिया भेद",
          "लिंग और वचन"
        ]
      },
      {
        id: "english_opt",
        name: "English Language",
        tag: "tag-green",
        weightage: "25%",
        optional: true,
        subtopics: [
          "Vocabulary", "Fill in the Blanks",
          "Error Spotting", "Synonyms & Antonyms",
          "One Word Substitution",
          "Reading Comprehension", "Idioms & Phrases"
        ]
      }
    ]
  },

  "SSC JE": {
    fullName: "Staff Selection Commission — Junior Engineer",
    totalQuestions: 200,
    duration: 120,
    topics: [
      {
        id: "gk",
        name: "General Intelligence & Reasoning",
        tag: "tag-purple",
        weightage: "15%",
        subtopics: [
          "Analogy", "Classification", "Series",
          "Coding Decoding", "Blood Relations",
          "Direction Sense", "Venn Diagram",
          "Syllogism", "Statement & Conclusions",
          "Non Verbal Reasoning"
        ]
      },
      {
        id: "english",
        name: "General Awareness",
        tag: "tag-orange",
        weightage: "15%",
        subtopics: [
          "Current Affairs", "Indian History",
          "Geography", "Polity & Constitution",
          "Economy", "Science & Technology",
          "Sports & Awards"
        ]
      },
      {
        id: "civil",
        name: "Civil Engineering",
        tag: "tag-blue",
        weightage: "35%",
        subtopics: [
          "Building Materials", "Estimating & Costing",
          "Surveying", "Soil Mechanics",
          "Hydraulics", "RCC Design",
          "Steel Design", "Environmental Engineering",
          "Transportation Engineering",
          "Structural Engineering"
        ]
      },
      {
        id: "electrical",
        name: "Electrical Engineering",
        tag: "tag-green",
        weightage: "35%",
        subtopics: [
          "Basic Electrical Engineering",
          "Electrical Machines",
          "Power Systems", "Control Systems",
          "Electrical Measurements",
          "Electronics & Circuits",
          "Power Electronics",
          "Utilization of Electrical Energy"
        ]
      },
      {
        id: "mechanical",
        name: "Mechanical Engineering",
        tag: "tag-red",
        weightage: "35%",
        subtopics: [
          "Theory of Machines",
          "Machine Design", "Fluid Mechanics",
          "Thermodynamics", "Heat Transfer",
          "Production Engineering",
          "Strength of Materials",
          "Industrial Engineering"
        ]
      }
    ]
  },

  "SSC Stenographer": {
    fullName: "Staff Selection Commission — Stenographer Grade C & D",
    totalQuestions: 200,
    duration: 120,
    topics: [
      {
        id: "reasoning",
        name: "General Intelligence & Reasoning",
        tag: "tag-purple",
        weightage: "33%",
        subtopics: [
          "Semantic Analogy", "Symbolic Operations",
          "Symbolic/Number Analogy", "Trends",
          "Figural Analogy", "Space Orientation",
          "Semantic Classification", "Venn Diagrams",
          "Symbolic/Number Classification",
          "Drawing Inferences", "Figural Classification",
          "Punched Hole/Pattern",
          "Semantic Series", "Figural Pattern",
          "Number Series", "Embedded Figures",
          "Critical Thinking", "Emotional Intelligence",
          "Word Building", "Social Intelligence",
          "Coding Decoding"
        ]
      },
      {
        id: "gk",
        name: "General Awareness",
        tag: "tag-orange",
        weightage: "33%",
        subtopics: [
          "Current Affairs — National & International",
          "Indian History", "Indian Geography",
          "Indian Polity & Constitution",
          "Indian Economy", "Science & Technology",
          "Sports & Games", "Awards & Honours",
          "Books & Authors", "Art & Culture",
          "Important Government Schemes"
        ]
      },
      {
        id: "english",
        name: "English Language & Comprehension",
        tag: "tag-green",
        weightage: "33%",
        subtopics: [
          "Spot the Error", "Fill in the Blanks",
          "Synonyms", "Antonyms",
          "Spelling Correction", "Idioms & Phrases",
          "One Word Substitution",
          "Sentence Improvement",
          "Active Passive Voice",
          "Direct Indirect Speech",
          "Reading Comprehension",
          "Para Jumbles", "Cloze Test"
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────
  // BANKING EXAMS
  // ─────────────────────────────────────────────

  "IBPS PO": {
    fullName: "Institute of Banking Personnel Selection — PO",
    totalQuestions: 100,
    duration: 60,
    topics: [
      {
        id: "reasoning",
        name: "Reasoning Ability",
        tag: "tag-purple",
        weightage: "35%",
        subtopics: [
          "Puzzles & Seating Arrangement",
          "Syllogism", "Coding Decoding",
          "Blood Relations", "Direction Sense",
          "Inequality", "Input Output",
          "Alphanumeric Series", "Data Sufficiency",
          "Logical Reasoning", "Order & Ranking"
        ]
      },
      {
        id: "quant",
        name: "Quantitative Aptitude",
        tag: "tag-blue",
        weightage: "35%",
        subtopics: [
          "Number Series", "Simplification",
          "Data Interpretation", "Quadratic Equations",
          "Percentage", "Profit & Loss",
          "Simple & Compound Interest",
          "Time & Work", "Speed Distance Time",
          "Probability", "Permutation & Combination",
          "Mensuration", "Average & Ages"
        ]
      },
      {
        id: "english",
        name: "English Language",
        tag: "tag-green",
        weightage: "30%",
        subtopics: [
          "Reading Comprehension",
          "Cloze Test", "Para Jumbles",
          "Error Spotting", "Fill in the Blanks",
          "Sentence Improvement",
          "Word Swap", "Column Based"
        ]
      }
    ]
  },

  "IBPS Clerk": {
    fullName: "Institute of Banking Personnel Selection — Clerk",
    totalQuestions: 100,
    duration: 60,
    topics: [
      {
        id: "reasoning",
        name: "Reasoning Ability",
        tag: "tag-purple",
        weightage: "35%",
        subtopics: [
          "Puzzles & Seating Arrangement",
          "Syllogism", "Coding Decoding",
          "Blood Relations", "Direction Sense",
          "Inequality", "Alphanumeric Series",
          "Order & Ranking", "Alphabet Based",
          "Distance & Direction", "Logical Reasoning"
        ]
      },
      {
        id: "quant",
        name: "Quantitative Aptitude",
        tag: "tag-blue",
        weightage: "35%",
        subtopics: [
          "Number Series", "Simplification",
          "Data Interpretation", "Percentage",
          "Profit & Loss", "Simple & Compound Interest",
          "Time & Work", "Speed Distance Time",
          "Average & Ages", "Ratio & Proportion",
          "Mensuration", "Quadratic Equations"
        ]
      },
      {
        id: "english",
        name: "English Language",
        tag: "tag-green",
        weightage: "30%",
        subtopics: [
          "Reading Comprehension",
          "Cloze Test", "Para Jumbles",
          "Error Spotting", "Fill in the Blanks",
          "Sentence Improvement",
          "Vocabulary Based", "Phrase Replacement"
        ]
      }
    ]
  },

  "SBI PO": {
    fullName: "State Bank of India — Probationary Officer",
    totalQuestions: 100,
    duration: 60,
    topics: [
      {
        id: "reasoning",
        name: "Reasoning & Computer Aptitude",
        tag: "tag-purple",
        weightage: "35%",
        subtopics: [
          "Puzzles & Seating Arrangement",
          "Syllogism", "Coding Decoding",
          "Blood Relations", "Direction Sense",
          "Inequality", "Input Output",
          "Logical Reasoning", "Data Sufficiency",
          "Computer Fundamentals",
          "MS Office & Internet", "Networking Basics"
        ]
      },
      {
        id: "quant",
        name: "Data Analysis & Interpretation",
        tag: "tag-blue",
        weightage: "35%",
        subtopics: [
          "Data Interpretation — Tables",
          "Data Interpretation — Charts",
          "Data Interpretation — Graphs",
          "Number Series", "Simplification",
          "Percentage", "Profit & Loss",
          "Simple & Compound Interest",
          "Time & Work", "Speed Distance Time",
          "Probability", "Permutation & Combination",
          "Quadratic Equations"
        ]
      },
      {
        id: "english",
        name: "English Language",
        tag: "tag-green",
        weightage: "30%",
        subtopics: [
          "Reading Comprehension",
          "Cloze Test", "Para Jumbles",
          "Error Spotting", "Fill in the Blanks",
          "Sentence Improvement",
          "Vocabulary — Synonyms Antonyms",
          "Word Usage", "Column Based Questions"
        ]
      }
    ]
  },

  "SBI Clerk": {
    fullName: "State Bank of India — Junior Associate",
    totalQuestions: 100,
    duration: 60,
    topics: [
      {
        id: "reasoning",
        name: "Reasoning Ability & Computer Aptitude",
        tag: "tag-purple",
        weightage: "35%",
        subtopics: [
          "Puzzles & Seating Arrangement",
          "Syllogism", "Coding Decoding",
          "Blood Relations", "Direction Sense",
          "Inequality", "Alphanumeric Series",
          "Order & Ranking",
          "Computer Basics",
          "MS Office", "Internet & Networking"
        ]
      },
      {
        id: "quant",
        name: "Quantitative Aptitude",
        tag: "tag-blue",
        weightage: "35%",
        subtopics: [
          "Number Series", "Simplification",
          "Data Interpretation", "Percentage",
          "Profit & Loss", "Simple & Compound Interest",
          "Time & Work", "Speed Distance Time",
          "Average & Ages", "Ratio & Proportion",
          "Mensuration"
        ]
      },
      {
        id: "english",
        name: "General English",
        tag: "tag-green",
        weightage: "30%",
        subtopics: [
          "Reading Comprehension",
          "Cloze Test", "Para Jumbles",
          "Error Spotting", "Fill in the Blanks",
          "Vocabulary", "Phrase Replacement",
          "Sentence Rearrangement"
        ]
      }
    ]
  },

  "RBI Grade B": {
    fullName: "Reserve Bank of India — Grade B Officer",
    totalQuestions: 200,
    duration: 120,
    topics: [
      {
        id: "reasoning",
        name: "Reasoning",
        tag: "tag-purple",
        weightage: "20%",
        subtopics: [
          "Verbal Reasoning", "Syllogism",
          "Statement & Argument",
          "Statement & Conclusions",
          "Logical Reasoning", "Analytical Reasoning",
          "Coded Inequality", "Input Output",
          "Puzzles & Seating Arrangement",
          "Blood Relations", "Direction Sense"
        ]
      },
      {
        id: "quant",
        name: "Quantitative Aptitude",
        tag: "tag-blue",
        weightage: "20%",
        subtopics: [
          "Data Interpretation", "Number Series",
          "Simplification & Approximation",
          "Quadratic Equations",
          "Percentage & Ratio", "Profit & Loss",
          "Time & Work", "Speed Distance Time",
          "Probability", "Permutation & Combination",
          "Data Sufficiency", "Caselet DI"
        ]
      },
      {
        id: "english",
        name: "English",
        tag: "tag-green",
        weightage: "20%",
        subtopics: [
          "Reading Comprehension",
          "Error Detection", "Para Jumbles",
          "Cloze Test", "Vocabulary",
          "Sentence Improvement",
          "Fill in the Blanks",
          "Paragraph Completion"
        ]
      },
      {
        id: "gk",
        name: "General Awareness",
        tag: "tag-orange",
        weightage: "20%",
        subtopics: [
          "Banking & Financial Awareness",
          "RBI Functions & Policies",
          "Monetary Policy & Credit Policy",
          "Indian Economy", "Budget & Finance",
          "Government Schemes",
          "Current Affairs — Economy",
          "International Organizations",
          "Capital Markets & SEBI",
          "Insurance Sector"
        ]
      },
      {
        id: "finance",
        name: "Finance & Management",
        tag: "tag-red",
        weightage: "20%",
        subtopics: [
          "Financial System of India",
          "Capital & Money Market",
          "Financial Institutions",
          "Management Concepts",
          "Leadership & Motivation",
          "Communication",
          "Corporate Governance",
          "Ethics in Business"
        ]
      }
    ]
  },

  "RBI Assistant": {
    fullName: "Reserve Bank of India — Assistant",
    totalQuestions: 100,
    duration: 60,
    topics: [
      {
        id: "reasoning",
        name: "Reasoning Ability",
        tag: "tag-purple",
        weightage: "25%",
        subtopics: [
          "Puzzles & Seating Arrangement",
          "Syllogism", "Coding Decoding",
          "Blood Relations", "Direction Sense",
          "Inequality", "Alphanumeric Series",
          "Order & Ranking", "Logical Reasoning",
          "Data Sufficiency"
        ]
      },
      {
        id: "quant",
        name: "Numerical Ability",
        tag: "tag-blue",
        weightage: "25%",
        subtopics: [
          "Number Series", "Simplification",
          "Data Interpretation", "Percentage",
          "Profit & Loss", "Interest",
          "Time & Work", "Speed Distance",
          "Average", "Ratio & Proportion",
          "Mensuration"
        ]
      },
      {
        id: "english",
        name: "English Language",
        tag: "tag-green",
        weightage: "25%",
        subtopics: [
          "Reading Comprehension",
          "Cloze Test", "Error Spotting",
          "Fill in the Blanks",
          "Sentence Improvement",
          "Para Jumbles", "Vocabulary"
        ]
      },
      {
        id: "gk",
        name: "General Awareness",
        tag: "tag-orange",
        weightage: "25%",
        subtopics: [
          "Banking Awareness", "RBI & Monetary Policy",
          "Current Affairs", "Indian Economy",
          "Government Schemes",
          "International Organizations",
          "Financial Terms & Concepts",
          "Static GK"
        ]
      }
    ]
  },

  "LIC AAO": {
    fullName: "Life Insurance Corporation — Assistant Administrative Officer",
    totalQuestions: 90,
    duration: 90,
    topics: [
      {
        id: "reasoning",
        name: "Reasoning Ability",
        tag: "tag-purple",
        weightage: "25%",
        subtopics: [
          "Puzzles & Seating Arrangement",
          "Syllogism", "Coding Decoding",
          "Blood Relations", "Direction Sense",
          "Inequality", "Input Output",
          "Alphanumeric Series", "Order & Ranking",
          "Logical Reasoning"
        ]
      },
      {
        id: "quant",
        name: "Quantitative Aptitude",
        tag: "tag-blue",
        weightage: "25%",
        subtopics: [
          "Data Interpretation", "Number Series",
          "Simplification", "Percentage",
          "Profit & Loss", "Interest",
          "Time & Work", "Speed Distance",
          "Probability", "Quadratic Equations",
          "Average & Ages"
        ]
      },
      {
        id: "english",
        name: "English Language",
        tag: "tag-green",
        weightage: "25%",
        subtopics: [
          "Reading Comprehension",
          "Cloze Test", "Para Jumbles",
          "Error Spotting", "Fill in the Blanks",
          "Sentence Improvement", "Vocabulary"
        ]
      },
      {
        id: "gk",
        name: "General Knowledge & Current Affairs",
        tag: "tag-orange",
        weightage: "25%",
        subtopics: [
          "Insurance Sector Awareness",
          "LIC Products & Services",
          "IRDAI & Regulations",
          "Banking & Finance",
          "Current Affairs",
          "Indian Economy",
          "Government Schemes",
          "Static GK"
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────
  // UPSC EXAMS
  // ─────────────────────────────────────────────

  "UPSC Prelims": {
    fullName: "UPSC Civil Services Preliminary Examination",
    totalQuestions: 100,
    duration: 120,
    topics: [
      {
        id: "history",
        name: "Indian History",
        tag: "tag-orange",
        weightage: "15%",
        subtopics: [
          "Ancient India — Vedic, Maurya, Gupta",
          "Medieval India — Delhi Sultanate, Mughal",
          "Modern India — British Rule",
          "Indian National Movement",
          "Post Independence Events",
          "Art, Culture & Architecture"
        ]
      },
      {
        id: "geography",
        name: "Indian & World Geography",
        tag: "tag-blue",
        weightage: "15%",
        subtopics: [
          "Physical Geography — Landforms, Rivers",
          "Indian Geography — States, Mountains",
          "Climate & Monsoon",
          "World Geography — Continents, Oceans",
          "Natural Resources", "Environment & Ecology",
          "Economic Geography"
        ]
      },
      {
        id: "polity",
        name: "Indian Polity & Governance",
        tag: "tag-purple",
        weightage: "20%",
        subtopics: [
          "Indian Constitution — Basics & Features",
          "Fundamental Rights & Duties",
          "Parliament & State Legislature",
          "Executive — President, PM, Cabinet",
          "Judiciary — Supreme Court, HC",
          "Local Governance — Panchayati Raj",
          "Constitutional Bodies",
          "Government Schemes & Policies"
        ]
      },
      {
        id: "economy",
        name: "Indian Economy",
        tag: "tag-green",
        weightage: "15%",
        subtopics: [
          "National Income & GDP", "Money & Banking",
          "Inflation", "Budget & Fiscal Policy",
          "Agriculture & Rural Economy",
          "Industry & Services", "International Trade",
          "Economic Reforms", "Poverty & Unemployment"
        ]
      },
      {
        id: "science",
        name: "General Science & Technology",
        tag: "tag-red",
        weightage: "15%",
        subtopics: [
          "Physics — Laws & Applications",
          "Chemistry — Elements & Compounds",
          "Biology — Human Body & Diseases",
          "Space & Defence Technology",
          "IT & Computers", "Biotechnology",
          "Environment & Climate Change"
        ]
      },
      {
        id: "current",
        name: "Current Affairs",
        tag: "tag-orange",
        weightage: "20%",
        subtopics: [
          "National Events & Government Schemes",
          "International Relations & Summits",
          "Awards & Honours", "Sports Events",
          "Important Appointments",
          "Science & Technology News",
          "Economy & Business News",
          "Environment News"
        ]
      }
    ]
  },

  "UPSC CDS": {
    fullName: "UPSC Combined Defence Services",
    totalQuestions: 120,
    duration: 120,
    topics: [
      {
        id: "english",
        name: "English",
        tag: "tag-green",
        weightage: "33%",
        subtopics: [
          "Spotting Errors", "Sentence Arrangement",
          "Selecting Words", "Ordering of Sentences",
          "Fill in the Blanks", "Comprehension",
          "Synonyms & Antonyms", "Idioms & Phrases",
          "One Word Substitution"
        ]
      },
      {
        id: "gk",
        name: "General Knowledge",
        tag: "tag-orange",
        weightage: "33%",
        subtopics: [
          "Current Affairs — National & International",
          "Indian History & Freedom Movement",
          "Indian Geography & World Geography",
          "Indian Polity & Constitution",
          "Indian Economy", "Defence & Military Affairs",
          "Science & Technology", "Sports & Awards",
          "Books & Authors"
        ]
      },
      {
        id: "math",
        name: "Elementary Mathematics",
        tag: "tag-blue",
        weightage: "33%",
        subtopics: [
          "Number System", "Fundamental Operations",
          "LCM & HCF", "Ratio & Proportion",
          "Percentage", "Square Roots",
          "Average", "Interest",
          "Profit & Loss", "Time & Distance",
          "Time & Work", "Algebra",
          "Geometry", "Mensuration",
          "Trigonometry", "Statistics"
        ]
      }
    ]
  },

  "NDA": {
    fullName: "National Defence Academy & Naval Academy Examination",
    totalQuestions: 270,
    duration: 150,
    topics: [
      {
        id: "math",
        name: "Mathematics",
        tag: "tag-blue",
        weightage: "45%",
        subtopics: [
          "Algebra", "Matrices & Determinants",
          "Trigonometry", "Analytical Geometry 2D & 3D",
          "Differential Calculus",
          "Integral Calculus & Differential Equations",
          "Vector Algebra",
          "Statistics & Probability",
          "Number System & Arithmetic",
          "Logarithms & Surds",
          "Permutation & Combination",
          "Binomial Theorem",
          "Sets, Relations & Functions"
        ]
      },
      {
        id: "english",
        name: "English",
        tag: "tag-green",
        weightage: "20%",
        subtopics: [
          "Comprehension", "Error Recognition",
          "Fill in the Blanks — Grammar",
          "Synonyms & Antonyms",
          "Sentence Rearrangement",
          "Completion of Sentences",
          "Vocabulary", "Idioms & Phrases",
          "One Word Substitution",
          "Active Passive & Reported Speech"
        ]
      },
      {
        id: "physics",
        name: "Physics",
        tag: "tag-purple",
        weightage: "15%",
        subtopics: [
          "Physical Properties & States of Matter",
          "Motion Laws & Gravitation",
          "Work Energy Power",
          "Heat & Thermodynamics",
          "Sound & Light",
          "Electricity & Magnetism",
          "Modern Physics",
          "Atomic Structure",
          "Defence Technology — Nuclear, Missiles"
        ]
      },
      {
        id: "chemistry",
        name: "Chemistry",
        tag: "tag-red",
        weightage: "10%",
        subtopics: [
          "Physical & Chemical Changes",
          "Elements, Compounds, Mixtures",
          "Acids, Bases, Salts",
          "Carbon & Compounds",
          "Oxidation & Reduction",
          "Chemical Bonding",
          "Preparation of Substances",
          "Properties of Air & Water"
        ]
      },
      {
        id: "history",
        name: "History, Freedom Movement & Geography",
        tag: "tag-orange",
        weightage: "10%",
        subtopics: [
          "Indian History — Ancient to Modern",
          "Freedom Struggle",
          "Bharat Ratna & Awards",
          "Indian Geography",
          "World Geography",
          "Climate, Soil & Vegetation",
          "Major Ports & Straits"
        ]
      }
    ]
  },

  "AFCAT": {
    fullName: "Air Force Common Admission Test",
    totalQuestions: 100,
    duration: 120,
    topics: [
      {
        id: "gk",
        name: "General Awareness",
        tag: "tag-orange",
        weightage: "25%",
        subtopics: [
          "Indian History & Culture",
          "Indian Geography",
          "Indian Polity & Constitution",
          "Indian Economy",
          "Defence & Military Affairs",
          "Sports & Games",
          "Awards & Honours",
          "Science & Technology",
          "Current Affairs — National & International",
          "Books & Authors",
          "Important Days & Events"
        ]
      },
      {
        id: "verbal",
        name: "Verbal Ability in English",
        tag: "tag-green",
        weightage: "25%",
        subtopics: [
          "Comprehension", "Error Detection",
          "Sentence Completion",
          "Synonyms & Antonyms",
          "Testing of Vocabulary",
          "Idioms & Phrases",
          "One Word Substitution",
          "Sentence Rearrangement"
        ]
      },
      {
        id: "numerical",
        name: "Numerical Ability",
        tag: "tag-blue",
        weightage: "25%",
        subtopics: [
          "Decimal Fraction", "Simplification",
          "Average", "Ratio & Proportion",
          "Percentage", "Profit & Loss",
          "Simple & Compound Interest",
          "Time & Work", "Time Speed Distance",
          "LCM & HCF", "Mensuration",
          "Logarithms", "Power & Exponents"
        ]
      },
      {
        id: "reasoning",
        name: "Reasoning & Military Aptitude",
        tag: "tag-purple",
        weightage: "25%",
        subtopics: [
          "Verbal Skills & Spatial Ability",
          "Analogy", "Classification",
          "Series", "Coding Decoding",
          "Blood Relations", "Direction Sense",
          "Venn Diagram", "Figure Matrix",
          "Dot Situation", "Embedded Figures",
          "Completion of Pattern"
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────
  // STATE EXAMS
  // ─────────────────────────────────────────────

  "State PSC": {
    fullName: "State Public Service Commission — General",
    totalQuestions: 150,
    duration: 120,
    topics: [
      {
        id: "history",
        name: "History & Culture",
        tag: "tag-orange",
        weightage: "15%",
        subtopics: [
          "Ancient Indian History",
          "Medieval Indian History",
          "Modern Indian History",
          "Indian National Movement",
          "State Specific History",
          "Art & Culture", "Heritage Sites"
        ]
      },
      {
        id: "geography",
        name: "Geography",
        tag: "tag-blue",
        weightage: "15%",
        subtopics: [
          "Indian Physical Geography",
          "State Geography", "World Geography",
          "Climate & Environment",
          "Natural Resources",
          "Agriculture & Irrigation",
          "Disasters & Management"
        ]
      },
      {
        id: "polity",
        name: "Polity & Governance",
        tag: "tag-purple",
        weightage: "20%",
        subtopics: [
          "Indian Constitution",
          "Fundamental Rights & Duties",
          "Parliament & Legislature",
          "State Government Structure",
          "Local Self Government",
          "Constitutional Bodies",
          "Government Schemes", "RTI & Important Acts"
        ]
      },
      {
        id: "economy",
        name: "Economy",
        tag: "tag-green",
        weightage: "15%",
        subtopics: [
          "Indian Economy Basics", "State Economy",
          "Agriculture & Rural Development",
          "Budget & Planning",
          "Banking & Finance",
          "Poverty & Employment Schemes",
          "International Organizations"
        ]
      },
      {
        id: "science",
        name: "General Science",
        tag: "tag-red",
        weightage: "15%",
        subtopics: [
          "Physics Basics", "Chemistry Basics",
          "Biology & Human Body",
          "Environment & Ecology",
          "Science & Technology",
          "Health & Disease",
          "Agriculture Science"
        ]
      },
      {
        id: "current",
        name: "Current Affairs",
        tag: "tag-orange",
        weightage: "20%",
        subtopics: [
          "State Current Affairs",
          "National Current Affairs",
          "International Affairs",
          "Sports & Awards",
          "Important Appointments",
          "Government Schemes",
          "Economy News"
        ]
      },
      {
        id: "hindi",
        name: "Hindi",
        tag: "tag-red",
        weightage: "10%",
        optional: true,
        subtopics: [
          "संधि और संधि विच्छेद", "उपसर्ग और प्रत्यय",
          "समास", "विलोम शब्द", "पर्यायवाची शब्द",
          "मुहावरे और लोकोक्तियाँ", "वाक्य शुद्धि",
          "रिक्त स्थान भरें", "व्याकरण — काल, क्रिया",
          "राज्य विशेष हिंदी"
        ]
      }
    ]
  },

  "Delhi Police Constable": {
    fullName: "Delhi Police — Head Constable & Constable",
    totalQuestions: 100,
    duration: 90,
    topics: [
      {
        id: "reasoning",
        name: "General Intelligence & Reasoning",
        tag: "tag-purple",
        weightage: "25%",
        subtopics: [
          "Analogy", "Classification", "Series",
          "Coding Decoding", "Blood Relations",
          "Direction Sense", "Venn Diagram",
          "Syllogism", "Non Verbal Reasoning",
          "Arrangement", "Mathematical Operations",
          "Statement & Conclusions"
        ]
      },
      {
        id: "gk",
        name: "General Knowledge",
        tag: "tag-orange",
        weightage: "25%",
        subtopics: [
          "Indian History", "Indian Geography",
          "Indian Polity & Constitution",
          "Indian Economy", "General Science",
          "Current Affairs", "Sports & Games",
          "Delhi Specific GK",
          "Awards & Honours",
          "Important Government Schemes"
        ]
      },
      {
        id: "math",
        name: "Numerical Ability",
        tag: "tag-blue",
        weightage: "25%",
        subtopics: [
          "Number System", "Percentage",
          "Ratio & Proportion", "Average",
          "Profit & Loss", "Simple Interest",
          "Time & Work", "Speed Distance",
          "Basic Mensuration", "Fractions"
        ]
      },
      {
        id: "english",
        name: "English",
        tag: "tag-green",
        weightage: "25%",
        subtopics: [
          "Comprehension", "Error Spotting",
          "Fill in the Blanks", "Synonyms & Antonyms",
          "One Word Substitution", "Idioms & Phrases",
          "Sentence Rearrangement",
          "Active Passive Voice"
        ]
      }
    ]
  }

}

export default EXAMS