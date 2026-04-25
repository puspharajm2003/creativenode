import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Phone, CheckCircle2 } from "lucide-react";

type Message = { role: "assistant" | "user"; content: string; card?: any; quickReplies?: string[] };

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hi! I'm Nova, the Creativenode AI. How can I help you today? Would you like to see our design packages?",
      quickReplies: ["Show me the packages", "I have a custom request"]
    }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = (userMsgText: string) => {
    if (!userMsgText.trim()) return;

    setMessages(prev => prev.map(m => ({ ...m, quickReplies: [] }))); // remove quick replies
    setMessages(prev => [...prev, { role: "user", content: userMsgText }]);
    setInput("");

    setTimeout(() => {
      let aiResponse = "";
      let card: any = null;
      let quickReplies: string[] = [];
      const lower = userMsgText.toLowerCase();

      if (lower.includes("package") || lower.includes("price") || lower.includes("cost") || lower.includes("show me")) {
        aiResponse = "We have three main tiers depending on the quality and volume you need. Which design quality are you looking for?";
        quickReplies = ["Basic Design", "Standard Design", "Professional Design"];
      } else if (lower.includes("basic")) {
        aiResponse = "Our Basic Plan is great for simple, high-quality layouts.";
        card = { title: "Basic Package", posters: "5 Posters / Week", price: "₹1,999" };
        quickReplies = ["Let's start!", "What about Standard?"];
      } else if (lower.includes("standard")) {
        aiResponse = "The Standard Plan gives you premium layouts with unlimited revisions.";
        card = { title: "Standard Package", posters: "24 Posters / Month", price: "₹3,999", highlight: "+ Free Festival Poster" };
        quickReplies = ["I want the Standard plan", "What about Professional?"];
      } else if (lower.includes("professional") || lower.includes("pro")) {
        aiResponse = "Professional Design includes 3D elements, ultra HD, and full source files.";
        card = { title: "Pro Package", posters: "24 Posters / Month", price: "₹9,999", highlight: "Full Source Files" };
        quickReplies = ["Let's do Professional", "Actually, Standard is fine"];
      } else if (lower.includes("start") || lower.includes("want") || lower.includes("yes") || lower.includes("hire") || lower.includes("fine")) {
        aiResponse = "Perfect! Let's get your project started. Reach out to our human team on WhatsApp to finalize the details.";
      } else {
        aiResponse = "Thanks for your message! To get accurate details, please message our team on WhatsApp.";
      }

      setMessages(prev => [...prev, { role: "assistant", content: aiResponse, card, quickReplies }]);
    }, 600);
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/916369278905?text=Hi%20Creativenode!%20I%20chatted%20with%20Nova%20and%20I'm%20interested%20in%20starting%20a%20project.", "_blank");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-tr from-gold-deep to-gold-bright rounded-full shadow-[0_10px_40px_-10px_hsl(42_65%_50%)] flex items-center justify-center text-ink hover:scale-110 transition-transform ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <div className={`fixed bottom-6 right-6 z-50 w-[350px] h-[550px] bg-ink/95 backdrop-blur-xl border border-gold/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-ink to-ink-soft border-b border-gold/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
              <Bot className="w-4 h-4 text-gold" />
            </div>
            <div>
              <h3 className="font-display font-bold text-cream text-sm">Nova</h3>
              <p className="text-[10px] text-green-400 font-display tracking-wider">AI ASSISTANT</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-cream/50 hover:text-gold transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className="space-y-2">
              <div className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-1 ${msg.role === "user" ? "bg-cream/10" : "bg-gold/10 border border-gold/30"}`}>
                  {msg.role === "user" ? <User className="w-3 h-3 text-cream/70" /> : <Bot className="w-3 h-3 text-gold" />}
                </div>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.role === "user" ? "bg-cream/10 text-cream rounded-tr-none" : "bg-ink-soft border border-gold/15 text-cream/90 rounded-tl-none"}`}>
                  <p>{msg.content}</p>
                  
                  {msg.card && (
                    <div className="mt-3 bg-ink border border-gold/20 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gold/10 blur-xl" />
                      <h4 className="font-display text-gold text-xs tracking-widest mb-2 uppercase">{msg.card.title}</h4>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-cream font-bold text-lg">{msg.card.price}</div>
                          <div className="text-cream/50 text-[10px] uppercase font-display tracking-wider">{msg.card.posters}</div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-gold/50" />
                      </div>
                      {msg.card.highlight && (
                        <div className="mt-2 text-[10px] text-gold-bright font-display tracking-wider">{msg.card.highlight}</div>
                      )}
                    </div>
                  )}

                  {msg.role === "assistant" && i === messages.length - 1 && msg.content.includes("WhatsApp") && (
                    <button onClick={handleWhatsApp} className="mt-3 w-full py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg flex items-center justify-center gap-2 font-display tracking-widest text-[10px] transition">
                      <Phone className="w-3 h-3" /> CONNECT ON WHATSAPP
                    </button>
                  )}
                </div>
              </div>

              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-9">
                  {msg.quickReplies.map((qr) => (
                    <button 
                      key={qr} 
                      onClick={() => handleSend(qr)}
                      className="px-3 py-1.5 bg-ink border border-gold/30 rounded-full text-[11px] text-cream/80 hover:bg-gold/10 hover:text-gold hover:border-gold transition font-display"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-4 bg-ink-soft/50 border-t border-gold/20 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-ink border border-gold/20 rounded-full px-4 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold outline-none transition"
          />
          <button type="submit" disabled={!input.trim()} className="w-10 h-10 shrink-0 bg-gold text-ink rounded-full flex items-center justify-center disabled:opacity-50 transition">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </>
  );
};
