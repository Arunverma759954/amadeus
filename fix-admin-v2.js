const { createClient } = require('@supabase/supabase-js');

// Config from .env.local
const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
// WARNING: Service role key should be kept in .env.local and never committed
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminV2() {
    const email = 'arunverma759954@gmail.com';
    const password = 'admin123';

    console.log(`🚀 Starting fix for: ${email}`);

    try {
        // 1. Check if user exists
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error("❌ Error listing users:", listError.message);
            return;
        }

        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            console.log("⚠️ User not found. Creating new admin user...");
            const { data, error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: {
                    is_admin: true,
                    full_name: 'Arun Verma',
                    role: 'Super Admin'
                }
            });

            if (createError) {
                console.error("❌ Failed to create user:", createError.message);
            } else {
                console.log("✅ SUCCESS! Admin user created.");
                console.log(`🔑 Login with: ${email} / ${password}`);
            }
        } else {
            console.log(`✅ User Found: ${user.id}. Updating...`);
            const { data, error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                {
                    password: password,
                    email_confirm: true,
                    user_metadata: {
                        ...user.user_metadata,
                        is_admin: true,
                        role: 'Super Admin'
                    }
                }
            );

            if (updateError) {
                console.error("❌ Failed to update user:", updateError.message);
            } else {
                console.log("✅ SUCCESS! Admin password reset and metadata updated.");
                console.log(`🔑 Login with: ${email} / ${password}`);
            }
        }
    } catch (err) {
        console.error("❌ Unexpected Error:", err.message);
    }
}

fixAdminV2();
