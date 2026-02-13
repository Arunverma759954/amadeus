const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
    const email = 'user@example.com';
    const password = 'user123';

    console.log(`Checking regular user: ${email}`);

    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();

        if (error) { console.error(error); return; }

        const user = users.find(u => u.email === email);

        if (!user) {
            console.log("Creating new test user...");
            const { error: createError } = await supabase.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: { full_name: 'Test Traveler' }
            });
            if (createError) console.error("Create failed:", createError);
            else console.log("✅ Test User Created: user@example.com / user123");
        } else {
            console.log("Resetting test user password...");
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                user.id,
                { password: password, email_confirm: true }
            );
            if (updateError) console.error("Update failed:", updateError);
            else console.log("✅ Test User Updated: user@example.com / user123");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

createTestUser();
