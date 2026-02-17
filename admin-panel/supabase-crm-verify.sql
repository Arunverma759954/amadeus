-- Copy-paste this in Supabase → SQL Editor → Run to confirm CRM tables exist.
-- You should see 3 result sets: one row each showing table name and row count (0).

SELECT 'crm_leads' AS table_name, COUNT(*) AS row_count FROM crm_leads
UNION ALL
SELECT 'crm_contacts', COUNT(*) FROM crm_contacts
UNION ALL
SELECT 'crm_deals', COUNT(*) FROM crm_deals;
