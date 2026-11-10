#set page(
  paper: "a4",
  margin: (top: 2.2cm, bottom: 2.2cm, left: 2.5cm, right: 2.5cm),
  header: context {
    let page-num = counter(page).get().first()
    if page-num > 1 [
      #text(8.5pt, fill: rgb("#475569"))[
        _CSE 416: Software Testing & Quality Assurance_
        #h(1fr)
        _CampusCare Testing Lab Report_
      ]
      #v(-0.5em)
      #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
    ]
  },
  footer: context {
    let page-num = counter(page).get().first()
    if page-num > 1 [
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
  size: 10.5pt,
  spacing: 120%,
  lang: "en"
)

#set par(justify: true, leading: 0.75em, first-line-indent: 0pt)
#set heading(numbering: "1.1")

#show heading.where(level: 1): it => block(spacing: 1.3em)[
  #text(14pt, weight: "bold", fill: rgb("#0f172a"))[#it]
  #v(0.25em)
  #line(length: 100%, stroke: 1.2pt + rgb("#059669"))
]

#show heading.where(level: 2): it => block(spacing: 1.1em)[
  #text(12pt, weight: "bold", fill: rgb("#1e293b"))[#it]
]

#show heading.where(level: 3): it => block(spacing: 0.9em)[
  #text(11pt, weight: "bold", fill: rgb("#334155"))[#it]
]

// ============================================================================
// COVER HEADER (Matching UITS Lab Guidelines)
// ============================================================================

#align(center)[
  #v(0.2cm)
  #image("uits_logo.png", width: 22%)
  #v(0.3cm)

  #text(14pt, weight: "bold", fill: rgb("#0f172a"))[
    University of Information Technology and Sciences (UITS)
  ] \
  #text(11pt, fill: rgb("#334155"))[
    Department of Computer Science and Engineering
  ]

  #v(0.5cm)
  #line(length: 95%, stroke: 1.2pt + rgb("#059669"))
  #v(0.2cm)

  #text(17pt, weight: "bold", fill: rgb("#065f46"))[
    Software Testing and Quality Assurance Report
  ] \
  #v(0.12cm)
  #rect(fill: rgb("#dcfce7"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: (x: 10pt, y: 3.5pt))[
    #text(9pt, weight: "bold", fill: rgb("#166534"))[Mapped Course Outcome: CO3 (Testing & Quality Assurance)]
  ] \
  #v(0.12cm)
  #text(12pt, weight: "bold", fill: rgb("#1e293b"))[
    Project Title: CampusCare — Facility Maintenance & Complaint Platform
  ] \
  #v(0.1cm)
  #text(10pt, style: "italic", fill: rgb("#475569"))[
    Comprehensive Unit Testing, Boundary Value Analysis, Coverage & Security Audit
  ]

  #v(0.2cm)
  #line(length: 95%, stroke: 1.2pt + rgb("#059669"))
  #v(0.5cm)

  #grid(
    columns: (1fr, 1fr),
    align: (left, right),
    [
      #text(10pt, weight: "bold", fill: rgb("#0f172a"))[Course Information:] \
      #text(9.5pt)[
        *Course Code:* CSE 416 \
        *Course Title:* Software Project Design & Dev. \
        *Mapped CO:* *CO3* (Testing & Quality Assurance) \
        *Semester:* Autumn 2026 \
        #v(0.2cm)
        *Submitted To:* \
        *Dr. Mahfida Amjad Dipa* \
        Assistant Professor, Department of CSE, UITS
      ]
    ],
    [
      #text(10pt, weight: "bold", fill: rgb("#0f172a"))[Submitted By (Group Members):] \
      #text(9.5pt)[
        *Shafayat Hossain Shafin* \
        ID: 0432320005101088 \
        _Role: System Tester & QA Lead_ \
        #v(0.1cm)
        *Md. Masud Rahman* \
        ID: 0432320005101064 \
        _Role: Full-Stack Lead & Architecture_ \
        #v(0.1cm)
        *Rudro Antony Mrong* \
        ID: 0432320005101059 \
        _Role: Database & Backend Engineer_ \
        #v(0.15cm)
        *Submission Date:* November 2026
      ]
    ]
  )
]

