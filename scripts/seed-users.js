import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log("Seeding users...");

  const users = [
    { email: "admin@campuscare.edu", password: "Admin123!", full_name: "System Administrator", role: "admin" },
    { email: "staff.it@campuscare.edu", password: "Staff123!", full_name: "IT Helpdesk Resolver", role: "staff", department_id: "33333333-3333-3333-3333-333333333333" },
    { email: "staff.elec@campuscare.edu", password: "Staff123!", full_name: "Electrical Lead Resolver", role: "staff", department_id: "11111111-1111-1111-1111-111111111111" },
    { email: "student@campuscare.edu", password: "Student123!", full_name: "Alex Student", role: "student" },
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
         console.log(`- ${u.email} already exists in auth. Fetching user ID...`);
         const { data: listData } = await supabase.auth.admin.listUsers();
         const existingUser = listData?.users?.find((usr) => usr.email === u.email);
         if (existingUser) {
           userId = existingUser.id;
         }
      } else {
         console.error(`- Failed to create ${u.email}:`, error.message);
         continue;
      }
    } else {
      userId = data.user.id;
      console.log(`- Created auth user ${u.email} (${userId})`);
    }

    if (userId) {
      // Ensure public.users table has the correct role, full_name, and department_id
      const updatePayload = {
        role: u.role,
        full_name: u.full_name,
        ...(u.department_id ? { department_id: u.department_id } : {}),
      };

      const { error: updateError } = await supabase
        .from("users")
        .update(updatePayload)
        .eq("id", userId);

      if (updateError) {
        console.error(`  - Failed to update public.users for ${u.email}:`, updateError.message);
      } else {
        console.log(`  - Successfully updated role '${u.role}' in public.users for ${u.email}`);
      }
    }
  }

  console.log("Done seeding users.");
}

seed().catch(console.error);
