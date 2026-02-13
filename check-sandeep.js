const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUser() {
    const email = 'sandeep@clinginfotech.com';
    console.log(`🔍 Checking status for: ${email}`);

    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;

        const user = users.find(u => u.email === email);

        if (!user) {
            console.log("❌ User NOT FOUND in Supabase Auth.");
            return;
        }

        console.log(`✅ User Found: ${user.id}`);
        console.log(`📧 Email Confirmed: ${user.email_confirmed_at ? 'YES (' + user.email_confirmed_at + ')' : 'NO'}`);

        if (!user.email_confirmed_at) {
            console.log("⚡ Attempting to confirm user manually...");
            const { data, error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                { email_confirm: true }
            );
            if (updateError) console.error("❌ Failed to confirm:", updateError.message);
            else console.log("✅ SUCCESS! User has been confirmed.");
        }
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

checkUser();