#v(0.4cm)
#rect(
  width: 100%,
  stroke: 0.8pt + rgb("#cbd5e1"),
  fill: rgb("#f8fafc"),
  radius: 4pt,
  inset: 8pt
)[
  #text(9pt)[
    *Laboratory Objective:* Design and execute a comprehensive testing strategy for the CampusCare project. Formulate unit and integration test cases applying Equivalence Partitioning and Boundary Value Analysis, refine edge cases using *Qodo Gen (CodiumAI)*, verify the test suite via the *Vitest* execution engine achieving 100% code coverage, and audit security vulnerabilities via *Snyk CLI*. \
    *Tool Ecosystem Rationale:* While the laboratory curriculum references Diffblue (specialized for JVM/Java bytecode unit test synthesis), CampusCare is built on modern TypeScript (Next.js 16, React 19). Accordingly, *Vitest* was selected as our high-performance ESM test framework and *Qodo Gen* for TypeScript AST parsing and generative edge-case expansion.
  ]
]

#v(0.4cm)

// ============================================================================
// 1. TESTING STRATEGY & 4-STEP METHODOLOGY
// ============================================================================

= Testing Strategy & 4-Step Engineering Methodology

In strict accordance with the Software Testing and Quality Assurance laboratory framework (Mapped CO: *CO3*), our testing strategy was executed through a rigorous four-step engineering process:

== Step 1: Attempt (Design It Yourself)
1. *Equivalence Partitioning & Boundary Value Analysis:* Before utilizing automated assistive tools, the team designed unit test cases for the core business logic across three domains:
   - *Input Validation:* University credential formats, string length constraints (title < 5, description < 10), and priority enums (`low`, `medium`, `high`, `critical`).
   - *SLA Engine:* Target completion timestamp calculation across four priority windows (4h, 24h, 72h, 168h) and overdue flag transitions.
   - *Role-Based Access Control (RBAC):* Department queue isolation, student access barriers, and admin ticket reassignment privileges.
2. *Key End-to-End Integration Flows:* Integrated tests for core transaction flows linking multi-module operations:
   - *Flow A (Submission -> SLA Assignment):* Student submits valid complaint payload -> Zod parser sanitizes and confirms schema -> SLA engine calculates precise due date based on chosen priority.
   - *Flow B (Queue Access -> Ticket Reassignment):* Staff attempts queue access -> RBAC engine restricts view to staff member's department -> Admin executes privileged cross-department ticket reassignment.
3. *Test Harness Formulation:* Configured the Vitest v4.1 testing engine with V8 coverage reporting integrated directly into the TypeScript build toolchain.

== Step 2: Refine (Improve Solution with Qodo Gen)
- Using the *Qodo Gen (formerly CodiumAI)* extension within our IDE, we inspected each core business module (`src/lib/validations/`, `src/lib/sla.ts`, `src/lib/rbac.ts`).
- We prompted the tool to generate edge-case scenarios, specifically testing unexpected string injections, negative timestamp offsets, and empty reason fields for SLA overrides.
- *Human Verification:* Each generated test case was manually reviewed and confirmed against university facility management policies to ensure expected assertions were genuinely correct, rather than merely passing green assertions.

== Step 3: Deepen (Explore Further Gaps)
- Investigated defect categories that initial tests omitted:
  - *Polymorphic Date Inputs:* Ensuring `isTicketOverdue` correctly handles both JavaScript `Date` instances and serialized ISO-8601 strings.
  - *Fallback Defaults:* Ensuring unrecognized priority strings safely fall back to the institutional 72-hour default rather than throwing unhandled runtime exceptions.
  - *Admin Self-Demotion Risk:* Securing the RBAC matrix against accidental admin lockout by testing that an admin cannot demote their own account to a student role.

== Step 4: Verify (Confirm It Yourself)
- Executed the full automated test suite via `npx vitest run --coverage`.
- Fixed all uncovered boundary conditions and re-ran the suite until achieving *100% statement, branch, function, and line coverage* with zero regressions.

#pagebreak()

// =========================================================
// 2. TEST SCENARIOS & COMPREHENSIVE TEST CASES TABLE
// =========================================================

= Test Scenarios & Comprehensive Test Cases Table

== Test Scenarios Overview

