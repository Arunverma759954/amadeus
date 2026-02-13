const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncUsers() {
    console.log("🔄 Starting User Sync...");

    try {
        // 1. Get all users from auth.users
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        console.log(`👥 Found ${users.length} users in Auth.`);

        for (const user of users) {
            const isAdmin = user.email === 'arunverma7599@gmail.com';

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || 'User',
                    is_admin: isAdmin
                });

            if (profileError) {
                console.error(`❌ Error syncing ${user.email}:`, profileError.message);
            } else {
                console.log(`✅ Synced: ${user.email} (${isAdmin ? 'ADMIN' : 'USER'})`);

                // Keep users confirmed
                if (!user.email_confirmed_at) {
                    console.log(`⚡ Confirming ${user.email}...`);
                    await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
                }
            }
        }

        console.log("🎉 Sync Complete!");
    } catch (err) {
        console.error("❌ Sync failed:", err.message);
    }
}

syncUsers();
