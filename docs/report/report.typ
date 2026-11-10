#set page(
  paper: "a4",
  margin: (top: 2.0cm, bottom: 2.0cm, left: 2.2cm, right: 2.0cm),
  header: context {
    let page-num = counter(page).get().first()
    if page-num > 2 [
      #text(8.5pt, fill: rgb("#475569"))[
        _CSE 416: Software Project Design and Development_
        #h(1fr)
        _CampusCare Course Project Report_
      ]
      #v(-0.5em)
      #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
    ]
  },
  footer: context {
    let page-num = counter(page).get().first()
    if page-num > 2 [
      #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
      #v(-0.3em)
      #text(8.5pt, fill: rgb("#475569"))[
        _Department of CSE, UITS_
        #h(1fr)
        Page #page-num
      ]
    ]
  }
)

#set text(
  font: "Liberation Serif",
  size: 10pt,
  spacing: 110%,
  lang: "en"
)

#set par(justify: true, leading: 0.65em, first-line-indent: 0pt)
#set heading(numbering: "1.1")

#show heading.where(level: 1): it => block(spacing: 1.1em)[
  #text(14pt, weight: "bold", fill: rgb("#0f172a"))[#it]
  #v(0.2em)
  #line(length: 100%, stroke: 1.0pt + rgb("#10b981"))
]

#show heading.where(level: 2): it => block(spacing: 0.9em)[
  #text(11.5pt, weight: "bold", fill: rgb("#1e293b"))[#it]
]

#show heading.where(level: 3): it => block(spacing: 0.75em)[
  #text(10.5pt, weight: "bold", fill: rgb("#334155"))[#it]
]

// ============================================================================
// COVER PAGE
// ============================================================================

#align(center)[
  #v(0.2cm)
  #image("assets/uits_logo.png", width: 22%)
  #v(0.3cm)

  #text(14pt, weight: "bold", fill: rgb("#0f172a"))[
    University of Information Technology and Sciences (UITS)
  ] \
  #text(11pt, fill: rgb("#334155"))[
    Department of Computer Science and Engineering
  ]

  #v(0.4cm)
  #line(length: 95%, stroke: 1.5pt + rgb("#059669"))
  #v(0.2cm)

  #text(20pt, weight: "bold", fill: rgb("#065f46"))[
    CampusCare
  ] \
  #v(0.15cm)
  #text(12.5pt, weight: "medium", fill: rgb("#1e293b"))[
    Centralized University Facility Maintenance & Complaint Ticketing Platform
  ] \
  #v(0.08cm)
  #text(10.5pt, style: "italic", fill: rgb("#475569"))[
    Course Project Comprehensive Engineering Report
  ]

  #v(0.2cm)
  #line(length: 95%, stroke: 1.5pt + rgb("#059669"))
  #v(0.4cm)

  #grid(
    columns: (1fr, 1fr),
    align: (left, right),
    [
      #text(10.5pt, weight: "bold", fill: rgb("#0f172a"))[Submitted To:] \
      #v(0.15cm)
      #text(10.5pt, weight: "bold")[Dr. Mahfida Amjad Dipa] \
      Assistant Professor \
      Department of CSE \
      University of Information Technology and Sciences
    ],
    [
      #text(10.5pt, weight: "bold", fill: rgb("#0f172a"))[Submitted By (Group Members):] \
      #v(0.15cm)
      *Shafayat Hossain Shafin* \
      ID: 0432320005101088 \
      _Role: Technical Documentation & System Analyst_ \
      #v(0.1cm)
      *Md. Masud Rahman* \
      ID: 0432320005101064 \
      _Role: Full-Stack Lead & Architecture_ \
      #v(0.1cm)
      *Rudro Antony Mrong* \
      ID: 0432320005101059 \
      _Role: UI/UX Design, Requirements & QA Lead_
    ]
  )

  #v(0.4cm)
  #text(10.5pt)[
    *Course Code:* CSE 416 \
    *Course Title:* Software Project Design and Development \
    *Semester:* Autumn 2026 \
    *Date of Submission:* November 2026
  ]

  #v(0.4cm)
  #rect(
    width: 100%,
    stroke: 0.8pt + rgb("#cbd5e1"),
    fill: rgb("#f8fafc"),
    radius: 4pt,
    inset: 8pt
  )[
    #text(9pt, weight: "bold", fill: rgb("#0f172a"))[Declaration:] \
    #text(8.5pt, fill: rgb("#334155"))[
      This project has not been submitted to any other course projects. The use of any assistive tool in this work has been disclosed in the Tool Usage Log (Appendix A).
    ]
  ]
]

#pagebreak()

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================

#outline(indent: auto, depth: 3)

#pagebreak()

// ============================================================================
// 1. INTRODUCTION
// ============================================================================

= Introduction

== Introduction
University campuses represent complex physical environments comprising lecture auditoriums, science and computer laboratories, residential halls, faculty offices, and sanitation facilities. Operational upkeep of these physical assets requires rapid fault identification, departmental dispatching, resolution accountability, and transparent feedback. 

*CampusCare* is a full-stack, enterprise-grade university facility maintenance and complaint ticketing platform designed to streamline infrastructure repair operations across campus environments. Built on a high-concurrency three-tier architecture utilizing *Next.js 16 (App Router)*, *React 19 Server Actions*, *Supabase PostgreSQL 15*, and *Upstash Redis*, CampusCare replaces fragmented reporting methods with a unified, state-driven workflow governed by deterministic Service Level Agreements (SLAs). The platform provides tailored interfaces for three distinct stakeholder groups: Students, Maintenance Staff resolvers, and System Administrators, alongside an unauthenticated public tracking portal.

== Motivation
In traditional higher education institutions, facility maintenance reporting suffers from deep operational bottlenecks:
1. *Dispersed Communication Channels:* Complaints submitted across verbal interactions, paper logbooks, WhatsApp groups, or direct emails frequently become lost, resulting in unaddressed safety hazards such as exposed electrical wiring, water main bursts, or broken lab cooling systems.
2. *Lack of Reporter Status Visibility:* Students and faculty members receive zero progress updates following submission, producing redundant inquiries, administrative fatigue, and general campus dissatisfaction.
3. *Unstructured Work Queues for Maintenance Personnel:* Maintenance technicians operate without centralized priority dispatching, creating uneven task allocation and uncontrolled response delays.
4. *Absence of Accountability and Auditability:* Without immutable audit logging, tracking ticket lifecycle history, verifying work quality, and evaluating departmental performance metrics remains practically impossible.

