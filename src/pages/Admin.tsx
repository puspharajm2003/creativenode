import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  LogOut, Upload, Trash2, Loader2, Plus, ImagePlus, ExternalLink,
  Eye, EyeOff, GripVertical, MessageSquare, Receipt, LayoutGrid, Activity,
  X, Link as LinkIcon, Instagram, Palette, Type, AlignLeft, Phone, CheckCircle2,
  Globe, Pencil, Monitor, Maximize2, Minimize2
} from "lucide-react";
import { toast } from "sonner";
import { Billing } from "@/components/admin/Billing";
import { Analytics } from "@/components/admin/Analytics";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Client { 
  id: string; 
  name: string; 
  slug: string; 
  tagline: string | null; 
  accent: string | null; 
  instagram_url: string | null;
  custom_link_url: string | null;
  custom_link_text: string | null;
}
interface Poster {
  id: string; client_id: string; title: string | null;
  image_path: string; sort_order: number; approved: boolean;
}
interface WebsiteEntry extends Poster {
  website_url?: string | null;
}
interface ContactMessage {
  id: string; name: string; email: string; message: string;
  created_at: string; read: boolean;
}

const PUBLIC_URL = (path: string) =>
  supabase.storage.from("client-posters").getPublicUrl(path).data.publicUrl;

const PUBLIC_URL_WEBSITES = (path: string) =>
  supabase.storage.from("client-websites").getPublicUrl(path).data.publicUrl;

