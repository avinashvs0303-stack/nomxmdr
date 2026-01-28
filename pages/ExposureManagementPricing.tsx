import React, { useMemo, useState, useEffect } from 'react';
import { ShieldAlert, Download, CheckCircle2, Info, Save } from 'lucide-react';
import { exportExposureManagementToExcel } from '../services/exportService';
import { supabase } from '../services/supabase';
import { useSearchParams } from 'react-router-dom';

/* ======================
   TIER CONFIG (SOURCE OF TRUTH)
====================== */

type TierKey = 'core' | 'advanced' | 'elite';

const TIERS: Record<TierKey, any> = {
  core: {
    name: 'Core',
    description: 'Baseline external exposure visibility',
    basePrice: 750,
    included: {
      domains: 1,
      cloud: 0,
      ipRanges: 1,
    },
    features: [
      'External asset discovery',
      'Domain & IP exposure monitoring',
      'Risk severity scoring',
      'Monthly exposure report',
    ],
    darkWebIncluded: false,
  },
  advanced: {
    name: 'Advanced',
    description: 'Expanded coverage with enrichment and analyst review',
    basePrice: 1200,
    included: {
      domains: 3,
      cloud: 1,
      ipRanges: 2,
    },
    features: [
      'Everything in Core',
      'Credential enrichment & validation',
      'Executive exposure monitoring',
      'Analyst review & SOC escalation',
      'Monthly executive report',
    ],
    darkWebIncluded: 'Dark Web Monitoring — Basic',
  },
  elite: {
    name: 'Elite',
    description: 'Enterprise-grade exposure management with SOC integration',
    basePrice: 1800,
    included: {
      domains: 5,
      cloud: 2,
      ipRanges: 5,
    },
    features: [
      'Everything in Advanced',
      'Brand & impersonation monitoring',
      'SOC-integrated workflows',
      'Quarterly threat landscape review',
    ],
    darkWebIncluded: 'Dark Web Monitoring — Advanced',
  },
};

/* ======================
   PRICING CONSTANTS
====================== */

const DOMAIN_PRICE = 150;
const CLOUD_PRICE = 200;
const IP_RANGE_PRICE = 100;
const ONE_TIME_ONBOARDING = 2500;

/* ======================
   COMPONENT
====================== */