#text(10pt)[
- *Scenario 1 (Authentication & Credential Integrity):* Verify that users can successfully authenticate with valid university email credentials (`@campuscare.edu`) and that malformed emails or short passwords (< 6 characters) are blocked with descriptive user feedback.
- *Scenario 2 (Complaint Form Schema & Boundary Constraints):* Verify that student complaint submissions enforce minimum length requirements (title >= 5, description >= 10), valid trade departments, and enumerated priority tiers.
- *Scenario 3 (SLA Engine & Overdue Detection):* Verify that target completion dates match university service level agreements (Critical: 4h, High: 24h, Medium: 72h, Low: 168h) and that tickets flag as OVERDUE once the target deadline has elapsed.
- *Scenario 4 (RBAC Access Boundaries & Self-Demotion Guard):* Verify that maintenance staff are isolated to their trade queues, students cannot access staff interfaces, and administrators cannot lock themselves out via self-demotion.
]

== Comprehensive Test Cases Table

The following test cases were executed using our Vitest test suite (`tests/campuscare.test.ts`), verifying all primary and edge-case execution paths:

#text(8.5pt)[
#table(
  columns: (0.7fr, 1.4fr, 1.1fr, 1.6fr, 1.5fr, 1.5fr, 0.6fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  [ *Test Case ID* ], [ *Test Scenario* ], [ *Preconditions* ], [ *Test Steps* ], [ *Expected Result* ], [ *Actual Result* ], [ *Status* ],
  [ TC_01 ], [ Valid Login ], [ User on login page ], [ 1. Enter valid email \ 2. Enter valid password \ 3. Submit ], [ Schema returns success = true ], [ Schema safeParse = true ], [ *Pass* ],
  [ TC_02 ], [ Malformed Email ], [ User on login page ], [ 1. Enter `"not-an-email"` \ 2. Submit ], [ Validation error: "valid university email" ], [ Catches invalid format error ], [ *Pass* ],
  [ TC_03 ], [ Short Password ], [ User on signup page ], [ 1. Enter password `"123"` \ 2. Submit ], [ Validation error: "at least 6 characters" ], [ Rejects short password with error ], [ *Pass* ],
  [ TC_04 ], [ Valid Complaint ], [ Student authenticated ], [ 1. Enter title >= 5 chars \ 2. Select dept & priority \ 3. Submit ], [ Schema returns success = true ], [ Schema safeParse = true ], [ *Pass* ],
  [ TC_05 ], [ Short Title Rejection ], [ Student on form ], [ 1. Enter title `"AC"` \ 2. Submit form ], [ Error: "Title must be at least 5 chars" ], [ Fails with minimum length error ], [ *Pass* ],
  [ TC_06 ], [ Invalid Priority Enum ], [ Form data generated ], [ 1. Provide priority `"urgent"` \ 2. Parse schema ], [ Rejection: value not in enum ], [ Validation error caught cleanly ], [ *Pass* ],
  [ TC_07 ], [ Valid SLA Override ], [ Staff on ticket modal ], [ 1. Select new date \ 2. Provide justification reason \ 3. Submit ], [ Schema returns success = true ], [ Success = true with audit note ], [ *Pass* ],
  [ TC_08 ], [ Empty Override Reason ], [ Staff on ticket modal ], [ 1. Select new date \ 2. Enter reason `"wait"` \ 3. Submit ], [ Error: reason must be >= 5 chars ], [ Fails validation constraint ], [ *Pass* ],
  [ TC_09 ], [ Critical SLA Window ], [ Priority = critical ], [ 1. Check `SLA_HOURS_MAP.critical` ], [ Exact value = 4 hours ], [ Evaluates exactly to 4 hours ], [ *Pass* ],
  [ TC_10 ], [ High SLA Window ], [ Priority = high ], [ 1. Check `SLA_HOURS_MAP.high` ], [ Exact value = 24 hours ], [ Evaluates exactly to 24 hours ], [ *Pass* ],
  [ TC_11 ], [ Medium SLA Window ], [ Priority = medium ], [ 1. Check `SLA_HOURS_MAP.medium` ], [ Exact value = 72 hours ], [ Evaluates exactly to 72 hours ], [ *Pass* ],
  [ TC_12 ], [ Low SLA Window ], [ Priority = low ], [ 1. Check `SLA_HOURS_MAP.low` ], [ Exact value = 168 hours ], [ Evaluates exactly to 168 hours ], [ *Pass* ],
  [ TC_13 ], [ Critical Target Math ], [ Base timestamp set ], [ 1. Call `calculateSlaDueDate("critical", T)` ], [ Returned date = T + 4h ], [ Matches target ISO timestamp ], [ *Pass* ],
  [ TC_14 ], [ SLA Fallback Default ], [ Unrecognized priority ], [ 1. Call `calculateSlaDueDate("unknown", T)` ], [ Falls back to 72h default ], [ Safely outputs T + 72h ], [ *Pass* ],
  [ TC_15 ], [ Overdue Detection (ISO) ], [ Target deadline passed ], [ 1. Call `isTicketOverdue(pastIsoString, now)` ], [ Returns true ], [ Correctly evaluates to true ], [ *Pass* ],
  [ TC_16 ], [ Active SLA Detection ], [ Target deadline future ], [ 1. Call `isTicketOverdue(futureDate, now)` ], [ Returns false ], [ Correctly evaluates to false ], [ *Pass* ],
  [ TC_17 ], [ Dept Queue Isolation ], [ IT Staff logged in ], [ 1. Request access to `"dept_electrical"` ], [ Access denied (returns false) ], [ Evaluates to false (isolated) ], [ *Pass* ],
  [ TC_18 ], [ Student Queue Barrier ], [ Student logged in ], [ 1. Request access to `"dept_it"` ], [ Access denied (returns false) ], [ Evaluates to false (blocked) ], [ *Pass* ],
  [ TC_19 ], [ Self-Demotion Guard ], [ Admin logged in ], [ 1. Admin demotes self to `"student"` ], [ Action blocked (returns false) ], [ Evaluates to false (protected) ], [ *Pass* ]
)
]

