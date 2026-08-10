# CampusCare

> **Centralized University Complaint & Facility Helpdesk System**

CampusCare is an internal, 3-tier web platform designed to streamline infrastructure maintenance, issue reporting, and departmental resolution workflows across university premises.

---

## 📌 Academic Context

- **Course Name:** Software Project Design and Development (CSE 416)
- **University:** University of Information Technology and Sciences (UITS)
- **Department:** Department of Computer Science and Engineering
- **Course Instructor:** **Al-Imtiaz**, Associate Professor & Head (Ph.D. Research Fellow, BUET)
- **Group Members:**
  - **Rudro Antony Mrong** (ID: `0432320005101059`)
  - **Md. Masud Rahman** (ID: `0432320005101064`)

---

## 📋 Documentation Suite & Deliverables

All completed planning deliverables, system design diagrams, and specifications are archived under the [`docs/`](docs/) directory:

| Deliverable                    | Description                                                      | Status       | Location                                                                 |
| :----------------------------- | :--------------------------------------------------------------- | :----------- | :----------------------------------------------------------------------- |
| **Project Proposal**           | Project scope, objectives, role capabilities, and roadmap        | ✅ Completed | [`docs/proposal/Project_Proposal.md`](docs/proposal/Project_Proposal.md) |
| **Product Requirements (PRD)** | Core specifications, SLA resolution matrix, and SQL schemas      | ✅ Completed | [`docs/prd/PRD.md`](docs/prd/PRD.md)                                     |
| **LaTeX SRS Document**         | 30-Page IEEE 830 compliant Software Requirements Specification   | ✅ Completed | [`docs/srs/SRS.pdf`](docs/srs/SRS.pdf) / [`SRS.tex`](docs/srs/SRS.tex)   |
| **System Diagrams**            | High-resolution UML, ER, Sequence, State Machine, and DFD models | ✅ Completed | [`docs/diagrams/`](docs/diagrams/)                                       |

---

## 🛠️ Planned Technology Stack

- **Frontend:** Next.js (App Router, React 19, TypeScript), Tailwind CSS, Shadcn UI
- **Backend & API:** Next.js Server Actions & React Server Components (RSC)
- **Database & Engine:** Supabase PostgreSQL with Row Level Security (RLS) policies
- **Authentication:** Supabase Auth (`HttpOnly` session cookie management)
- **Storage:** Supabase Storage buckets for initial issue evidence and repair completion photos

---

## 📄 License

This repository is developed strictly for academic evaluation in CSE 416 at the University of Information Technology and Sciences (UITS).