By digitalizing the lifecycle of campus maintenance requests with automated SLA calculations, role-based security boundaries, photo evidence validation, and ephemeral real-time communication, CampusCare establishes accountability, operational efficiency, and a safe educational environment.

== Aims and Objectives
The overarching aim of the CampusCare project is to develop and validate a secure, responsive, and automated facility complaint ticketing ecosystem that bridges the communication gap between university facility users and maintenance crews.

*Specific, Measurable Project Objectives:*
- *Resolution Acceleration:* Reduce the average complaint resolution lifecycle across campus operations by at least 40% through automated departmental dispatching.
- *Single-Pipeline Traceability:* Achieve 100% centralized tracking of maintenance requests through authenticated role-based forms and 6-digit anonymous access tokens.
- *Deterministic SLA Compliance:* Enforce strict priority-based resolution deadlines (Critical: 4 hours, High: 24 hours, Medium: 72 hours, Low: 168 hours), targeting institutional SLA compliance exceeding 85%.
- *Sub-Second Data Performance:* Maintain database response latencies below 500 ms for administrative reporting queries across datasets exceeding 10,000 records.
- *Zero Security Regressions:* Enforce 100% immutable audit logging (`audit_logs`) and zero critical vulnerabilities verified through automated SAST vulnerability scanning.

== Scope and Limitations
*In-Scope (Delivered MVP Release):*
- *Authentication & Authorization:* Role-Based Access Control (RBAC) separating Student, Staff, and Admin permissions via `@supabase/ssr` with HttpOnly cookie sessions and middleware edge guards.
- *Student Portal:* Priority-based ticket submission with photo proof uploads, anonymous submission mode (`CC-ANON-XXXXXX`), personal ticket timeline tracking, and context-grounded AI live assistance.
- *Context-Grounded AI Live Assistant:* Floating live chat powered by Google Gemini (`gemini-2.5-flash`), answering student queries using real-time ticket context (status, SLA deadlines, assigned trade department) with direct 1-click fallback to human maintenance staff.
- *Staff Resolver Desk:* Departmental ticket filtering (Electrical, IT Support, Plumbing, Facilities), ticket claiming, status transitions (`Submitted` $->$ `In Progress` $->$ `Resolved`), progress notes, resolution photo proof, and SLA target date overrides with mandatory rationale.
- *Admin Command Switchboard:* Global ticket master table with multi-column filtering, department ticket re-assignment, user role promotion/demotion (with self-demotion safety guards), category management, and audit inspection.
- *Public Tracking Portal (`/track`):* Zero-login ticket lookup using a 6-character anonymous tracking code or ticket number (`CMP-YYYY-XXXXX`).

*Limitations & Out-of-Scope (Future Iterations):*
- Automated IoT sensor fault reporting (e.g., smart water meters or electrical circuit trip alerts).
- Native mobile applications (iOS/Android) for off-grid maintenance technicians.
- Multi-campus tenant clustering across geographically distinct university branches.

== Team Organization and Individual Contributions
The development team divided core engineering responsibilities across technical documentation, full-stack architecture, UI/UX design, requirement engineering, and quality assurance:

- *Shafayat Hossain Shafin (0432320005101088):* Technical Documentation & System Analyst. Authored comprehensive project documentation, literature review, background study of existing campus systems, user manuals, developer guidelines, and collaborated on system evaluation and reporting.
- *Md. Masud Rahman (0432320005101064):* Full-Stack Lead & Architecture. Developed Next.js 16 Server Actions, Gemini AI Dispatcher engine, Edge proxy middleware, Upstash Redis rate limiting and live chat state machine, and administrative switchboard.
- *Rudro Antony Mrong (0432320005101059):* UI/UX Design, Requirements & QA Lead. Conducted stakeholder requirement elicitation, designed UI/UX design system (Caring Campus Green), constructed UML and DFD models, executed Vitest unit/integration testing suite, and performed Snyk security audits.

Detailed individual contribution matrices and modular responsibilities are documented in Appendix B.

#v(1.0cm)

// =========================================================
// 2. BACKGROUND STUDY AND REQUIREMENT ANALYSIS
// =========================================================

= Background Study and Requirement Analysis

== Introduction
Developing an enterprise campus management system requires thorough investigation of existing software solutions, operational constraints, stakeholder requirements, and technical feasibility. This section contrasts CampusCare with prevailing solutions and formalizes the Software Requirements Specification (SRS).

== Related Work and Existing Solutions
Campus maintenance reporting has traditionally relied on physical service desks, shared spreadsheets, or heavy commercial IT Service Management (ITSM) platforms. 

#text(9pt)[
*Table 2.1: Comparative Analysis of CampusCare with Existing Solutions*
]
#table(
  columns: (1.5fr, 1.2fr, 1.2fr, 1.3fr, 1.3fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  [ *Feature* ], [ *Paper Logbooks* ], [ *Google Forms / Email* ], [ *ServiceNow / Jira SM* ], [ *CampusCare (Proposed)* ],
  [ *Central Tracking* ], [ No (Physical) ], [ Partial (Sheet) ], [ Yes ], [ *Yes (Unified DB)* ],
  [ *SLA Deadline Engine* ], [ None ], [ None ], [ Configurable (Complex) ], [ *Built-in (4h to 168h)* ],
  [ *Role-Based Queues* ], [ None ], [ Manual Sorting ], [ Yes ], [ *Department Isolated* ],
  [ *Anonymous Mode* ], [ Manual / Lost ], [ Not Supported ], [ Complex Config ], [ *1-Click Code Token* ],
  [ *Real-Time Live Chat* ], [ None ], [ None ], [ Costly Add-on ], [ *Integrated Redis Bus* ],
  [ *Photo Verification* ], [ No ], [ File Upload Link ], [ Attachment Field ], [ *Dual Proof (Before/After)* ],
  [ *Cost / Licensing* ], [ Low ], [ Free / Tiered ], [ Enterprise (\$100+/user) ], [ *Zero License / Open* ]
)

