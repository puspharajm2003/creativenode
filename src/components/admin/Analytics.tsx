import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Users, Eye, ArrowUpRight, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageView {
  id: string;
  created_at: string;
  path: string;
  session_id: string;
  user_agent: string;
  referrer: string;
}

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState<PageView[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        setViews(data);
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  const uniqueVisitors = new Set(views.map(v => v.session_id)).size;
  const totalViews = views.length;
  
  // Calculate today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysViews = views.filter(v => new Date(v.created_at) >= today);
  const todaysUniqueVisitors = new Set(todaysViews.map(v => v.session_id)).size;

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-5xl font-bold flex items-center gap-4">
          Analytics
        </h1>
        <p className="font-serif-elegant italic text-cream/60 text-lg mt-1">
          Monitor your website traffic and visitor engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="bg-ink-soft/40 border-gold/15 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-display tracking-widest text-gold">Total Views</CardTitle>
            <Eye className="w-4 h-4 text-gold/50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cream">{totalViews}</div>
            <p className="text-xs text-cream/40 mt-1 font-serif-elegant italic flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              {todaysViews.length} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-ink-soft/40 border-gold/15 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-display tracking-widest text-gold">Unique Visitors</CardTitle>
            <Users className="w-4 h-4 text-gold/50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cream">{uniqueVisitors}</div>
            <p className="text-xs text-cream/40 mt-1 font-serif-elegant italic flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              {todaysUniqueVisitors} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-ink-soft/40 border-gold/15 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-display tracking-widest text-gold">Live Now</CardTitle>
            <Activity className="w-4 h-4 text-gold/50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cream">
              {/* very simple live approx: seen within last 5 minutes */}
              {new Set(views.filter(v => new Date().getTime() - new Date(v.created_at).getTime() < 5 * 60 * 1000).map(v => v.session_id)).size}
            </div>
            <p className="text-xs text-cream/40 mt-1 font-serif-elegant italic">
              active in last 5m
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-display font-semibold mb-4 text-gold/80">Recent Traffic</h2>
      <div className="bg-ink-soft/20 border border-gold/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-cream/50 uppercase bg-ink-soft/40 border-b border-gold/10">
            <tr>
              <th className="px-6 py-4 font-display tracking-widest">Time</th>
              <th className="px-6 py-4 font-display tracking-widest">Path</th>
              <th className="px-6 py-4 font-display tracking-widest hidden md:table-cell">Referrer</th>
              <th className="px-6 py-4 font-display tracking-widest hidden lg:table-cell">Device/Browser</th>
            </tr>
          </thead>
          <tbody>
            {views.slice(0, 15).map((view) => (
              <tr key={view.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                <td className="px-6 py-4 text-cream/80 whitespace-nowrap">
                  {new Date(view.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 font-mono text-gold/90">
                  {view.path}
                </td>
                <td className="px-6 py-4 text-cream/60 hidden md:table-cell truncate max-w-[200px]" title={view.referrer}>
                  {view.referrer}
                </td>
                <td className="px-6 py-4 text-cream/40 hidden lg:table-cell text-xs max-w-[300px] truncate" title={view.user_agent}>
                  {view.user_agent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};
