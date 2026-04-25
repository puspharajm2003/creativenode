
-- Roles enum + table (separate from profiles for security)
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT,
  accent TEXT DEFAULT '#D4AF37',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clients"
ON public.clients FOR SELECT
USING (true);

CREATE POLICY "Admins manage clients"
ON public.clients FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Client posters
CREATE TABLE public.client_posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT,
  image_path TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_posters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posters"
ON public.client_posters FOR SELECT
USING (true);

CREATE POLICY "Admins manage posters"
ON public.client_posters FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_posters_updated_at
BEFORE UPDATE ON public.client_posters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_posters_client ON public.client_posters(client_id, sort_order);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('client-posters', 'client-posters', true);

CREATE POLICY "Public can view poster images"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-posters');

CREATE POLICY "Admins can upload posters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-posters' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posters"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'client-posters' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posters"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'client-posters' AND public.has_role(auth.uid(), 'admin'));

-- Seed clients
INSERT INTO public.clients (name, slug, tagline, accent, sort_order) VALUES
('JP Fitness Studios', 'jp-fitness-studios', 'India''s Leading Wellness Coach', '#3FB6E0', 1),
('Hotel Tamil Park', 'hotel-tamil-park', 'Hospitality, the Tamil way', '#D4AF37', 2),
('KSP Pattu Maaligai', 'ksp-pattu-maaligai', 'Heritage silks, modern elegance', '#C8385F', 3);