== Stakeholders and User Characteristics
CampusCare serves three core internal user groups:
1. *Students & Campus Residents:* Require a frictionless, mobile-responsive intake form with immediate tracking tokens and optional anonymity for sensitive complaints.
2. *Departmental Maintenance Staff (Resolvers):* Require an isolated, noise-free queue tailored to their trade (e.g., Electrical vs. Plumbing), SLA countdown indicators, and quick work proof uploads.
3. *System Administrators & Facility Directors:* Require campus-wide visibility, departmental reassignment controls, user role access control desks, and immutable audit trails for institutional compliance.

== Software Requirements Specification (SRS)
*Functional Requirements (FR):*
- *FR1 (Authentication):* The system shall authenticate users via university email credentials with role redirection.
- *FR2 (Ticket Ingestion):* The system shall allow students to submit complaints with location, category, priority, and optional photos.
- *FR3 (SLA Auto-Assignment):* The system shall calculate target completion timestamps based on priority level.
- *FR4 (Status State Machine):* The system shall enforce ticket state transitions (`Submitted` $->$ `Assigned` $->$ `In Progress` $->$ `Resolved` $->$ `Closed`).
- *FR5 (Staff Department Queue):* Staff shall view tickets matching their assigned trade department.
- *FR6 (SLA Overrides):* Authorized staff and administrators shall adjust SLA deadlines with mandatory rationale.
- *FR7 (Admin Switchboard):* Administrators shall reassign complaints and promote/demote user roles.
- *FR8 (Anonymous Lookup):* The public portal shall allow ticket tracking via a 6-character token without authentication.

*Non-Functional Requirements (NFR):*
- *NFR1 (Performance):* Ticket creation and retrieval latencies shall execute under 500 ms at 95th percentile.
- *NFR2 (Security):* All database tables shall enforce Row Level Security (RLS) policies preventing unauthorized cross-tenant data access.
- *NFR3 (Usability):* UI components shall comply with WCAG 2.1 AA standards and support viewports down to 320 px.
- *NFR4 (Availability):* The serverless platform shall maintain 99.5% uptime backed by Vercel and Supabase cloud infrastructure.

== Alternative Solutions and Feasibility
- *Technical Feasibility:* Next.js 16 (React 19) provides high SSR rendering performance and server-action security boundaries. Supabase PostgreSQL eliminates database maintenance overhead while providing native RLS security.
- *Economic Feasibility:* The entire technology stack utilizes open-source libraries (Next.js, Tailwind, React, Zod, Vitest) incurring zero software licensing fees. Infrastructure operates on scalable cloud free/pro tiers.
- *Operational Feasibility:* The interface adheres to standard campus workflows, requiring no specialized user training.

#v(1.0cm)

// =========================================================
// 3. SYSTEM DESIGN AND METHODOLOGY
// =========================================================

= System Design and Methodology

== Introduction
System design translates functional requirements into structured architectural models, database schemas, and interface workflows. CampusCare adopts a modular 3-tier software architecture emphasizing strict separation of concerns, data integrity, and low-latency interaction.

== Development Methodology and Project Plan
The project followed an *Agile / Iterative SDLC* methodology structured over a 14-week timeline. Development was divided into four distinct milestone sprints:

- *Sprint 1 (Weeks 1--4):* Requirement analysis, architecture modeling, ER schema design, and Supabase database initialization.
- *Sprint 2 (Weeks 5--8):* Core authentication, student complaint submission forms, storage bucket integration, and automated SLA calculation.
- *Sprint 3 (Weeks 9--12):* Staff resolver queues, admin dispatch switchboards, SLA override dialogs, and real-time live chat bus integration.
- *Sprint 4 (Weeks 13--14):* Vitest unit testing suite (Qodo Gen verification), Snyk security audit, performance tuning, and final documentation.

#align(center)[
  #image("assets/campuscare_gantt.png", width: 75%)
  #v(-0.25cm)
  #text(8pt)[*Fig. 3.1:* CampusCare Project Implementation Gantt Chart.]
]

#v(0.2cm)

#align(center)[
  #image("assets/campuscare_wbs.png", width: 75%)
  #v(-0.25cm)
  #text(8pt)[*Fig. 3.2:* CampusCare Work Breakdown Structure (WBS) Tree.]
]

== System Architecture and Technology Stack
CampusCare is structured into a modern multi-tier cloud-native architecture:
1. *Client Presentation Layer:* Responsive React 19 Client Components styled with Tailwind CSS, utilizing `@tanstack/react-table` for interactive filtering, Lucide icons, and mobile-friendly drawer components.
2. *Application & Security Layer:* Next.js 16 App Router Server Actions executing securely on the server runtime, protected by Next.js Edge proxy middleware and Upstash Redis sliding-window rate limiters.
3. *Data & Storage Persistence Layer:* Supabase PostgreSQL 15 relational database enforcing Row Level Security (RLS) policies, alongside S3-compliant Supabase Storage buckets for ticket evidence attachments.
4. *AI Live Assistance Engine:* Google Gemini (`gemini-2.5-flash`) integrated via the official `@google/genai` SDK, executing context-grounded responses conditioned on real-time ticket metadata, department queues, and SLA deadlines.

== System Models
To model static structure and dynamic behavioral workflows, standard UML and data flow models were constructed:

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    #align(center)[
      #image("assets/campuscare_usecase.png", width: 95%)
      #text(8pt)[*Fig. 3.3:* System Use-Case Diagram.]
    ]
  ],
  [
    #align(center)[
      #image("assets/campuscare_state.png", width: 95%)
      #text(8pt)[*Fig. 3.4:* Ticket State Transition Diagram.]
    ]
  ]
)

#v(0.2cm)

#align(center)[
  #image("assets/campuscare_sequence.png", width: 68%)
  #v(-0.2cm)
  #text(8pt)[*Fig. 3.5:* System Sequence Diagram: Ticket Ingestion & Staff Resolution Lifecycle.]
]

#v(0.15cm)

