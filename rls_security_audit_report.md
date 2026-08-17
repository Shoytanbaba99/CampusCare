# Database Schema & RLS Security Audit Report

## Executive Summary
An in-depth security audit of the CampusCare Supabase RLS policies and application queries across `src/app/student/`, `src/app/staff/`, and `src/app/admin/` reveals solid foundational security (such as the appropriate use of `SECURITY DEFINER` to avoid infinite recursion) but highlights **three critical RLS vulnerabilities/discrepancies** where the application's queries mismatch the database's Row Level Security constraints. 

These issues will result in broken functionality for students and represent a severe compromise to the integrity of the audit logs.

---

## 1. Critical Missing RLS Policies (Broken Functionality)

### A. Students Cannot Update Complaint Status (Close/Reopen)
**Location:** `src/app/student/complaints/detailActions.ts`
**Description:** 
When a student confirms or rejects a resolution, the server action executes an `UPDATE` query on the `complaints` table to change the status to `closed` or `reopened`.
```typescript
  // from detailActions.ts
  const { error: updateError } = await supabase
    .from("complaints")
    .update({ status: "closed", closed_at: ... })
    .eq("id", complaintId)
    .eq("reporter_id", user.id);
```
**RLS Issue:**
The migration `01_schema.sql` only defines the policy `"Staff and Admins update complaints"`. There is **no** `UPDATE` policy permitting students to modify their own complaints. 
**Impact:** Student attempts to confirm/reject ticket resolutions will silently fail or throw a Postgres RLS error, effectively breaking the resolution workflow.
**Remediation:** Add an RLS policy allowing students to update specific fields of their own complaints:
```sql
CREATE POLICY "Students can update own complaint status"
    ON public.complaints FOR UPDATE
    TO authenticated
    USING (reporter_id = auth.uid())
    WITH CHECK (reporter_id = auth.uid());
```

### B. Students Cannot Insert Progress Notes on Rejection
**Location:** `src/app/student/complaints/detailActions.ts`
**Description:** 
When a student rejects a ticket resolution, the action appends a rejection reason to the timeline via an `INSERT` into `progress_notes`.
```typescript
  // from detailActions.ts
  await supabase.from("progress_notes").insert({
    complaint_id: complaintId,
    author_id: user.id,
    note_text: `Resolution Rejected by Student: ${rejectionReason}`,
    is_internal: false,
  });
```
**RLS Issue:**
The schema defines the policy `"Staff and Admins insert progress notes"`, which explicitly enforces `WITH CHECK (public.get_user_role(auth.uid()) IN ('staff', 'admin'))`. 
**Impact:** The insert query will be blocked by RLS, causing the student's rejection feedback to be completely lost.
**Remediation:** Add an RLS policy allowing students to insert progress notes on their own complaints:
```sql
CREATE POLICY "Students insert progress notes on own complaints"
    ON public.progress_notes FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.complaints 
            WHERE id = complaint_id AND reporter_id = auth.uid()
        )
    );
```

---

## 2. Severe Security Vulnerability

### A. Insecure Audit Log Forgery
**Location:** `supabase/migrations/01_schema.sql` -> `public.audit_logs`
**Description:** 
The audit ledger is designed to be an immutable record of system events. However, the current RLS policy for inserting audit logs is highly permissive:
```sql
CREATE POLICY "System inserts audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);
```
**RLS Issue:**
Because it uses `WITH CHECK (true)` for the `authenticated` role, **any** logged-in user (including malicious students or compromised staff accounts) can connect directly to the Supabase API and insert completely forged audit logs for actions they never performed, or obfuscate genuine logs with overwhelming spam.
**Remediation:** 
Client-side inserts to the audit log should be completely forbidden. You should either:
1. Drop the `INSERT` policy for `authenticated` users (`WITH CHECK (false)`) and rely strictly on Supabase Service Role keys to insert logs from trusted Server Actions, bypassing RLS.
2. Rely entirely on PostgreSQL Database Triggers to handle audit logging securely at the database level.

---

## 3. Verified Security Strengths & Safe Queries

### A. RLS Recursion Loops Handled Correctly
- The helper functions `public.get_user_role()` and `public.get_user_department_id()` correctly employ `SECURITY DEFINER` and `STABLE` attributes. 
- When RLS policies evaluate `get_user_role()`, it queries `public.users` under the elevated privileges of the defining role (typically `postgres`). This successfully bypasses RLS during evaluation, effectively preventing the notorious infinite recursion loop that occurs when a table's RLS policy relies on a query to itself.

### B. Safe Table Queries
The following tables and actions were audited and found to securely map against their defined RLS policies:
- **`users`**: Only queried for updates by admins (`admin/users/actions.ts`), correctly mapping to `"Users can update own profile or admins update all"`. Profile creation is safely relegated to the database `handle_new_user` auth trigger rather than a client-side insert.
- **`departments` & `categories`**: Public read-only for authenticated users. Inserts are correctly mapped and restricted to admins via the `"Admins can insert departments"` policy.
- **`attachments`**: `INSERT` and `SELECT` are safely bound by user and authenticated roles.
- **`feedback`**: Students are correctly permitted to insert feedback strictly for their own complaints via the `EXISTS` check in the feedback RLS policy.