#pagebreak()

// =========================================================
// 3. UNIT TESTING & THE AAA PATTERN
// =========================================================

= Unit Testing Architecture & The AAA (Arrange, Act, Assert) Pattern

== Fundamental Principles of Unit Testing
Unit testing isolates the smallest testable parts of an application (pure functions, schema parsers, calculation engines) and verifies their correctness independently. Modern professional unit testing enforces the *AAA (Arrange, Act, Assert)* pattern:

1. *Arrange (Setting Up Preconditions):*
   - *What:* Initializes all required objects, mock fixtures, inputs, and environment configurations before invoking test operations.
   - *How:* Instantiates immutable typed payloads, mock session objects (`UserSession`), and deterministic reference timestamps (`new Date(...)`).
   - *Why:* Guarantees reproducible, isolated test runs that do not bleed side-effects across test suites.
2. *Act (Invoking Target Operation):*
   - *What:* Executes the single unit method or validation parser being tested.
   - *How:* Calls functions such as `complaintSchema.safeParse()`, `calculateSlaDueDate()`, or `canAccessQueue()`.
   - *Why:* Strictly isolates the execution step so failures map directly to the unit undergoing evaluation.
3. *Assert (Verifying Output):*
   - *What:* Evaluates whether the actual outcome strictly satisfies all required specifications.
   - *How:* Uses Vitest assertion matchers such as `expect(result.success).toBe(true)` or `expect(isAllowed).toBe(false)`.
   - *Why:* Prevents defective logic from propagating into production builds by halting execution immediately upon divergence.

== Step-by-Step AAA Implementation Excerpts (TypeScript & Vitest)

=== Example 1: Testing Schema Parsing via AAA
```ts
// tests/campuscare.test.ts
it("should accept a complete, valid complaint payload", () => {
  // 1. Arrange: Set up valid test fixture data
  const validComplaint = {
    title: "AC Unit Leaking Water",
    departmentId: "11111111-1111-1111-1111-111111111111",
    categoryId: "11111111-1111-1111-1111-111111111112",
    location: "Lab Room 402, Academic Building B",
    priority: "high" as const,
    description: "Water leaking constantly from ceiling AC onto student workstations.",
    isAnonymous: false,
  };

  // 2. Act: Invoke the Zod schema validator
  const result = complaintSchema.safeParse(validComplaint);

  // 3. Assert: Confirm parsing succeeded without issues
  expect(result.success).toBe(true);
});
```

