# Product Requirements Document (PRD): CampusCare
### Centralized University Complaint Management System

![UITS Logo](file:///mnt/Shared/Projects/Github/CampusCare/docs/srs/uits_logo.png)

**University:** University of Information Technology and Sciences (UITS)  
**Department:** Department of Computer Science and Engineering  
**Course:** Software Project Design and Development (CSE 416)  

**Submitted To:**  
Al-Imtiaz  
*Associate Professor & Head, Ph.D. (Research Fellow), BUET, Department of CSE, UITS*  

**Submitted By (Group Members):**  
- **Rudro Antony Mrong** (ID: 0432320005101059)  
- **Md. Masud Rahman** (ID: 0432320005101064)  

**Document Version:** 1.1.0 (Approved Specification)  
**Submission Date:** August 2026  

---

## 1. Product Overview

CampusCare is an internal, web-based ticketing and helpdesk application designed for university campus management. The platform replaces unorganized communication channels (emails, phone calls, verbal walk-in reports) with a centralized, strictly tracked digital pipeline. The system enforces accountability, tracks service level agreement (SLA) deadlines, reduces issue resolution times, and provides administrators with quantitative operational analytics regarding campus infrastructure maintenance.

---

## 2. User Personas & System Roles

The platform operates on a strict Role-Based Access Control (RBAC) model encompassing three distinct user roles.

- **Student (End-User):** Primary reporter of campus infrastructure and facility issues. Objectives: submit categorized complaints, upload photographic evidence, monitor real-time ticket progress timelines, and confirm or reject resolution actions.
- **Staff (Resolver):** Operational personnel (IT support, plumbing, electrical, janitorial, facilities management). Objectives: view assigned departmental queues, acknowledge ticket receipt, update progress states, append chronological work notes, upload repair proof, and mark tickets resolved.
- **Admin (Dispatcher & Analyst):** Department heads and facility managers. Objectives: route unassigned tickets, reassign tickets across personnel or departments, override ticket priority levels, manage user access, oversee category taxonomies, analyze system performance metrics, and review immutable audit logs.

---

## 3. Ticket State Machine Specification

Complaints follow a deterministic state machine. Direct state skips (such as transitioning directly from `Submitted` to `Closed`) are prohibited and enforced at both the application and database layers.

### 3.1 State Definitions
- **Submitted:** Ticket created by student, awaiting departmental triage or staff assignment.
- **Assigned:** Ticket assigned to a specific staff member or operational department.
- **In Progress:** Work accepted by staff member and actively under maintenance.
- **Resolved:** Staff member completed work; ticket awaits student verification.
- **Closed:** Student confirmed resolution (or system auto-closed after 7 days without response).
- **Reopened:** Student rejected resolution; ticket returned to `In Progress` status with rejection explanation.

### 3.2 State Transition Matrix

| Current State | Allowed Next State | Triggering Actor | Required Input / Condition |
| :--- | :--- | :--- | :--- |
| **Submitted** | `Assigned` | Admin / System | Target Department or Staff ID selection |
| **Assigned** | `In Progress` | Staff / Admin | Staff acceptance trigger |
| **In Progress** | `Resolved` | Staff | Resolution notes text (optional repair photo) |
| **Resolved** | `Closed` | Student / System | Student confirmation click (or 7-day timeout) |
| **Resolved** | `Reopened` | Student | Rejection explanation text |
| **Reopened** | `In Progress` | Staff / Admin | System automatic state update upon rejection |

---

## 4. Priority Levels & SLA Targets

Every submitted complaint is assigned a priority level that determines its target Service Level Agreement (SLA) resolution timeframe and visual indicator on administrative dashboards.

| Priority Level | Criteria Examples | Target SLA Resolution | Escalation Trigger |
| :--- | :--- | :--- | :--- |
| **Low** | Minor cosmetic damage, non-essential item | 7 Business Days | Exceeds 7 days without assignment |
| **Medium** | Functional inconvenience, single-user impact | 3 Business Days | Exceeds 3 days in `Assigned` state |
| **High** | Classroom tech failure, localized plumbing issue | 24 Hours | Exceeds 24 hours without progress note |
| **Critical** | Main power outage, severe water pipe burst, security breach | 4 Hours | Immediate admin notification upon creation |

---

## 5. Functional Requirements

### 5.1 Authentication & Authorization Module
- The system must provide email and password authentication using Supabase Auth.
- The system must store session tokens in `HttpOnly`, `SameSite=Lax`, `Secure` cookies managed via `@supabase/ssr` and Next.js proxy middleware.
- The system must route users to role-specific dashboards upon successful authentication (`/student/dashboard`, `/staff/dashboard`, `/admin/dashboard`).
- The system must restrict database read and write access using Row Level Security (RLS) policies enforcing role permissions.
- The system must provide a secure logout mechanism that invalidates the active server session and clears cookies immediately.

### 5.2 Student Module
- The student dashboard must display aggregate metric cards for total submitted complaints, active/pending complaints, and resolved complaints.
- The system must provide a complaint submission form requiring a title, category selection, physical location details (building, floor, room number), priority level, and detailed description.
- The system must support optional file uploads for photographic evidence (restricted to JPG, PNG, WEBP formats, maximum 5MB file size).
- The system must automatically generate a unique, human-readable Complaint ID (format: `CMP-YYYY-XXXX`) upon database insertion.
- The system must render a chronological timeline view for each complaint, displaying status transitions, timestamps, assigned department, and public progress notes.
- The system must display a verification prompt when a ticket transitions to `Resolved`, allowing the student to click "Confirm Resolution" (transitioning ticket to `Closed`) or "Reject Resolution" (transitioning ticket to `Reopened`).
- The system must prompt the student for an optional 1 to 5 star rating and written feedback comment upon ticket closure.

### 5.3 Staff Module
- The staff dashboard must display a queue of complaints assigned specifically to the staff member's department or individual account.
- The system must highlight tickets approaching or exceeding their target SLA resolution deadlines with visual warning badges.
- The system must allow staff members to accept assigned tickets, updating state from `Assigned` to `In Progress`.
- The system must provide a text interface for staff to append chronological progress notes to active tickets.
- The system must allow staff to upload optional repair completion photographs prior to resolving a ticket.
- The system must provide a explicit action button to transition an `In Progress` ticket to `Resolved`, transferring final closure verification to the reporting student.

### 5.4 Admin Module
- The admin dashboard must display system-wide KPI metrics, including total active complaints, overdue complaints rate, average resolution time, and student satisfaction score.
- The admin dashboard must render analytics charts displaying complaints categorized by issue type, complaints by department, and monthly complaint volume trends.
- The system must provide a master complaint data table supporting real-time text search, filtering by status, priority, department, category, and date range, with column sorting and pagination.
- The system must allow administrators to manually assign unassigned complaints or reassign active complaints to different staff members or departments.
- The system must allow administrators to override and elevate or lower the priority level of any complaint.
- The system must provide administrative interfaces to create, edit, or deactivate user accounts (Students and Staff).
- The system must provide administrative interfaces to manage operational taxonomy tables (Categories and Departments).
- The system must provide a read-only Audit Log interface displaying all state changes, reassignments, user updates, and system events, stamped with executing User ID and precise timestamp.

---

## 6. Core Data Models & Database Schema

The database schema requires the following relational entities implemented in PostgreSQL with foreign key constraints.

### 6.1 `users` (Profiles Table)
- `id` (UUID, Primary Key, references `auth.users.id` ON DELETE CASCADE)
- `email` (TEXT, Unique, Not Null)
- `full_name` (TEXT, Not Null)
- `role` (ENUM: `'student'`, `'staff'`, `'admin'`, Not Null, Default `'student'`)
- `department_id` (UUID, Foreign Key references `departments.id`, Nullable)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)

