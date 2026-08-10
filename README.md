# CampusCare

A friend gave me the idea for this campus facility management system when I asked him for something to build just to pass a class. The goal was to ship a complete MVP product and see what I could learn along the way. 

It is not a perfectly planned corporate product. It is a sandbox where I ended up running into and fixing some unexpectedly annoying edge cases with modern web frameworks and databases.

## Tech Stack

*   **Next.js 16 App Router:** Everything uses React 19 Server Actions.
*   **Supabase:** Handling PostgreSQL, authentication, and Row Level Security (RLS).
*   **Tailwind CSS:** Custom Emerald styling.
*   **Zod:** Strict server and client form validation.
*   **Upstash Redis:** Rate limiting.

## Hard Lessons Learned

Building this MVP forced me to fix a few major issues you only run into when building full applications:

1.  **PostgreSQL Infinite Loops**
    I wrote an RLS policy that queried the `users` table from inside a policy attached to the `users` table. This causes PostgreSQL to throw an infinite recursion loop and crash. I had to rewrite the permission checks using `SECURITY DEFINER STABLE` SQL functions to bypass the evaluation loop.

2.  **Zod Validating Fake Database Seeds**
    My database seed had dummy UUIDs like `11111111-1111-1111-1111-111111111111`. Zod's `.uuid()` function strictly enforces the RFC 4122 spec where position 17 must be 8, 9, a, or b. It silently failed all my forms because the dummy IDs had a 1 in that position. I replaced those checks with `.min(1)` for foreign keys.

3.  **React 19 Form Keys**
    Using `useActionState` progressive enhancement means Next.js injects index prefixes into form keys (like `_1_departmentId`). You cannot simply use `formData.get("departmentId")` anymore and must parse the formData entries defensively.

## Running Locally

1.  Clone the repository and run `pnpm install`.
2.  Copy `.env.example` to `.env.local` and add your keys.
3.  Run `pnpm dev`.
