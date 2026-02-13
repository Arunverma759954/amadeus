const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword() {
    const email = 'rohitverma00003@gmail.com';
    const newPassword = 'password123';

    console.log(`🔄 Resetting password for: ${email}`);

    try {
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const user = users.find(u => u.email === email);
        if (!user) {
            console.log("❌ User not found!");
            return;
        }

        const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: newPassword, email_confirm: true }
        );

        if (updateError) {
            console.error("❌ Error:", updateError.message);
        } else {
            console.log("✅ SUCCESS! Password has been reset to: password123");
            console.log("🚀 Try logging in now.");
        }
    } catch (err) {
        console.error("❌ Unexpected error:", err.message);
    }
}

resetPassword();
