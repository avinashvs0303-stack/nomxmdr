import { useState, useEffect } from 'react';
import {
  Newspaper,
  RefreshCcw,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { NewsArticle } from '../types';

export default function SecurityNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH INITIAL DATA ----------------
  const fetchNews = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('security_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) {
      setNews(data);
    }

    setLoading(false);
  };

  // ---------------- REALTIME SUBSCRIPTION ----------------
  useEffect(() => {
    fetchNews();

    const channel = supabase
      .channel('security-news-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_news',
        },
        (payload) => {
          setNews((prev) => {
            const updated = [
              payload.new as NewsArticle,
              ...prev,
            ];

            return updated
              .sort(
                (a, b) =>
                  new Date(b.created_at!).getTime() -
                  new Date(a.created_at!).getTime()
              )
              .slice(0, 30);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ---------------- UI HELPERS ----------------
  const getSeverityStyles = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/5';
      case 'high':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-orange-500/5';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 shadow-yellow-500/5';
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/5';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <ShieldAlert size={14} />;
      case 'high':
        return <AlertTriangle size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Cyber <span className="text-blue-600">News</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Cyber Security News
          </p>
        </div>

        <button
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-2xl border border-slate-200 font-black shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
        >
          <RefreshCcw
            size={18}
            className={loading ? 'animate-spin' : ''}
          />
          Sync Feed
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white rounded-[2rem] p-8 border border-slate-200/60 animate-pulse h-[350px] shadow-sm"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all group flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getSeverityStyles(
                    item.severity
                  )}`}
                >
                  {getSeverityIcon(item.severity)}
                  {item.severity}
                </span>

                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar size={12} /> {item.date}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-3 leading-snug group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>

              <p className="text-sm text-slate-500 mb-8 line-clamp-4 leading-relaxed font-medium">
                {item.summary}
              </p>

              <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    <Newspaper size={14} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Security News
                  </span>
                </div>

                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-black text-sm flex items-center gap-1 group/btn"
                >
                  Read More
                  <ChevronRight
                    size={16}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
