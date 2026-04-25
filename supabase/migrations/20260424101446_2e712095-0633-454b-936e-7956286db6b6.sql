-- 1. Approval flag on posters
ALTER TABLE public.client_posters
  ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;

-- Tighten public read: only approved posters visible to anonymous users
DROP POLICY IF EXISTS "Anyone can view posters" ON public.client_posters;

CREATE POLICY "Public can view approved posters"
  ON public.client_posters
  FOR SELECT
  USING (approved = true OR public.has_role(auth.uid(), 'admin'));

-- 2. Contact messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can submit a message
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 255
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(message) BETWEEN 1 AND 4000
  );

-- Only admins can view or manage messages
CREATE POLICY "Admins read messages"
  ON public.contact_messages
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update messages"
  ON public.contact_messages
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete messages"
  ON public.contact_messages
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));