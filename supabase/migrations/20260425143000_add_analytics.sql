CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  path text not null,
  session_id text not null,
  user_agent text,
  referrer text
);

-- Allow anonymous inserts so any visitor can be tracked
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for all users" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Only authenticated users (admins) can view the analytics
CREATE POLICY "Enable read access for authenticated users" ON public.page_views
  FOR SELECT TO authenticated USING (true);