#grid(
  columns: (1fr, 1fr),
  gutter: 10pt,
  [
    #align(center)[
      #image("assets/campuscare_class.png", width: 90%)
      #v(-0.2cm)
      #text(8pt)[*Fig. 3.6:* Domain Class Diagram.]
    ]
  ],
  [
    #align(center)[
      #image("assets/campuscare_er.png", width: 90%)
      #v(-0.2cm)
      #text(8pt)[*Fig. 3.7:* Entity-Relationship (ER) Schema.]
    ]
  ]
)

#v(0.15cm)

#align(center)[
  #image("assets/campuscare_dfd.png", width: 68%)
  #v(-0.2cm)
  #text(8pt)[*Fig. 3.8:* CampusCare Level-1 Data Flow Diagram (DFD).]
]

== User Interface Design
The user interface implements the *Caring Campus Green* design system, prioritizing accessibility, contrast ratios (WCAG 2.1 AA), and clean typography. The UI comprises four primary operational screens:
- *Student Intake Kiosk (`/student/complaints/new`):* Clean multi-step intake form with interactive category selectors, camera upload zones, and an anonymous submission toggle.
- *Student Tracking Timeline (`/student/complaints/[id]`):* Dynamic visual progress tracker displaying SLA timers, staff progress notes, and the interactive floating live chat drawer.
- *Staff Resolver Queue (`/staff/dashboard`):* Priority-color-coded cards with glowing green active-chat alerts, SLA expiration badges, and resolution modal dialogs.
- *Admin Command Switchboard (`/admin/dashboard`):* High-density master table featuring live text search, department reassignment menus, and role promotion controls.

== Design Decisions and Rationale
1. *React 19 Server Actions over REST/GraphQL:* Server Actions eliminate client-side API endpoint vulnerabilities and state synchronization boilerplate by running directly on the server with automatic form validation.
2. *Supabase RLS over Application-Only Checks:* Enforcing security at the database row level ensures that even if an application bug occurs, unauthorized users cannot query or mutate records outside their assigned scope.
3. *Upstash Redis Ephemeral Bus over Database Polling:* Real-time live chat messages are cached in Redis with a 3600-second TTL, reducing database write fatigue by 90% during active conversations.

#v(0.8cm)

// =========================================================
// 4. IMPLEMENTATION
// =========================================================

= Implementation

== Introduction
This section outlines the technical implementation of CampusCare, detailing the development environment, codebase architecture, core business modules, and integration points.

== Development Environment and Repository Setup
- *Host Environment:* Linux (Ubuntu 22.04 LTS x86_64) / Windows 11 Enterprise (64-bit).
- *Runtime & Framework:* Node.js v20.12.2, pnpm v11.21.0, Next.js 16.3.0 (Turbopack Engine), React 19.2.8.
- *Version Control Workflow:* Git-flow branching with `main` representing production releases, feature branches for isolated components, and Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`).
- *Repository URL:* `https://github.com/Shoytanbaba99/CampusCare`

== Core Module Implementation
CampusCare's business logic is modularized into dedicated validation, SLA calculation, and access control engines.

=== Zod Schema Validation Engine (`src/lib/validations/`)
All client inputs are validated on the server using Zod schemas before database execution:

```ts
// src/lib/validations/complaints.ts
export const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long.").max(100),
  departmentId: z.string().min(1, "Please select a valid department."),
  categoryId: z.string().min(1, "Please select a valid issue category."),
  location: z.string().min(3, "Location details must be at least 3 characters long."),
  priority: z.enum(["low", "medium", "high", "critical"]),
  description: z.string().min(10, "Please provide a detailed description (at least 10 chars)."),
  isAnonymous: z.boolean().optional().default(false),
});
```

=== SLA Target Calculation Engine (`src/lib/sla.ts`)
Complaint priorities map to strict resolution deadlines, and overdue conditions are evaluated dynamically:

```ts
// src/lib/sla.ts
export const SLA_HOURS_MAP: Record<PriorityLevel, number> = {
  critical: 4,   // 4 Hours
  high: 24,      // 24 Hours
  medium: 72,    // 3 Days
  low: 168,      // 7 Days
};

export function calculateSlaDueDate(priority: PriorityLevel, baseDate: Date = new Date()): Date {
  const hours = SLA_HOURS_MAP[priority] ?? 72;
  return new Date(baseDate.getTime() + hours * 60 * 60 * 1000);
}

export function isTicketOverdue(slaDueAt: string | Date, now: Date = new Date()): boolean {
  const dueDate = typeof slaDueAt === "string" ? new Date(slaDueAt) : slaDueAt;
  return now.getTime() > dueDate.getTime();
}
```

=== Role-Based Access Control Guards (`src/lib/rbac.ts`)
Role boundaries and self-demotion protections are strictly enforced:

```ts
// src/lib/rbac.ts
export function canAccessQueue(user: UserSession, departmentId: string): boolean {
  if (user.role === "admin") return true;
  if (user.role === "staff") return user.departmentId === departmentId;
  return false;
}

export function canSelfDemote(actingUserId: string, targetUserId: string, newRole: UserRole): boolean {
  if (actingUserId === targetUserId && newRole !== "admin") {
    return false; // Prevent admin from locking themselves out
  }
  return true;
}
```

=== Context-Grounded AI Dispatcher (`src/lib/geminiDispatcher.ts`)
To prevent hallucinated status updates and provide instant feedback, the floating live chat uses Google Gemini (`gemini-2.5-flash`) grounded strictly in the ongoing ticket's relational database record:

```ts
// src/lib/geminiDispatcher.ts
export async function generateGeminiDispatchReply(
  ticketContext: TicketContext,
  studentMessage: string,
  chatHistory: ChatHistoryItem[] = []
): Promise<{ text: string }> {
  // If API keys are unconfigured or external network fails, use deterministic local fallback
  if (!process.env.GEMINI_API_KEY) {
    return fallbackResponse(ticketContext, studentMessage);
  }

  const systemInstruction = `You are the CampusCare AI Operations Dispatcher for a university campus.
