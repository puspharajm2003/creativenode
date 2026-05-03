CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id TEXT UNIQUE NOT NULL,
  amount_received NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  promo_code_used TEXT,
  plan_name TEXT,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage promo codes" ON promo_codes
  FOR ALL USING (has_role('admin', auth.uid()));

CREATE POLICY "Anyone can read active promo codes" ON promo_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (has_role('admin', auth.uid()));

CREATE POLICY "Anyone can insert payments" ON payments
  FOR INSERT WITH CHECK (true);
