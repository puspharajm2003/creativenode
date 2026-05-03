import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Tag, Plus, Loader2, Search, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  created_at: string;
}

interface Payment {
  id: string;
  payment_id: string;
  amount_received: number;
  currency: string;
  promo_code_used: string | null;
  plan_name: string | null;
  status: string;
  created_at: string;
}

export const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Promo form state
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("");

  useEffect(() => {
    fetchData();

    // Set up realtime subscriptions
    const channel = supabase.channel('payments-promo')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promo_codes' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [promosRes, paymentsRes] = await Promise.all([
      supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false })
    ]);

    if (promosRes.data) setPromoCodes(promosRes.data);
    if (paymentsRes.data) setPayments(paymentsRes.data);
    setLoading(false);
  };

  const handleCreatePromo = async () => {
    if (!newCode || !newDiscount) return toast.error("Please fill all fields");
    
    const discount = parseInt(newDiscount, 10);
    if (isNaN(discount) || discount < 0 || discount > 100) return toast.error("Discount must be between 0 and 100");

    const { error } = await supabase.from("promo_codes").insert({
      code: newCode.toUpperCase(),
      discount_percent: discount
    });

    if (error) {
      if (error.code === '23505') toast.error("Promo code already exists");
      else toast.error("Failed to create promo code");
    } else {
      toast.success("Promo code created successfully");
      setShowPromoForm(false);
      setNewCode("");
      setNewDiscount("");
      fetchData();
    }
  };

  const togglePromoStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("promo_codes").update({ is_active: !currentStatus }).eq("id", id);
    if (error) toast.error("Failed to update status");
    else {
      toast.success(`Promo code ${currentStatus ? 'disabled' : 'enabled'}`);
      fetchData();
    }
  };

  const deletePromo = async (id: string) => {
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) toast.error("Failed to delete promo code");
    else {
      toast.success("Promo code deleted");
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount_received), 0);

  return (
    <div className="p-8 space-y-12 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-cream mb-2">Payments & Promos</h1>
        <p className="font-serif-elegant italic text-cream/50">Manage Razorpay transactions and discount codes.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Promo Codes */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold flex items-center gap-2">
              <Tag className="w-5 h-5" /> Promo Codes
            </h2>
            <button 
              onClick={() => setShowPromoForm(!showPromoForm)}
              className="w-8 h-8 rounded border border-gold/30 hover:border-gold hover:text-gold flex items-center justify-center text-cream/70 transition"
            >
              {showPromoForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>

          {showPromoForm && (
            <Card className="bg-ink-soft/40 border-gold/20 animate-in slide-in-from-top-4">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-xs font-display tracking-widest text-cream/60 uppercase">Code</label>
                  <input 
                    type="text" 
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. LUXURY20"
                    className="w-full mt-1 bg-ink border border-gold/20 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-xs font-display tracking-widest text-cream/60 uppercase">Discount %</label>
                  <input 
                    type="number" 
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(e.target.value)}
                    placeholder="e.g. 20"
                    min="0" max="100"
                    className="w-full mt-1 bg-ink border border-gold/20 rounded px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold"
                  />
                </div>
                <button onClick={handleCreatePromo} className="w-full py-2 bg-gold/10 hover:bg-gold text-gold hover:text-ink border border-gold/30 rounded font-display tracking-widest text-xs font-bold transition">
                  CREATE CODE
                </button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {promoCodes.length === 0 && !showPromoForm && (
              <div className="p-8 text-center border border-dashed border-gold/20 rounded-xl">
                <p className="text-sm font-serif-elegant italic text-cream/40">No promo codes found.</p>
              </div>
            )}
            {promoCodes.map(promo => (
              <div key={promo.id} className={`p-4 border rounded-xl flex items-center justify-between transition-colors ${promo.is_active ? 'border-gold/30 bg-ink-soft' : 'border-white/5 bg-ink opacity-60'}`}>
                <div>
                  <div className="font-mono text-gold font-bold text-lg">{promo.code}</div>
                  <div className="text-xs font-serif-elegant italic text-cream/60 mt-0.5">{promo.discount_percent}% OFF</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => togglePromoStatus(promo.id, promo.is_active)} className={`px-3 py-1 text-xs border rounded font-display tracking-widest ${promo.is_active ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-cream/20 text-cream/40 hover:text-cream'}`}>
                    {promo.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                  <button onClick={() => deletePromo(promo.id)} className="px-2 py-1 text-xs border border-destructive/30 text-destructive hover:bg-destructive/10 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Recent Transactions
            </h2>
            <div className="text-sm font-display tracking-widest">
              TOTAL REVENUE: <span className="text-gold">₹{totalRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-ink-soft/20 border border-gold/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-cream/50 uppercase bg-ink-soft/40 border-b border-gold/10">
                <tr>
                  <th className="px-6 py-4 font-display tracking-widest">Date</th>
                  <th className="px-6 py-4 font-display tracking-widest">Payment ID</th>
                  <th className="px-6 py-4 font-display tracking-widest">Plan</th>
                  <th className="px-6 py-4 font-display tracking-widest">Amount</th>
                  <th className="px-6 py-4 font-display tracking-widest">Promo</th>
                  <th className="px-6 py-4 font-display tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-cream/40 font-serif-elegant italic">
                      No payments recorded yet. Wait for a user to complete checkout.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                      <td className="px-6 py-4 text-cream/80 whitespace-nowrap">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-cream/50">
                        {payment.payment_id}
                      </td>
                      <td className="px-6 py-4 text-cream/80 truncate max-w-[150px]">
                        {payment.plan_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono text-gold/90 font-bold">
                        ₹{(payment.amount_received).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        {payment.promo_code_used ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[10px]">
                            {payment.promo_code_used}
                          </span>
                        ) : (
                          <span className="text-cream/20">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-display tracking-widest border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                          <CheckCircle2 className="w-3 h-3" /> {payment.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
