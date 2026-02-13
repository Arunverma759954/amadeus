const { createClient } = require('@supabase/supabase-js');

// Using the keys you provided earlier
const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY'; // Secret service_role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function confirmUser() {
    console.log("🔍 Checking user: rohitverma00003@gmail.com");

    try {
        // 1. Get User ID using admin API
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error("❌ Error listing users:", error.message);
            return;
        }

        const user = users.find(u => u.email === 'rohitverma00003@gmail.com');

        if (!user) {
            console.log("❌ User not found in database!");
            return;
        }

        console.log(`✅ User Found: ${user.id}`);

        if (user.email_confirmed_at) {
            console.log("⚠️ User is ALREADY confirmed!");
        } else {
            // 2. Confirm the user
            const { data, error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                { email_confirm: true }
            );

            if (updateError) {
                console.error("❌ Failed to confirm user:", updateError.message);
            } else {
                console.log("✅ SUCCESS! User confirmed manually.");
                console.log("🎉 You can now login with this email.");
            }
        }
    } catch (err) {
        console.error("❌ An unexpected error occurred:", err.message);
    }
}

confirmUser();
