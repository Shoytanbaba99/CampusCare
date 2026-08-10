import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valParts] = trimmed.split('=');
      const val = valParts.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rnvdzfxdksaxrhfwobcl.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function resetAndSeedSingleAdmin() {
  console.log("🧹 1. Cleaning database tables (complaints, attachments, notes, feedback, audit logs)...");

  await supabase.from("attachments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("progress_notes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("feedback").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("audit_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("complaints").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("👤 2. Ensuring single Master Admin exists (admin@campuscare.edu / Admin123!)...");

  let adminUserId = null;

  const { data: adminAuthData, error: adminAuthError } = await supabase.auth.admin.createUser({
    email: "admin@campuscare.edu",
    password: "Admin123!",
    email_confirm: true,
    user_metadata: { full_name: "System Administrator", role: "admin" },
  });

  if (adminAuthError) {
    console.log("- Admin user exists in Auth. Fetching ID...");
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existingAdmin = listData?.users?.find((u) => u.email === "admin@campuscare.edu");
    if (existingAdmin) {
      adminUserId = existingAdmin.id;
    }
  } else {
    adminUserId = adminAuthData.user.id;
  }

  if (adminUserId) {
    await supabase.from("users").upsert({
      id: adminUserId,
      email: "admin@campuscare.edu",
      full_name: "System Administrator",
      role: "admin",
      department_id: null,
    });
    console.log(`- ✅ Admin user initialized (${adminUserId})`);
  }

  console.log("🧹 3. Removing test student & staff accounts...");

  const { data: listData } = await supabase.auth.admin.listUsers();
  if (listData?.users) {
    for (const u of listData.users) {
      if (u.email !== "admin@campuscare.edu") {
        console.log(`- Deleting user ${u.email}...`);
        await supabase.from("users").delete().eq("id", u.id);
        await supabase.auth.admin.deleteUser(u.id);
      }
    }
  }

  console.log("\n🎉 DATABASE CLEANED & RESEEDED SUCCESSFULLY!");
  console.log("-------------------------------------------------------");
  console.log("Admin Credentials:");
  console.log("Email:    admin@campuscare.edu");
  console.log("Password: Admin123!");
  console.log("Role:     Admin");
  console.log("-------------------------------------------------------");
}

resetAndSeedSingleAdmin().catch(console.error);
