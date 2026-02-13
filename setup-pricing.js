const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPricingTable() {
    console.log("🛠️ Setting up pricing_settings table...");

    try {
        // We can't use 'create table' via RPC easily unless an RPC function exists.
        // But we can check if it exists by trying to select from it.
        const { data, error } = await supabase
            .from('pricing_settings')
            .select('*')
            .limit(1);

        if (error && error.code === '42P01') { // Table does not exist
            console.log("❌ Table 'pricing_settings' does not exist.");
            console.log("⚠️ PLEASE RUN THIS IN SUPABASE SQL EDITOR:");
            console.log(`
                CREATE TABLE IF NOT EXISTS pricing_settings (
                    id bigint primary key generated always as identity,
                    markup_percent float8 default 0,
                    discount_percent float8 default 0,
                    active boolean default true,
                    updated_at timestamp with time zone default now()
                );

                -- Insert initial row if empty
                INSERT INTO pricing_settings (markup_percent, discount_percent)
                SELECT 0, 10
                WHERE NOT EXISTS (SELECT 1 FROM pricing_settings);
            `);
        } else if (error) {
            console.error("❌ Error checking table:", error.message);
        } else {
            console.log("✅ Table 'pricing_settings' already exists.");
            console.log("Current Data:", data);
        }
    } catch (err) {
        console.error("❌ Unexpected error:", err.message);
    }
}

setupPricingTable();
