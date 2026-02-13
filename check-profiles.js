const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfiles() {
    console.log("🔍 Checking 'profiles' table...");

    try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1);

        if (error) {
            console.error("❌ Error accessing 'profiles' table:", error.message);
            if (error.message.includes('does not exist')) {
                console.log("💡 The 'profiles' table is missing!");
            }
        } else {
            console.log("✅ 'profiles' table exists.");
            console.log("Sample Data:", data);
        }
    } catch (err) {
        console.error("❌ Unexpected Error:", err.message);
    }
}

checkProfiles();
