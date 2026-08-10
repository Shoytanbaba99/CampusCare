# Project Proposal

## Project Title: CampusCare (Centralized University Complaint Management System)
**Document Type:** Formal Project Proposal  
**Target Domain:** Educational Institution Infrastructure & Facility Operations Management  

---

## 1. Executive Summary

CampusCare is a 3-tier web application designed to centralize university facility maintenance, infrastructure reporting, and operational task dispatching. In many academic institutions, complaint reporting relies on unorganized communication channels such as phone calls, emails, and physical front desk visits. This fragmentation causes delayed issue resolution, lost requests, lack of status tracking for reporters, and limited visibility for management. CampusCare introduces a unified digital workflow governed by a strict state machine (Submitted, Assigned, In Progress, Resolved, Closed, Reopened). The system provides role-based user interfaces for Students, Staff, and Administrators to enforce operational accountability, reduce resolution times, and provide institutional analytics regarding campus maintenance.

---

## 2. Problem Statement

Managing physical and technical infrastructure across campus buildings, residence halls, laboratories, and classrooms involves thousands of active assets. Existing manual and fragmented reporting workflows present systemic operational challenges:

- **Fragmented Communication Channels:** Complaints submitted through inconsistent channels lead to misplaced requests and zero centralized record-keeping.
- **Absence of Reporter Visibility:** Students lack a mechanism to track ticket progress after reporting an issue, generating redundant complaints and support inquiries.
- **Unstructured Task Allocation:** Operational maintenance staff lack prioritized digital queues, leading to inefficient task distribution and missed service deadlines.
- **Lack of Administrative Analytics:** Department managers lack quantitative data regarding active workloads, overdue tickets, staff resolution efficiency, and chronic infrastructure failures.
- **Absence of Historical Audit Ledgers:** Without immutable database audit logs, tracing ticket history, verifying state changes, and evaluating historical institutional performance remains difficult.

---

## 3. Proposed Solution

CampusCare resolves these operational challenges by implementing a web application that enforces strict data isolation and role-based workflows across three target user roles:

- **Student Interface:** Enables students to submit categorized complaints with location details and photo attachments, track real-time ticket progress timelines, and verify or reject completed repairs.
- **Staff Interface:** Provides operational personnel with departmental ticket queues, SLA deadline indicators, progress note submission forms, repair proof uploads, and resolution status toggles.
- **Administrator Command Center:** Equips facility managers with global complaint routing tools, priority escalation controls, analytics charts, user management interfaces, and immutable audit logs.

---

## 4. Project Objectives & Scope

### 4.1 Quantifiable Objectives
- Reduce average complaint resolution lifecycle time across campus facility operations.
- Eliminate untracked or lost service requests by consolidating submission into a single authenticated pipeline.
- Maintain institutional SLA compliance above 85 percent across all complaint priority levels.
- Achieve system master table response latencies below 500 milliseconds for administrative reporting queries.

### 4.2 Minimum Viable Product (MVP) Scope

The core project deliverable encompasses the complete implementation of the following subsystems:

- **Authentication & RBAC:** Secure email/password login using `@supabase/ssr`, `HttpOnly` session cookie management, and role-based route protection.
- **Student Module:** Dashboard with personal metric cards, complaint submission form with image uploads, human-readable Complaint ID generation (`CMP-YYYY-XXXX`), ticket timeline tracking, and resolution confirmation/rejection workflow.
- **Staff Module:** Departmental ticket queue, visual SLA deadline indicators, status transition controls (`Assigned` to `In Progress` to `Resolved`), internal progress notes feed, and completion photo uploads.
- **Admin Module:** Global master ticket table with multi-parameter filtering, manual ticket assignment and priority override controls, user management, category/department taxonomy configuration, and analytics data charts.
- **Database & Audit Core:** PostgreSQL relational schema with Row Level Security (RLS) policies, foreign key constraints, automated database triggers, and immutable audit logs.

### 4.3 Future Extensions (Version 2.0 Scope)

Features designated for post-MVP iteration include:

