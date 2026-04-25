-- supabase/migrations/20260424120000_add_client_links.sql

ALTER TABLE public.clients
ADD COLUMN instagram_url TEXT,
ADD COLUMN custom_link_url TEXT,
ADD COLUMN custom_link_text TEXT;