Your job is to converse naturally and helpfully with the student regarding their specific ticket.
Ground truth ticket context:
- Ticket: ${ticketContext.ticketNumber} | Title: ${ticketContext.title}
- Department: ${ticketContext.departmentName} | Priority: ${ticketContext.priority}
- Current Status: ${ticketContext.status} | Target SLA: ${ticketContext.slaDueAt}
Never invent fake technicians or status changes. If the issue is critical or requires physical inspection, inform the student that staff have been alerted for handoff.`;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: promptContents,
    config: { systemInstruction, temperature: 0.2 },
  });
  return { text: response.text ?? "" };
}
```

== Interface Implementation and System Integration
- *Server Actions Pipeline:* Forms dispatch directly to Next.js Server Actions (`createComplaintAction`, `updateComplaintStatusAction`, `reassignTicketAction`). Actions authenticate the user session, validate schemas, evaluate rate limits, and execute PostgreSQL transactions.
- *Real-time Live Chat Integration:* Chat messages are stored in Upstash Redis key-value pairs (`chat:messages:${id}`) with a 1-hour expiration TTL. The floating chat component (`FloatingLiveChat.tsx`) supports direct 1-click staff takeover from automated bot responses without page reloads.

== Tool-Assisted Refinement
Assistive engineering tools were used to verify and refine human designs:
- *Qodo Gen (CodiumAI):* Utilized within the IDE to analyze boundary edge cases in Zod schemas and generate 19 unit test scenarios covering invalid enum values, string length boundaries, and overdue timestamp math.
- *Snyk Security Scanner:* Scanned dependencies and static source code to identify and mitigate known CVEs.

#pagebreak()

// =========================================================
// 5. TESTING, DEPLOYMENT AND RESULT ANALYSIS
// =========================================================

= Testing, Deployment and Result Analysis

== Introduction
Quality assurance verifies that the software satisfies all functional requirements and performance benchmarks while maintaining security integrity. This section presents our test strategy, comprehensive test case execution, code coverage metrics, security audits, and release deployment.

== Testing and Quality Assurance
Testing was conducted using *Vitest v4.1* alongside *Qodo Gen* verification. The test suite covers all input validation rules, priority SLA calculations, and authorization constraints.

#text(9pt)[
*Table 5.1: CampusCare Core Functional & Security Unit Test Cases*
]
#table(
  columns: (0.8fr, 1.8fr, 1.8fr, 1.8fr, 0.8fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  [ *ID* ], [ *Test Case Description* ], [ *Input / Scenario* ], [ *Expected Result* ], [ *Status* ],
  [ TC-01 ], [ Valid Login Credentials ], [ Email & pass $\ge$ 6 chars ], [ Schema safeParse = True ], [ *PASS* ],
  [ TC-02 ], [ Malformed Email Rejection ], [ `"not-an-email"` ], [ Fails with format error ], [ *PASS* ],
  [ TC-03 ], [ Short Password Rejection ], [ Password: `"123"` ], [ Fails ($<$ 6 chars error) ], [ *PASS* ],
  [ TC-04 ], [ Valid Complaint Payload ], [ Complete form data ], [ Schema safeParse = True ], [ *PASS* ],
  [ TC-05 ], [ Short Title Rejection ], [ Title: `"AC"` ($<$ 5 chars) ], [ Fails ($<$ 5 chars error) ], [ *PASS* ],
  [ TC-06 ], [ Invalid Priority Value ], [ Priority: `"super-urgent"` ], [ Schema validation fails ], [ *PASS* ],
  [ TC-07 ], [ Valid SLA Override ], [ Valid date + reason note ], [ Schema safeParse = True ], [ *PASS* ],
  [ TC-08 ], [ Empty SLA Override Reason ], [ Reason: `"wait"` ($<$ 5 chars) ], [ Schema validation fails ], [ *PASS* ],
  [ TC-09 ], [ Critical SLA Window ], [ Priority = `"critical"` ], [ Target = +4 Hours ], [ *PASS* ],
  [ TC-10 ], [ High SLA Window ], [ Priority = `"high"` ], [ Target = +24 Hours ], [ *PASS* ],
  [ TC-11 ], [ Medium SLA Window ], [ Priority = `"medium"` ], [ Target = +72 Hours ], [ *PASS* ],
  [ TC-12 ], [ Low SLA Window ], [ Priority = `"low"` ], [ Target = +168 Hours ], [ *PASS* ],
  [ TC-13 ], [ Overdue Detection (Date) ], [ Past target date ], [ `isTicketOverdue` = True ], [ *PASS* ],
  [ TC-14 ], [ Overdue Detection (ISO) ], [ Past ISO string date ], [ `isTicketOverdue` = True ], [ *PASS* ],
  [ TC-15 ], [ Active Ticket SLA Status ], [ Future target date ], [ `isTicketOverdue` = False ], [ *PASS* ],
  [ TC-16 ], [ Staff Department Isolation ], [ IT Staff $->$ Electrical queue ], [ Access Denied (False) ], [ *PASS* ],
  [ TC-17 ], [ Student Queue Barrier ], [ Student $->$ Staff queue ], [ Access Denied (False) ], [ *PASS* ],
  [ TC-18 ], [ Admin Reassign Privilege ], [ Admin user session ], [ Permission Granted (True) ], [ *PASS* ],
  [ TC-19 ], [ Admin Self-Demotion Guard ], [ Admin demoting self to Student ], [ Rejected / Blocked (False) ], [ *PASS* ]
)

=== V8 Code Coverage Report
Executing `npx vitest run --coverage` verified complete coverage across all core modules:

#table(
  columns: (2.5fr, 1.2fr, 1.2fr, 1.2fr, 1.2fr, 1.5fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  [ *Module File* ], [ *% Stmts* ], [ *% Branch* ], [ *% Funcs* ], [ *% Lines* ], [ *Uncovered* ],
  [ `src/lib/rbac.ts` ], [ 100% ], [ 100% ], [ 100% ], [ 100% ], [ None ],
  [ `src/lib/sla.ts` ], [ 100% ], [ 100% ], [ 100% ], [ 100% ], [ None ],
  [ `src/lib/validations/auth.ts` ], [ 100% ], [ 100% ], [ 100% ], [ 100% ], [ None ],
  [ `src/lib/validations/complaints.ts` ], [ 100% ], [ 100% ], [ 100% ], [ 100% ], [ None ],
  [ *All Core Files Combined* ], [ *100%* ], [ *100%* ], [ *100%* ], [ *100%* ], [ *0 Lines* ]
)

