import { useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';

type ExportFormat = 'pdf' | 'docx';

function normalizeTier(v: any): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s) return null;

  // Handle "Core" -> "CORE", "Advance" -> "ADVANCE", etc.
  const up = s.toUpperCase();
  if (up === 'CORE' || up === 'ADVANCE' || up === 'ELITE') return up;

  return s; // fallback (do not destroy unknown values)
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
        // don't break viewer if comments table/policy is still being tuned
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

    // Snapshot-first for pending/approved, fallback to data for draft or missing snapshot
   const base =
    proposal.approval_snapshot && proposal.status !== 'draft'
      ? {
          // start with full data (has line_items/maturity_summary)
          ...(proposal.data || {}),
          // overlay snapshot (approval “freeze” wins)
          ...(proposal.approval_snapshot || {}),
          // shallow-merge common nested objects so snapshot doesn't wipe data
          pricing: { ...(proposal.data?.pricing || {}), ...(proposal.approval_snapshot?.pricing || {}) },
          inputs: { ...(proposal.data?.inputs || {}), ...(proposal.approval_snapshot?.inputs || {}) },
          onboarding: { ...(proposal.data?.onboarding || {}), ...(proposal.approval_snapshot?.onboarding || {}) },
          service_package: {
            ...(proposal.data?.service_package || {}),
            ...(proposal.approval_snapshot?.service_package || {}),
          },
        }
      : proposal.data;
    // Normalize tier casing so UI doesn’t silently break when DB contains "Core"
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

  const handleExport = async (format: ExportFormat) => {
    if (!proposal?.id) return;
    setExporting(format);
    setExportError(null);

    try {
      /**
       * ✅ Path A (recommended): Supabase Edge Function returns { url }
       * - Create an edge function e.g. "export-proposal"
       * - It generates PDF/DOCX and returns a signed URL
       */
      const fnName = 'export-proposal';
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: { proposal_id: proposal.id, format },
      });

      if (!error && data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
        setExporting(null);
        return;
      }

      /**
       * ✅ Path B (fallback): REST endpoint
       * - /api/export/pdf/:id  and /api/export/docx/:id
       */
      const fallbackUrl =
        format === 'pdf'
          ? `/api/export/pdf/${proposal.id}`
          : `/api/export/docx/${proposal.id}`;

      // If function failed but endpoint exists, still works.
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      setExporting(null);
    } catch (e: any) {
      console.error('Export failed:', e);
      setExportError('Export failed. Check export function / endpoint.');
      setExporting(null);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading proposal…</div>;
  }

  if (!proposal || !viewData) {
    return <div className="text-red-500">Proposal not found</div>;
  }

  const d = viewData;

  // Helpful fallbacks for missing fields (keeps UI stable)
  const clientName = d?.client?.name ?? null;

  const inputs = d?.inputs || {};
  const addons = Array.isArray(d?.addons) ? d.addons : [];
  const pricing = d?.pricing || {};
  const onboarding = d?.onboarding || {};
  const sp = d?.service_package || {};

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Proposal {proposal.id}
          </h1>
          <p className="text-slate-500 mt-1">
            {proposal.calculator_type} • {sp?.maturity_label || '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Status: <span className="font-medium">{proposal.status}</span>
            {proposal.locked ? ' • Locked' : ''}
            {typeof proposal.version === 'number' ? ` • v${proposal.version}` : ''}
          </p>

          {exportError && (
            <p className="text-xs text-red-500 mt-2">{exportError}</p>
          )}
        </div>

        {/* EXPORT (same minimal theme, no redesign) */}
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-60"
          >
            {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
          </button>
          <button
            onClick={() => handleExport('docx')}
            disabled={exporting !== null}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-60"
          >
            {exporting === 'docx' ? 'Exporting…' : 'Export DOCX'}
          </button>
        </div>
      </header>

      {/* CLIENT */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-2">Client</h3>
        <p>{clientName ? clientName : '—'}</p>
      </section>

      {/* SERVICE PACKAGE */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3">Service Package</h3>
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
        <h3 className="font-bold mb-2">Strategic Maturity Level</h3>
        <p className="text-lg font-semibold text-blue-600">
          {d?.maturity_summary?.level || '—'}
        </p>
      </section>
      {/* INPUTS */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3">Coverage Inputs</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Endpoints</p>
            <p className="font-medium">
              {typeof inputs.endpoints === 'number' ? inputs.endpoints : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">NDR IPs</p>
            <p className="font-medium">
              {typeof inputs.ndrIps === 'number' ? inputs.ndrIps : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">SIEM Tier</p>
            <p className="font-medium">{inputs.siemTier || '—'}</p>
          </div>
          <div>
            <p className="text-slate-500">Contract Term</p>
            <p className="font-medium">
              {inputs.contractTerm ? `${inputs.contractTerm} months` : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* ADD-ONS */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3">Add-ons</h3>

        {addons.length ? (
          <ul className="space-y-2 text-sm text-slate-600">
            {addons.map((addon: any) => (
              <li key={addon.id}>
                • {addon.id} ({addon.days} days)
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 text-sm">No add-ons selected</p>
        )}
      </section>

      {/* PRICING (render ALL important fields from defensive pricing) */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3">Pricing</h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Base Monthly</p>
            <p className="font-medium">{moneyEUR(pricing.baseMonthly)}</p>
          </div>
          <div>
            <p className="text-slate-500">Discount</p>
            <p className="font-medium">
              {pricing.termDiscount != null
                ? `${Math.round(Number(pricing.termDiscount) * 100)}%`
                : pricing.discount != null
                  ? `${Math.round(Number(pricing.discount) * 100)}%`
                  : '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Monthly</p>
            <p className="font-medium">{moneyEUR(pricing.monthly)}</p>
          </div>
          <div>
            <p className="text-slate-500">Yearly</p>
            <p className="font-medium">{moneyEUR(pricing.yearly)}</p>
          </div>
          <div>
            <p className="text-slate-500">One-time</p>
            <p className="font-medium">{moneyEUR(pricing.oneTime)}</p>
          </div>
        </div>
      </section>
      {/* DETAILED LINE ITEMS */}
<section className="bg-white rounded-2xl border p-6">
  <h3 className="font-bold mb-4">Detailed Line-Item Cost Analysis</h3>

  {Array.isArray(d?.line_items) && d.line_items.length ? (
    <table className="w-full text-sm border">
      <thead>
        <tr className="bg-slate-50">
          <th className="p-2 text-left">Category</th>
          <th className="p-2 text-left">Description</th>
          <th className="p-2 text-left">Metric</th>
          <th className="p-2 text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        {d.line_items.map((item: any, i: number) => (
          <tr key={i} className="border-t">
            <td className="p-2 font-medium">{item.category}</td>
            <td className="p-2">
              {Array.isArray(item.description)
                ? item.description.map((x: string) => (
                    <div key={x}>• {x}</div>
                  ))
                : item.description}
            </td>
            <td className="p-2">{item.metric || '—'}</td>
            <td className="p-2 text-right">
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
  ) : (
    <p className="text-slate-500 text-sm">—</p>
  )}
</section>

      {/* ONBOARDING */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3">Onboarding</h3>

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
          <span className="font-medium">{moneyEUR(onboarding.fee)}</span>
        </p>
      </section>

      {/* APPROVAL COMMENTS */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-bold mb-3">Approval History</h3>

        {comments.length === 0 ? (
          <p className="text-slate-500 text-sm">No approval comments</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {comments.map((c: any) => (
              <li key={c.id}>
                <span className="font-medium">Comment:</span>{' '}
                {c.comment}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* VERSION CONTEXT */}
      <section className="bg-slate-50 rounded-2xl border p-6">
        <h3 className="font-bold mb-3">Version History</h3>
        <p className="text-sm text-slate-600">
          {versions.length} version{versions.length === 1 ? '' : 's'} recorded
        </p>
      </section>
    </div>
  );
}