- Automated AI complaint classification and duplicate ticket detection.
- Real-time notification dispatch via WebSocket subscriptions and transactional emails (Resend API).
- Native mobile application for operational staff (React Native / Expo).
- Multi-campus organizational hierarchy support.

---

## 5. Target Audience & Role Matrix

| Capability / Function | Student Role | Staff Role | Admin Role |
| :--- | :---: | :---: | :---: |
| Submit New Complaint | Yes | No | No |
| View Personal Submitted Complaints | Yes | No | Yes (All) |
| View Department Assigned Complaints | No | Yes | Yes (All) |
| Accept & Update Ticket Status | No | Yes | Yes |
| Append Progress Notes | Public Notes View Only | Yes | Yes |
| Confirm or Reject Resolution | Yes | No | Yes (Override) |
| Submit Satisfaction Feedback & Rating | Yes | No | View Analytics |
| Assign or Reassign Staff/Department | No | No | Yes |
| Override Ticket Priority Level | No | No | Yes |
| Manage Users & Taxonomies | No | No | Yes |
| View System Audit Logs | No | No | Yes (Read-Only) |

---

## 6. System Architecture & Technical Stack

CampusCare is structured around a modern 3-tier architecture:

- **Presentation Layer (Frontend):** Built using Next.js (App Router, React 19, TypeScript) styled with Tailwind CSS and Shadcn UI component primitives. Responsive design guarantees mobile viewport compatibility down to 320px width.
- **Application Layer (Backend):** Server-side logic, API endpoints, and Server Actions managed within Next.js. Server-side validation executed via Zod schemas. Session handling executed via `@supabase/ssr` with Next.js proxy middleware.
- **Data & Storage Layer:** Database hosted on PostgreSQL via Supabase. Row Level Security (RLS) policies enforced at the engine layer. Photographic attachments stored in secure Supabase Storage buckets with server-side mime-type validation.

---

## 7. Development Plan & Implementation Phases

The project execution is organized into ten sequential phases:

1. **Requirements Analysis & Specification:** Finalizing the Product Requirements Document, database schema ERD, and state machine transition rules.
2. **UI/UX Design & Token Setup:** Configuring Tailwind CSS color variables, Shadcn UI primitives, dark mode tokens, and responsive layout shells.
3. **Database Architecture & RLS Configuration:** Writing PostgreSQL SQL migration scripts, creating tables, foreign key constraints, indexes, and RLS policies.
4. **Authentication & Session Middleware:** Implementing Supabase SSR authentication utilities, login/signup forms, and Edge proxy middleware for role-based redirects.
5. **Student Module Implementation:** Building the student dashboard, Zod-validated submission forms, ticket ID trigger generator, and timeline tracking UI.
6. **Staff Queue & Workflow Development:** Constructing departmental queues, SLA calculation logic, status update handlers, progress note feeds, and repair proof upload handlers.
7. **Admin Command Center & Analytics:** Implementing the master data table, ticket dispatcher modals, management forms, and data visualization charts.
8. **Database Triggers & Audit Logging:** Configuring PostgreSQL automated triggers for `audit_logs` insertion and storage bucket security policies.
9. **Quality Assurance & Security Auditing:** Executing end-to-end user flow testing, RLS boundary verification, input sanitization tests, and Core Web Vitals profiling.
10. **Production Build & Documentation:** Compiling production bundles (`npm run build`), verifying zero build errors, and drafting project documentation.

---

## 8. Success Metrics & Evaluation Criteria

Project deployment success will be evaluated against quantifiable benchmarks:

- **Ticket Resolution Lifecycle Rate:** Achieving a minimum 90 percent completion rate for submitted complaints reaching `Closed` status within designated SLA limits.
- **System SLA Adherence:** Maintaining greater than 85 percent compliance with target resolution timeframes across all priority categories.
- **Master Table Query Performance:** Maintaining administrative query execution times under 500 milliseconds for dataset volumes up to 10,000 complaint records.
- **Student Satisfaction Index:** Achieving an average user feedback rating exceeding 4.0 out of 5.0 stars on closed ticket evaluations.