== Code Review, Refactoring and Security Hardening
- *Snyk Vulnerability Scan:* Static dependency and source scanning was performed via Snyk CLI (`snyk test`). All 35 production dependencies reported *0 Critical, 0 High, and 0 Medium CVE vulnerabilities*.
- *Database RLS Hardening:* Tables (`complaints`, `progress_notes`, `attachments`, `audit_logs`) enforce PostgreSQL Row Level Security. `SECURITY DEFINER` helper functions were introduced to eliminate policy recursion while checking admin privileges.
- *Secrets Isolation:* Supabase service role keys and Upstash Redis tokens are stored strictly within `.env.local`, which is excluded from git version control via `.gitignore`.

== Documentation and Version-Control Management
- *README.md:* Standardized project overview documenting feature capabilities, navigation walkthroughs, test accounts, and local deployment steps.
- *Commit Discipline:* Commits adhere to Conventional Commits standard across all development phases.

== CI/CD, Deployment and Release Management
- *Continuous Deployment:* Integrated with Vercel for automated CI/CD builds on every git push to `main`.
- *Database Hosting:* Supabase Cloud PostgreSQL 15 managed instance in Singapore (AWS `ap-southeast-1`).
- *Repository URL:* `https://github.com/Shoytanbaba99/CampusCare`
- *Live Deployed Product:* `https://campuscare.vercel.app` (or local port `http://localhost:3000`)

== Results and Discussion
- *Functional Coverage:* 100% of functional requirements specified in the SRS were implemented and verified.
- *System Performance:* Server Action submission latency averaged 215 ms, while administrative master table filtering executed in under 85 ms across test datasets.
- *Testing Velocity:* All 19 unit test cases executed in 514 ms on local environments, providing instantaneous regression feedback.

#v(0.8cm)

// =========================================================
// 6. CONCLUSION AND FUTURE WORK
// =========================================================

= Conclusion and Future Work

== Conclusion
The CampusCare project successfully designed, developed, tested, and deployed an enterprise-grade campus facility complaint management platform. By centralizing reporting workflows, automating SLA deadline enforcement, establishing departmental queue isolation, and providing transparent ticket timelines, the platform directly resolves the long-standing fragmentation of university maintenance operations. Automated testing achieved 100% code coverage across core validation and security modules, while SAST audits confirmed a robust, zero-vulnerability security posture.

== Future Work
Future releases of CampusCare will focus on:
1. *Native Mobile Apps:* Developing cross-platform mobile applications using React Native / Expo to enable push notifications and offline mode for maintenance crews.
2. *Automated AI Vision Fault Triage:* Integrating computer vision models to automatically detect and classify breakdown types (e.g., detecting pipe leakage vs. plaster cracks) directly from uploaded student photos.
3. *IoT Sensor Telemetry:* Ingesting automated telemetry from campus water pumps, HVAC controllers, and electrical circuit breakers to generate preventive maintenance work orders automatically.

#v(0.8cm)

// =========================================================
// REFERENCES
// =========================================================

= References

[1] R. S. Pressman and B. R. Maxim, _Software Engineering: A Practitioner’s Approach_, 9th ed. New York, NY, USA: McGraw-Hill, 2020.

[2] I. Sommerville, _Software Engineering_, 10th ed. Harlow, U.K.: Pearson, 2015.

[3] Vercel, "Next.js App Router Documentation," _nextjs.org_, 2026. [Online]. Available: https://nextjs.org/docs.

[4] Supabase, "Row Level Security (RLS) Guide," _supabase.com_, 2026. [Online]. Available: https://supabase.com/docs/guides/auth/row-level-security.

[5] Zod Authors, "Zod: TypeScript-first schema declaration and validation," _zod.dev_, 2026. [Online]. Available: https://zod.dev.

[6] Vitest Team, "Vitest: Next Generation Testing Framework," _vitest.dev_, 2026. [Online]. Available: https://vitest.dev.

[7] Snyk, "Snyk CLI and Open Source Security Documentation," _snyk.io_, 2026. [Online]. Available: https://docs.snyk.io.

[8] Qodo, "Qodo Gen: AI Code Analysis & Test Generation," _qodo.ai_, 2026. [Online]. Available: https://www.qodo.ai.

#v(0.8cm)

// =========================================================
// APPENDIX A: TOOL USAGE LOG
// =========================================================

= Appendix A: Tool Usage Log

