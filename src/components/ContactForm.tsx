import { useCallback, useState } from "react";
import { z } from "zod";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle2, Download, Pencil, FileText, X, Eye, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  businessType: z.string().trim().min(1, "Business type required").max(120),
  posterSize: z.string().trim().min(1, "Poster size/frequency required").max(120),
  message: z.string().trim().min(1, "Message required").max(4000),
});

/* ── Plan catalog with validation constraints ── */
const PLAN_OPTIONS = [
  { plan: "Frame Poster", posters: "1 Poster", price: "₹149", priceNum: 149, minPosters: 1, maxPosters: 1 },
  { plan: "Basic Poster", posters: "5 Posters / Week", price: "₹1,999", priceNum: 1999, minPosters: 2, maxPosters: 10 },
  { plan: "Standard Poster", posters: "24 Posters / Month", price: "₹9,999", priceNum: 9999, minPosters: 11, maxPosters: 100 },
];

interface Props {
  variant?: "dark" | "light";
  className?: string;
}

export const ContactForm = ({ variant = "dark", className = "" }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [posterSize, setPosterSize] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  /* confirm-step state */
  const [confirming, setConfirming] = useState(false);
  const [editPlan, setEditPlan] = useState("");
  const [editPosters, setEditPosters] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editPriceNum, setEditPriceNum] = useState(0);
  const [parsedData, setParsedData] = useState<z.infer<typeof schema> | null>(null);
  const [validationWarning, setValidationWarning] = useState("");

  const [lastName, setLastName] = useState("");
  const [lastSummary, setLastSummary] = useState<any>(null);

  /* PDF preview modal state */
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  /* ── Determine recommended plan from poster-size text ── */
  const recommend = (ps: string) => {
    const lower = ps.toLowerCase();
    if (lower.includes("single") || lower.includes("1") || lower.includes("one")) {
      return PLAN_OPTIONS[0];
    } else if (lower.includes("week") || lower.includes("5") || lower.includes("few")) {
      return PLAN_OPTIONS[1];
    }
    return PLAN_OPTIONS[2];
  };

  /* ── Plan selection with validation ── */
  const selectPlan = useCallback((opt: typeof PLAN_OPTIONS[0]) => {
    setEditPlan(opt.plan);
    setEditPosters(opt.posters);
    setEditPrice(opt.price);
    setEditPriceNum(opt.priceNum);
    setValidationWarning("");
  }, []);

  /* ── Validate plan against poster size input ── */
  const validateSelection = useCallback(() => {
    if (!parsedData) return true;
    const lower = parsedData.posterSize.toLowerCase();
    const currentOpt = PLAN_OPTIONS.find(o => o.plan === editPlan);
    if (!currentOpt) return true;

    // Warn if user wants many posters but selected lowest plan
    if ((lower.includes("month") || lower.includes("24") || lower.includes("bulk")) && currentOpt.plan === "Frame Poster") {
      setValidationWarning("Frame Poster plan is for single posters. Consider Basic or Standard for bulk needs.");
      return false;
    }
    // Warn if user wants single poster but selected highest plan
    if ((lower.includes("single") || lower.includes("one") || lower.includes("1 ")) && currentOpt.plan === "Standard Poster") {
      setValidationWarning("Standard plan includes 24 posters/month. Frame Poster may be more cost-effective for a single design.");
      return false;
    }
    setValidationWarning("");
    return true;
  }, [parsedData, editPlan]);

  /* ── Generate one-page confirmation receipt PDF ── */
  const generateReceiptPDF = useCallback((data: { name: string; email: string; business: string; plan: string; posters: string; price: string; date: string }) => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const w = pdf.internal.pageSize.getWidth();

    // Dark background
    pdf.setFillColor(10, 10, 10);
    pdf.rect(0, 0, w, 842, "F");

    // Gold header line
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(2);
    pdf.line(40, 50, w - 40, 50);

    // CREATIVENODE
    pdf.setTextColor(212, 175, 55);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("CREATIVENODE", 40, 40);

    // Receipt title
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text("CONFIRMATION RECEIPT", w - 40, 40, { align: "right" });

    // Date
    pdf.setFontSize(9);
    pdf.text(data.date, w - 40, 70, { align: "right" });

    // Client details
    pdf.setTextColor(230, 220, 200);
    pdf.setFontSize(11);
    let y = 100;
    const label = (l: string, v: string) => {
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(l.toUpperCase(), 40, y);
      pdf.setTextColor(230, 220, 200);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(v, 40, y + 16);
      y += 40;
    };
    label("Name", data.name);
    label("Email", data.email);
    label("Business", data.business);

    // Divider
    y += 10;
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(0.5);
    pdf.line(40, y, w - 40, y);
    y += 30;

    // Plan box
    pdf.setFillColor(20, 20, 20);
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(1);
    pdf.rect(40, y, w - 80, 120, "FD");

    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(10);
    pdf.text("SELECTED PLAN", 60, y + 25);
    pdf.setTextColor(230, 220, 200);
    pdf.setFontSize(22);
    pdf.text(data.plan, 60, y + 55);
    pdf.setFontSize(14);
    pdf.setTextColor(212, 175, 55);
    pdf.text(data.price, 60, y + 80);
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(10);
    pdf.text(data.posters, 60, y + 100);

    y += 160;

    // Footer
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("This is a confirmation of your interest. Final pricing may vary based on project scope.", 40, y);
    pdf.text("Contact: +91 6369278905  |  hello@creativenode.in", 40, y + 16);

    // Bottom gold line
    pdf.setDrawColor(212, 175, 55);
    pdf.setLineWidth(2);
    pdf.line(40, 810, w - 40, 810);

    return pdf;
  }, []);

  /* ── Generate pitch deck preview ── */
  const showPitchDeckPreview = useCallback(() => {
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();

    pdf.setFillColor(10, 10, 10);
    pdf.rect(0, 0, pw, ph, "F");
    pdf.setTextColor(212, 175, 55);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(36);
    pdf.text("CREATIVENODE", pw / 2, ph / 2 - 40, { align: "center" });
    pdf.setFontSize(14);
    pdf.setTextColor(230, 220, 200);
    pdf.text("Design Portfolio & Pricing Deck", pw / 2, ph / 2, { align: "center" });
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text("Preview — Full deck available after form submission", pw / 2, ph / 2 + 30, { align: "center" });
    pdf.text(new Date().toLocaleDateString(), pw / 2, ph / 2 + 50, { align: "center" });

    // Pricing page
    pdf.addPage();
    pdf.setFillColor(10, 10, 10);
    pdf.rect(0, 0, pw, ph, "F");
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(12);
    pdf.text("INVESTMENT", 40, 60);
    pdf.setFontSize(28);
    pdf.text("Simple, transparent rates.", 40, 100);

    let cy = 150;
    for (const p of PLAN_OPTIONS) {
      pdf.setFillColor(20, 20, 20);
      pdf.setDrawColor(212, 175, 55);
      pdf.setLineWidth(0.5);
      pdf.rect(40, cy, (pw - 100) / 3, 140, "FD");
      pdf.setTextColor(212, 175, 55);
      pdf.setFontSize(10);
      pdf.text(p.plan.toUpperCase(), 55, cy + 25);
      pdf.setTextColor(230, 220, 200);
      pdf.setFontSize(22);
      pdf.text(p.price, 55, cy + 60);
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(9);
      pdf.text(p.posters, 55, cy + 85);
    }

    // Contact page
    pdf.addPage();
    pdf.setFillColor(10, 10, 10);
    pdf.rect(0, 0, pw, ph, "F");
    pdf.setTextColor(212, 175, 55);
    pdf.setFontSize(12);
    pdf.text("LET'S WORK TOGETHER", pw / 2, 80, { align: "center" });
    pdf.setFontSize(36);
    pdf.text("Start Today.", pw / 2, 140, { align: "center" });
    pdf.setTextColor(200, 195, 180);
    pdf.setFontSize(14);
    pdf.text("+91 6369278905  |  hello@creativenode.in", pw / 2, 200, { align: "center" });

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
    setPreviewOpen(true);
  }, []);

  /* Step 1 — validate, open confirm step */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, businessType, posterSize, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const rec = recommend(parsed.data.posterSize);
    selectPlan(rec);
    setParsedData(parsed.data);
    setConfirming(true);
  };

  /* Step 2 — save to CRM + open WhatsApp + track */
  const onConfirm = async () => {
    if (!parsedData) return;
    // Validate (warning only, don't block)
    validateSelection();

    setLoading(true);
    const { name: n, email: em, businessType: bt, posterSize: ps, message: m } = parsedData;

    /* Build the EXACT WhatsApp delivery text */
    const waPlain = `Hi Creativenode! I'm ${n} (${bt}).\nEmail: ${em}\nPoster need: ${ps}\nSelected Plan: ${editPlan}\nPosters: ${editPosters}\nTotal: ${editPrice}\n\nMessage: ${m}`;

    /* CRM record — includes the full WhatsApp text for auditing + tracking */
    const crmMessage = [
      `Business Type: ${bt}`,
      `Poster Size/Freq: ${ps}`,
      ``,
      `Selected Plan: ${editPlan}`,
      `Posters: ${editPosters}`,
      `Total Price: ${editPrice}`,
      ``,
      `Message: ${m}`,
      ``,
      `── WhatsApp Delivery Text ──`,
      waPlain,
      ``,
      `── WhatsApp Status ──`,
      `Redirect initiated: ${new Date().toISOString()}`,
      `Status: OPENED`,
    ].join("\n");

    const { error } = await supabase.from("contact_messages").insert([{ name: n, email: em, message: crmMessage }]);
    setLoading(false);
    if (error) {
      toast.error("Could not send. Please try again.");
      return;
    }

    const event = new CustomEvent("nova-recommendation", {
      detail: { name: n, businessType: bt, posterSize: ps, recommendedPlan: editPlan, postersCount: editPosters, totalPrice: editPrice }
    });
    window.dispatchEvent(event);

    const waText = encodeURIComponent(waPlain);
    window.open(`https://wa.me/916369278905?text=${waText}`, "_blank");

    setLastName(n);
    setLastSummary({ recommendedPlan: editPlan, postersCount: editPosters, totalPrice: editPrice, email: em, businessType: bt });
    setDone(true);
    setConfirming(false);
    setName(""); setEmail(""); setBusinessType(""); setPosterSize(""); setMessage("");
    toast.success("Redirected to WhatsApp!");
  };

  /* ── Download confirmation receipt ── */
  const downloadReceipt = useCallback(() => {
    if (!lastSummary) return;
    const pdf = generateReceiptPDF({
      name: lastName,
      email: lastSummary.email ?? "",
      business: lastSummary.businessType ?? "",
      plan: lastSummary.recommendedPlan,
      posters: lastSummary.postersCount,
      price: lastSummary.totalPrice,
      date: new Date().toLocaleString(),
    });
    pdf.save(`creativenode-receipt-${Date.now()}.pdf`);
    toast.success("Receipt downloaded");
  }, [lastSummary, lastName, generateReceiptPDF]);

  const inputBase =
    variant === "dark"
      ? "w-full bg-ink/60 border border-gold/25 focus:border-gold rounded px-4 py-3 outline-none text-cream placeholder:text-cream/40 transition"
      : "w-full bg-white/90 border border-gold/40 focus:border-gold rounded px-4 py-3 outline-none text-ink placeholder:text-ink/40 transition";

  /* ── PDF Preview Modal ── */
  const PreviewModal = () => previewOpen ? (
    <div className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[80vh] bg-ink border border-gold/30 rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(212,175,55,0.15)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/15 bg-ink-soft/60">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold" />
            <span className="font-display text-sm tracking-widest text-gold">PITCH DECK PREVIEW</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={previewUrl}
              download="creativenode-pitch-deck-preview.pdf"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-display tracking-widest bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 rounded transition"
            >
              <Download className="w-3 h-3" /> DOWNLOAD
            </a>
            <button
              onClick={() => { setPreviewOpen(false); URL.revokeObjectURL(previewUrl); }}
              className="p-1.5 rounded-full hover:bg-white/5 text-cream/50 hover:text-gold transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <iframe
          src={previewUrl}
          className="w-full h-[calc(100%-56px)]"
          title="Pitch Deck Preview"
        />
      </div>
    </div>
  ) : null;

  /* ── Done state ── */
  if (done) {
    return (
      <>
        <PreviewModal />
        <div className={`flex flex-col items-center justify-center text-center py-10 px-6 border border-gold/30 rounded bg-ink/40 backdrop-blur-sm ${className}`}>
          <CheckCircle2 className="w-12 h-12 text-gold mb-4" />
          <h3 className="font-display text-2xl font-bold text-cream">Request Sent!</h3>
          <p className="font-serif-elegant italic text-cream/70 mt-2 mb-6">
            Thanks {lastName ? `${lastName}, ` : ""}we've opened WhatsApp with your details.
          </p>

          {lastSummary && (
            <div className="bg-ink border border-gold/20 rounded-lg p-5 w-full text-left max-w-sm mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 blur-2xl pointer-events-none" />
              <h4 className="font-display text-gold text-xs tracking-widest mb-3 uppercase flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> Selected Plan
              </h4>
              <div className="flex justify-between items-end mb-2 relative z-10">
                <div className="text-cream font-bold text-2xl">{lastSummary.totalPrice}</div>
                <div className="text-cream/50 text-[10px] uppercase font-display tracking-wider bg-gold/10 px-2 py-1 rounded border border-gold/20">{lastSummary.postersCount}</div>
              </div>
              <div className="text-cream font-display text-sm mt-3 relative z-10">{lastSummary.recommendedPlan}</div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            {/* Download receipt PDF */}
            <button
              onClick={downloadReceipt}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gold/40 text-gold hover:bg-gold/10 rounded font-display tracking-widest text-xs transition"
            >
              <FileText className="w-3.5 h-3.5" /> DOWNLOAD RECEIPT
            </button>
            {/* Preview pitch deck */}
            <button
              onClick={showPitchDeckPreview}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gold/40 text-gold hover:bg-gold/10 rounded font-display tracking-widest text-xs transition"
            >
              <Eye className="w-3.5 h-3.5" /> PREVIEW PITCH DECK
            </button>
          </div>

          <button
            onClick={() => setDone(false)}
            className="mt-2 text-xs font-display tracking-[0.3em] text-gold hover:text-gold-bright"
          >
            SEND ANOTHER →
          </button>
        </div>
      </>
    );
  }

  /* ── Confirm / Edit step ── */
  if (confirming && parsedData) {
    return (
      <>
        <PreviewModal />
        <div className={`flex flex-col py-8 px-6 border border-gold/30 rounded bg-ink/40 backdrop-blur-sm ${className}`}>
          <h3 className="font-display text-xl font-bold text-cream mb-1 flex items-center gap-2">
            <Pencil className="w-4 h-4 text-gold" /> Review & Confirm
          </h3>
          <p className="font-serif-elegant italic text-cream/50 text-sm mb-6">
            Edit the plan below before we send it via WhatsApp.
          </p>

          {/* Summary */}
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between text-cream/70">
              <span className="font-display tracking-widest text-[10px] text-cream/40 uppercase">Name</span>
              <span>{parsedData.name}</span>
            </div>
            <div className="flex justify-between text-cream/70">
              <span className="font-display tracking-widest text-[10px] text-cream/40 uppercase">Email</span>
              <span>{parsedData.email}</span>
            </div>
            <div className="flex justify-between text-cream/70">
              <span className="font-display tracking-widest text-[10px] text-cream/40 uppercase">Business</span>
              <span>{parsedData.businessType}</span>
            </div>
          </div>

          {/* Editable plan */}
          <div className="bg-ink border border-gold/20 rounded-lg p-5 mb-4 space-y-4">
            <h4 className="font-display text-gold text-xs tracking-widest uppercase">Selected Plan</h4>

            {/* Plan selector */}
            <div className="flex gap-2 flex-wrap">
              {PLAN_OPTIONS.map((opt) => (
                <button
                  key={opt.plan}
                  type="button"
                  onClick={() => selectPlan(opt)}
                  className={`px-3 py-2 rounded text-xs font-display tracking-wider border transition ${
                    editPlan === opt.plan
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-gold/15 text-cream/50 hover:border-gold/40 hover:text-cream"
                  }`}
                >
                  {opt.plan} · {opt.price}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-end">
              <div className="text-cream font-bold text-3xl">{editPrice}</div>
              <div className="text-cream/50 text-[10px] uppercase font-display tracking-wider bg-gold/10 px-2 py-1 rounded border border-gold/20">{editPosters}</div>
            </div>
          </div>

          {/* Validation warning */}
          {validationWarning && (
            <div className="flex items-start gap-2 px-4 py-3 mb-4 rounded border border-amber-500/30 bg-amber-500/5 text-amber-400 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationWarning}</span>
            </div>
          )}

          {/* Preview pitch deck link */}
          <button
            type="button"
            onClick={showPitchDeckPreview}
            className="self-start mb-4 inline-flex items-center gap-1.5 text-xs font-display tracking-widest text-cream/40 hover:text-gold transition"
          >
            <Eye className="w-3 h-3" /> PREVIEW PITCH DECK
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => { setConfirming(false); setValidationWarning(""); }}
              className="flex-1 py-3 text-center font-display tracking-widest text-xs text-cream/60 border border-gold/20 rounded hover:text-cream hover:bg-white/5 transition"
            >
              BACK
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-[2] py-3 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.2em] text-xs font-bold rounded hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> SAVING & OPENING WHATSAPP...</>
              ) : (
                <><Send className="w-4 h-4" /> CONFIRM & OPEN WHATSAPP</>
              )}
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ── Main form ── */
  return (
    <>
      <PreviewModal />
      <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
        <div className="grid sm:grid-cols-2 gap-4">
          <input className={inputBase} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
          <input className={inputBase} placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
          <input className={inputBase} placeholder="Business type (e.g. Gym, Agency)" value={businessType} onChange={(e) => setBusinessType(e.target.value)} maxLength={120} required />
          <input className={inputBase} placeholder="Poster need (e.g. 5/week, single)" value={posterSize} onChange={(e) => setPosterSize(e.target.value)} maxLength={120} required />
        </div>
        <textarea
          className={`${inputBase} min-h-[140px] resize-y`}
          placeholder="Tell us about your project — type of design, deadline, brand vibe..."
          value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} required
        />
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.2em] text-xs font-bold rounded hover:opacity-90 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> REVIEW & SEND
          </button>
          <button
            type="button"
            onClick={showPitchDeckPreview}
            className="inline-flex items-center gap-1.5 text-xs font-display tracking-widest text-cream/40 hover:text-gold transition"
          >
            <Eye className="w-3 h-3" /> PREVIEW DECK
          </button>
        </div>
      </form>
    </>
  );
};
