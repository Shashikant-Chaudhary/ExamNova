// ─────────────────────────────────────────────
// cutoffs.js
// Previous year cutoffs and expected current
// year cutoffs for all major exams
// ─────────────────────────────────────────────

const CUTOFFS = {

  "SSC CGL": {
    totalMarks: 200,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 145,
        OBC:     132,
        SC:      120,
        ST:      108,
        EWS:     138,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 148,
        OBC:     135,
        SC:      122,
        ST:      110,
        EWS:     140,
      }
    },
    sectionWiseCutoff: {
      "Quantitative Aptitude":            { min: 12, good: 18, excellent: 22 },
      "General Intelligence & Reasoning": { min: 14, good: 20, excellent: 23 },
      "English Language":                 { min: 12, good: 18, excellent: 22 },
      "General Awareness":                { min: 10, good: 15, excellent: 20 },
    }
  },

  "SSC CHSL": {
    totalMarks: 200,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 136,
        OBC:     122,
        SC:      110,
        ST:      98,
        EWS:     128,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 138,
        OBC:     124,
        SC:      112,
        ST:      100,
        EWS:     130,
      }
    },
    sectionWiseCutoff: {
      "Quantitative Aptitude": { min: 10, good: 16, excellent: 20 },
      "General Intelligence":  { min: 12, good: 18, excellent: 22 },
      "English Language":      { min: 10, good: 16, excellent: 20 },
      "General Awareness":     { min: 8,  good: 13, excellent: 17 },
    }
  },

  "SSC MTS": {
    totalMarks: 90,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 45,
        OBC:     40,
        SC:      35,
        ST:      30,
        EWS:     42,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 47,
        OBC:     42,
        SC:      37,
        ST:      32,
        EWS:     44,
      }
    },
  },

  "SSC GD": {
    totalMarks: 80,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 55,
        OBC:     50,
        SC:      45,
        ST:      40,
        EWS:     52,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 57,
        OBC:     52,
        SC:      47,
        ST:      42,
        EWS:     54,
      }
    },
  },

  "RRB NTPC": {
    totalMarks: 100,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 65,
        OBC:     60,
        SC:      55,
        ST:      50,
        EWS:     62,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 67,
        OBC:     62,
        SC:      57,
        ST:      52,
        EWS:     64,
      }
    },
    sectionWiseCutoff: {
      "Mathematics":                      { min: 15, good: 22, excellent: 27 },
      "General Intelligence & Reasoning": { min: 15, good: 22, excellent: 27 },
      "General Awareness":                { min: 16, good: 24, excellent: 30 },
    }
  },

  "RRB Group D": {
    totalMarks: 100,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 55,
        OBC:     50,
        SC:      45,
        ST:      40,
        EWS:     52,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 57,
        OBC:     52,
        SC:      47,
        ST:      42,
        EWS:     54,
      }
    },
  },

  "IBPS PO": {
    totalMarks: 100,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 47.25,
        OBC:     45,
        SC:      42,
        ST:      40,
        EWS:     46,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 48,
        OBC:     46,
        SC:      43,
        ST:      41,
        EWS:     47,
      }
    },
    sectionWiseCutoff: {
      "Reasoning Ability":     { min: 8, good: 15, excellent: 20 },
      "Quantitative Aptitude": { min: 8, good: 15, excellent: 20 },
      "English Language":      { min: 8, good: 12, excellent: 16 },
    }
  },

  "IBPS Clerk": {
    totalMarks: 100,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 62,
        OBC:     58,
        SC:      52,
        ST:      48,
        EWS:     60,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 64,
        OBC:     60,
        SC:      54,
        ST:      50,
        EWS:     62,
      }
    },
  },

  "SBI PO": {
    totalMarks: 100,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 52,
        OBC:     48,
        SC:      44,
        ST:      42,
        EWS:     50,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 54,
        OBC:     50,
        SC:      46,
        ST:      44,
        EWS:     52,
      }
    },
  },

  "SBI Clerk": {
    totalMarks: 100,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 68,
        OBC:     64,
        SC:      58,
        ST:      54,
        EWS:     66,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 70,
        OBC:     66,
        SC:      60,
        ST:      56,
        EWS:     68,
      }
    },
  },

  "UPSC Prelims": {
    totalMarks: 200,
    previousYear: {
      year: "2024",
      cutoffs: {
        General: 98,
        OBC:     96,
        SC:      90,
        ST:      88,
        EWS:     96,
      }
    },
    expectedCurrentYear: {
      year: "2025",
      cutoffs: {
        General: 100,
        OBC:     98,
        SC:      92,
        ST:      90,
        EWS:     98,
      }
    },
  },

}

export default CUTOFFS