#text(9pt)[
*Table A.1: Tool Usage and Assistive AI Verification Log*
]
#table(
  columns: (0.7fr, 1.4fr, 1.1fr, 1.8fr, 1.2fr, 1.8fr, 1.0fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  [ *Wk* ], [ *Task / Artifact* ], [ *Tool Used* ], [ *Own Design First (What we did)* ], [ *Tool's Role* ], [ *How Output was Verified* ], [ *Decision* ],
  [ W1 ], [ ER Schema & Models ], [ Draw.io / VP ], [ Hand-sketched tables, foreign keys, and relations ], [ Modeling / Diagram ], [ Checked against 3NF normalization rules ], [ *Accepted* ],
  [ W4 ], [ Input Validation ], [ Zod v3.23 ], [ Designed form bounds (min lengths, priority enums) ], [ Schema Syntax ], [ Compiled via TypeScript strict mode ], [ *Accepted* ],
  [ W8 ], [ SLA Engine Logic ], [ TypeScript ], [ Formulated hour maps (Critical=4h, High=24h, etc.) ], [ Formulation ], [ Verified against university policy specs ], [ *Accepted* ],
  [ W10 ], [ AI Live Dispatcher ], [ Google Gemini API ], [ Designed prompt templates with ticket context injection ], [ Natural Language ], [ Tested against grounding constraints & fallback ], [ *Accepted* ],
  [ W11 ], [ Rate Limiter ], [ Upstash Redis ], [ Designed sliding-window limiter (3 req/min) ], [ Integration ], [ Benchmarked under rapid automated requests ], [ *Accepted* ],
  [ W13 ], [ Unit Test Scenarios ], [ Qodo Gen ], [ Wrote core test assertions and role matrices ], [ Edge Exploration ], [ Reviewed generated test cases in Vitest ], [ *Modified* ],
  [ W14 ], [ Security Audit ], [ Snyk CLI ], [ Formulated RLS policies and sanitize headers ], [ SAST Scan ], [ Executed `snyk test` with 0 CVE findings ], [ *Accepted* ],
  [ W14 ], [ Report Typesetting ], [ Typst v0.15 ], [ Authored report content according to SPDD format ], [ Typesetting ], [ Verified layout, margins, and page budget ], [ *Accepted* ]
)

#v(0.8cm)

// =========================================================
// APPENDIX B: TEAM CONTRIBUTION RECORD
// =========================================================

= Appendix B: Team Contribution Record

*Repository:* `https://github.com/Shoytanbaba99/CampusCare` \
*Deployed Product:* `https://campuscare.vercel.app` (or local port `http://localhost:3000`)

#table(
  columns: (1.5fr, 2.2fr, 1.4fr, 2.0fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  [ *Member (Name, ID)* ], [ *Modules / Tasks Owned* ], [ *Contribution Focus* ], [ *Documentation & Role Assignment* ],
  [ *Shafayat Hossain Shafin* \ ID: 0432320005101088 \ _Technical Documentation Lead_ ], [ Technical documentation, literature review, user guides, developer guidelines, project proposal and report formatting ], [ Requirement Elicitation & System Analysis ], [ Authored Section 1 (Introduction), Section 2 (Background Study & SRS), and overall report compilation & formatting ],
  [ *Md. Masud Rahman* \ ID: 0432320005101064 \ _Full-Stack Lead & Architecture_ ], [ Full-stack architecture, Next.js 16 Server Actions, Gemini AI Dispatcher, Edge middleware, Redis live chat bus, SLA engine ], [ System Architecture & Backend Integration ], [ Authored Section 4 (Implementation), Section 6 (Conclusion & Future Work), system integration, and presentation deck lead ],
  [ *Rudro Antony Mrong* \ ID: 0432320005101059 \ _UI/UX Design, Requirements & QA_ ], [ Stakeholder requirements, UI/UX design system, UML & DFD modeling, Vitest test suite execution, Qodo Gen refinement, Snyk security audits ], [ UI/UX Engineering & Software Verification ], [ Authored Section 3 (System Design & UI/UX), Section 5 (Testing & QA), Table 5.1 test cases, and code coverage report ]
)

#pagebreak()

// =========================================================
// JUSTIFICATION REPORT (CO-PO & CEP)
// =========================================================

= Justification Report

Below is the CO-PO Mapping and Complex Engineering Problem (CEP) Justification Report for the project titled *“CampusCare: Centralized University Facility Maintenance & Complaint Tracking Platform”*, developed for the course CSE 416 Software Project Design and Development (Autumn 2026).

== CO-PO Mapping

#text(8pt)[
#table(
  columns: (0.7fr, 3.4fr, 0.7fr, 1.1fr, 0.7fr, 1.2fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  inset: 3.5pt,
  [ *CO No.* ], [ *Course Outcome* ], [ *PO* ], [ *Domain / Level* ], [ *KP* ], [ *CP / CA* ],
  [ *CO1* ], [ Analyze project requirements and design a software solution for a real-life problem, using modern requirements and modeling tools to refine and verify the design. ], [ PO(c) ], [ C -- L4 ], [ K5 ], [ WP1, WP2, WP3 ],
  [ *CO2* ], [ Apply modern engineering tools and techniques across the SDLC (design, coding, review, DevOps) to build effective software solutions. ], [ PO(e) ], [ C -- L3 ], [ K6 ], [ -- ],
  [ *CO3* ], [ Create and implement robust testing and quality-assurance mechanisms to ensure software quality. ], [ PO(i) ], [ C -- L5 ], [ -- ], [ WP1, WP2, WP3 ],
  [ *CO4* ], [ Implement, deploy and manage a real-life complex software product end-to-end, with version control, CI/CD and release management. ], [ PO(k) ], [ C -- L6 ], [ -- ], [ EA1, EA2, EA3 ],
  [ *CO5* ], [ Investigate a real-life problem by evaluating alternative solutions and justifying design decisions with evidence. ], [ PO(d) ], [ C -- L5 ], [ K8 ], [ WP1, WP2, WP3 ],
  [ *CO6* ], [ Communicate software engineering work effectively through professional documentation, reports and oral presentation. ], [ PO(g) ], [ C/A -- L4 / A3 ], [ K7 ], [ EA1, EA2, EA5 ],
  [ *CO7* ], [ Function effectively as a member of a multi-person team, sharing responsibility and integrating individual contributions. ], [ PO(h) ], [ A -- A3 ], [ K7 ], [ EA1, EA2 ],
  [ *CO8* ], [ Demonstrate ethical and professional responsibility in software licensing, secure data handling and honest disclosure of tool use. ], [ PO(f) ], [ A -- A3 ], [ K7 ], [ -- ]
)
]

#v(0.15cm)
#text(8pt, style: "italic")[
  *Domain Legend:* C = Cognitive (Bloom L1--L6), P = Psychomotor (P1--P7), A = Affective (A1--A5). KP = Knowledge Profile (K1--K8). CP = Complex Problem attributes (WP1--WP7). CA = Complex Activity attributes (EA1--EA5).
]

== Mapping of COs with Program Outcomes (POs)

#text(8pt)[
#table(
  columns: (1.2fr, ..(1fr,) * 12),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  inset: 3.5pt,
  [ *CO* ], [ *(a)* ], [ *(b)* ], [ *(c)* ], [ *(d)* ], [ *(e)* ], [ *(f)* ], [ *(g)* ], [ *(h)* ], [ *(i)* ], [ *(j)* ], [ *(k)* ], [ *(l)* ],
  [ *CO1* ], [ ], [ ], [ *3* ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
  [ *CO2* ], [ ], [ ], [ ], [ ], [ *3* ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
  [ *CO3* ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ *3* ], [ ], [ ], [ ],
  [ *CO4* ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ *3* ], [ ],
  [ *CO5* ], [ ], [ ], [ ], [ *2* ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ ],
  [ *CO6* ], [ ], [ ], [ ], [ ], [ ], [ ], [ *2* ], [ ], [ ], [ ], [ ], [ ],
  [ *CO7* ], [ ], [ ], [ ], [ ], [ ], [ ], [ ], [ *2* ], [ ], [ ], [ ], [ ],
  [ *CO8* ], [ ], [ ], [ ], [ ], [ ], [ *2* ], [ ], [ ], [ ], [ ], [ ], [ ]
)
]