const Admin = () => {
  const { user, signOut } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [websites, setWebsites] = useState<WebsiteEntry[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [activeWebsiteClientId, setActiveWebsiteClientId] = useState<string>("");
  const [tab, setTab] = useState<"analytics" | "clients" | "websites" | "messages" | "billing">("analytics");
  const [uploading, setUploading] = useState(false);
  const [uploadingWebsite, setUploadingWebsite] = useState(false);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);
  const websiteFileRef = useRef<HTMLInputElement>(null);
  /* Apple-style website popup */
  const [popupWebsite, setPopupWebsite] = useState<WebsiteEntry | null>(null);
  const [popupAnimating, setPopupAnimating] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  /* Website URL input state */
  const [websiteUrlInput, setWebsiteUrlInput] = useState("");

  const active = clients.find((c) => c.id === activeId);
  const activePosters = posters.filter((p) => p.client_id === activeId);
  const activeWebClient = clients.find((c) => c.id === activeWebsiteClientId);
  const activeWebsiteItems = websites.filter((w) => w.client_id === activeWebsiteClientId);

  /* Apple-style popup open/close */
  const openPopup = (w: WebsiteEntry) => {
    setPopupWebsite(w);
    setPopupVisible(true);
    requestAnimationFrame(() => setPopupAnimating(true));
  };
  const closePopup = () => {
    setPopupAnimating(false);
    setTimeout(() => { setPopupVisible(false); setPopupWebsite(null); }, 500);
  };

  /* Save website URL */
  const saveWebsiteUrl = async (w: WebsiteEntry, url: string) => {
    const { error } = await supabase.from("client_websites").update({ website_url: url } as any).eq("id", w.id);
    if (error) return toast.error(error.message);
    toast.success("URL saved");
    setWebsites(prev => prev.map(x => x.id === w.id ? { ...x, website_url: url } : x));
  };

  /* Edit website title */
  const editWebsiteTitle = async (w: WebsiteEntry, title: string) => {
    const { error } = await supabase.from("client_websites").update({ title }).eq("id", w.id);
    if (error) return toast.error(error.message);
    toast.success("Title updated");
    setWebsites(prev => prev.map(x => x.id === w.id ? { ...x, title } : x));
  };
  const unreadCount = messages.filter((m) => !m.read).length;

  /* Toggle ALL website entries for a client between approved/hidden */
  const toggleClientWebsiteVisibility = async (clientId: string) => {
    const clientWebsites = websites.filter(w => w.client_id === clientId);
    if (!clientWebsites.length) {
      toast.error("No website entries to toggle");
      return;
    }
    // If any are approved, hide all. If all hidden, show all.
    const anyApproved = clientWebsites.some(w => w.approved);
    const newStatus = !anyApproved;

    const updates = clientWebsites.map(w =>
      supabase.from("client_websites").update({ approved: newStatus }).eq("id", w.id)
    );
    const results = await Promise.all(updates);
    if (results.some(r => r.error)) {
      toast.error("Could not update visibility");
      return;
    }
    setWebsites(prev => prev.map(w =>
      w.client_id === clientId ? { ...w, approved: newStatus } : w
    ));
    toast.success(newStatus ? `${clients.find(c => c.id === clientId)?.name} is now visible` : `${clients.find(c => c.id === clientId)?.name} is now hidden`);
  };

  const load = async () => {
    const [{ data: c }, { data: p }, { data: w }, { data: m }] = await Promise.all([
      supabase.from("clients").select("*").order("sort_order"),
      supabase.from("client_posters").select("*").order("sort_order"),
      supabase.from("client_websites").select("*").order("sort_order"),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    ]);
    setClients(c ?? []);
    setPosters((p ?? []) as Poster[]);
    setWebsites((w ?? []) as WebsiteEntry[]);
    setMessages(m ?? []);
    if (!activeId && c && c.length) setActiveId(c[0].id);
    if (!activeWebsiteClientId && c && c.length) setActiveWebsiteClientId(c[0].id);
  };
  useEffect(() => { load(); }, []);

  const onUpload = async (files: FileList | null) => {
    if (!files || !active) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "png";
        const path = `${active.slug}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("client-posters").upload(path, file, {
          cacheControl: "3600", upsert: false,
        });
        if (upErr) throw upErr;
        const max = activePosters.reduce((m, p) => Math.max(m, p.sort_order), 0);
        const { error: insErr } = await supabase.from("client_posters").insert({
          client_id: active.id, image_path: path,
          title: file.name.replace(/\.[^.]+$/, ""), sort_order: max + 1,
        });
        if (insErr) throw insErr;
      }
      toast.success("Uploaded — awaiting approval");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const deletePoster = async (p: Poster) => {
    if (!confirm("Delete this poster?")) return;
    await supabase.storage.from("client-posters").remove([p.image_path]);
    await supabase.from("client_posters").delete().eq("id", p.id);
    toast.success("Deleted");
    load();
  };

  const toggleApprove = async (p: Poster) => {
    const { error } = await supabase
      .from("client_posters")
      .update({ approved: !p.approved })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(p.approved ? "Hidden from showcase" : "Approved & live");
    setPosters((prev) => prev.map((x) => x.id === p.id ? { ...x, approved: !p.approved } : x));
  };

  const saveClient = async (data: Partial<Client>) => {
    if (!data.name) return;
    const slug = data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) return;
    
    const payload = {
      name: data.name,
      tagline: data.tagline,
      accent: data.accent,
      instagram_url: data.instagram_url,
      custom_link_text: data.custom_link_text,
      custom_link_url: data.custom_link_url,
      slug,
    };

    if (clientToEdit) {
      const { error } = await supabase.from("clients").update(payload).eq("id", clientToEdit.id);
      if (error) toast.error(error.message);
      else { toast.success("Client updated"); setClientDialogOpen(false); load(); }
    } else {
      const max = clients.reduce((m, c: any) => Math.max(m, c.sort_order ?? 0), 0);
      const { error } = await supabase.from("clients").insert({ ...payload, sort_order: max + 1 });
      if (error) toast.error(error.message);
      else { toast.success("Client added"); setClientDialogOpen(false); load(); }
    }
  };

  const deleteClient = async (c: Client) => {
    if (!confirm(`Are you sure you want to delete ${c.name}? All associated posters will be deleted.`)) return;
    const { error } = await supabase.from("clients").delete().eq("id", c.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Client deleted");
      if (activeId === c.id) setActiveId("");
      load();
    }
  };

  // dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const ids = activePosters.map((p) => p.id);
    const oldIdx = ids.indexOf(a.id as string);
    const newIdx = ids.indexOf(over.id as string);
    const reordered = arrayMove(activePosters, oldIdx, newIdx);
    // optimistic
    const reorderedById = new Map(reordered.map((p, i) => [p.id, i + 1]));
    setPosters((prev) =>
      prev.map((p) => reorderedById.has(p.id) ? { ...p, sort_order: reorderedById.get(p.id)! } : p)
    );
    // persist
    const updates = reordered.map((p, i) =>
      supabase.from("client_posters").update({ sort_order: i + 1 }).eq("id", p.id)
    );
    const results = await Promise.all(updates);
    if (results.some((r) => r.error)) toast.error("Could not save order");
  };

  /* ── Website management ── */
  const onUploadWebsite = async (files: FileList | null) => {
    if (!files || !activeWebClient) return;
    setUploadingWebsite(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "png";
        const path = `${activeWebClient.slug}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("client-websites").upload(path, file, {
          cacheControl: "3600", upsert: false,
        });
        if (upErr) throw upErr;
        const max = activeWebsiteItems.reduce((m, w) => Math.max(m, w.sort_order), 0);
        const { error: insErr } = await supabase.from("client_websites").insert({
          client_id: activeWebClient.id, image_path: path,
          title: file.name.replace(/\.[^.]+$/, ""), sort_order: max + 1,
        });
        if (insErr) throw insErr;
      }
      toast.success("Website screenshot uploaded — awaiting approval");
      await load();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploadingWebsite(false);
      if (websiteFileRef.current) websiteFileRef.current.value = "";
    }
  };

  const deleteWebsite = async (w: Poster) => {
    if (!confirm("Delete this website screenshot?")) return;
    await supabase.storage.from("client-websites").remove([w.image_path]);
    await supabase.from("client_websites").delete().eq("id", w.id);
    toast.success("Deleted");
    load();
  };

  const toggleApproveWebsite = async (w: Poster) => {
    const { error } = await supabase
      .from("client_websites")
      .update({ approved: !w.approved })
      .eq("id", w.id);
    if (error) return toast.error(error.message);
    toast.success(w.approved ? "Hidden from showcase" : "Approved & live");
    setWebsites((prev) => prev.map((x) => x.id === w.id ? { ...x, approved: !w.approved } : x));
  };

  const onDragEndWebsite = async (e: DragEndEvent) => {
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const ids = activeWebsiteItems.map((w) => w.id);
    const oldIdx = ids.indexOf(a.id as string);
    const newIdx = ids.indexOf(over.id as string);
    const reordered = arrayMove(activeWebsiteItems, oldIdx, newIdx);
    const reorderedById = new Map(reordered.map((w, i) => [w.id, i + 1]));
    setWebsites((prev) =>
      prev.map((w) => reorderedById.has(w.id) ? { ...w, sort_order: reorderedById.get(w.id)! } : w)
    );
    const updates = reordered.map((w, i) =>
      supabase.from("client_websites").update({ sort_order: i + 1 }).eq("id", w.id)
    );
    const results = await Promise.all(updates);
    if (results.some((r) => r.error)) toast.error("Could not save order");
  };

  const markRead = async (m: ContactMessage) => {
    await supabase.from("contact_messages").update({ read: !m.read }).eq("id", m.id);
    setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, read: !m.read } : x));
  };
  const deleteMessage = async (m: ContactMessage) => {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", m.id);
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
  };

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="h-16 border-b border-gold/15 bg-ink-soft/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rotate-45 bg-gold" />
          <span className="font-display tracking-[0.4em] text-gold text-sm">CREATIVENODE · CRM</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/clients" className="text-sm font-serif-elegant italic text-cream/70 hover:text-gold flex items-center gap-1">
            View Showcase <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <span className="text-xs text-cream/50">{user?.email}</span>
          <button onClick={signOut} className="flex items-center gap-2 px-3 py-1.5 text-xs font-display tracking-wider text-cream/80 hover:text-gold border border-gold/30 rounded">
            <LogOut className="w-3.5 h-3.5" /> SIGN OUT
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gold/15 bg-ink-soft/40 px-6 flex gap-2">
        {(["analytics", "clients", "websites", "messages", "billing"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-xs font-display tracking-[0.3em] border-b-2 transition flex items-center gap-2 ${
              tab === t ? "border-gold text-gold" : "border-transparent text-cream/60 hover:text-cream"
            }`}
          >
            {t === "analytics" && <Activity className="w-3.5 h-3.5" />}
            {t === "messages" && <MessageSquare className="w-3.5 h-3.5" />}
            {t === "billing" && <Receipt className="w-3.5 h-3.5" />}
            {t === "websites" && <LayoutGrid className="w-3.5 h-3.5" />}
            {t.toUpperCase()}
            {t === "messages" && unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-gold text-ink rounded-full font-bold">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "analytics" ? (
        <Analytics />
      ) : tab === "billing" ? (
        <Billing />
      ) : tab === "clients" ? (
        <div className="flex min-h-[calc(100vh-7rem)]">
          <aside className="w-72 border-r border-gold/15 bg-ink-soft/40 p-4 space-y-2 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display tracking-[0.3em] text-gold/80 text-xs">CLIENTS</span>
              <button onClick={() => { setClientToEdit(undefined); setClientDialogOpen(true); }} className="w-7 h-7 rounded border border-gold/30 hover:border-gold hover:text-gold flex items-center justify-center text-cream/70">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-3 py-3 rounded border transition ${
                  activeId === c.id ? "border-gold bg-gold/10" : "border-gold/15 hover:border-gold/40"
                }`}
              >
                <div className="font-display text-cream">{c.name}</div>
                <div className="text-xs font-serif-elegant italic text-cream/50 truncate">{c.tagline}</div>
              </button>
            ))}
          </aside>

          <main className="flex-1 p-8">
            {active && (
              <>
                <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                  <div>
                    <div className="text-xs font-display tracking-[0.4em] text-gold/70 mb-1">
                      {activePosters.length} POSTERS · {activePosters.filter(p => p.approved).length} LIVE · {activePosters.filter(p => !p.approved).length} PENDING
                    </div>
                    <div className="flex items-center gap-4">
                      <h1 className="font-display text-5xl font-bold">{active.name}</h1>
                      <div className="flex gap-2">
                        <button onClick={() => { setClientToEdit(active); setClientDialogOpen(true); }} className="px-3 py-1 text-xs border border-gold/40 text-gold hover:bg-gold/10 rounded font-display tracking-widest">
                          EDIT
                        </button>
                        <button onClick={() => deleteClient(active)} className="px-3 py-1 text-xs border border-destructive/40 text-destructive hover:bg-destructive/10 rounded font-display tracking-widest">
                          DELETE
                        </button>
                      </div>
                    </div>
                    <p className="font-serif-elegant italic text-cream/60 text-lg mt-1">{active.tagline}</p>
                    <p className="text-xs text-cream/40 mt-3 font-serif-elegant italic">
                      Drag posters to reorder · Click eye to approve / hide
                    </p>
                  </div>
                  <label className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.2em] text-sm font-bold rounded hover:opacity-90 transition">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    UPLOAD POSTER
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
                  </label>
                </div>

                {activePosters.length === 0 ? (
                  <div className="border border-dashed border-gold/30 rounded-lg p-20 text-center">
                    <ImagePlus className="w-10 h-10 text-gold/50 mx-auto mb-4" />
                    <p className="font-serif-elegant italic text-cream/60">No posters yet — upload the first one above.</p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={activePosters.map((p) => p.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {activePosters.map((p) => (
                          <SortablePoster key={p.id} poster={p} onDelete={deletePoster} onApprove={toggleApprove} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </>
            )}
          </main>
        </div>
      ) : tab === "websites" ? (
        <div className="flex min-h-[calc(100vh-7rem)]">
          <aside className="w-72 border-r border-gold/15 bg-ink-soft/40 p-4 space-y-2 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display tracking-[0.3em] text-gold/80 text-xs">CLIENTS</span>
              <button onClick={() => { setClientToEdit(undefined); setClientDialogOpen(true); }} className="w-7 h-7 rounded border border-gold/30 hover:border-gold hover:text-gold flex items-center justify-center text-cream/70">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {clients.map((c) => {
              const cWebsites = websites.filter(w => w.client_id === c.id);
              const isHidden = cWebsites.length > 0 && cWebsites.every(w => !w.approved);
              const hasEntries = cWebsites.length > 0;
              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-2 rounded border transition ${
                    activeWebsiteClientId === c.id ? "border-gold bg-gold/10" : "border-gold/15 hover:border-gold/40"
                  }`}
                >
                  <button
                    onClick={() => setActiveWebsiteClientId(c.id)}
                    className="flex-1 text-left px-3 py-3 min-w-0"
                  >
                    <div className={`font-display truncate ${isHidden ? 'text-cream/40 line-through' : 'text-cream'}`}>{c.name}</div>
                    <div className="text-xs font-serif-elegant italic text-cream/50 truncate flex items-center gap-1">
                      {c.tagline}
                      {hasEntries && (
                        <span className={`ml-auto shrink-0 text-[9px] font-display tracking-widest px-1.5 py-0.5 rounded-full border ${
                          isHidden
                            ? 'border-cream/20 text-cream/30 bg-cream/5'
                            : 'border-emerald-500/30 text-emerald-400/70 bg-emerald-500/5'
                        }`}>
                          {isHidden ? 'HIDDEN' : `${cWebsites.filter(w => w.approved).length} LIVE`}
                        </span>
                      )}
                    </div>
                  </button>
                  {hasEntries && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleClientWebsiteVisibility(c.id); }}
                      className={`shrink-0 w-8 h-8 mr-2 rounded-full border flex items-center justify-center transition ${
                        isHidden
                          ? 'border-cream/20 text-cream/30 hover:border-gold/40 hover:text-gold'
                          : 'border-gold/30 text-gold hover:bg-gold/10'
                      }`}
                      title={isHidden ? 'Show on public page' : 'Hide from public page'}
                    >
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              );
            })}
          </aside>

          <main className="flex-1 p-8">
            {activeWebClient && (
              <>
                <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                  <div>
                    <div className="text-xs font-display tracking-[0.4em] text-gold/70 mb-1">
                      {activeWebsiteItems.length} SCREENSHOTS · {activeWebsiteItems.filter(w => w.approved).length} LIVE · {activeWebsiteItems.filter(w => !w.approved).length} PENDING
                    </div>
                    <div className="flex items-center gap-4">
                      <h1 className="font-display text-5xl font-bold">{activeWebClient.name}</h1>
                      <div className="flex gap-2">
                        <button onClick={() => { setClientToEdit(activeWebClient); setClientDialogOpen(true); }} className="px-3 py-1 text-xs border border-gold/40 text-gold hover:bg-gold/10 rounded font-display tracking-widest">
                          EDIT
                        </button>
                        <button onClick={() => deleteClient(activeWebClient)} className="px-3 py-1 text-xs border border-destructive/40 text-destructive hover:bg-destructive/10 rounded font-display tracking-widest">
                          DELETE
                        </button>
                      </div>
                    </div>
                    <p className="font-serif-elegant italic text-cream/60 text-lg mt-1">{activeWebClient.tagline}</p>
                    <p className="text-xs text-cream/40 mt-3 font-serif-elegant italic">
                      Drag screenshots to reorder · Click eye to approve / hide · Add URL for live preview
                    </p>
                  </div>
                  <label className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gold-deep via-gold to-gold-bright text-ink font-display tracking-[0.2em] text-sm font-bold rounded hover:opacity-90 transition">
                    {uploadingWebsite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    UPLOAD SCREENSHOT
                    <input ref={websiteFileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onUploadWebsite(e.target.files)} />
                  </label>
                </div>

                {activeWebsiteItems.length === 0 ? (
                  <div className="border border-dashed border-gold/30 rounded-lg p-20 text-center">
                    <ImagePlus className="w-10 h-10 text-gold/50 mx-auto mb-4" />
                    <p className="font-serif-elegant italic text-cream/60">No website screenshots yet — upload the first one above.</p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndWebsite}>
                    <SortableContext items={activeWebsiteItems.map((w) => w.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activeWebsiteItems.map((w) => (
                          <SortableWebsiteCard key={w.id} entry={w} onDelete={deleteWebsite} onApprove={toggleApproveWebsite} onOpenPopup={openPopup} onSaveUrl={saveWebsiteUrl} onEditTitle={editWebsiteTitle} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </>
            )}
          </main>

          {/* ── Apple-style Website Popup ── */}
          {popupVisible && popupWebsite && (
            <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${popupAnimating ? 'bg-black/80 backdrop-blur-2xl' : 'bg-black/0 backdrop-blur-none'}`} onClick={closePopup}>
              <div
                onClick={e => e.stopPropagation()}
                className={`relative w-[95vw] max-w-7xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  popupAnimating
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-[0.85] translate-y-8'
                }`}
                style={{ perspective: '1200px' }}
              >
                {/* Browser chrome */}
                <div className="bg-[#1c1c1e] rounded-t-2xl border border-white/10 border-b-0">
                  <div className="flex items-center px-5 py-3.5 gap-3">
                    {/* Traffic lights */}
                    <div className="flex gap-2">
                      <button onClick={closePopup} className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] hover:brightness-110 transition group relative">
                        <X className="w-2 h-2 text-[#4a0002] absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition" />
                      </button>
                      <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e]" />
                      <div className="w-3.5 h-3.5 rounded-full bg-[#28c840]" />
                    </div>
                    {/* URL bar */}
                    <div className="flex-1 mx-4">
                      <div className="bg-black/40 rounded-lg px-4 py-2 flex items-center gap-2 border border-white/5 max-w-2xl mx-auto">
                        <Globe className="w-3.5 h-3.5 text-white/30 shrink-0" />
                        <span className="text-[13px] text-white/50 truncate font-mono">
                          {popupWebsite.website_url || PUBLIC_URL_WEBSITES(popupWebsite.image_path)}
                        </span>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2">
                      {popupWebsite.website_url && (
                        <a href={popupWebsite.website_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition" title="Open in new tab">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={closePopup} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Content area */}
                <div className="bg-white rounded-b-2xl overflow-hidden border border-white/10 border-t-0 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]" style={{ height: '80vh' }}>
                  {popupWebsite.website_url ? (
                    <iframe
                      src={popupWebsite.website_url}
                      className="w-full h-full border-0"
                      title={popupWebsite.title ?? 'Website Preview'}
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-ink">
                      <img src={PUBLIC_URL_WEBSITES(popupWebsite.image_path)} alt={popupWebsite.title ?? 'Website'} className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                </div>
                {/* Bottom info bar */}
                <div className={`mt-4 text-center transition-all duration-500 delay-200 ${
                  popupAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <div className="font-display text-white text-lg tracking-widest">{popupWebsite.title ?? 'Untitled'}</div>
                  <div className="text-white/40 text-xs font-serif-elegant italic mt-1">
                    {clients.find(c => c.id === popupWebsite.client_id)?.name}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <main className="p-8">
          <div className="mb-8">
            <div className="text-xs font-display tracking-[0.4em] text-gold/70 mb-1">
              {messages.length} TOTAL · {unreadCount} UNREAD · {messages.filter(m => m.message.includes('── WhatsApp Status ──')).length} WA LEADS
            </div>
            <h1 className="font-display text-5xl font-bold">Messages</h1>
            <p className="font-serif-elegant italic text-cream/60 text-lg mt-1">Contact form submissions from the landing page.</p>
          </div>
          {messages.length === 0 ? (
            <div className="border border-dashed border-gold/30 rounded-lg p-20 text-center">
              <MessageSquare className="w-10 h-10 text-gold/50 mx-auto mb-4" />
              <p className="font-serif-elegant italic text-cream/60">No messages yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-4xl">
              {messages.map((m) => {
                /* Parse WhatsApp tracking status from message body */
                const isWaLead = m.message.includes('── WhatsApp Status ──');
                const waStatusMatch = m.message.match(/Status: (\w+)/);
                const waStatus = waStatusMatch ? waStatusMatch[1] : null;
                const waTimeMatch = m.message.match(/Redirect initiated: (.+?)\n/);
                const waTime = waTimeMatch ? waTimeMatch[1] : null;
                /* Parse selected plan */
                const planMatch = m.message.match(/Selected Plan: (.+?)\n/);
                const planName = planMatch ? planMatch[1] : null;
                const priceMatch = m.message.match(/Total Price: (.+?)\n/);
                const totalPrice = priceMatch ? priceMatch[1] : null;

                return (
                  <div key={m.id} className={`p-5 rounded border transition ${m.read ? "border-gold/15 bg-ink-soft/30" : "border-gold/40 bg-gold/5"}`}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-display font-semibold text-cream">{m.name}</div>
                          <a href={`mailto:${m.email}`} className="text-xs text-gold hover:text-gold-bright">{m.email}</a>
                        </div>
                        {/* WhatsApp status badge */}
                        {isWaLead ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] font-display tracking-widest">
                            <Phone className="w-3 h-3" />
                            WA {waStatus ?? 'OPENED'}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold/60 text-[10px] font-display tracking-widest">
                            <MessageSquare className="w-3 h-3" />
                            FORM
                          </div>
                        )}
                        {/* Plan badge */}
                        {planName && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold text-[10px] font-display tracking-widest">
                            <CheckCircle2 className="w-3 h-3" />
                            {planName} {totalPrice && `· ${totalPrice}`}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xs text-cream/40 block">{new Date(m.created_at).toLocaleString()}</span>
                          {isWaLead && waTime && (
                            <span className="text-[10px] text-emerald-400/60 block">
                              WA redirect: {new Date(waTime).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <button onClick={() => markRead(m)} className="text-xs text-cream/60 hover:text-gold px-2 py-1 border border-gold/20 rounded">
                          {m.read ? "Mark unread" : "Mark read"}
                        </button>
                        <button onClick={() => deleteMessage(m)} className="w-8 h-8 rounded border border-destructive/40 text-destructive hover:bg-destructive/10 flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-cream/80 whitespace-pre-wrap font-serif-elegant text-lg leading-relaxed">{m.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {clientDialogOpen && (
        <ClientDialog 
          client={clientToEdit} 
          onClose={() => { setClientDialogOpen(false); setClientToEdit(undefined); }} 
          onSave={saveClient} 
        />
      )}
    </div>
  );
};

const SortablePoster = ({
  poster, onDelete, onApprove,
}: { poster: Poster; onDelete: (p: Poster) => void; onApprove: (p: Poster) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: poster.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="group relative poster-card aspect-[3/4]">
      <img src={PUBLIC_URL(poster.image_path)} alt={poster.title ?? "Poster"} className="w-full h-full object-cover" loading="lazy" />

      {/* Status badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`px-2 py-1 text-[10px] font-display tracking-widest rounded backdrop-blur-sm border ${
          poster.approved
            ? "bg-gold/20 border-gold/50 text-gold"
            : "bg-ink/70 border-cream/30 text-cream/70"
        }`}>
          {poster.approved ? "LIVE" : "PENDING"}
        </span>
      </div>

      {/* Drag handle */}
      <button
        {...attributes} {...listeners}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-ink/80 border border-gold/40 text-gold opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10 gap-2">
        <span className="font-serif-elegant italic text-cream text-sm truncate flex-1">{poster.title}</span>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => onApprove(poster)}
            className={`w-8 h-8 rounded-full bg-ink/80 border flex items-center justify-center ${
              poster.approved ? "border-gold/50 text-gold" : "border-cream/30 text-cream/70 hover:border-gold hover:text-gold"
            }`}
            title={poster.approved ? "Hide from showcase" : "Approve for showcase"}
          >
            {poster.approved ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onDelete(poster)} className="w-8 h-8 rounded-full bg-ink/80 border border-destructive/40 text-destructive flex items-center justify-center">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SortableWebsiteCard = ({
  entry, onDelete, onApprove, onOpenPopup, onSaveUrl, onEditTitle,
}: {
  entry: WebsiteEntry;
  onDelete: (p: Poster) => void;
  onApprove: (p: Poster) => void;
  onOpenPopup: (w: WebsiteEntry) => void;
  onSaveUrl: (w: WebsiteEntry, url: string) => void;
  onEditTitle: (w: WebsiteEntry, title: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState(entry.website_url ?? "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(entry.title ?? "");

  return (
    <div ref={setNodeRef} style={style} className="group relative rounded-xl border border-gold/15 bg-ink-soft/40 overflow-hidden hover:border-gold/40 transition-colors">
      {/* Screenshot / iframe preview */}
      <div className="relative aspect-video cursor-pointer" onClick={() => onOpenPopup(entry)}>
        {entry.website_url ? (
          <div className="w-full h-full relative overflow-hidden">
            <iframe
              src={entry.website_url}
              className="w-[200%] h-[200%] border-0 pointer-events-none origin-top-left"
              style={{ transform: 'scale(0.5)' }}
              title={entry.title ?? 'Preview'}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
            />
            <div className="absolute inset-0 bg-transparent hover:bg-ink/10 transition" />
          </div>
        ) : (
          <img src={PUBLIC_URL_WEBSITES(entry.image_path)} alt={entry.title ?? "Website"} className="w-full h-full object-cover" loading="lazy" />
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-xs font-display tracking-widest">
            <Monitor className="w-3.5 h-3.5" /> OPEN PREVIEW
          </div>
        </div>
        {/* Status badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-2 py-1 text-[10px] font-display tracking-widest rounded backdrop-blur-sm border ${
            entry.approved ? "bg-gold/20 border-gold/50 text-gold" : "bg-ink/70 border-cream/30 text-cream/70"
          }`}>
            {entry.approved ? "LIVE" : "PENDING"}
          </span>
        </div>
        {/* Drag handle */}
        <button
          {...attributes} {...listeners}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-ink/80 border border-gold/40 text-gold opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info section */}
      <div className="p-4 space-y-3">
        {/* Editable title */}
        <div className="flex items-center gap-2">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={() => { onEditTitle(entry, titleDraft); setEditingTitle(false); }}
              onKeyDown={e => { if (e.key === 'Enter') { onEditTitle(entry, titleDraft); setEditingTitle(false); } }}
              className="flex-1 bg-black/20 border border-gold/20 rounded px-2 py-1 text-sm text-cream outline-none focus:border-gold/50"
            />
          ) : (
            <span className="flex-1 font-display text-cream text-sm truncate">{entry.title || 'Untitled'}</span>
          )}
          <button onClick={() => { setTitleDraft(entry.title ?? ""); setEditingTitle(!editingTitle); }} className="p-1 text-cream/40 hover:text-gold transition">
            <Pencil className="w-3 h-3" />
          </button>
        </div>

        {/* URL input */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 bg-black/20 border border-gold/10 rounded-lg px-3 py-2 focus-within:border-gold/40 transition">
            <Globe className="w-3 h-3 text-gold/40 shrink-0" />
            {editingUrl ? (
              <input
                autoFocus
                value={urlDraft}
                onChange={e => setUrlDraft(e.target.value)}
                onBlur={() => { onSaveUrl(entry, urlDraft); setEditingUrl(false); }}
                onKeyDown={e => { if (e.key === 'Enter') { onSaveUrl(entry, urlDraft); setEditingUrl(false); } }}
                placeholder="https://example.com"
                className="flex-1 bg-transparent text-xs text-cream/70 outline-none placeholder:text-cream/20 font-mono"
              />
            ) : (
              <span
                onClick={() => { setUrlDraft(entry.website_url ?? ""); setEditingUrl(true); }}
                className="flex-1 text-xs text-cream/50 truncate cursor-text font-mono"
              >
                {entry.website_url || 'Click to add URL...'}
              </span>
            )}
          </div>
          {entry.website_url && (
            <a href={entry.website_url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-cream/40 hover:text-gold transition" title="Open in browser">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between pt-1 border-t border-gold/10">
          <button
            onClick={() => onApprove(entry)}
            className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-display tracking-widest rounded transition ${
              entry.approved ? "text-gold hover:text-cream" : "text-cream/50 hover:text-gold"
            }`}
          >
            {entry.approved ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {entry.approved ? 'VISIBLE' : 'HIDDEN'}
          </button>
          <div className="flex gap-1">
            <button onClick={() => onOpenPopup(entry)} className="p-1.5 text-cream/40 hover:text-gold transition" title="Preview">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(entry)} className="p-1.5 text-cream/40 hover:text-destructive transition" title="Delete">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientDialog = ({ client, onClose, onSave }: { client?: Client; onClose: () => void; onSave: (data: Partial<Client>) => void }) => {
  const [name, setName] = useState(client?.name ?? "");
  const [tagline, setTagline] = useState(client?.tagline ?? "");
  const [accent, setAccent] = useState(client?.accent ?? "#D4AF37");
  const [instagramUrl, setInstagramUrl] = useState(client?.instagram_url ?? "");
  const [customLinkText, setCustomLinkText] = useState(client?.custom_link_text ?? "");
  const [customLinkUrl, setCustomLinkUrl] = useState(client?.custom_link_url ?? "");

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="relative bg-gradient-to-b from-ink-soft to-ink border border-gold/20 rounded-2xl p-8 w-full max-w-2xl shadow-[0_0_50px_rgba(212,175,55,0.05)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="font-display text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#D4AF37] to-[#B45309]">
              {client ? 'Edit Client Profile' : 'New Client Profile'}
            </h2>
            <p className="font-serif-elegant italic text-cream/50 mt-1">
              {client ? 'Refine the brand details and showcase links.' : 'Initialize a new brand in the showcase.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-cream/50 hover:text-gold transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8 relative z-10">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-display tracking-[0.3em] text-gold/70 border-b border-gold/10 pb-2">BRAND IDENTITY</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-display tracking-widest text-cream/50 uppercase flex items-center gap-1.5"><Type className="w-3 h-3"/> Brand Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Creativenode" className="w-full bg-black/20 border border-gold/10 rounded-lg px-4 py-3 text-sm text-cream placeholder:text-cream/20 outline-none focus:border-gold/50 focus:bg-black/40 transition-all shadow-inner" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-display tracking-widest text-cream/50 uppercase flex items-center gap-1.5"><Palette className="w-3 h-3"/> Accent Color</label>
                <div className="flex items-center gap-3 bg-black/20 border border-gold/10 rounded-lg p-2 focus-within:border-gold/50 focus-within:bg-black/40 transition-all shadow-inner h-[46px]">
                  <div className="relative w-8 h-8 rounded-md overflow-hidden shrink-0 border border-white/10 shadow-sm cursor-pointer">
                    <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0" />
                    <div className="w-full h-full pointer-events-none" style={{ backgroundColor: accent }} />
                  </div>
                  <span className="font-mono text-sm text-cream/70 uppercase tracking-wider">{accent}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-display tracking-widest text-cream/50 uppercase flex items-center gap-1.5"><AlignLeft className="w-3 h-3"/> Tagline</label>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Forging digital experiences" className="w-full bg-black/20 border border-gold/10 rounded-lg px-4 py-3 text-sm text-cream placeholder:text-cream/20 outline-none focus:border-gold/50 focus:bg-black/40 transition-all shadow-inner" />
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-display tracking-[0.3em] text-gold/70 border-b border-gold/10 pb-2">EXTERNAL LINKS</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-display tracking-widest text-cream/50 uppercase flex items-center gap-1.5"><Instagram className="w-3 h-3"/> Instagram URL</label>
                <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." className="w-full bg-black/20 border border-gold/10 rounded-lg px-4 py-3 text-sm text-cream placeholder:text-cream/20 outline-none focus:border-gold/50 focus:bg-black/40 transition-all shadow-inner" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-display tracking-widest text-cream/50 uppercase flex items-center gap-1.5"><Type className="w-3 h-3"/> Custom Link Label</label>
                  <input value={customLinkText} onChange={(e) => setCustomLinkText(e.target.value)} placeholder="e.g. View Website" className="w-full bg-black/20 border border-gold/10 rounded-lg px-4 py-3 text-sm text-cream placeholder:text-cream/20 outline-none focus:border-gold/50 focus:bg-black/40 transition-all shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-display tracking-widest text-cream/50 uppercase flex items-center gap-1.5"><LinkIcon className="w-3 h-3"/> Custom Link URL</label>
                  <input value={customLinkUrl} onChange={(e) => setCustomLinkUrl(e.target.value)} placeholder="https://..." className="w-full bg-black/20 border border-gold/10 rounded-lg px-4 py-3 text-sm text-cream placeholder:text-cream/20 outline-none focus:border-gold/50 focus:bg-black/40 transition-all shadow-inner" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gold/10">
            <button onClick={onClose} className="px-6 py-3 border border-gold/20 rounded-lg text-cream/70 hover:text-cream hover:bg-white/5 transition-colors font-display tracking-widest text-xs">
              CANCEL
            </button>
            <button 
              onClick={() => onSave({ name, tagline, accent, instagram_url: instagramUrl, custom_link_text: customLinkText, custom_link_url: customLinkUrl })} 
              disabled={!name.trim()} 
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#B45309] via-[#D4AF37] to-[#FDE68A] text-ink font-display tracking-[0.2em] text-xs font-bold rounded-lg disabled:opacity-50 hover:opacity-90 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {client ? 'SAVE CHANGES' : 'CREATE CLIENT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
