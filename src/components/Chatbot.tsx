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
  const [isLoading, setIsLoading] = useState(false);
  const [savedRecommendation, setSavedRecommendation] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-chat", handleOpen);
    return () => window.removeEventListener("open-chat", handleOpen);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      setIsOpen(true);
      const d = e.detail;
      setSavedRecommendation(d);
      setMessages(prev => [
        ...prev,
        { role: "user", content: `Hi Nova! I'm ${d.name}. My business is ${d.businessType} and I need ${d.posterSize}.` },
        { 
          role: "assistant", 
          content: `Thanks ${d.name}! Based on your needs, I've tailored a recommendation for you. Our team will also receive this directly.`,
          card: { title: d.recommendedPlan, posters: d.postersCount, price: d.totalPrice, highlight: "Recommended for you" },
          quickReplies: ["Connect on WhatsApp"]
        }
      ]);
    };
    window.addEventListener("nova-recommendation", handler);
    return () => window.removeEventListener("nova-recommendation", handler);
  }, []);

  const handleSend = async (userMsgText: string) => {
    if (!userMsgText.trim() || isLoading) return;

    const newUserMsg: Message = { role: "user", content: userMsgText };
    setMessages(prev => prev.map(m => ({ ...m, quickReplies: [] }))); // remove quick replies
    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_OPENROUTER_BASE_URL + "/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Creativenode AI",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_OPENROUTER_MODEL,
          messages: [
            {
              role: "system",
              content: `You are Nova, the AI assistant for Creativenode, a premium design agency. 
              Be professional, creative, and luxury-focused. 
              Our services: 
              1. Basic Package (₹1,999): 5 Posters/Week, premium layouts.
              2. Standard Package (₹3,999): 24 Posters/Month, unlimited revisions, + Free Festival Poster.
              3. Pro Package (₹9,999): 24 Posters/Month, 3D elements, ultra HD, Source files.
              
              ${savedRecommendation ? `The user has a current recommendation: 
              - Name: ${savedRecommendation.name}
              - Business: ${savedRecommendation.businessType}
              - Need: ${savedRecommendation.posterSize}
              - Recommended Plan: ${savedRecommendation.recommendedPlan}
              - Price: ${savedRecommendation.totalPrice}` : ""}

              Always encourage users to connect on WhatsApp for final details. 
              Keep responses concise and helpful. 
              If the user mentions a business type, give creative design suggestions.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsgText }
          ]
        })
      });

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid API response structure from OpenRouter/OpenAI");
      }
      if (data.choices[0].message.refusal) {
        throw new Error(`OpenAI model request refused: ${data.choices[0].message.refusal}`);
      }
      const aiResponse = data.choices[0].message.content || "I couldn't generate a response.";
      
      let quickReplies: string[] = [];
      if (aiResponse.toLowerCase().includes("whatsapp") || aiResponse.toLowerCase().includes("connect")) {
        quickReplies = ["Connect on WhatsApp"];
      } else if (aiResponse.toLowerCase().includes("package") || aiResponse.toLowerCase().includes("price")) {
        quickReplies = ["Basic Design", "Standard Design", "Professional Design"];
      }

      setMessages(prev => [...prev, { role: "assistant", content: aiResponse, quickReplies }]);
    } catch (error) {
      console.error("OpenRouter Error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having a little trouble connecting right now. Please try again or reach out to us on WhatsApp!" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/916369278905?text=Hi%20Creativenode!%20I%20chatted%20with%20Nova%20and%20I'm%20interested%20in%20starting%20a%20project.", "_blank");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 md:bottom-6 md:right-6 z-[40] w-14 h-14 bg-gradient-to-tr from-gold-deep to-gold-bright rounded-full shadow-[0_10px_40px_-10px_hsl(42_65%_50%)] flex items-center justify-center text-ink hover:scale-110 transition-transform ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <div className={`fixed bottom-24 right-6 md:bottom-6 md:right-6 z-[60] w-[calc(100vw-48px)] max-w-[350px] h-[550px] max-h-[calc(100vh-140px)] bg-ink/95 backdrop-blur-xl border border-gold/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"}`}>
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
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center animate-pulse">
                <Bot className="w-3 h-3 text-gold" />
              </div>
              <div className="bg-ink-soft border border-gold/15 p-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-gold/50 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
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
