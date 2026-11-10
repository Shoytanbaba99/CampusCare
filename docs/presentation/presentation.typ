#set page(
  paper: "presentation-16-9",
  margin: (x: 2.0cm, top: 1.3cm, bottom: 1.1cm),
  fill: rgb("#061A12"),
  header: context {
    let page-num = counter(page).get().first()
    if page-num > 1 {
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [
          #text(size: 11pt, weight: "bold", fill: rgb("#10B981"))[CampusCare]
          #text(size: 11pt, fill: rgb("#6EE7B7"))[ | Intelligent Campus Maintenance Platform]
        ],
        [
          #text(size: 10pt, fill: rgb("#94A3B8"))[Department of CSE, UITS]
        ]
      )
      v(-0.3em)
      line(length: 100%, stroke: 0.5pt + rgb("#1D4A38"))
    }
  },
  footer: context {
    let page-num = counter(page).get().first()
    if page-num > 1 {
      v(0.15cm)
      line(length: 100%, stroke: 0.5pt + rgb("#1D4A38"))
      v(0.15cm)
      grid(
        columns: (1fr, auto),
        align: (left + horizon, right + horizon),
        [
          #text(size: 9pt, fill: rgb("#94A3B8"))[CampusCare — CSE 416 Software Project Design and Development]
        ],
        [
          #text(size: 9pt, weight: "bold", fill: rgb("#10B981"))[#page-num]
        ]
      )
    }
  }
)

#set text(font: "Liberation Sans", fill: rgb("#ECFDF5"), size: 13.5pt)
#set par(leading: 0.75em)

// Clean slide title without any speaker badge
#let slide-title(title, subtitle: none) = {
  v(-0.4em)
  text(size: 22pt, weight: "bold", fill: rgb("#34D399"))[#title]
  if subtitle != none [
    #v(-0.3em)
    #text(size: 13pt, fill: rgb("#A7F3D0"))[#subtitle]
  ]
  v(0.2em)
}

#let card(title: none, body, fill: rgb("#0A291D"), border: rgb("#1D4A38")) = {
  rect(
    width: 100%,
    fill: fill,
    stroke: 1pt + border,
    radius: 8pt,
    inset: 8pt,
    [
      #if title != none [
        #text(weight: "bold", size: 13pt, fill: rgb("#34D399"))[#title]
        #v(0.3em)
      ]
      #body
    ]
  )
}

// ==========================================
// SLIDE 1: TITLE SLIDE
// ==========================================
#align(center + horizon)[
  #image("../report/assets/uits_logo.png", width: 1.6cm)
  #v(0.4em)
  #text(size: 32pt, weight: "bold", fill: rgb("#10B981"))[CampusCare]
  #v(-0.2em)
  #text(size: 16pt, weight: "medium", fill: rgb("#A7F3D0"))[Automated University Facility Issue Reporting, Tracking & SLA Management System]
  #v(0.7em)

  #grid(
    columns: (1fr, 1fr, 1fr),
    gutter: 12pt,
    card(title: "Md. Masud Rahman", [
      #text(size: 11pt, fill: rgb("#D1FAE5"))[ID: 0432320005101064\ CSE Department, UITS]
    ]),
    card(title: "Rudro Antony Mrong", [
      #text(size: 11pt, fill: rgb("#D1FAE5"))[ID: 0432320005101059\ CSE Department, UITS]
    ]),
    card(title: "Shafayat Hossain Shafin", [
      #text(size: 11pt, fill: rgb("#D1FAE5"))[ID: 0432320005101088\ CSE Department, UITS]
    ])
  )

  #v(0.5em)
  #text(size: 11.5pt, fill: rgb("#94A3B8"))[
    *Course:* CSE 416: Software Project Design and Development | *Semester:* Autumn 2026\
    *Supervised by:* Dr. Mahfida Amjad Dipa, Assistant Professor, Department of CSE, UITS
  ]
]

