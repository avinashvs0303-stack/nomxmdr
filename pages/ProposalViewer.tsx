import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';
import { FileText, Download, Loader2 } from 'lucide-react';
import { exportProposalToWord, ProposalData, ExportOptions } from '../services/proposalExportService';

type ExportFormat = 'pdf' | 'docx';

function normalizeTier(v: any): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s) return null;
  const up = s.toUpperCase();
  if (up === 'CORE' || up === 'ADVANCE' || up === 'ELITE') return up;
  return s;
}

function moneyEUR(n: any): string {
  const num = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(num)) return '€0';
  return `€${Math.round(num).toLocaleString()}`;
}

export default function ProposalViewer() {
  const { id } = useParams<{ id: string }>();

  const [proposal, setProposal] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setExportError(null);

      // 1) proposal
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Failed to load proposal:', error);
        setProposal(null);
        setLoading(false);
        return;
      }

      setProposal(data);

      // 2) comments (optional table)
      const { data: commentData, error: commentErr } = await supabase
        .from('proposal_comments')
        .select('*')
        .eq('proposal_id', id)
        .order('created_at', { ascending: false });

      if (commentErr) {
        console.warn('Failed to load comments:', commentErr);
        setComments([]);
      } else {
        setComments(commentData || []);
      }

      // 3) versions (optional table)
      const { data: versionData, error: versionErr } = await supabase
        .from('proposal_versions')
        .select('*')
        .eq('proposal_id', id)
        .order('version', { ascending: false });

      if (versionErr) {
        console.warn('Failed to load versions:', versionErr);
        setVersions([]);
      } else {
        setVersions(versionData || []);
      }

      setLoading(false);
    };

    loadAll();
  }, [id]);

  const viewData = useMemo(() => {
    if (!proposal) return null;

    const base =
      proposal.approval_snapshot && proposal.status !== 'draft'
        ? {
            ...(proposal.data || {}),
            ...(proposal.approval_snapshot || {}),
            pricing: { ...(proposal.data?.pricing || {}), ...(proposal.approval_snapshot?.pricing || {}) },
            inputs: { ...(proposal.data?.inputs || {}), ...(proposal.approval_snapshot?.inputs || {}) },
            onboarding: { ...(proposal.data?.onboarding || {}), ...(proposal.approval_snapshot?.onboarding || {}) },
            service_package: {
              ...(proposal.data?.service_package || {}),
              ...(proposal.approval_snapshot?.service_package || {}),
            },
          }
        : proposal.data;

    const maturityNorm = normalizeTier(base?.maturity);
    const tierNorm = normalizeTier(base?.service_package?.tier);

    return {
      ...base,
      maturity: maturityNorm ?? base?.maturity,
      service_package: {
        ...(base?.service_package || {}),
        tier: tierNorm ?? base?.service_package?.tier,
      },
    };
  }, [proposal]);

  /**
   * Handle export to Word or PDF
   */
  const handleExport = async (format: ExportFormat) => {
    if (!proposal?.id || !viewData) return;
    setExporting(format);
    setExportError(null);

    try {
      if (format === 'docx') {
        // Client-side Word export using proposalExportService
        const proposalData: ProposalData = {
          calculator: viewData.calculator,
          client: viewData.client,
          inputs: viewData.inputs,
          addons: viewData.addons,
          pricing: viewData.pricing,
          maturity: viewData.maturity,
          maturity_summary: viewData.maturity_summary,
          line_items: viewData.line_items,
          service_package: viewData.service_package,
          onboarding: viewData.onboarding,
        };

        const exportOptions: ExportOptions = {
          companyName: 'CompanyX',
          companyTagline: 'Guardian xMDR',
          proposalDate: new Date(proposal.created_at),
        };

        await exportProposalToWord(proposalData, exportOptions);
        setExporting(null);
        return;
      }

      if (format === 'pdf') {
        // PDF export - try Edge Function first, then fallback
        try {
          const { data, error } = await supabase.functions.invoke('export-proposal', {
            body: { proposal_id: proposal.id, format: 'pdf' },
          });

          if (!error && data?.url) {
            window.open(data.url, '_blank', 'noopener,noreferrer');
            setExporting(null);
            return;
          }
        } catch (fnError) {
          console.warn('Edge function not available, using fallback:', fnError);
        }

        // Fallback: Use REST endpoint
        const fallbackUrl = `/api/export/pdf/${proposal.id}`;
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
        setExporting(null);
      }
    } catch (e: any) {
      console.error('Export failed:', e);
      setExportError('Export failed. Please try again.');
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-500">Loading proposal…</span>
      </div>
    );
  }

  if (!proposal || !viewData) {
    return (
      <div className="p-8 text-center">
        <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <p className="text-red-500 font-medium">Proposal not found</p>
      </div>
    );
  }

  const d = viewData;
  const clientName = d?.client?.name ?? null;
  const inputs = d?.inputs || {};
  const addons = Array.isArray(d?.addons) ? d.addons : [];
  const pricing = d?.pricing || {};
  const onboarding = d?.onboarding || {};
  const sp = d?.service_package || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {clientName || 'Proposal'} - {sp?.maturity_label || sp?.tier || 'MDR'}
          </h1>
          <p className="text-slate-500 mt-1">
            {proposal.calculator_type} • Created {new Date(proposal.created_at).toLocaleDateString()}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                proposal.status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : proposal.status === 'pending_approval'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {proposal.status.replace('_', ' ')}
            </span>
            {proposal.locked && (
              <span className="text-xs text-slate-400">• Locked</span>
            )}
            {typeof proposal.version === 'number' && (
              <span className="text-xs text-slate-400">• v{proposal.version}</span>
            )}
          </div>

          {exportError && (
            <p className="text-xs text-red-500 mt-2">{exportError}</p>
          )}
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('docx')}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-60 transition-colors"
          >
            {exporting === 'docx' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {exporting === 'docx' ? 'Generating…' : 'Export Word'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-60 transition-colors"
          >
            {exporting === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {exporting === 'pdf' ? 'Generating…' : 'Export PDF'}
          </button>
        </div>
      </header>

      {/* CLIENT */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-2 text-slate-900">Client</h3>
        <p className="text-slate-700">{clientName ? clientName : '—'}</p>
      </section>

      {/* SERVICE PACKAGE */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3 text-slate-900">Service Package</h3>
        <p className="text-slate-700 font-medium mb-3">
          {(sp?.tier || '—') as string} — {sp?.maturity_label || '—'}
        </p>

        {Array.isArray(sp?.inclusions) && sp.inclusions.length > 0 ? (
          <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600">
            {sp.inclusions.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-sm">—</p>
        )}
      </section>

      {/* STRATEGIC MATURITY */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-2 text-slate-900">Strategic Maturity Level</h3>
        <p className="text-lg font-semibold text-blue-600">
          {d?.maturity_summary?.level || '—'}
        </p>
      </section>

      {/* INPUTS */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3 text-slate-900">Coverage Inputs</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Endpoints</p>
            <p className="font-medium text-slate-900">
              {typeof inputs.endpoints === 'number' ? inputs.endpoints : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">NDR IPs</p>
            <p className="font-medium text-slate-900">
              {typeof inputs.ndrIps === 'number' ? inputs.ndrIps : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">SIEM Tier</p>
            <p className="font-medium text-slate-900">{inputs.siemTier || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Contract Term</p>
            <p className="font-medium text-slate-900">
              {inputs.contractTerm ? `${inputs.contractTerm} months` : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* ADD-ONS */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3 text-slate-900">Add-ons</h3>

        {addons.length ? (
          <ul className="space-y-2 text-sm text-slate-600">
            {addons.map((addon: any) => (
              <li key={addon.id}>
                • {addon.name || addon.id} ({addon.days} days)
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-sm">No add-ons selected</p>
        )}
      </section>

      {/* PRICING */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3 text-slate-900">Pricing</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Base Monthly</p>
            <p className="font-medium text-slate-900">{moneyEUR(pricing.baseMonthly)}</p>
          </div>
          <div>
            <p className="text-slate-500">Discount</p>
            <p className="font-medium text-slate-900">
              {pricing.termDiscount != null
                ? `${Math.round(Number(pricing.termDiscount) * 100)}%`
                : pricing.discount != null
                  ? `${Math.round(Number(pricing.discount) * 100)}%`
                  : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Monthly</p>
            <p className="font-medium text-slate-900">{moneyEUR(pricing.monthly)}</p>
          </div>
          <div>
            <p className="text-slate-500">Yearly</p>
            <p className="font-medium text-slate-900">{moneyEUR(pricing.yearly)}</p>
          </div>
          <div>
            <p className="text-slate-500">One-time</p>
            <p className="font-medium text-slate-900">{moneyEUR(pricing.oneTime)}</p>
          </div>
        </div>

        {/* Total Contract Value */}
        <div className="mt-6 p-4 bg-slate-900 rounded-xl text-white">
          <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Total Contract Value</p>
          <p className="text-2xl font-bold">
            {moneyEUR((pricing.monthly || 0) * (inputs.contractTerm || 12) + (pricing.oneTime || 0))}
          </p>
        </div>
      </section>

      {/* DETAILED LINE ITEMS */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-4 text-slate-900">Detailed Line-Item Cost Analysis</h3>

        {Array.isArray(d?.line_items) && d.line_items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-3 text-left font-semibold text-slate-700">Category</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Description</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Metric</th>
                  <th className="p-3 text-right font-semibold text-slate-700">Value</th>
                </tr>
              </thead>
              <tbody>
                {d.line_items.map((item: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="p-3 font-medium text-slate-900">{item.category}</td>
                    <td className="p-3 text-slate-600">
                      {Array.isArray(item.description)
                        ? item.description.map((x: string, j: number) => (
                            <div key={j}>• {x}</div>
                          ))
                        : item.description}
                    </td>
                    <td className="p-3 text-slate-600">{item.metric || '—'}</td>
                    <td className="p-3 text-right text-slate-900">
                      {item.extended_monthly != null && moneyEUR(item.extended_monthly)}
                      {item.extended_onetime != null &&
                        `${moneyEUR(item.extended_onetime)} (One-Time)`}
                      {item.discount_percent != null &&
                        `-${Math.round(item.discount_percent * 100)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">—</p>
        )}
      </section>

      {/* ONBOARDING */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3 text-slate-900">Onboarding</h3>

        {Array.isArray(onboarding.steps) && onboarding.steps.length > 0 ? (
          <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600">
            {onboarding.steps.map((step: string) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-sm">—</p>
        )}

        <p className="mt-3 text-sm">
          <span className="text-slate-500">Onboarding Fee:</span>{' '}
          <span className="font-medium text-slate-900">{moneyEUR(onboarding.fee)}</span>
        </p>
      </section>

      {/* APPROVAL COMMENTS */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3 text-slate-900">Approval History</h3>

        {comments.length === 0 ? (
          <p className="text-slate-500 text-sm">No approval comments</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c: any) => (
              <li key={c.id} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">{c.comment}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(c.created_at).toLocaleDateString()} • {c.status_at_time}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* VERSION CONTEXT */}
      <section className="bg-slate-50 rounded-2xl border p-6">
        <h3 className="font-bold mb-3 text-slate-900">Version History</h3>
        <p className="text-sm text-slate-600">
          {versions.length} version{versions.length === 1 ? '' : 's'} recorded
        </p>
      </section>
    </div>
  );
}
