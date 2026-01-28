import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { PricingProposal } from '../types';
import {
  FileText,
  Edit3,
  Trash2,
  Send,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Eye,
} from 'lucide-react';

export default function MyProposals() {
  const [proposals, setProposals] = useState<PricingProposal[]>([]);
  const [filter, setFilter] = useState<'all' | 'draft' | 'pending_approval' | 'approved'>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1️⃣ Load proposals for current user
  useEffect(() => {
    const loadProposals = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading proposals:', error);
      } else {
        setProposals(data as PricingProposal[]);
      }

      setLoading(false);
    };

    loadProposals();
  }, []);

  // 2️⃣ Submit proposal for approval
  const handleSendForApproval = async (id: string) => {
    // 1️⃣ Load proposal
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !proposal) {
      console.error('Failed to load proposal', error);
      return;
    }

    // 2️⃣ Create approval snapshot (full proposal data)
    const approvalSnapshot = proposal.data;

    // 3️⃣ Freeze snapshot + update status
    const { error: updateError } = await supabase
      .from('proposals')
      .update({
        status: 'pending_approval',
        approval_snapshot: approvalSnapshot,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error sending for approval', updateError);
      return;
    }

    // 4️⃣ Update UI
    setProposals(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'pending_approval' } : p))
    );
  };

  // 3️⃣ Delete proposal (draft only)
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('proposals').delete().eq('id', id);

    if (error) {
      console.error('Error deleting proposal:', error);
      return;
    }

    setProposals(prev => prev.filter(p => p.id !== id));
  };

  // Helper to get the correct edit URL for each calculator type
  const getEditUrl = (proposal: PricingProposal) => {
    switch (proposal.calculator_type) {
      case 'defensive':
        return `/defensive/pricing?proposalId=${proposal.id}`;
      case 'exposure':
        return `/defensive/exposure-management?proposalId=${proposal.id}`;
      case 'solutions':
        return `/defensive/solutions?proposalId=${proposal.id}`;
      default:
        return `/defensive/pricing?proposalId=${proposal.id}`;
    }
  };

  // Helper to get calculator type display label
  const getCalculatorLabel = (type: string) => {
    switch (type) {
      case 'defensive':
        return 'MDR Pricing';
      case 'exposure':
        return 'Exposure Mgmt';
      case 'solutions':
        return 'Solutions';
      default:
        return type;
    }
  };

  const normalized = searchTerm.trim().toLowerCase();

  const byStatus =
    filter === 'all' ? proposals : proposals.filter(p => p.status === filter);

  const filteredProposals = !normalized
    ? byStatus
    : byStatus.filter(p => {
        const clientName = (p.data?.client?.name || '').toLowerCase();
        const pid = (p.id || '').toLowerCase();
        return clientName.includes(normalized) || pid.includes(normalized);
      });

  if (loading) {
    return <div className="text-slate-500">Loading…</div>;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Proposals</h1>
          <p className="text-slate-500 mt-1">Manage and track your security service proposals.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {(['all', 'draft', 'pending_approval', 'approved'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === s
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client or proposal ID..."
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {filteredProposals.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <FileText size={32} />
            </div>
            <div>
              <p className="text-slate-900 font-bold">No proposals found</p>
              <p className="text-slate-500 text-sm">Create a new proposal using the pricing calculators.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="px-6 py-4">Client / ID</th>
                  <th className="px-6 py-4">Calculator</th>
                  <th className="px-6 py-4">Service Package</th>
                  <th className="px-6 py-4 text-right">Value (Ann.)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProposals.map(proposal => (
                  <tr
                    key={proposal.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            proposal.calculator_type === 'defensive'
                              ? 'bg-blue-100 text-blue-600'
                              : proposal.calculator_type === 'exposure'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          {proposal.calculator_type === 'defensive' ? (
                            <Shield size={20} />
                          ) : proposal.calculator_type === 'exposure' ? (
                            <Eye size={20} />
                          ) : (
                            <Zap size={20} />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {proposal.data?.client?.name || '—'}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400">
                            ID: {proposal.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {getCalculatorLabel(proposal.calculator_type)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">
                        {proposal.data?.service_package?.maturity_label || proposal.data?.maturity || '—'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-slate-900">
                        €
                        {Math.round(proposal.data?.pricing?.yearly || 0).toLocaleString()}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          proposal.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : proposal.status === 'pending_approval'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {proposal.status === 'approved' ? (
                          <CheckCircle size={12} />
                        ) : proposal.status === 'pending_approval' ? (
                          <Clock size={12} />
                        ) : null}
                        {proposal.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-slate-500">
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {proposal.status === 'draft' && (
                          <button
                            onClick={() => handleSendForApproval(proposal.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Submit for Approval"
                          >
                            <Send size={16} />
                          </button>
                        )}

                        <Link
                          to={getEditUrl(proposal)}
                          className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all group-hover:text-slate-600 inline-flex"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </Link>

                        {proposal.status === 'draft' && (
                          <button
                            onClick={() => handleDelete(proposal.id)}
                            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* Icons */

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