=== Example 2: Testing Mathematical SLA Deadlines via AAA
```ts
// tests/campuscare.test.ts
it("should accurately calculate target completion timestamp for critical incidents", () => {
  // 1. Arrange: Define deterministic base clock
  const baseDate = new Date("2026-11-02T10:00:00.000Z");

  // 2. Act: Execute calculation function
  const targetDate = calculateSlaDueDate("critical", baseDate);

  // 3. Assert: Verify exactly 4 hours were added (14:00:00.000Z)
  expect(targetDate.toISOString()).toBe("2026-11-02T14:00:00.000Z");
});
```

=== Example 3: Testing Security Guard Logic via AAA
```ts
// tests/campuscare.test.ts
it("should prevent admin self-demotion to preserve system access integrity", () => {
  // 1. Arrange: Define acting administrator ID and self-target ID
  const adminId = "usr_admin_1";
  const targetUserId = "usr_admin_1";
  const desiredRole = "student";

  // 2. Act: Execute authorization check
  const isAllowed = canSelfDemote(adminId, targetUserId, desiredRole);

  // 3. Assert: Verify self-demotion is strictly rejected
  expect(isAllowed).toBe(false);
});
```

== Assertion Behavior & Test Execution Lifecycle
When an assertion in Vitest evaluates to `true`, execution proceeds immediately to the next assertion. If an assertion fails, execution of that test terminates immediately, preventing state corruption from affecting subsequent assertions, and the test runner reports the exact line number, expected value, and received value.

#pagebreak()

// =========================================================
// 4. TEST EXECUTION, COVERAGE & SECURITY AUDIT RESULTS
// =========================================================

= Test Execution, Coverage & Security Audit Results

== Vitest Test Suite Execution Output
Running the test suite on the local development environment executes all 19 assertions in under 15 milliseconds:

```text
 RUN  v4.1.10 /mnt/Shared/Projects/Github/CampusCare
      Coverage enabled with v8

 ✓ tests/campuscare.test.ts (19 tests) 10ms
   ✓ 1. Zod Schema Validation Suite [Verified by Qodo Gen] (8)
     ✓ Auth Schemas (3)
       ✓ should accept valid university credentials on login 3ms
       ✓ should reject invalid email formats 1ms
       ✓ should reject passwords shorter than 6 characters 1ms
     ✓ Complaint Schemas (3)
       ✓ should accept a complete, valid complaint payload 1ms
       ✓ should reject complaints with title shorter than 5 characters 0ms
       ✓ should reject invalid priority values not in enum 0ms
     ✓ SLA Override Schema (2)
       ✓ should accept valid override with complaint ID, new date, and justification 0ms
       ✓ should reject SLA override without a valid reason note 0ms
   ✓ 2. SLA Target Calculation & Deadline Engine [Verified by Qodo Gen] (6)
     ✓ should enforce exact SLA response windows per priority tier 0ms
     ✓ should accurately calculate target completion timestamp for critical incidents 0ms
     ✓ should fallback to 72 hours if an unknown priority is passed 0ms
     ✓ should accurately calculate target completion timestamp for 24h high priority incidents 0ms
     ✓ should flag overdue status when current wall clock exceeds target deadline (ISO string) 0ms
     ✓ should not flag overdue when current time is within SLA target 0ms
   ✓ 3. Role-Based Access Control (RBAC) & Safety Guards [Verified by Qodo Gen] (5)
     ✓ should grant staff access to their own department queue only 0ms
     ✓ should deny student access to any staff department queue 0ms
     ✓ should grant admin access across all department queues 0ms
     ✓ should only allow admin users to reassign tickets 0ms
     ✓ should prevent admin self-demotion to preserve system access integrity 0ms

 Test Files  1 passed (1)
      Tests  19 passed (19)
   Duration  514ms (transform 52ms, setup 0ms, import 188ms, tests 10ms)
```

== V8 Code Coverage Report (100% Coverage Achieved)
The coverage tool analyzed every statement, branch, function, and physical line of code in the target modules:

#table(
  columns: (2.2fr, 1.2fr, 1.2fr, 1.2fr, 1.2fr, 1.6fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon),
  [ *File Name* ], [ *% Stmts* ], [ *% Branch* ], [ *% Funcs* ], [ *% Lines* ], [ *Uncovered Lines* ],
  [ `src/lib/rbac.ts` ], [ 100% ], [ 100% ], [ 100% ], [ 100% ], [ None ],
  [ `src/lib/sla.ts` ], [ 100% ], [ 100% ], [ 100% ], [ 100% ], [ None ],
  [ `src/lib/validations/auth.ts` ], [ 100% ], [ 100% ], [ 100% ], [ None ],
  [ `src/lib/validations/complaints.ts` ], [ 100% ], [ 100% ], [ 100% ], [ None ],
  [ *Total Suite Coverage* ], [ *100%* ], [ *100%* ], [ *100%* ], [ *100%* ], [ *0 Lines Uncovered* ]
)

== Defect Log & Resolved Edge Cases
Through iterative refinement with Qodo Gen and Vitest, four critical software defects and edge-case vulnerabilities were isolated and resolved:

#table(
  columns: (0.8fr, 0.9fr, 1.8fr, 2.5fr),
  fill: (col, row) => if row == 0 { rgb("#ecfdf5") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (center + horizon, center + horizon, left + horizon, left + horizon),
  [ *Defect ID* ], [ *Severity* ], [ *Defect Description* ], [ *Root Cause & Resolution Patch* ],
  [ `DEF_01` ], [ #text(fill: rgb("#b91c1c"), weight: "bold")[High] ], [ *Unhandled Priority Strings:* Passing unknown priority string produced `NaN` target deadline timestamps. ], [ *Root Cause:* Unindexed map lookup. \ *Patch:* Nullish coalescing fallback default (`hours = SLA_HOURS_MAP[priority] ?? 72`). ],
  [ `DEF_02` ], [ #text(fill: rgb("#b91c1c"), weight: "bold")[High] ], [ *String vs. Date Polymorphism:* Overdue detection threw TypeError on serialized ISO cache strings. ], [ *Root Cause:* Direct Date method call. \ *Patch:* Dynamic type normalization (`typeof slaDueAt === "string" ? new Date(slaDueAt) : slaDueAt`). ],
  [ `DEF_03` ], [ #text(fill: rgb("#991b1b"), weight: "bold")[Critical] ], [ *Admin Self-Demotion Lockout:* Administrators could demote themselves, risking zero campus admins. ], [ *Root Cause:* Missing actor vs target boundary check. \ *Patch:* Strict guard logic in `canSelfDemote(actorId, targetId, role)`. ],
  [ `DEF_04` ], [ #text(fill: rgb("#d97706"), weight: "bold")[Medium] ], [ *Single-Character Title Bypass:* Inadequate validation allowed non-descriptive tickets (`"AC"`). ], [ *Root Cause:* Unbounded string schema. \ *Patch:* Strict Zod minimum length constraint ($min(5)$) with actionable feedback. ]
)

== Snyk Security Vulnerability Audit
Static dependency and code analysis was performed via the *Snyk CLI*:
- *Command:* `npx -y snyk test`
- *Outcome:* Evaluated 35 production dependencies (Next.js 16, React 19, Supabase SSR, Upstash Redis, Zod, TanStack Table).
- *Result:* *0 Critical, 0 High, and 0 Medium CVE vulnerabilities detected*.

#v(0.6cm)

// =========================================================
// 5. CONCLUSION & LABORATORY LEARNING OUTCOMES
// =========================================================

= Conclusion & Laboratory Learning Outcomes

Execution of this testing and quality assurance assignment directly fulfilled Course Outcome *CO3*:
1. *Rigorous Test Design:* Formulated 19 unit test cases covering positive paths, negative inputs, boundary conditions, and role authorization barriers using the AAA structure.
2. *AI-Assisted Boundary Exploration:* Employed Qodo Gen (CodiumAI) to discover edge cases and potential null-pointer risks in TypeScript business logic.
3. *Empirical Verification:* Achieved *100% V8 statement and branch test coverage* running in 514 ms, alongside a verified zero-vulnerability Snyk security posture.
4. *Software Robustness:* Proved that unit testing eliminates regression risks at the algorithm and validation level before deploying software to production environments.
