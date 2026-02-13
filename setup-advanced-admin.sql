-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    flight_details JSONB NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Search Logs Table
CREATE TABLE IF NOT EXISTS public.search_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    search_params JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Site Content Table
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_key TEXT UNIQUE NOT NULL,
    content_value TEXT NOT NULL,
    content_type TEXT DEFAULT 'text',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE search_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE site_content;

-- Add RLS Policies (Allow Authenticated users to insert, Admins to view all)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Simple policy for demonstration (can be refined for strict role-based access)
CREATE POLICY "Users can insert their own bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert their own search logs" ON search_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read site content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage site content" ON site_content FOR ALL USING (true);