const ExposureManagementPricing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const existingProposalId = searchParams.get('proposalId');

  const [loadedProposal, setLoadedProposal] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [client, setClient] = useState('');
  const [tier, setTier] = useState<TierKey>('core');
  const [term, setTerm] = useState(12);
  const [discount, setDiscount] = useState(0);

  const [assets, setAssets] = useState({
    domains: TIERS['core'].included.domains,
    cloud: TIERS['core'].included.cloud,
    ipRanges: TIERS['core'].included.ipRanges,
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const tierConfig = TIERS[tier];

  /* ======================
     LOAD EXISTING (EDIT MODE)
  ====================== */

  useEffect(() => {
    const loadExisting = async () => {
      if (!existingProposalId) return;

      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', existingProposalId)
        .single();

      if (error || !data) {
        console.error('Failed to load proposal for edit:', error);
        return;
      }

      setLoadedProposal(data);

      const locked =
        data.locked === true ||
        data.status === 'approved' ||
        data.status === 'pending_approval';

      setIsLocked(locked);

      const d = data.data || {};

      setClient(d.client?.name || '');
      setTier(d.tier || 'core');
      setTerm(d.inputs?.term ?? 12);
      setDiscount(d.inputs?.discount ?? 0);
      setAssets(d.inputs?.assets ?? TIERS['core'].included);
    };

    loadExisting();
  }, [existingProposalId]);

  /* ======================
     PRICING LOGIC
  ====================== */

  const monthlyExposure = useMemo(() => {
    return (
      tierConfig.basePrice +
      Math.max(0, assets.domains - tierConfig.included.domains) * DOMAIN_PRICE +
      Math.max(0, assets.cloud - tierConfig.included.cloud) * CLOUD_PRICE +
      Math.max(0, assets.ipRanges - tierConfig.included.ipRanges) * IP_RANGE_PRICE
    );
  }, [assets, tierConfig]);

  const discountedMonthly = monthlyExposure * (1 - discount / 100);
  const totalContractValue = discountedMonthly * term + ONE_TIME_ONBOARDING;
  const yearlyValue = discountedMonthly * 12;

  /* ======================
     BUILD LINE ITEMS
  ====================== */

  const buildLineItems = () => {
    const items: any[] = [];

    items.push({
      category: 'Exposure Tier',
      description: `${tierConfig.name} Exposure Management`,
      metric: '1 Base Platform',
      unit_price: tierConfig.basePrice,
      extended_monthly: tierConfig.basePrice,
      billing: 'monthly',
    });

    const extraDomains = Math.max(0, assets.domains - tierConfig.included.domains);
    if (extraDomains > 0) {
      items.push({
        category: 'Additional Domains',
        description: 'Extra Domain/Brand Monitoring',
        metric: `${extraDomains} Domains`,
        unit_price: DOMAIN_PRICE,
        extended_monthly: extraDomains * DOMAIN_PRICE,
        billing: 'monthly',
      });
    }

    const extraCloud = Math.max(0, assets.cloud - tierConfig.included.cloud);
    if (extraCloud > 0) {
      items.push({
        category: 'Additional Cloud Accounts',
        description: 'Extra Cloud Account Monitoring',
        metric: `${extraCloud} Accounts`,
        unit_price: CLOUD_PRICE,
        extended_monthly: extraCloud * CLOUD_PRICE,
        billing: 'monthly',
      });
    }

    const extraIPs = Math.max(0, assets.ipRanges - tierConfig.included.ipRanges);
    if (extraIPs > 0) {
      items.push({
        category: 'Additional IP Ranges',
        description: 'Extra IP Range Monitoring',
        metric: `${extraIPs} Ranges`,
        unit_price: IP_RANGE_PRICE,
        extended_monthly: extraIPs * IP_RANGE_PRICE,
        billing: 'monthly',
      });
    }

    items.push({
      category: 'Onboarding',
      description: 'One-time Setup & Configuration',
      metric: '1 Project',
      unit_price: ONE_TIME_ONBOARDING,
      extended_onetime: ONE_TIME_ONBOARDING,
      billing: 'one_time',
    });

    if (discount > 0) {
      items.push({
        category: 'Discount',
        description: `${discount}% Discount Applied`,
        discount_percent: discount / 100,
        billing: 'discount',
      });
    }

    return items;
  };

  /* ======================
     SAVE HANDLER
  ====================== */

  const handleSave = async () => {
    if (isLocked) return;

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      alert('Not authenticated');
      return;
    }

    const payloadData = {
      calculator: 'exposure_management',
      client: { name: client || null },
      tier: tier,
      inputs: {
        term,
        discount,
        assets,
      },
      pricing: {
        baseMonthly: monthlyExposure,
        monthly: discountedMonthly,
        yearly: yearlyValue,
        oneTime: ONE_TIME_ONBOARDING,
        total: totalContractValue,
        termDiscount: discount / 100,
      },
      maturity: tier.toUpperCase(),
      maturity_summary: {
        level: tierConfig.name,
        tier: tier.toUpperCase(),
      },
      line_items: buildLineItems(),
      service_package: {
        tier: tier.toUpperCase(),
        maturity_label: tierConfig.name,
        inclusions: tierConfig.features,
      },
      onboarding: {
        steps: ['Discovery', 'Asset Mapping', 'Integration', 'Tuning', 'Go Live'],
        fee: ONE_TIME_ONBOARDING,
      },
    };

    let error: any = null;

    if (existingProposalId) {
      const resp = await supabase
        .from('proposals')
        .update({ data: payloadData })
        .eq('id', existingProposalId);

      error = resp.error;
    } else {
      const proposalId = crypto.randomUUID();
      const resp = await supabase.from('proposals').insert([{
        id: proposalId,
        user_id: user.id,
        status: 'draft',
        calculator_type: 'exposure',
        tags: ['Exposure Management'],
        data: payloadData,
      }]);

      error = resp.error;
    }

    setSaving(false);

    if (error) {
      console.error(error);
      setSaveStatus('Failed to save proposal');
      return;
    }

    setSaveStatus('Proposal saved!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  /* ======================
     RENDER
  ====================== */

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-12">

      {/* Locked Banner */}
      {isLocked && (
        <div className="bg-orange-100 border border-orange-300 text-orange-800 px-6 py-4 rounded-2xl font-bold">
          This proposal is locked ({loadedProposal?.status}). Editing is disabled.
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Exposure Management Pricing
          </h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Info size={16} className="text-blue-500" />
            Tiered exposure management aligned with Dark Web Monitoring services.
          </p>
          {existingProposalId && (
            <p className="text-xs text-slate-400 mt-1">
              Editing Proposal: {existingProposalId}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || isLocked}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Save size={18} />
            {saving ? 'Saving...' : existingProposalId ? 'Update Proposal' : 'Save as Draft'}
          </button>

          <button
            onClick={() =>
              exportExposureManagementToExcel({
                tier: tierConfig.name,
                term,
                discount,
                assets,
                pricing: {
                  monthly: discountedMonthly,
                  onboarding: ONE_TIME_ONBOARDING,
                  total: totalContractValue,
                },
              })
            }
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 active:scale-95"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-xl font-bold text-sm">
          {saveStatus}
        </div>
      )}

      {/* Client Name */}
      <div className="bg-white rounded-3xl border p-8">
        <SectionTitle title="Client Information" />
        <div className="mt-4">
          <label className="text-xs font-bold uppercase text-slate-500">Client Name</label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            disabled={isLocked}
            placeholder="Enter client name..."
            className="mt-2 w-full max-w-md rounded-xl border px-4 py-3 font-semibold disabled:bg-slate-100"
          />
        </div>
      </div>

      {/* Tier Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(TIERS) as TierKey[]).map(key => {
          const t = TIERS[key];
          return (
            <div
              key={key}
              onClick={() => {
                if (isLocked) return;
                setTier(key);
                setAssets(t.included);
              }}
              className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${
                tier === key
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <h3 className="text-xl font-black mb-1">{t.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{t.description}</p>
              <p className="text-2xl font-black text-slate-900 mb-4">
                € {t.basePrice} / month
              </p>

              <ul className="space-y-2 text-sm">
                {t.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              {t.darkWebIncluded && (
                <div className="mt-4 text-xs font-bold uppercase text-blue-600">
                  Includes: {t.darkWebIncluded}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exposure Scope */}
      <div className="bg-white rounded-3xl border p-8 space-y-6">
        <SectionTitle title="Exposure Management Scope" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NumberInput label="Domains / Brands" value={assets.domains} onChange={v => setAssets({ ...assets, domains: v })} disabled={isLocked} />
          <NumberInput label="Cloud Accounts" value={assets.cloud} onChange={v => setAssets({ ...assets, cloud: v })} disabled={isLocked} />
          <NumberInput label="IP Ranges / Assets" value={assets.ipRanges} onChange={v => setAssets({ ...assets, ipRanges: v })} disabled={isLocked} />
        </div>
      </div>

      {/* Commercial Terms */}
      <div className="bg-white rounded-3xl border p-8 space-y-6">
        <SectionTitle title="Commercial Terms" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NumberInput label="Contract Term (Months)" value={term} onChange={setTerm} disabled={isLocked} />
          <NumberInput label="Discount (%)" value={discount} onChange={setDiscount} disabled={isLocked} />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-900 text-white rounded-3xl p-8">
        <h3 className="text-xl font-black mb-6">Pricing Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Summary label="Monthly" value={`€ ${discountedMonthly.toFixed(2)}`} />
          <Summary label="Yearly" value={`€ ${yearlyValue.toFixed(2)}`} />
          <Summary label="One-time Onboarding" value={`€ ${ONE_TIME_ONBOARDING}`} />
          <Summary label={`Total (${term} months)`} value={`€ ${totalContractValue.toFixed(2)}`} highlight />
        </div>
      </div>
    </div>
  );
};

/* ======================
   HELPERS
====================== */

const SectionTitle = ({ title }: { title: string }) => (
  <div className="flex items-center gap-2 text-blue-600 font-bold uppercase text-sm">
    <ShieldAlert size={16} /> {title}
  </div>
);

const NumberInput = ({ label, value, onChange, disabled }: any) => (
  <div>
    <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
    <input
      type="number"
      min={0}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      disabled={disabled}
      className="mt-2 w-full rounded-xl border px-4 py-3 font-semibold disabled:bg-slate-100"
    />
  </div>
);

const Summary = ({ label, value, highlight }: any) => (
  <div className={`p-4 rounded-2xl ${highlight ? 'bg-emerald-600' : 'bg-slate-800'}`}>
    <p className="text-xs uppercase tracking-widest opacity-80">{label}</p>
    <p className="text-2xl font-black mt-1">{value}</p>
  </div>
);

export default ExposureManagementPricing;
