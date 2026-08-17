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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("🧹 1. Cleaning database tables...");

  await supabase.from("attachments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("progress_notes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("feedback").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("audit_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("complaints").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("departments").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("🏢 2. Upserting default departments...");
  const departments = [
    { id: "11111111-1111-1111-1111-111111111111", code: "ELEC", name: "Electrical", description: "Electrical maintenance" },
    { id: "22222222-2222-2222-2222-222222222222", code: "FAC", name: "Facilities", description: "General facilities and grounds" },
    { id: "33333333-3333-3333-3333-333333333333", code: "IT", name: "Information Technology", description: "IT support and network" },
    { id: "44444444-4444-4444-4444-444444444444", code: "PLUMB", name: "Plumbing", description: "Plumbing and water issues" },
  ];

  for (const dept of departments) {
    const { error } = await supabase.from("departments").upsert(dept);
    if (error) console.error("Error upserting department", dept.code, error.message);
  }

  console.log("📁 3. Upserting default categories...");
  const categories = [
    // Electrical & HVAC
    { id: "11111111-1111-1111-1111-111111111112", name: "AC Failure / Not Cooling", department_id: "11111111-1111-1111-1111-111111111111" },
    { id: "11111111-1111-1111-1111-111111111113", name: "Fan / Light Fixture Broken", department_id: "11111111-1111-1111-1111-111111111111" },
    { id: "11111111-1111-1111-1111-111111111114", name: "Power Socket / Outlet Faulty", department_id: "11111111-1111-1111-1111-111111111111" },
    
    // Facilities & Civil Work
    { id: "22222222-2222-2222-2222-222222222223", name: "Broken Furniture / Desk Damage", department_id: "22222222-2222-2222-2222-222222222222" },
    { id: "22222222-2222-2222-2222-222222222224", name: "Door Lock Stuck / Handle Broken", department_id: "22222222-2222-2222-2222-222222222222" },
    { id: "22222222-2222-2222-2222-222222222225", name: "Window Glass / Frame Damaged", department_id: "22222222-2222-2222-2222-222222222222" },

    // IT Support & Infrastructure
    { id: "33333333-3333-3333-3333-333333333334", name: "Wi-Fi / Network Connection Drop", department_id: "33333333-3333-3333-3333-333333333333" },
    { id: "33333333-3333-3333-3333-333333333335", name: "Lab Computer Hardware Failure", department_id: "33333333-3333-3333-3333-333333333333" },
    { id: "33333333-3333-3333-3333-333333333336", name: "Classroom Projector / Display Fault", department_id: "33333333-3333-3333-3333-333333333333" },

    // Plumbing & Sanitation
    { id: "44444444-4444-4444-4444-444444444445", name: "Water Tap Leak / Pipe Burst", department_id: "44444444-4444-4444-4444-444444444444" },
    { id: "44444444-4444-4444-4444-444444444446", name: "Washroom Fitting / Drainage Block", department_id: "44444444-4444-4444-4444-444444444444" },
  ];

  for (const cat of categories) {
    const { error } = await supabase.from("categories").upsert(cat);
    if (error) console.error("Error upserting category", cat.name, error.message);
  }

  console.log("👤 4. Initializing default accounts...");
  const users = [
    { email: "admin@campuscare.edu", password: "Admin123!", full_name: "System Administrator", role: "admin" },
    { email: "staff.it@campuscare.edu", password: "Staff123!", full_name: "IT Helpdesk", role: "staff", department_id: "33333333-3333-3333-3333-333333333333" },
    { email: "student@campuscare.edu", password: "Student123!", full_name: "Student User", role: "student" },
  ];

  for (const u of users) {
    console.log(`Processing ${u.email}...`);
    let userId;
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already') || error.message.toLowerCase().includes('registered')) {
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existingUser = listData?.users?.find((usr) => usr.email === u.email);
        if (existingUser) {
          userId = existingUser.id;
          // Update password for existing user if needed, optional
          await supabase.auth.admin.updateUserById(userId, { password: u.password, user_metadata: { full_name: u.full_name, role: u.role } });
        }
      } else {
        console.error(`- Failed to create ${u.email}:`, error.message);
        continue;
      }
    } else {
      userId = data.user.id;
    }

    if (userId) {
      const updatePayload = {
        role: u.role,
        full_name: u.full_name,
        ...(u.department_id ? { department_id: u.department_id } : {}),
      };
      
      const { error: updateError } = await supabase.from("users").update(updatePayload).eq("id", userId);
      if (updateError) {
          console.error(`  - Failed to update public.users for ${u.email}:`, updateError.message);
      } else {
          console.log(`- Ensured ${u.email} exists with role ${u.role}`);
      }
    }
  }

  console.log("\n🎉 SEED SCRIPT COMPLETE");
}

seed().catch(console.error);
