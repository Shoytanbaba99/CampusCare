# CampusCare 🏫✨

**CampusCare** is a modern, full-stack campus facility management and maintenance complaint ticketing platform built with **Next.js 16 (App Router)**, **React 19 Server Actions**, **Supabase (PostgreSQL, Auth, Storage, RLS)**, and **Tailwind CSS**.

It streamlines campus facility upkeep by providing role-based portals for **Students**, **Staff**, and **Administrators** to report, track, assign, and resolve physical maintenance issues across campus.

---

## 🌟 Core Features & Role Capabilities

### 🧑‍🎓 Student Portal & Public Lookup
* **Ticket Submission & Anonymous Reporting:** Submit facility complaints specifying location, department, issue category, priority, and optional photo evidence. Supports optional **Submit Anonymously** mode (`CC-ANON-XXXXXX`) with strict identity masking across all staff and admin views.
* **Dual Public Tracking Portal (`/track`):** Publicly track any ticket progress via 6-digit access code or Ticket Number (`CMP-2026-XXXXX`) without needing an account.
* **🤖 Real-time AI Support Chatbot:** Integrated floating glassmorphism chat widget powered by AI models with multi-model fallback waterfall (`gemini-3.5-flash` → `gemini-3.1-flash-lite` → `gemini-2.5-flash` → `gemini-1.5-flash`) and context-aware ticket knowledge.

### 👷 Staff Portal
* **Department Queue & Real-time Chat Badges:** View isolated ticket feeds routed to your department with glowing green pulsing **`💬 ACTIVE CHAT`** badges on tickets with active student messages.
* **1-on-1 Live Chat Takeover:** Seamlessly transition any ticket chat from AI Dispatcher mode to Staff Live mode (`"bot"` → `"staff"`) with 1-click takeover controls.
* **Ticket Claiming & Status Updates:** Claim unassigned complaints, update status (`Submitted` → `In Progress` → `Resolved`), post work audit logs, and attach photo proof of completed work.
* **SLA Target Management:** Override and adjust SLA completion target timestamps with audit reason tracking.

### 👑 Admin Command Center
* **Master Ticket Table & Active Chat Alerts:** Complete visibility over all campus complaints with real-time status/priority filters and pulsing **`💬 Active Chat`** badges on active rows.
* **Super-User Admin Live Chat:** Admins can join any live chat session with senior oversight authority.
* **Ticket Dispatch & User Management:** Reassign complaints between departments/staff and manage user roles (`Student`, `Staff`, `Admin`) with self-demotion protection.
* **Immutable Audit Ledger:** System audit trail capturing all ticket status updates, staff reassignments, SLA date overrides, and user management events.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 16 App Router & React 19 Server Actions
* **AI Intelligence Engine:** Multi-model AI Dispatcher with automated model waterfall (`gemini-3.5-flash` / `gemini-3.1-flash-lite` / `gemini-2.5-flash` / `gemini-1.5-flash`)
* **Real-time Ephemeral Bus & Rate Limiting:** Upstash Redis ephemeral message caching (`chat:messages:${id}`, 1-hour TTL) & sliding window rate limiting
* **Database & Auth:** Supabase (PostgreSQL with Row Level Security, Auth, Object Storage)
* **Styling:** Vanilla Tailwind CSS with custom emerald theme (`Caring Campus Green`), glassmorphism UI drawers, and 4-way role-based chat color hierarchy
* **Validation:** Zod schemas for type-safe server & client form validation
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