### 6.2 `departments` Table
- `id` (UUID, Primary Key, Default `gen_random_uuid()`)
- `name` (TEXT, Unique, Not Null)
- `code` (TEXT, Unique, Not Null)
- `description` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)

### 6.3 `categories` Table
- `id` (UUID, Primary Key, Default `gen_random_uuid()`)
- `name` (TEXT, Unique, Not Null)
- `department_id` (UUID, Foreign Key references `departments.id`, Not Null)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)

### 6.4 `complaints` Table
- `id` (UUID, Primary Key, Default `gen_random_uuid()`)
- `ticket_number` (TEXT, Unique, Not Null) -- e.g. CMP-2026-0001
- `reporter_id` (UUID, Foreign Key references `users.id`, Not Null)
- `assigned_staff_id` (UUID, Foreign Key references `users.id`, Nullable)
- `department_id` (UUID, Foreign Key references `departments.id`, Not Null)
- `category_id` (UUID, Foreign Key references `categories.id`, Not Null)
- `title` (TEXT, Not Null)
- `description` (TEXT, Not Null)
- `location` (TEXT, Not Null)
- `priority` (ENUM: `'low'`, `'medium'`, `'high'`, `'critical'`, Default `'medium'`)
- `status` (ENUM: `'submitted'`, `'assigned'`, `'in_progress'`, `'resolved'`, `'closed'`, `'reopened'`, Default `'submitted'`)
- `sla_due_at` (TIMESTAMPTZ, Not Null)
- `resolved_at` (TIMESTAMPTZ, Nullable)
- `closed_at` (TIMESTAMPTZ, Nullable)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)
- `updated_at` (TIMESTAMPTZ, Default `NOW()`)