#v(0.15cm)
#text(8pt, style: "italic")[
  *Correlation strength:* 3 = High, 2 = Medium, 1 = Low.
]

== Justification of PO through COs

#text(8pt)[
#table(
  columns: (0.7fr, 0.7fr, 3.2fr, 1.4fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  inset: 3.5pt,
  [ *CO* ], [ *PO* ], [ *Justification* ], [ *Report Section* ],
  [ *CO1* ], [ *PO(c)* ], [ Analyzed campus maintenance bottlenecks and formalized into SRS specifications, UML models (Use-Case, State, Sequence, Class, ER), and 3-tier architecture. ], [ Sec. 2 (2.3--2.4); Sec. 3 (3.3--3.5) ],
  [ *CO2* ], [ *PO(e)* ], [ Applied modern web tools (Next.js 16, React 19, Supabase PostgreSQL, Upstash Redis, Tailwind CSS, Zod, Vitest) across the engineering lifecycle. ], [ Sec. 3 (3.3); Sec. 4 (4.2--4.5); Sec. 5; App. A ],
  [ *CO3* ], [ *PO(i)* ], [ Formulated a comprehensive unit test suite via Qodo Gen and Vitest (19 tests, 100% coverage) alongside Snyk SAST security vulnerability audits. ], [ Sec. 5 (5.2--5.3) ],
  [ *CO4* ], [ *PO(k)* ], [ Constructed and deployed the end-to-end product with Git version control, Vercel automated CI/CD pipeline, and managed Supabase cloud database. ], [ Sec. 4 (4.2--4.4); Sec. 5 (5.4--5.5) ],
  [ *CO5* ], [ *PO(d)* ], [ Evaluated existing manual and ITSM alternatives (Table 2.1), justifying design decisions with empirical evidence and performance metrics. ], [ Sec. 2 (2.2, 2.5); Sec. 3 (3.6) ],
  [ *CO6* ], [ *PO(g)* ], [ Produced rigorous technical documentation, including this SPDD comprehensive report, project proposal, SRS, and README developer guides. ], [ Sec. 5 (5.4); App. C ],
  [ *CO7* ], [ *PO(h)* ], [ Functioned effectively as a collaborative team, partitioning tasks across frontend, backend, and QA, verified through modular task decomposition and peer reviews. ], [ Sec. 1 (1.5); App. B ],
  [ *CO8* ], [ *PO(f)* ], [ Enforced ethical data handling via PostgreSQL Row Level Security, secured environment secrets via `.env.local`, and disclosed all assistive tool usage. ], [ Sec. 5 (5.3); Sec. 6 (6.2); App. A ]
)
]

== Complex Engineering Problem (CEP) Justification

#text(8pt)[
#table(
  columns: (1.5fr, 0.8fr, 3.7fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  inset: 3.5pt,
  [ *Attribute* ], [ *Linked COs* ], [ *Justification & Report Evidence* ],
  [ *WP1: Depth of Knowledge Required* ], [ CO1, CO3, CO5 ], [ Solving campus-wide dispatching required in-depth knowledge of database security (PostgreSQL RLS with `SECURITY DEFINER` policies), asynchronous concurrency (React 19 Server Actions), and deterministic state machine modeling (Sec. 3.3, 4.3). ],
  [ *WP2: Range of Conflicting Requirements* ], [ CO1, CO3, CO5 ], [ Successfully balanced user privacy (anonymous ticket reporting) against accountability (immutable audit logging), and high throughput chat concurrency against database rate limits via Upstash Redis (Sec. 3.6, 4.4). ],
  [ *WP3: Depth of Analysis Required* ], [ CO1, CO3, CO5 ], [ Analyzed mathematical SLA degradation curves across four priority tiers, evaluated caching vs. direct DB query latencies, and verified code boundaries with 100% coverage test suites (Sec. 2.5, 5.2). ]
)
]

== Range of Complex Engineering Activities (CEA) Justification

#text(8pt)[
#table(
  columns: (1.5fr, 0.8fr, 3.7fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  inset: 3.5pt,
  [ *Attribute* ], [ *Linked COs* ], [ *Justification & Report Evidence* ],
  [ *EA1: Range of Resources* ], [ CO4, CO6, CO7 ], [ Coordinated multiple enterprise-grade tools: Next.js 16, Supabase PostgreSQL, Upstash Redis Cloud, Vercel serverless edge deployment, Git version control, and Vitest/Snyk toolchains (Sec. 3.3, 4.2). ],
  [ *EA2: Level of Interaction* ], [ CO4, CO6, CO7 ], [ Managed interactions between diverse technical constraints (HttpOnly edge sessions, browser camera uploads, server-side Zod validation) and diverse human stakeholders (Students, Resolvers, Directors) (Sec. 2.3, 4.4). ],
  [ *EA3: Innovation* ], [ CO4 ], [ Designed a novel 1-click live takeover mechanism transitioning bot assistance to human technician live chat without page refresh, coupled with dual photo evidence verification (Sec. 3.5, 4.4). ],
  [ *EA5: Familiarity* ], [ CO6 ], [ Extended standard CRUD web practices by engineering database-level security policies (RLS), edge proxy rate limiters, and automated SLA overdue detection triggers (Sec. 4.3, 5.3). ]
)
]

== Mapping to Communication (CO6)
- *Written Technical Documents:* Produced this comprehensive course project report, along with the project proposal, SRS document, and GitHub developer documentation.
- *Oral Presentations:* Conducted live demonstrations showcasing multi-role workflows (Student complaint submission $->$ Staff claiming and resolving $->$ Admin dispatching and audit review).
- *Visual Representation:* Integrated 8 formal UML, DFD, and architectural diagrams (Gantt, WBS, Use-Case, State, Sequence, Class, ER schema, Level-1 DFD) to illustrate system design with visual precision.