#pagebreak()

// ==========================================
// SLIDE 2: CONTENTS
// ==========================================
#slide-title("Presentation Agenda", subtitle: "Structured Overview of CampusCare Project")

#grid(
  columns: (1fr, 1fr),
  gutter: 14pt,
  [
    #card(title: "Part 1: Motivation & Problem Context")[
      - *1. Introduction & Core Concept*
      - *2. Problem Statement*
      - *3. Project Objectives*
      - *4. Related Works & Gap Analysis*
    ]
    #v(0.4em)
    #card(title: "Part 2: Engineering & Core Features")[
      - *5. Development Methodology*
      - *6. 3-Tier System Architecture*
      - *7. Technology Stack & Tools*
      - *8. Feature Spotlight: Context-Grounded AI Dispatcher*
    ]
  ],
  [
    #card(title: "Part 3: Evaluation & Wrap-Up")[
      - *9. Outcome & Impact Analysis (Eco/Env/Sust)*
      - *10. Result Analysis & Performance*
      - *11. Individual Team Contributions*
      - *12. Limitations & Future Work*
      - *13. Conclusion*
      - *Followed by Live System Demonstration*
    ]
  ]
)

#pagebreak()

// ==========================================
// SLIDE 3: INTRODUCTION
// ==========================================
#slide-title("1. Introduction", subtitle: "Centralized Intelligent Facility Management for Campuses")

#grid(
  columns: (1fr, 1fr),
  gutter: 14pt,
  [
    #card(title: "What is CampusCare?")[
      - A unified *3-tier web platform* designed for university campuses to streamline facility maintenance and issue tracking.
      - Eliminates chaotic paper logbooks, unmonitored WhatsApp messages, and delayed verbal complaints.
      - Connects *Students*, *Department Staff Resolvers*, and *Administrative Overseers* in a single automated lifecycle.
    ]
  ],
  [
    #card(title: "Core System Capabilities")[
      - *Anonymous & Authenticated Reporting:* Students submit complaints with image evidence and exact campus room locations.
      - *Automated SLA Resolution Windows:* Priority-based countdown timers (4h Critical, 24h High, 72h Medium).
      - *AI Operations Dispatcher:* Live, context-aware ticket assistant with instant human takeover.
      - *Transparent Audit Trails:* Tamper-proof history tracking every status change and assignment.
    ]
  ]
)

#pagebreak()

// ==========================================
// SLIDE 4: PROBLEM STATEMENT
// ==========================================
#slide-title("2. Problem Statement", subtitle: "Operational Bottlenecks in Traditional Campus Maintenance")

#grid(
  columns: (1fr, 1fr),
  gutter: 10pt,
  card(title: "Fragmented Channels", [
    #text(size: 12.5pt)[
      Complaints are submitted randomly across phone calls, unofficial Facebook groups, personal messages, and front-desk physical paper books.
    ]
  ]),
  card(title: "Zero Status Visibility", [
    #text(size: 12.5pt)[
      Students have no mechanism to track if their issue was acknowledged, who is assigned, or when repairs will be finished.
    ]
  ]),
  card(title: "Lack of Accountability", [
    #text(size: 12.5pt)[
      Staff departments have no centralized task queue. Unresolved tickets get lost between departments with no SLA enforcement.
    ]
  ]),
  card(title: "No Analytical Data", [
    #text(size: 12.5pt)[
      University management lacks historical metrics to identify chronic equipment failures or measure department repair efficiency.
    ]
  ])
)

#pagebreak()

// ==========================================
// SLIDE 5: OBJECTIVES
// ==========================================
#slide-title("3. Project Objectives", subtitle: "Target Goals and Measurable Deliverables")

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 10pt,
  card(title: "Centralized Portal", [
    #text(size: 12pt)[
      Build a role-based single-entry portal where students log issues across departments (IT, Electrical, HVAC, Sanitation, Lost & Found).
    ]
  ]),
  card(title: "Strict SLA Control", [
    #text(size: 12pt)[
      Implement an automated Service Level Agreement engine calculating real-time resolution deadlines with visual overdue indicators.
    ]
  ]),
  card(title: "AI & Live Chat", [
    #text(size: 12pt)[
      Deploy an AI Dispatcher providing instant contextual ticket updates, with instant human staff takeover capabilities.
    ]
  ])
)

