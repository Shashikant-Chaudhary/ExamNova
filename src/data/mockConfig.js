// ─────────────────────────────────────────────
// mockConfig.js
// Real exam patterns with CA sections marked
// CA sections use Tavily + AI for latest news
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
      { name: "Mathematics",                      topic: "Mathematics",                      questions: 25, type: "normal" },
      { name: "General Intelligence & Reasoning", topic: "General Intelligence & Reasoning", questions: 30, type: "normal" },
      { name: "General Science",                  topic: "General Science",                  questions: 25, type: "normal" },
      { name: "General Awareness",                topic: "General Awareness & Current Affairs", questions: 13, type: "normal" },
      { name: "Current Affairs",                  topic: "Current Affairs",                  questions: 7,  type: "current_affairs" },
      { name: "General English",                  topic: "General English",                  questions: 0,  type: "normal", optional: "english" },
      { name: "Hindi",                            topic: "Hindi",                            questions: 0,  type: "normal", optional: "hindi"   },
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
      { name: "Quantitative Aptitude",  topic: "Quantitative Aptitude",  questions: 25, type: "normal" },
      { name: "General Intelligence",   topic: "General Intelligence",   questions: 25, type: "normal" },
      { name: "English Language",       topic: "English Language",       questions: 25, type: "normal" },
      { name: "General Awareness",      topic: "General Awareness",      questions: 16, type: "normal" },
      { name: "Current Affairs",        topic: "Current Affairs",        questions: 9,  type: "current_affairs" },
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
      { name: "English Language",                 topic: "English Language",                 questions: 20, type: "normal",   optional: "english" },
      { name: "Hindi",                            topic: "Hindi",                            questions: 20, type: "normal",   optional: "hindi"   },
    ]
  },

  "IBPS PO": {
    totalQuestions: 100,
    duration:       60,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "Reasoning Ability",    topic: "Reasoning Ability",    questions: 35, type: "normal" },
      { name: "Quantitative Aptitude",topic: "Quantitative Aptitude",questions: 35, type: "normal" },
      { name: "English Language",     topic: "English Language",     questions: 30, type: "normal" },
    ]
  },

  "IBPS Clerk": {
    totalQuestions: 100,
    duration:       60,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "Reasoning Ability",    topic: "Reasoning Ability",    questions: 35, type: "normal" },
      { name: "Quantitative Aptitude",topic: "Quantitative Aptitude",questions: 35, type: "normal" },
      { name: "English Language",     topic: "English Language",     questions: 30, type: "normal" },
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

  "UPSC Prelims": {
    totalQuestions: 100,
    duration:       120,
    marking:        { correct: 2, wrong: -0.66 },
    sections: [
      { name: "Indian History",               topic: "Indian History",               questions: 15, type: "normal" },
      { name: "Indian & World Geography",     topic: "Indian & World Geography",     questions: 15, type: "normal" },
      { name: "Indian Polity & Governance",   topic: "Indian Polity & Governance",   questions: 20, type: "normal" },
      { name: "Indian Economy",               topic: "Indian Economy",               questions: 10, type: "normal" },
      { name: "General Science & Technology", topic: "General Science & Technology", questions: 10, type: "normal" },
      { name: "Current Affairs",              topic: "Current Affairs",              questions: 20, type: "current_affairs" },
      { name: "Government Schemes & Policies",topic: "Government Schemes & Policies",questions: 10, type: "current_affairs" },
    ]
  },

  "UPSC CDS": {
    totalQuestions: 120,
    duration:       120,
    marking:        { correct: 1, wrong: -0.33 },
    sections: [
      { name: "English",                topic: "English",             questions: 40, type: "normal" },
      { name: "General Knowledge",      topic: "General Knowledge",   questions: 26, type: "normal" },
      { name: "Defence & Security",     topic: "Defence & Security",  questions: 14, type: "current_affairs" },
      { name: "Elementary Mathematics", topic: "Elementary Mathematics", questions: 40, type: "normal" },
    ]
  },

  "State PSC": {
    totalQuestions: 150,
    duration:       120,
    marking:        { correct: 1, wrong: -0.25 },
    sections: [
      { name: "History & Culture",          topic: "History & Culture",   questions: 25, type: "normal" },
      { name: "Geography",                  topic: "Geography",           questions: 25, type: "normal" },
      { name: "Polity & Governance",        topic: "Polity & Governance", questions: 30, type: "normal" },
      { name: "Economy",                    topic: "Economy",             questions: 20, type: "normal" },
      { name: "General Science",            topic: "General Science",     questions: 25, type: "normal" },
      { name: "Current Affairs",            topic: "Current Affairs",     questions: 25, type: "current_affairs" },
    ]
  },

}

export default MOCK_CONFIG