### 6.5 `progress_notes` Table
- `id` (UUID, Primary Key, Default `gen_random_uuid()`)
- `complaint_id` (UUID, Foreign Key references `complaints.id` ON DELETE CASCADE, Not Null)
- `author_id` (UUID, Foreign Key references `users.id`, Not Null)
- `note_text` (TEXT, Not Null)
- `is_internal` (BOOLEAN, Default `FALSE`)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)

### 6.6 `attachments` Table
- `id` (UUID, Primary Key, Default `gen_random_uuid()`)
- `complaint_id` (UUID, Foreign Key references `complaints.id` ON DELETE CASCADE, Not Null)
- `uploader_id` (UUID, Foreign Key references `users.id`, Not Null)
- `file_url` (TEXT, Not Null)
- `file_type` (TEXT, Not Null)
- `file_size_bytes` (INTEGER, Not Null)
- `attachment_type` (ENUM: `'initial_evidence'`, `'repair_proof'`, Default `'initial_evidence'`)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)

### 6.7 `feedback` Table
- `id` (UUID, Primary Key, Default `gen_random_uuid()`)
- `complaint_id` (UUID, Foreign Key references `complaints.id` ON DELETE CASCADE, Unique, Not Null)
- `student_id` (UUID, Foreign Key references `users.id`, Nullable)
- `is_anonymous` (BOOLEAN, Default `FALSE`)
- `rating` (INTEGER, CHECK `rating >= 1 AND rating <= 5`, Not Null)
- `comments` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)

### 6.8 `audit_logs` Table (Immutable Ledger)
- `id` (UUID, Primary Key, Default `gen_random_uuid()`)
- `complaint_id` (UUID, Foreign Key references `complaints.id` ON DELETE SET NULL, Nullable)
- `actor_id` (UUID, Foreign Key references `users.id`, Nullable)
- `action` (TEXT, Not Null) -- e.g. TICKET_SUBMITTED, STATUS_CHANGED, ASSIGNED_STAFF
- `old_state` (JSONB, Nullable)
- `new_state` (JSONB, Nullable)
- `created_at` (TIMESTAMPTZ, Default `NOW()`)

---

## 7. Non-Functional Requirements

### 7.1 Performance Targets
- Dashboard Initial Render: Initial dashboard page loads must complete rendering within 1.5 seconds on broadband connections.
- Query Response Latency: Master complaint list queries and analytics aggregations must execute within 500 milliseconds for datasets up to 10,000 records.
- Database Indexing: Explicit composite indexes must be maintained on `complaints(reporter_id)`, `complaints(department_id, status)`, `complaints(status, priority)`, and `audit_logs(complaint_id)`.

### 7.2 Security Requirements
- Database Isolation: Row Level Security (RLS) policies must be enabled on every PostgreSQL table, restricting record access to authenticated users based on role and ownership.
- Session Security: Session tokens must never be exposed to client-side JavaScript or stored in `LocalStorage`. Session cookies must be configured with `HttpOnly`, `SameSite=Lax`, and `Secure` attributes.
- Input Sanitation & Validation: Server Actions and API endpoints must validate input payloads against server-side Zod schemas.
- File Upload Constraints: Uploaded files must be validated on the server for mime-type whitelist (image/jpeg, image/png, image/webp) and file size ceiling (maximum 5MB). Executable files must be rejected.

### 7.3 Usability & Mobile Responsiveness
- All student submission forms, ticket detail views, and tracking timelines must be mobile-responsive, operating without layout breakdown on viewports down to 320px width.
- Touch target sizes for interactive elements must adhere to standard accessibility criteria (minimum 44x44px).

### 7.4 Data Integrity & Reliability
- Foreign key constraints with cascading logic or protected deletion rules must prevent orphaned records upon user or taxonomy modification.
- Database trigger functions must handle ticket number sequencing and audit log generation inside atomic transactions.

---

## 8. Technical Stack Specification

- **Frontend Framework:** Next.js (App Router, React 19, TypeScript)
- **Styling & UI Components:** Tailwind CSS integrated with Shadcn UI component primitives
- **Database Architecture:** PostgreSQL hosted via Supabase
- **Authentication Engine:** Supabase Auth (`@supabase/ssr` package with Next.js proxy middleware)
- **Object Storage:** Supabase Storage buckets
- **Schema Validation:** Zod