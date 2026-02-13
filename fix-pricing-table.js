const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase (Use the same credentials as in your project)
const supabaseUrl = 'https://cbhjzumrfeslsronuzpk.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY'; // Service Role Key for admin rights

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPricingTable() {
    console.log("🛠️ Fixing pricing_settings table...");

    try {
        // 1. Check if table exists and has data
        const { data: existingData, error: fetchError } = await supabase
            .from('pricing_settings')
            .select('*');

        if (fetchError) {
            console.log("❌ Error fetching table (might not exist):", fetchError.message);
            // Attempt to create table via SQL matching the app's expectation
            // We can't run DDL easily here without the SQL editor, but we can try to insert and see.
            // Since we can't run CREATE TABLE, we have to assume the user might need to run it, 
            // OR we use the fact that the previous setup script might have worked partially.

            // However, usually we can't CREATE TABLE from client unless exposed via RPC.
            // Let's assume the table 'pricing_settings' IS accessible or we need to guide the user.

            // IF the error is 'relation "public.pricing_settings" does not exist', we MUST tell the user to run SQL.
        }

        if (!existingData || existingData.length === 0) {
            console.log("⚠️ Table empty or not found. Attempting to insert default row...");
            const { data: insertData, error: insertError } = await supabase
                .from('pricing_settings')
                .insert([{ markup_value: 0 }]) // Default 0% markup
                .select();

            if (insertError) {
                console.error("❌ Insert failed:", insertError.message);
                console.log("\n⚠️ PLEASE RUN THIS SQL IN SUPABASE DASHBOARD:\n");
                console.log(`
                    create table if not exists pricing_settings (
                        id uuid default gen_random_uuid() primary key,
                        markup_value float8 default 0,
                        created_at timestamp with time zone default now()
                    );
                    insert into pricing_settings (markup_value) values (0);
                `);
            } else {
                console.log("✅ Inserted default pricing row:", insertData);
            }
        } else {
            console.log("✅ Pricing row found:", existingData[0]);
            // Check if column is 'markup_value' or 'markup_percent'
            if (existingData[0].markup_value === undefined) {
                console.log("⚠️ Column 'markup_value' might be missing. Found keys:", Object.keys(existingData[0]));
            }
        }

    } catch (err) {
        console.error("❌ Unexpected error:", err);
    }
}

fixPricingTable();