#v(0.4em)
#card(title: "Measurable Reliability Benchmarks")[
  #text(size: 12pt)[
    *Zero-Data-Loss Transactions:* Guaranteed database state consistency with PostgreSQL RLS.\
    *Sub-Second Latency:* In-memory and Upstash Redis caching for real-time ticket messaging.\
    *100% Core Verification:* Rigorous unit test coverage validating Zod schemas and RBAC security rules.
  ]
]

#pagebreak()

// ==========================================
// SLIDE 6: RELATED WORKS & GAPS
// ==========================================
#slide-title("4. Related Works & Gap Analysis", subtitle: "Benchmarking CampusCare Against Existing Solutions")

#table(
  columns: (1.5fr, 1.8fr, 2fr),
  stroke: (x, y) => if y == 0 { (bottom: 1.5pt + rgb("#10B981")) } else { 0.5pt + rgb("#1D4A38") },
  fill: (x, y) => if y == 0 { rgb("#134E4A") } else if calc.even(y) { rgb("#082419") } else { rgb("#061A12") },
  align: (left + horizon),
  table.header(
    [*Platform*], [*Primary Strength*], [*Identified Gap for University Campuses*]
  ),
  [Jira Service Management], [Enterprise ticketing & ITIL workflows], [Cost-prohibitive for universities; lacks campus location hierarchy & student anonymity.],
  [Freshservice / Zendesk], [Automated email workflows & CRM], [Complex configuration; no integrated campus room/lab tagging or student feedback loops.],
  [UITS Facebook Groups], [High student engagement (8k+ members)], [Unstructured text; complaints buried in feeds; zero accountability or resolution tracking.],
  [*CampusCare (Proposed)*], [*Campus-native role architecture, SLA engine, AI live dispatcher*], [*100% Open-Source, zero licensing cost, built specifically for academic infrastructure.*]
)

#pagebreak()

// ==========================================
// SLIDE 7: METHODOLOGY
// ==========================================
#slide-title("5. Development Methodology", subtitle: "Agile SDLC with Continuous Automated Verification")

#grid(
  columns: (1fr, 1.2fr),
  gutter: 14pt,
  [
    #card(title: "Agile Iterative Sprints")[
      - *Sprint 1:* Requirements engineering & SRS documentation.
      - *Sprint 2:* Supabase DB schema, migrations & RLS policies.
      - *Sprint 3:* Next.js App Router UI, forms & validation.
      - *Sprint 4:* SLA deadline engine & staff resolution workflows.
      - *Sprint 5:* Redis live chat, Gemini AI Dispatcher & QA.
    ]
  ],
  [
    #card(title: "QA & Verification Loop")[
      - *Formal Unit Testing:* Vitest suite with 19 automated test cases executed in under 10ms.
      - *100% Code Coverage:* 100% Stmts, Branches, and Functions verified across core business logic (`rbac.ts`, `sla.ts`, `validations/`).
      - *Snyk Vulnerability Scan:* Scanned all dependencies; verified 0 high-severity security vulnerabilities.
    ]
  ]
)

#pagebreak()

// ==========================================
// SLIDE 8: SYSTEM ARCHITECTURE
// ==========================================
#slide-title("6. 3-Tier System Architecture", subtitle: "Clean Separation of Presentation, Business Logic & Data Persistence")

