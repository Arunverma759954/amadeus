-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) to create CRM tables.
-- Your admin panel and main app use the same Supabase project.

-- 1) Leads (inquiries from website / call / WhatsApp)
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'call', 'whatsapp', 'email', 'other')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'lost')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Contacts (customers / repeat clients)
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Deals (sales pipeline: inquiry → quoted → booked → paid)
CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2),
  currency TEXT DEFAULT 'AUD',
  stage TEXT DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'quoted', 'booked', 'paid', 'completed', 'lost')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Optional: enable RLS and allow all for anon (admin panel uses anon key). Tighten in production.
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for crm_leads" ON crm_leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for crm_contacts" ON crm_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for crm_deals" ON crm_deals FOR ALL USING (true) WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crm_leads_updated BEFORE UPDATE ON crm_leads FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER crm_contacts_updated BEFORE UPDATE ON crm_contacts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER crm_deals_updated BEFORE UPDATE ON crm_deals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
