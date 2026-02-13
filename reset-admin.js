const { createClient } = require('@supabase/supabase-js');

// Using the keys found in confirm-user.js
const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY'; // Secret service_role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAdminUser() {
    const email = 'arunverma7599@gmail.com';
    const newPassword = 'admin123';

    console.log(`🔍 Checking user: ${email}`);

    try {
        // 1. Get User by Email
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error("❌ Error listing users:", error.message);
            return;
        }

        const user = users.find(u => u.email === email);

        if (!user) {
            console.log("⚠️ User not found. Creating new admin user...");
            // Create the user
            const { data, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: newPassword,
                email_confirm: true,
                user_metadata: { is_admin: true, full_name: 'Arun Verma' }
            });

            if (createError) {
                console.error("❌ Failed to create user:", createError.message);
            } else {
                console.log("✅ SUCCESS! Admin user created.");
                console.log(`🔑 Login with: ${email} / ${newPassword}`);
            }
        } else {
            console.log(`✅ User Found: ${user.id}`);

            // 2. Update Password and Metadata
            const { data, error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                {
                    password: newPassword,
                    email_confirm: true,
                    user_metadata: { ...user.user_metadata, is_admin: true }
                }
            );

            if (updateError) {
                console.error("❌ Failed to update user:", updateError.message);
            } else {
                console.log("✅ SUCCESS! Admin password reset.");
                console.log(`🔑 Login with: ${email} / ${newPassword}`);
            }
        }
    } catch (err) {
        console.error("❌ An unexpected error occurred:", err.message);
    }
}

resetAdminUser();