#grid(
  columns: (1.3fr, 1fr),
  gutter: 14pt,
  align: horizon,
  [
    #image("../report/assets/campuscare_dfd.png", width: 95%)
  ],
  [
    #card(title: "Presentation Tier", [
      #text(size: 11pt)[Next.js 16 App Router, Tailwind CSS, Turbopack, responsive mobile-first UI.]
    ])
    #v(0.4em)
    #card(title: "Application / Logic Tier", [
      #text(size: 11pt)[Next.js Server Actions, Zod Schema Validator, SLA Engine, Gemini 3.5 Dispatcher.]
    ])
    #v(0.4em)
    #card(title: "Data Persistence Tier", [
      #text(size: 11pt)[PostgreSQL with Row Level Security, Upstash Redis pub/sub live chat, Supabase Storage.]
    ])
  ]
)

#pagebreak()

// ==========================================
// SLIDE 9: USE OF TOOLS & TECHNOLOGIES
// ==========================================
#slide-title("7. Technology Stack & Tools", subtitle: "Modern Cloud-Native & Open-Source Toolchain")

#grid(
  columns: (1fr, 1fr),
  gutter: 10pt,
  card(title: "Frontend & Full-Stack", [
    - *Next.js 16 (App Router):* Server components and optimized Turbopack build engine.
    - *TypeScript & React 19:* Strict static typing preventing runtime null-pointer exceptions.
    - *Tailwind CSS:* Custom glassmorphism design system tailored for academic readability.
  ]),
  card(title: "Database & Security", [
    - *Supabase PostgreSQL:* Managed database with Row-Level Security (RLS) enforcement.
    - *Upstash Redis:* Low-latency memory store powering live chat with global TTL expiration.
    - *Supabase Storage:* Secure cloud bucket for complaint image evidence attachments.
  ]),
  card(title: "Artificial Intelligence & QA", [
    - *Google Gemini AI:* High-throughput multi-model cascade (`gemini-3.5-flash-lite`).
    - *Vitest & V8 Coverage:* Ultra-fast unit testing framework (19 test cases, 100% coverage).
    - *Snyk & Qodo Gen:* Static security scanning and boundary test case generation.
  ]),
  card(title: "Documentation & Modeling", [
    - *Typst 0.15:* Publication-grade document and presentation compilation engine.
    - *PlantUML & Mermaid:* Formal UML modeling (Class, ER, DFD, Sequence, State).
  ])
)

#pagebreak()

// ==========================================
// SLIDE 10: FEATURE SPOTLIGHT - AI DISPATCHER
// ==========================================
#slide-title("8. Core Feature: Context-Grounded AI Dispatcher", subtitle: "Intelligent Ticket Assistance with Zero Hallucinations & Human Handover")

#grid(
  columns: (1.1fr, 1fr),
  gutter: 14pt,
  [
    #card(title: "How the AI Dispatcher Covers Ongoing Tickets")[
      - *Real-Time Ticket Grounding:* Unlike generic chatbots, the AI ingests live database fields for each ticket:
        - Current Status (`Submitted`, `In Progress`, `Resolved`)
        - Exact Location (`Lab Room 402, Building B`)
        - SLA Target Deadline countdown
        - Recent staff progress notes & activity feed
      - *Continuous Student Inquiry Answering:* When a student asks *"When will this be fixed?"* or *"Who has my lost ID?"*, the AI reads actual staff logs and responds accurately without guessing.
      - *Multi-Turn Conversational Memory:* Remembers previous questions in the live chat session for natural dialogue.
    ]
  ],
  [
    #card(title: "High-Availability Architecture")[
      - *4-Second Multi-Model Cascade:* Prioritizes low-latency models (`gemini-3.5-flash-lite`, ~1.1s) with automatic failover to `gemini-3.8-flash`.
      - *Instant Human Handover:*
        - Clicking *Talk to Staff* instantly silences the AI bot.
        - Staff can click *Join Live Chat* from `/staff/dashboard` to speak directly with the student.
      - *Resilient Fallback:* If cloud endpoints disconnect, a smart local fallback answers based on ticket context.
    ]
  ]
)

