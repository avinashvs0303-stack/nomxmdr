import React, { useMemo, useState } from 'react';
import { ShieldAlert, Download, CheckCircle2, Info } from 'lucide-react';
import { exportExposureManagementToExcel } from '../services/exportService';

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
    darkWebIncluded: 'Dark Web Monitoring – Basic',
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
    darkWebIncluded: 'Dark Web Monitoring – Advanced',
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
  const [tier, setTier] = useState<TierKey>('core');
  const [term, setTerm] = useState(12);
  const [discount, setDiscount] = useState(0);

  const [assets, setAssets] = useState({
    domains: TIERS[tier].included.domains,
    cloud: TIERS[tier].included.cloud,
    ipRanges: TIERS[tier].included.ipRanges,
  });

  const tierConfig = TIERS[tier];

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

  /* ======================
     RENDER
  ====================== */

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-12">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">
          Exposure Management Pricing
        </h1>
        <p className="text-slate-500 mt-2 flex items-center gap-2">
          <Info size={16} className="text-blue-500" />
          Tiered exposure management aligned with Dark Web Monitoring services.
        </p>
      </div>

      {/* Tier Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(TIERS) as TierKey[]).map(key => {
          const t = TIERS[key];
          return (
            <div
              key={key}
              onClick={() => {
                setTier(key);
                setAssets(t.included);
              }}
              className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${
                tier === key
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
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
          <NumberInput label="Domains / Brands" value={assets.domains} onChange={v => setAssets({ ...assets, domains: v })} />
          <NumberInput label="Cloud Accounts" value={assets.cloud} onChange={v => setAssets({ ...assets, cloud: v })} />
          <NumberInput label="IP Ranges / Assets" value={assets.ipRanges} onChange={v => setAssets({ ...assets, ipRanges: v })} />
        </div>
      </div>

      {/* Commercial Terms */}
      <div className="bg-white rounded-3xl border p-8 space-y-6">
        <SectionTitle title="Commercial Terms" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NumberInput label="Contract Term (Months)" value={term} onChange={setTerm} />
          <NumberInput label="Discount (%)" value={discount} onChange={setDiscount} />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-900 text-white rounded-3xl p-8">
        <h3 className="text-xl font-black mb-6">Pricing Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Summary label="Discounted Monthly" value={`€ ${discountedMonthly.toFixed(2)}`} />
          <Summary label="One-time Onboarding" value={`€ ${ONE_TIME_ONBOARDING}`} />
          <Summary label={`Total (${term} months)`} value={`€ ${totalContractValue.toFixed(2)}`} highlight />
        </div>

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
          className="mt-8 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <Download size={18} />
          Export Proposal
        </button>
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

const NumberInput = ({ label, value, onChange }: any) => (
  <div>
    <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
    <input
      type="number"
      min={0}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="mt-2 w-full rounded-xl border px-4 py-3 font-semibold"
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
