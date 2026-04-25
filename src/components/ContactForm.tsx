import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(120),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(1, "Message required").max(4000),
});

interface Props {
  variant?: "dark" | "light";
  className?: string;
}

export const ContactForm = ({ variant = "dark", className = "" }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [lastName, setLastName] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { name: n, email: em, message: m } = parsed.data;
    const { error } = await supabase.from("contact_messages").insert([{ name: n!, email: em!, message: m! }]);
    setLoading(false);
    if (error) {
      toast.error("Could not send. Please try again.");
      return;
    }
    setLastName(parsed.data.name);
    setDone(true);
    setName(""); setEmail(""); setMessage("");
    toast.success("Message sent — we'll be in touch.");
  };

  const inputBase =
    variant === "dark"
      ? "w-full bg-ink/60 border border-gold/25 focus:border-gold rounded px-4 py-3 outline-none text-cream placeholder:text-cream/40 transition"
      : "w-full bg-white/90 border border-gold/40 focus:border-gold rounded px-4 py-3 outline-none text-ink placeholder:text-ink/40 transition";

  if (done) {
    return (
      <div className={`flex flex-col items-center justify-center text-center py-10 px-6 border border-gold/30 rounded bg-ink/40 backdrop-blur-sm ${className}`}>
        <CheckCircle2 className="w-12 h-12 text-gold mb-4" />
        <h3 className="font-display text-2xl font-bold text-cream">Message received</h3>
        <p className="font-serif-elegant italic text-cream/70 mt-2">
          Thanks {lastName ? `${lastName}, ` : ""}we'll reply within 24 hours.
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-6 text-xs font-display tracking-[0.3em] text-gold hover:text-gold-bright"
        >
          SEND ANOTHER →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`space-y-4 ${className}`}>
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          className={inputBase}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
        />
        <input
          className={inputBase}
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={255}
          required
        />
      </div>
      <textarea
        className={`${inputBase} min-h-[140px] resize-y`}
        placeholder="Tell us about your project — type of design, deadline, brand vibe..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={4000}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.3em] text-sm font-bold rounded hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        SEND MESSAGE
      </button>
    </form>
  );
};