#pagebreak()

// ==========================================
// SLIDE 11: OUTCOME & IMPACT
// ==========================================
#slide-title("9. Outcome & Impact Analysis", subtitle: "Measurable Value Across Triple Bottom Line")

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 10pt,
  card(title: "Economic Impact", [
    - *Zero Licensing Fees:* 100% open-source software stack saves university IT budget.
    - *Preventative Cost Savings:* Fast reporting of water leaks and electrical faults prevents expensive building damages.
    - *Optimized Labor:* Eliminates manual ticket sorting and phone follow-ups.
  ]),
  card(title: "Environmental Impact", [
    - *Paperless Operations:* Replaces paper requisition forms and physical front-desk logbooks.
    - *Rapid Energy Conservation:* Quick repair of malfunctioning HVAC units and outdoor lights minimizes wasted campus electricity.
  ]),
  card(title: "Social Sustainability", [
    - *Student Empowerment:* Transparent timeline tracking restores student trust in campus administration.
    - *Safe Anonymous Reporting:* Allows students to report sensitive issues (harassment, hazards) without fear.
  ])
)

#pagebreak()

// ==========================================
// SLIDE 12: RESULT ANALYSIS
// ==========================================
#slide-title("10. Result Analysis & Performance", subtitle: "Empirical System Metrics and Validation Outcomes")

#grid(
  columns: (1.2fr, 1fr),
  gutter: 14pt,
  [
    #card(title: "Test Suite Execution (Vitest v4.1)")[
      #table(
        columns: (1.8fr, 1fr, 1fr),
        stroke: 0.5pt + rgb("#1D4A38"),
        fill: (x, y) => if y == 0 { rgb("#134E4A") } else { rgb("#082419") },
        align: (left, center, center),
        table.header([*Module Tested*], [*Tests*], [*Status*]),
        [Zod Input Validation], [8], [Passed (1ms)],
        [SLA Deadline Engine], [6], [Passed (0ms)],
        [RBAC & Admin Guard], [5], [Passed (0ms)],
        [*Total Passing Tests*], [*19 / 19*], [*100% GREEN*]
      )
    ]
  ],
  [
    #card(title: "Performance Benchmarks")[
      - *Production Build Time:* Compiled 12 routes in 30.8s via Next.js Turbopack.
      - *AI Dispatcher Latency:* Fast ~1.1s response using `gemini-3.5-flash-lite`.
      - *Redis Chat Pipeline:* Sub-50ms message delivery with automated in-memory failover.
      - *Security Posture:* 0 critical vulnerabilities identified by Snyk audit.
    ]
  ]
)

#pagebreak()

// ==========================================
// SLIDE 13: CONTRIBUTION TABLE
// ==========================================
#slide-title("11. Team Contribution Table", subtitle: "Equitable Distribution of Engineering Work")

#table(
  columns: (1.5fr, 1.8fr, 3fr),
  stroke: (x, y) => if y == 0 { (bottom: 1.5pt + rgb("#10B981")) } else { 0.5pt + rgb("#1D4A38") },
  fill: (x, y) => if y == 0 { rgb("#134E4A") } else if calc.even(y) { rgb("#082419") } else { rgb("#061A12") },
  align: (left + horizon),
  table.header(
    [*Student ID*], [*Member Name*], [*Core Technical Roles & Contributions*]
  ),
  [0432320005101064], [Md. Masud Rahman], [Full-Stack System Architecture, Next.js Server Actions, Gemini AI Dispatcher, Upstash Redis Live Chat, SLA Calculation Engine.],
  [0432320005101059], [Rudro Antony Mrong], [Requirements Engineering, SRS Formulation, System Modeling (DFD, Class, Sequence Diagrams), Literature Review & UI Design.],
  [0432320005101088], [Shafayat Hossain Shafin], [System Tester & Quality Assurance, Automated Unit Testing with Vitest (19 test cases, 100% coverage), SLA Boundary Tests, Snyk Security Auditing, Test Documentation.]
)

