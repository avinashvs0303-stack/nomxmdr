import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { PricingProposal } from '../types';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';

export default function AdminProposals() {
  const [proposals, setProposals] = useState<PricingProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentById, setCommentById] = useState<Record<string, string>>({});

  // 1️⃣ Load pending proposals from DB
  useEffect(() => {
    const loadProposals = async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setProposals(data || []);
      }

      setLoading(false);
    };

    loadProposals();
  }, []);

  // 2️⃣ Approve / reject proposal (+ comment)
  const handleReview = async (id: string, approve: boolean) => {
    const comment = (commentById[id] ?? '').trim();

    if (!approve && !comment) {
      alert('Please add a comment when rejecting / requesting changes.');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // write comment (optional on approve, required on reject)
    if (comment) {
      const { error: commentError } = await supabase.from('proposal_comments').insert([
        {
          proposal_id: id,
          author_id: user?.id ?? null,
          status_at_time: approve ? 'approved' : 'draft',
          comment,
        },
      ]);

      if (commentError) {
        console.error('Failed to write approval comment:', commentError);
        return;
      }
    }

    // update status (backend will version + lock as configured)
    const { error } = await supabase
      .from('proposals')
      .update({ status: approve ? 'approved' : 'draft' })
      .eq('id', id);

    if (error) {
      console.error(error);
      return;
    }

    // Remove reviewed proposal from UI
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  if (loading) {
    return <div className="text-slate-500">Loading proposals…</div>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Proposal Reviews</h1>
        <p className="text-slate-500 mt-1">
          Approve or request changes on pending client proposals.
        </p>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {proposals.length === 0 ? (
          <div className="p-20 text-center text-slate-500 font-medium">
            <FileText size={48} className="mx-auto mb-4 opacity-10" />
            No proposals currently awaiting approval.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {proposals.map(p => (
              <div
                key={p.id}
                className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      p.calculator_type === 'defensive'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {p.calculator_type === 'defensive' ? <Shield size={24} /> : <Zap size={24} />}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {p.data?.client?.name || `Proposal ${p.id.slice(0, 8)}`}
                    </h3>

                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {(p.data?.service_package?.maturity_label || p.data?.maturity || 'CUSTOM').toString().toUpperCase()}
                      </span>

                      <span className="text-xs font-bold text-blue-600">
                        €{Math.round(p.data?.pricing?.yearly || 0).toLocaleString()} Annual Value
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/proposals/${p.id}`}
                    className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm flex items-center gap-2"
                  >
                    <Eye size={18} /> View Details
                  </Link>

                  {/* ✅ Comment (no UX redesign; just adds a field) */}
                  <textarea
                    value={commentById[p.id] ?? ''}
                    onChange={(e) => setCommentById(prev => ({ ...prev, [p.id]: e.target.value }))}
                    placeholder="Approval comment (required for reject)"
                    className="w-80 p-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />

                  <div className="h-8 w-px bg-slate-200 mx-2" />

                  <button
                    onClick={() => handleReview(p.id, false)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                    title="Reject / Draft"
                  >
                    <XCircle size={24} />
                  </button>

                  <button
                    onClick={() => handleReview(p.id, true)}
                    className="p-3 text-green-500 hover:bg-green-50 rounded-xl"
                    title="Approve"
                  >
                    <CheckCircle size={24} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Icons (unchanged) */

const Shield = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const Zap = ({ size, className }: { size: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
