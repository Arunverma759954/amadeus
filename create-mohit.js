const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMohitUser() {
    const email = 'Mohitsharma123@gmail.com';
    const password = 'password123'; // Default password for him to change if needed
    const fullName = 'Mohit';

    console.log(`🚀 Manually creating account for: ${email}`);

    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (error) {
            if (error.message.includes("already exists")) {
                console.log("⚠️ User already exists! Updating password instead...");
                const { data: { users } } = await supabase.auth.admin.listUsers();
                const user = users.find(u => u.email === email);
                await supabase.auth.admin.updateUserById(user.id, { password: password, email_confirm: true });
                console.log("✅ Password reset to 'password123' and email confirmed.");
            } else {
                console.error("❌ Error:", error.message);
            }
        } else {
            console.log("✅ SUCCESS! Account created for Mohit.");
            console.log(`🔑 Login with: ${email} / ${password}`);
        }
    } catch (err) {
        console.error("❌ Unexpected error:", err.message);
    }
}

createMohitUser();