#pagebreak()

// ==========================================
// SLIDE 14: LIMITATIONS
// ==========================================
#slide-title("12. Current Project Limitations", subtitle: "Honest Academic Assessment of Boundary Constraints")

#grid(
  columns: (1fr, 1fr),
  gutter: 10pt,
  card(title: "Web-Only Access")[
    - Currently operates as a responsive web application; lacks a native mobile app (Android/iOS) with background push notifications.
  ],
  card(title: "Manual Issue Reporting")[
    - Relies on students and staff to manually report faults; no direct integration with automated hardware IoT sensors.
  ],
  card(title: "Cloud Infrastructure Dependence")[
    - Requires active internet connectivity to communicate with Supabase, Upstash, and Google Gemini API endpoints.
  ],
  card(title: "Single-Campus Boundary")[
    - Configured for single-campus university structure (UITS); multi-campus tenancy requires additional tenant isolation schemas.
  ]
)

#pagebreak()

// ==========================================
// SLIDE 15: FUTURE WORK
// ==========================================
#slide-title("13. Future Roadmap & Enhancements", subtitle: "Scalable Pathways for CampusCare 2.0")

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 10pt,
  card(title: "Native Mobile App", [
    - Develop cross-platform React Native app with native push notifications, offline draft caching, and barcode scanning for lab equipment.
  ]),
  card(title: "IoT Sensor Automation", [
    - Integrate ESP32 / LoRaWAN sensors in restrooms and server rooms to automatically generate tickets for water leaks and overheating.
  ]),
  card(title: "Predictive Analytics", [
    - Machine learning models analyzing historical repair logs to forecast equipment failure before breakdowns occur.
  ])
)

#pagebreak()

// ==========================================
// SLIDE 16: CONCLUSION
// ==========================================
#slide-title("14. Conclusion", subtitle: "Summary of Project Achievements")

#card(title: "Summary of Deliverables")[
  #text(size: 13pt)[
    - Successfully engineered and deployed *CampusCare*, an automated, role-based university facility maintenance platform.
    - Solved the historic challenges of scattered reporting, zero visibility, and lack of accountability across university operations.
    - Delivered enterprise-grade features: *PostgreSQL RLS security*, *automated SLA overdue detection*, *Gemini-powered AI Dispatcher*, and *real-time chat with human takeover*.
    - Fully validated through a 100% passing automated test suite and deployed on cloud infrastructure.
  ]
]

#v(0.4em)
#card(title: "Final Verdict")[
  #text(size: 12.5pt, fill: rgb("#6EE7B7"))[
    CampusCare proves that modern web technologies and lightweight AI can transform campus operations into transparent, efficient, and student-centered environments.
  ]
]

#pagebreak()

// ==========================================
// SLIDE 17: Q&A / THANK YOU
// ==========================================
#align(center + horizon)[
  #text(size: 38pt, weight: "bold", fill: rgb("#10B981"))[Thank You!]
  #v(0.2em)
  #text(size: 18pt, fill: rgb("#A7F3D0"))[We Welcome Questions & Feedback]
  #v(0.2em)
  #text(size: 14pt, weight: "bold", fill: rgb("#34D399"))[Now Proceeding to Live System Demonstration]
  #v(0.6em)

  #card(title: none, [
    #text(size: 13.5pt, fill: rgb("#ECFDF5"))[
      *CampusCare:* Intelligent University Facility Management Platform\
      *Department of Computer Science & Engineering, UITS*\
      *Codebase & Documentation:* `github.com/Shoytanbaba99/CampusCare`
    ]
  ])

  #v(0.6em)
  #text(size: 11.5pt, fill: rgb("#94A3B8"))[
    Md. Masud Rahman (0432320005101064) | Rudro Antony Mrong (0432320005101059) | Shafayat Hossain Shafin (0432320005101088)
  ]
]
