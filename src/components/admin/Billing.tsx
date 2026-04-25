import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, FileDown, X, Loader2 } from "lucide-react";
import jsPDF from "jspdf";

interface Client { id: string; name: string; }
interface InvoiceItem { description: string; qty: number; price: number; }
interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string | null;
  client_name: string;
  client_email: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issue_date: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

const PRESET_ITEMS = [
  { description: "Basic poster", price: 199 },
  { description: "Standard poster (single frame)", price: 299 },
  { description: "Premium campaign", price: 499 },
  { description: "Monthly · Single Frame (10 posters)", price: 1499 },
  { description: "Monthly · Basic Bundle (10 posters)", price: 1999 },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-cream/10 text-cream/70 border-cream/20",
  sent: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/40",
  cancelled: "bg-cream/5 text-cream/40 border-cream/15 line-through",
};

export const Billing = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: inv }, { data: cls }] = await Promise.all([
      supabase.from("invoices" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id,name").order("name"),
    ]);
    setInvoices(((inv as any) ?? []) as Invoice[]);
    setClients((cls as Client[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const totals = {
    paid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0),
    outstanding: invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + Number(i.total), 0),
    draft: invoices.filter((i) => i.status === "draft").length,
  };

  const setStatus = async (i: Invoice, status: Invoice["status"]) => {
    const { error } = await supabase.from("invoices" as any).update({ status }).eq("id", i.id);
    if (error) return toast.error(error.message);
    setInvoices((prev) => prev.map((x) => x.id === i.id ? { ...x, status } : x));
    toast.success(`Marked ${status}`);
  };

  const remove = async (i: Invoice) => {
    if (!confirm(`Delete invoice ${i.invoice_number}?`)) return;
    const { error } = await supabase.from("invoices" as any).delete().eq("id", i.id);
    if (error) return toast.error(error.message);
    setInvoices((prev) => prev.filter((x) => x.id !== i.id));
    toast.success("Deleted");
  };

  const downloadPdf = (i: Invoice) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    // Header
    doc.setFillColor(15, 15, 17);
    doc.rect(0, 0, W, 90, "F");
    doc.setTextColor(212, 175, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CREATIVENODE", 40, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 210);
    doc.text("Design. Build. Innovate.", 40, 68);

    doc.setTextColor(212, 175, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("INVOICE", W - 40, 50, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(220, 220, 210);
    doc.text(i.invoice_number, W - 40, 68, { align: "right" });

    // Bill to
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("BILL TO", 40, 130);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(i.client_name, 40, 148);
    if (i.client_email) doc.text(i.client_email, 40, 162);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("ISSUED", W - 200, 130);
    doc.text("DUE", W - 100, 130);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(i.issue_date, W - 200, 148);
    doc.text(i.due_date || "-", W - 100, 148);

    // Items table
    let y = 210;
    doc.setFillColor(245, 240, 225);
    doc.rect(40, y - 14, W - 80, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 60, 20);
    doc.text("DESCRIPTION", 50, y);
    doc.text("QTY", W - 230, y, { align: "right" });
    doc.text("PRICE", W - 150, y, { align: "right" });
    doc.text("AMOUNT", W - 50, y, { align: "right" });
    y += 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    i.items.forEach((it) => {
      const amt = Number(it.qty) * Number(it.price);
      doc.text(it.description, 50, y);
      doc.text(String(it.qty), W - 230, y, { align: "right" });
      doc.text(`Rs ${Number(it.price).toFixed(2)}`, W - 150, y, { align: "right" });
      doc.text(`Rs ${amt.toFixed(2)}`, W - 50, y, { align: "right" });
      y += 20;
    });

    // Totals
    y += 10;
    doc.setDrawColor(212, 175, 55);
    doc.line(W - 240, y, W - 40, y);
    y += 16;
    doc.setFontSize(10);
    doc.text("Subtotal", W - 200, y);
    doc.text(`Rs ${Number(i.subtotal).toFixed(2)}`, W - 50, y, { align: "right" });
    if (Number(i.tax_rate) > 0) {
      y += 16;
      doc.text(`Tax (${i.tax_rate}%)`, W - 200, y);
      doc.text(`Rs ${Number(i.tax_amount).toFixed(2)}`, W - 50, y, { align: "right" });
    }
    y += 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(180, 140, 30);
    doc.text("TOTAL", W - 200, y);
    doc.text(`Rs ${Number(i.total).toFixed(2)}`, W - 50, y, { align: "right" });

    if (i.notes) {
      y += 40;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("NOTES", 40, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(doc.splitTextToSize(i.notes, W - 80), 40, y);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("hello@creativenode.in  ·  +91 6369278905  ·  @creativenode.in", W / 2, doc.internal.pageSize.getHeight() - 30, { align: "center" });
    doc.save(`${i.invoice_number}.pdf`);
  };

  return (
    <main className="p-8">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="text-xs font-display tracking-[0.4em] text-gold/70 mb-1">{invoices.length} INVOICES</div>
          <h1 className="font-display text-5xl font-bold">Billing</h1>
          <p className="font-serif-elegant italic text-cream/60 text-lg mt-1">Create invoices, track payments, export PDFs.</p>
        </div>
        <button
          onClick={() => setEditorOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.2em] text-sm font-bold rounded hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> NEW INVOICE
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-3xl">
        <StatCard label="PAID" value={`₹${totals.paid.toFixed(0)}`} accent="text-emerald-400" />
        <StatCard label="OUTSTANDING" value={`₹${totals.outstanding.toFixed(0)}`} accent="text-gold" />
        <StatCard label="DRAFTS" value={String(totals.draft)} accent="text-cream/70" />
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-cream/60"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : invoices.length === 0 ? (
        <div className="border border-dashed border-gold/30 rounded-lg p-20 text-center max-w-3xl">
          <p className="font-serif-elegant italic text-cream/60">No invoices yet — create your first one.</p>
        </div>
      ) : (
        <div className="border border-gold/15 rounded-lg overflow-hidden max-w-6xl">
          <table className="w-full text-sm">
            <thead className="bg-ink-soft/60 text-cream/60">
              <tr className="text-left">
                <th className="px-4 py-3 font-display tracking-wider text-xs">INVOICE</th>
                <th className="px-4 py-3 font-display tracking-wider text-xs">CLIENT</th>
                <th className="px-4 py-3 font-display tracking-wider text-xs">ISSUED</th>
                <th className="px-4 py-3 font-display tracking-wider text-xs text-right">TOTAL</th>
                <th className="px-4 py-3 font-display tracking-wider text-xs">STATUS</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t border-gold/10 hover:bg-ink-soft/30">
                  <td className="px-4 py-3 font-mono text-cream/90">{i.invoice_number}</td>
                  <td className="px-4 py-3">
                    <div className="text-cream">{i.client_name}</div>
                    <div className="text-xs text-cream/50">{i.client_email}</div>
                  </td>
                  <td className="px-4 py-3 text-cream/60">{i.issue_date}</td>
                  <td className="px-4 py-3 text-right font-display font-bold gold-text">₹{Number(i.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={i.status}
                      onChange={(e) => setStatus(i, e.target.value as Invoice["status"])}
                      className={`px-2 py-1 text-xs font-display tracking-wider rounded border bg-transparent ${STATUS_STYLES[i.status]}`}
                    >
                      <option value="draft">DRAFT</option>
                      <option value="sent">SENT</option>
                      <option value="paid">PAID</option>
                      <option value="overdue">OVERDUE</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => downloadPdf(i)} className="w-8 h-8 rounded border border-gold/30 hover:border-gold hover:text-gold flex items-center justify-center" title="Download PDF">
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(i)} className="w-8 h-8 rounded border border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center justify-center" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editorOpen && <InvoiceEditor clients={clients} onClose={() => setEditorOpen(false)} onSaved={() => { setEditorOpen(false); load(); }} />}
    </main>
  );
};

const StatCard = ({ label, value, accent }: { label: string; value: string; accent: string }) => (
  <div className="p-5 rounded-lg border border-gold/15 bg-ink-soft/40">
    <div className="text-xs font-display tracking-[0.3em] text-cream/50">{label}</div>
    <div className={`font-display font-black text-3xl mt-2 ${accent}`}>{value}</div>
  </div>
);

const InvoiceEditor = ({
  clients, onClose, onSaved,
}: { clients: Client[]; onClose: () => void; onSaved: () => void }) => {
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", qty: 1, price: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const subtotal = items.reduce((s, i) => s + Number(i.qty || 0) * Number(i.price || 0), 0);
  const taxAmount = (subtotal * Number(taxRate || 0)) / 100;
  const total = subtotal + taxAmount;

  const setItem = (idx: number, patch: Partial<InvoiceItem>) =>
    setItems((arr) => arr.map((it, i) => i === idx ? { ...it, ...patch } : it));

  const save = async () => {
    if (!clientName.trim()) return toast.error("Client name required");
    if (items.length === 0 || items.every((i) => !i.description.trim())) return toast.error("Add at least one item");
    setSaving(true);
    const cleanItems = items.filter((i) => i.description.trim()).map((i) => ({
      description: i.description.trim(),
      qty: Number(i.qty),
      price: Number(i.price),
    }));
    const payload: any = {
      client_id: clientId || null,
      client_name: clientName.trim(),
      client_email: clientEmail.trim() || null,
      items: cleanItems,
      subtotal, tax_rate: Number(taxRate), tax_amount: taxAmount, total,
      issue_date: issueDate,
      due_date: dueDate || null,
      notes: notes.trim() || null,
    };
    const { error } = await supabase.from("invoices" as any).insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Invoice created");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-start justify-center p-6 overflow-y-auto">
      <div className="bg-ink-soft border border-gold/30 rounded-lg p-8 w-full max-w-3xl my-10 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold gold-text">New Invoice</h2>
          <button onClick={onClose} className="text-cream/60 hover:text-gold"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-display tracking-widest text-cream/60">CLIENT</label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                const c = clients.find((c) => c.id === e.target.value);
                if (c) setClientName(c.name);
              }}
              className="mt-1 w-full bg-ink border border-gold/20 rounded px-3 py-2 outline-none focus:border-gold"
            >
              <option value="">— Custom —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-display tracking-widest text-cream/60">CLIENT NAME</label>
            <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="mt-1 w-full bg-ink border border-gold/20 rounded px-3 py-2 outline-none focus:border-gold" />
          </div>
          <div>
            <label className="text-xs font-display tracking-widest text-cream/60">EMAIL</label>
            <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="mt-1 w-full bg-ink border border-gold/20 rounded px-3 py-2 outline-none focus:border-gold" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-display tracking-widest text-cream/60">ISSUE</label>
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="mt-1 w-full bg-ink border border-gold/20 rounded px-3 py-2 outline-none focus:border-gold" />
            </div>
            <div>
              <label className="text-xs font-display tracking-widest text-cream/60">DUE</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 w-full bg-ink border border-gold/20 rounded px-3 py-2 outline-none focus:border-gold" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-display tracking-widest text-cream/60">ITEMS</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_ITEMS.map((p) => (
                <button
                  key={p.description}
                  onClick={() => setItems((arr) => [...arr, { description: p.description, qty: 1, price: p.price }])}
                  className="text-[10px] font-display tracking-wider px-2 py-1 border border-gold/25 hover:border-gold hover:text-gold rounded"
                >
                  + ₹{p.price}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <input
                  placeholder="Description"
                  value={it.description}
                  onChange={(e) => setItem(idx, { description: e.target.value })}
                  className="col-span-7 bg-ink border border-gold/20 rounded px-3 py-2 outline-none focus:border-gold text-sm"
                />
                <input
                  type="number" min={1}
                  value={it.qty}
                  onChange={(e) => setItem(idx, { qty: Number(e.target.value) })}
                  className="col-span-2 bg-ink border border-gold/20 rounded px-3 py-2 outline-none focus:border-gold text-sm"
                />
                <input
                  type="number" min={0} step="0.01"
                  value={it.price}
                  onChange={(e) => setItem(idx, { price: Number(e.target.value) })}
                  className="col-span-2 bg-ink border border-gold/20 rounded px-3 py-2 outline-none focus:border-gold text-sm"
                />
                <button
                  onClick={() => setItems((arr) => arr.filter((_, i) => i !== idx))}
                  className="col-span-1 flex items-center justify-center border border-destructive/30 text-destructive rounded hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setItems((arr) => [...arr, { description: "", qty: 1, price: 0 }])}
              className="text-xs font-display tracking-widest text-gold hover:text-gold-bright"
            >
              + ADD LINE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-display tracking-widest text-cream/60">NOTES</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full bg-ink border border-gold/20 rounded px-3 py-2 outline-none focus:border-gold text-sm" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-display tracking-widest text-cream/60">TAX %</label>
              <input
                type="number" min={0} step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-24 bg-ink border border-gold/20 rounded px-3 py-1.5 outline-none focus:border-gold text-sm text-right"
              />
            </div>
            <div className="border-t border-gold/15 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-cream/70"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-cream/70"><span>Tax</span><span>₹{taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-display font-bold text-xl gold-text pt-2 border-t border-gold/20"><span>TOTAL</span><span>₹{total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gold/15">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-display tracking-wider text-cream/70 hover:text-cream">CANCEL</button>
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-wider text-sm font-bold rounded hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} SAVE INVOICE
          </button>
        </div>
      </div>
    </div>
  );
};
