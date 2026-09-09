# CampusCare

**CampusCare** is a modern, full-stack campus facility management and maintenance complaint ticketing platform built with **Next.js 16 (App Router)**, **React 19 Server Actions**, **Supabase (PostgreSQL, Auth, Storage, RLS)**, and **Tailwind CSS**.

It streamlines campus facility upkeep by providing role-based portals for **Students**, **Staff**, and **Administrators** to report, track, assign, and resolve physical maintenance issues across campus.

---

## 🎓 Academic Project Information

* **Course:** CSE 416 (Software Project Design and Development)
* **Semester:** Autumn 2026
* **Institution:** University of Information Technology and Sciences (UITS)
* **Supervised by:** Dr. Mahfida Amjad Dipa, Assistant Professor, Department of CSE, UITS

### Group Members
* **Shafayat Hossain Shafin** (ID: 0432320005101088)
* **Md. Masud Rahman** (ID: 0432320005101064)
* **Rudro Antony Mrong** (ID: 0432320005101059)

---

## 🔑 Demo Test Accounts

Use these pre-configured accounts to test each role on the platform:

| Role | Email | Password | Default Portal |
| :--- | :--- | :--- | :--- |
| **Student** | `student@campuscare.edu` | `Student123!` | `/student/dashboard` |
| **Staff (IT)** | `staff.it@campuscare.edu` | `Staff123!` | `/staff/dashboard` |
| **Admin** | `admin@campuscare.edu` | `Admin123!` | `/admin/dashboard` |

Login is available at `/login`. After authentication, the system automatically redirects users to their designated role portal based on database permissions.

---

## 🧭 How to Navigate the Website

### 1. Student Portal (`/student/dashboard`)
* **Dashboard Overview:** Displays metric cards for total, in-progress, and resolved complaints, followed by a list of personal tickets with status badges and SLA timers.
* **Submit a Complaint (`/student/complaints/new`):** Fill in campus location, building details, maintenance department, category, priority, description, and optional photo attachment.
* **Anonymous Mode:** Toggle "Submit Anonymously" on the form to mask your identity. The system generates a 6-character tracking code (`CC-ANON-XXXXXX`) so staff and admins cannot see who submitted it.
* **Ticket Details & Chat (`/student/complaints/[id]`):** View ticket timeline, status history, and staff progress notes. The floating chat drawer allows asking questions about the ticket, receiving automated assistance, or chatting directly with assigned staff once claimed.

### 2. Staff Portal (`/staff/dashboard`)
* **Department Queue:** Staff see only tickets belonging to their assigned department (such as IT, Electrical, Facilities, or Plumbing), prioritized by SLA urgency.
* **Claim & Update Status (`/staff/complaints/[id]`):** Claim unassigned tickets, advance state (`Submitted` -> `In Progress` -> `Resolved`), and add internal or public progress notes.
* **Resolution Proof:** When resolving an issue, staff can upload completion photos as verification evidence.
* **SLA Target Management:** Staff can override or extend target completion dates with a required reason for the audit record.
* **Live Chat Support:** Tickets with active incoming messages display a glowing chat badge. Staff can open the chat drawer, review the automated conversation, and click "Take Over Live Chat" to speak directly with the reporter.

### 3. Admin Command Center (`/admin/dashboard`)
* **Master Ticket Table:** Global view of all campus complaints across every department. Supports multi-column filtering by status, priority, and department, plus quick ticket reassignment.
* **User Management (`/admin/users`):** View all registered users, promote or demote roles (Student, Staff, Admin) with self-demotion safety checks, and assign staff members to departments.
* **Category Management:** Create new issue categories under specific maintenance departments.
* **Audit Logs (`/admin/audit-logs`):** An immutable event ledger recording every ticket status transition, staff assignment change, and user role update with actor details and timestamps.
* **Super-User Chat Access:** Administrators can join any ticket's chat drawer with senior oversight access.

### 4. Public Ticket Tracking (`/track`)
* Accessible without logging in.
* Anyone with a 6-character anonymous tracking code or standard ticket ID (`CMP-YYYY-XXXXX`) can look up current status, public progress notes, and resolution evidence.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 16 (App Router), React 19 Server Actions, Tailwind CSS, Lucide React
* **Backend & Database:** Supabase (PostgreSQL 15 with Row Level Security, Auth, Object Storage)
* **Real-time Chat & Rate Limiting:** Upstash Redis for ephemeral chat messaging and submission rate limiting
* **Validation:** Zod schemas for client and server input validation
* **Data Tables:** TanStack Table for admin master tables

---

## 🚀 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shoytanbaba99/CampusCare.git
   cd CampusCare
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and add your Supabase, Upstash Redis, and API keys:
   ```bash
   cp .env.example .env.local
   ```

4. **Seed Default Accounts (Optional):**
   ```bash
   node scripts/seed-users.js
   ```

5. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
