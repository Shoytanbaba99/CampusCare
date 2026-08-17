# CampusCare 🏫✨

**CampusCare** is a modern, full-stack campus facility management and maintenance complaint ticketing platform built with **Next.js 16 (App Router)**, **React 19 Server Actions**, **Supabase (PostgreSQL, Auth, Storage, RLS)**, and **Tailwind CSS**.

It streamlines campus facility upkeep by providing role-based portals for **Students**, **Staff**, and **Administrators** to report, track, assign, and resolve physical maintenance issues across campus.

---

## 🌟 Core Features & Role Capabilities

### 🧑‍🎓 Student Portal
* **Ticket Submission:** Submit facility complaints specifying location, maintenance department, issue category, priority level, and optional photo evidence.
* **Real-time Tracking:** View active complaints, SLA target completion deadlines, and visual status badges (`Submitted`, `Assigned`, `In Progress`, `Resolved`, `Closed`).
* **Interactive Timeline:** Track step-by-step progress notes and updates posted by maintenance staff.

### 👷 Staff Portal
* **Department Queue:** View isolated ticket feeds routed specifically to your maintenance department (e.g. Electrical, Plumbing, HVAC, Carpentry).
* **Ticket Claiming & Status Updates:** Claim unassigned department complaints, update ticket progress (`Submitted` → `In Progress` → `Resolved`), and attach photo proof of completed work.
* **Audit & Internal Notes:** Post public progress updates for students or private internal notes visible only to staff and administrators.
* **SLA Target Management:** Override and adjust SLA completion target timestamps with reason tracking for complex maintenance tasks.

### 👑 Admin Command Center
* **Master Ticket Overview:** Complete visibility over all campus complaints with real-time status, priority, and department filter controls.
* **Ticket Dispatch:** Reassign complaints to specific staff members or re-route tickets between maintenance departments.
* **User Management Desk:** Manage user accounts and grant system roles (`Student`, `Staff`, `Admin`) with built-in self-demotion protection.
* **Immutable Audit Ledger:** System audit trail capturing all ticket status updates, staff reassignments, date overrides, and user actions.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 16 App Router & React 19 Server Actions
* **Database & Auth:** Supabase (PostgreSQL with Row Level Security, Auth, Object Storage)
* **Styling:** Vanilla Tailwind CSS with custom emerald theme (`Caring Campus Green`) and responsive design tokens
* **Validation:** Zod schemas for type-safe server & client form validation
* **Rate Limiting:** Upstash Redis sliding window rate limiting
* **Icons:** Lucide React

---

## 📖 Project Takeaways & Retrospective

For detailed post-mortem insights, database RLS optimization notes, React 19 form handling patterns, and architectural takeaways, read the full project takeaways document:

👉 [**Project Retrospective & Technical Takeaways**](.mentor/takeaways.md)

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
   Copy `.env.example` to `.env.local` and fill in your Supabase and Upstash Redis credentials:
   ```bash
   cp .env.example .env.local
   ```

4. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
