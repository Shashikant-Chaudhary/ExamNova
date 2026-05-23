// ─────────────────────────────────────────────
// mockConfig.js
// Real exam patterns with CA sections marked
// CA sections use Tavily + AI for latest news
// Topic names match question bank exactly
// ─────────────────────────────────────────────

const MOCK_CONFIG = {

  "RRB NTPC": {
    totalQuestions: 100,
    duration:       90,
    marking:        { correct: 1, wrong: -0.33 },
    hasOptionalSubject: true,
    sections: [
      { name: "Mathematics",                      topic: "Mathematics",                      questions: 30, type: "normal" },
      { name: "General Intelligence & Reasoning", topic: "General Intelligence & Reasoning", questions: 30, type: "normal" },
      { name: "General Awareness",                topic: "General Awareness",                questions: 26, type: "normal" },
      { name: "Current Affairs",                  topic: "Current Affairs",                  questions: 14, type: "current_affairs" },
      { name: "General English",                  topic: "General English",                  questions: 0,  type: "normal", optional: "english" },
      { name: "Hindi",                            topic: "Hindi",                            questions: 0,  type: "normal", optional: "hindi"   },
    ]
  },

  "RRB Group D": {
    totalQuestions: 100,
    duration:       90,
    marking:        { correct: 1, wrong: -0.33 },
    hasOptionalSubject: true,
    sections: [
      { name: "Mathematics",                         topic: "Mathematics",                         questions: 25, type: "normal" },
      { name: "General Intelligence & Reasoning",    topic: "General Intelligence & Reasoning",    questions: 30, type: "normal" },
      { name: "General Science",                     topic: "General Science",                     questions: 25, type: "normal" },
      { name: "General Awareness & Current Affairs", topic: "General Awareness & Current Affairs", questions: 13, type: "normal" },
      { name: "Current Affairs",                     topic: "Current Affairs",                     questions: 7,  type: "current_affairs" },
      { name: "General English",                     topic: "General English",                     questions: 0,  type: "normal", optional: "english" },
      { name: "Hindi",                               topic: "Hindi",                               questions: 0,  type: "normal", optional: "hindi"   },
    ]
  },

  "RRB ALP": {
    totalQuestions: 75,
    duration:       60,
    marking:        { correct: 1, wrong: -0.33 },
    hasOptionalSubject: true,
    sections: [
      { name: "Mathematics",                      topic: "Mathematics",                      questions: 20, type: "normal" },
      { name: "General Intelligence & Reasoning", topic: "General Intelligence & Reasoning", questions: 25, type: "normal" },
      { name: "Basic Science & Engineering",      topic: "Basic Science & Engineering",      questions: 20, type: "normal" },
      { name: "General Awareness",                topic: "General Awareness",                questions: 6,  type: "normal" },
      { name: "Current Affairs",                  topic: "Current Affairs",                  questions: 4,  type: "current_affairs" },
      { name: "General English",                  topic: "General English",                  questions: 0,  type: "normal", optional: "english" },
      { name: "Hindi",                            topic: "Hindi",                            questions: 0,  type: "normal", optional: "hindi"   },
    ]
  },

  "SSC CGL": {
    totalQuestions: 100,
    duration:       60,
    marking:        { correct: 2, wrong: -0.5 },
    sections: [
      { name: "Quantitative Aptitude",            topic: "Quantitative Aptitude",            questions: 25, type: "normal" },
      { name: "General Intelligence & Reasoning", topic: "General Intelligence & Reasoning", questions: 25, type: "normal" },
      { name: "English Language",                 topic: "English Language",                 questions: 25, type: "normal" },
      { name: "General Awareness",                topic: "General Awareness",                questions: 16, type: "normal" },
      { name: "Current Affairs",                  topic: "Current Affairs",                  questions: 9,  type: "current_affairs" },
    ]
  },

  "SSC CHSL": {
    totalQuestions: 100,
    duration:       60,
    marking:        { correct: 2, wrong: -0.5 },
    sections: [
      { name: "Quantitative Aptitude", topic: "Quantitative Aptitude", questions: 25, type: "normal" },
      { name: "General Intelligence",  topic: "General Intelligence",  questions: 25, type: "normal" },
      { name: "English Language",      topic: "English Language",      questions: 25, type: "normal" },
      { name: "General Awareness",     topic: "General Awareness",     questions: 16, type: "normal" },
      { name: "Current Affairs",       topic: "Current Affairs",       questions: 9,  type: "current_affairs" },
    ]
  },

  "SSC MTS": {
    totalQuestions: 90,
    duration:       90,
    marking:        { correct: 1, wrong: -0.25 },
    hasOptionalSubject: true,
    sections: [
      { name: "Numerical & Mathematical Ability",    topic: "Numerical & Mathematical Ability",    questions: 20, type: "normal" },
      { name: "Reasoning Ability & Problem Solving", topic: "Reasoning Ability & Problem Solving", questions: 25, type: "normal" },
      { name: "General Awareness",                   topic: "General Awareness",                   questions: 13, type: "normal" },
      { name: "Current Affairs",                     topic: "Current Affairs",                     questions: 7,  type: "current_affairs" },
      { name: "General English",                     topic: "General English",                     questions: 25, type: "normal", optional: "english" },
      { name: "Hindi",                               topic: "Hindi",                               questions: 25, type: "normal", optional: "hindi"   },
    ]
  },

  "SSC GD": {
    totalQuestions: 80,
    duration:       60,
    marking:        { correct: 1, wrong: -0.25 },
    hasOptionalSubject: true,
    sections: [
      { name: "Elementary Mathematics",           topic: "Elementary Mathematics",           questions: 20, type: "normal" },
      { name: "General Intelligence & Reasoning", topic: "General Intelligence & Reasoning", questions: 20, type: "normal" },
      { name: "General Knowledge & Awareness",    topic: "General Knowledge & Awareness",    questions: 13, type: "normal" },
      { name: "Current Affairs",                  topic: "Current Affairs",                  questions: 7,  type: "current_affairs" },
      { name: "English Language",                 topic: "English Language",                 questions: 20, type: "normal", optional: "english" },
      { name: "Hindi",                            topic: "Hindi",                            questions: 20, type: "normal", optional: "hindi"   },
    ]
  },

  "SSC JE": {
    totalQuestions: 60,
    duration:       120,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "General Intelligence & Reasoning", topic: "General Intelligence & Reasoning", questions: 20, type: "normal" },
      { name: "General Awareness",                topic: "General Awareness",                questions: 20, type: "normal" },
      { name: "Civil Engineering",                topic: "Civil Engineering",                questions: 7,  type: "normal" },
      { name: "Electrical Engineering",           topic: "Electrical Engineering",           questions: 7,  type: "normal" },
      { name: "Mechanical Engineering",           topic: "Mechanical Engineering",           questions: 6,  type: "normal" },
    ]
  },

  "SSC Stenographer": {
    totalQuestions: 59,
    duration:       120,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "General Intelligence & Reasoning",  topic: "General Intelligence & Reasoning",  questions: 19, type: "normal" },
      { name: "General Awareness",                 topic: "General Awareness",                 questions: 20, type: "normal" },
      { name: "English Language & Comprehension",  topic: "English Language & Comprehension",  questions: 20, type: "normal" },
    ]
  },

  "IBPS PO": {
    totalQuestions: 100,
    duration:       60,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "Reasoning Ability",     topic: "Reasoning Ability",     questions: 35, type: "normal" },
      { name: "Quantitative Aptitude", topic: "Quantitative Aptitude", questions: 35, type: "normal" },
      { name: "English Language",      topic: "English Language",      questions: 30, type: "normal" },
    ]
  },

  "IBPS Clerk": {
    totalQuestions: 100,
    duration:       60,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "Reasoning Ability",     topic: "Reasoning Ability",     questions: 35, type: "normal" },
      { name: "Quantitative Aptitude", topic: "Quantitative Aptitude", questions: 35, type: "normal" },
      { name: "English Language",      topic: "English Language",      questions: 30, type: "normal" },
    ]
  },

  "SBI PO": {
    totalQuestions: 100,
    duration:       60,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "Reasoning & Computer Aptitude",  topic: "Reasoning & Computer Aptitude",  questions: 35, type: "normal" },
      { name: "Data Analysis & Interpretation", topic: "Data Analysis & Interpretation", questions: 35, type: "normal" },
      { name: "English Language",               topic: "English Language",               questions: 30, type: "normal" },
    ]
  },

  "SBI Clerk": {
    totalQuestions: 100,
    duration:       60,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "Reasoning Ability & Computer Aptitude", topic: "Reasoning Ability & Computer Aptitude", questions: 35, type: "normal" },
      { name: "Quantitative Aptitude",                 topic: "Quantitative Aptitude",                 questions: 35, type: "normal" },
      { name: "General English",                       topic: "General English",                       questions: 30, type: "normal" },
    ]
  },

  "RBI Grade B": {
    totalQuestions: 100,
    duration:       90,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "Reasoning",            topic: "Reasoning",            questions: 20, type: "normal" },
      { name: "Quantitative Aptitude",topic: "Quantitative Aptitude",questions: 15, type: "normal" },
      { name: "English",              topic: "English",              questions: 20, type: "normal" },
      { name: "General Awareness",    topic: "General Awareness",    questions: 20, type: "normal" },
      { name: "Finance & Management", topic: "Finance & Management", questions: 20, type: "normal" },
      { name: "Current Affairs",      topic: "Current Affairs",      questions: 5,  type: "current_affairs" },
    ]
  },

  "RBI Assistant": {
    totalQuestions: 100,
    duration:       60,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "English Language",  topic: "English Language",  questions: 25, type: "normal" },
      { name: "Numerical Ability", topic: "Numerical Ability", questions: 30, type: "normal" },
      { name: "Reasoning Ability", topic: "Reasoning Ability", questions: 30, type: "normal" },
      { name: "General Awareness", topic: "General Awareness", questions: 15, type: "normal" },
    ]
  },

  "LIC AAO": {
    totalQuestions: 90,
    duration:       120,
    marking:        { correct: 1, wrong: -0.33 },
    sections: [
      { name: "Reasoning Ability",                 topic: "Reasoning Ability",                 questions: 25, type: "normal" },
      { name: "Quantitative Aptitude",             topic: "Quantitative Aptitude",             questions: 25, type: "normal" },
      { name: "English Language",                  topic: "English Language",                  questions: 20, type: "normal" },
      { name: "General Knowledge & Current Affairs", topic: "General Knowledge & Current Affairs", questions: 15, type: "normal" },
      { name: "Current Affairs",                   topic: "Current Affairs",                   questions: 5,  type: "current_affairs" },
    ]
  },

  "UPSC Prelims": {
    totalQuestions: 100,
    duration:       120,
    marking:        { correct: 2, wrong: -0.66 },
    sections: [
      { name: "Indian History",                topic: "Indian History",                questions: 15, type: "normal" },
      { name: "Indian & World Geography",      topic: "Indian & World Geography",      questions: 15, type: "normal" },
      { name: "Indian Polity & Governance",    topic: "Indian Polity & Governance",    questions: 20, type: "normal" },
      { name: "Indian Economy",                topic: "Indian Economy",                questions: 10, type: "normal" },
      { name: "General Science & Technology",  topic: "General Science & Technology",  questions: 10, type: "normal" },
      { name: "Current Affairs",               topic: "Current Affairs",               questions: 20, type: "current_affairs" },
      { name: "Government Schemes & Policies", topic: "Government Schemes & Policies", questions: 10, type: "current_affairs" },
    ]
  },

  "UPSC CDS": {
    totalQuestions: 120,
    duration:       120,
    marking:        { correct: 1, wrong: -0.33 },
    sections: [
      { name: "English",                topic: "English",                questions: 40, type: "normal" },
      { name: "General Knowledge",      topic: "General Knowledge",      questions: 26, type: "normal" },
      { name: "Defence & Security",     topic: "Defence & Security",     questions: 14, type: "current_affairs" },
      { name: "Elementary Mathematics", topic: "Elementary Mathematics", questions: 40, type: "normal" },
    ]
  },

  "State PSC": {
    totalQuestions: 150,
    duration:       120,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "History & Culture",   topic: "History & Culture",   questions: 25, type: "normal" },
      { name: "Geography",           topic: "Geography",           questions: 25, type: "normal" },
      { name: "Polity & Governance", topic: "Polity & Governance", questions: 30, type: "normal" },
      { name: "Economy",             topic: "Economy",             questions: 20, type: "normal" },
      { name: "General Science",     topic: "General Science",     questions: 25, type: "normal" },
      { name: "Current Affairs",     topic: "Current Affairs",     questions: 25, type: "current_affairs" },
    ]
  },

  "NDA": {
    totalQuestions: 120,
    duration:       150,
    marking:        { correct: 2.5, wrong: -0.83 },
    sections: [
      { name: "Mathematics",                           topic: "Mathematics",                           questions: 50, type: "normal" },
      { name: "English",                               topic: "English",                               questions: 20, type: "normal" },
      { name: "Physics",                               topic: "Physics",                               questions: 15, type: "normal" },
      { name: "Chemistry",                             topic: "Chemistry",                             questions: 15, type: "normal" },
      { name: "History, Freedom Movement & Geography", topic: "History, Freedom Movement & Geography", questions: 10, type: "normal" },
      { name: "Current Affairs & Defence",             topic: "Current Affairs",                       questions: 10, type: "current_affairs" },
    ]
  },

  "AFCAT": {
    totalQuestions: 100,
    duration:       120,
    marking:        { correct: 3, wrong: -1 },
    sections: [
      { name: "Verbal Ability in English",     topic: "Verbal Ability in English",     questions: 30, type: "normal" },
      { name: "Numerical Ability",             topic: "Numerical Ability",             questions: 15, type: "normal" },
      { name: "Reasoning & Military Aptitude", topic: "Reasoning & Military Aptitude", questions: 30, type: "normal" },
      { name: "General Awareness",             topic: "General Awareness",             questions: 15, type: "normal" },
      { name: "Current Affairs",               topic: "Current Affairs",               questions: 10, type: "current_affairs" },
    ]
  },

  "Delhi Police Constable": {
    totalQuestions: 100,
    duration:       90,
    marking:        { correct: 1, wrong: 0 },
    hasOptionalSubject: true,
    sections: [
      { name: "General Intelligence & Reasoning", topic: "General Intelligence & Reasoning", questions: 25, type: "normal" },
      { name: "General Knowledge",                topic: "General Knowledge",                questions: 25, type: "normal" },
      { name: "Numerical Ability",                topic: "Numerical Ability",                questions: 15, type: "normal" },
      { name: "Current Affairs",                  topic: "Current Affairs",                  questions: 15, type: "current_affairs" },
      { name: "English",                          topic: "English",                          questions: 20, type: "normal", optional: "english" },
      { name: "Hindi",                            topic: "Hindi",                            questions: 20, type: "normal", optional: "hindi"   },
    ]
  },

}

export default MOCK_CONFIG