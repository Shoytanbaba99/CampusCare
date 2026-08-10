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
    console.log(`Creating ${u.email}...`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
         console.log(`- ${u.email} already exists.`);
      } else {
         console.error(`- Failed to create ${u.email}:`, error.message);
      }
    } else {
      console.log(`- Successfully created ${u.email}`);
      // If staff, update department_id in public.users
      if (u.role === "staff" && u.department_id) {
        const { error: updateError } = await supabase
           .from("users")
           .update({ department_id: u.department_id })
           .eq("id", data.user.id);
        
        if (updateError) {
           console.error(`  - Failed to assign department for ${u.email}:`, updateError.message);
        } else {
           console.log(`  - Assigned department for ${u.email}`);
        }
      }
    }
  }
  
  console.log("Done seeding users.");
}

seed().catch(console.error);
