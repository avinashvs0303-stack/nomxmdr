import React, { useMemo, useState } from 'react';
import { ShieldAlert, Download, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { exportExposureManagementToExcel } from '../services/exportService';
import { exportProposalToWord, ProposalData, ExportOptions } from '../services/proposalExportService';

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
  const [tier, setTier] = useState<TierKey>('core');
  const [term, setTerm] = useState(12);
  const [discount, setDiscount] = useState(0);
  const [clientName, setClientName] = useState('');
  const [exporting, setExporting] = useState<'docx' | 'excel' | null>(null);

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
     EXPORT TO WORD
  ====================== */

  const handleExportToWord = async () => {
    setExporting('docx');

    try {
      const proposalData: ProposalData = {
        calculator: 'exposure_management',
        client: { name: clientName || 'Draft Proposal' },
        inputs: {
          endpoints: assets.domains,
          ndrIps: assets.ipRanges,
          siemTier: `${assets.cloud} Cloud Accounts`,
          contractTerm: term,
        },
        addons: [],
        pricing: {
          baseMonthly: monthlyExposure,
          monthly: discountedMonthly,
          yearly: discountedMonthly * 12,
          oneTime: ONE_TIME_ONBOARDING,
          termDiscount: discount / 100,
        },
        maturity: tier.toUpperCase(),
        maturity_summary: {
          level: `Exposure Management - ${tierConfig.name}`,
          tier: tier.toUpperCase(),
        },
        line_items: [
          {
            category: 'Base Platform',
            description: `${tierConfig.name} Exposure Management`,
            metric: '1 Platform',
            unit_price: tierConfig.basePrice,
            extended_monthly: tierConfig.basePrice,
            billing: 'monthly',
          },
          {
            category: 'Domains / Brands',
            description: 'Domain and brand monitoring',
            metric: `${assets.domains} domains`,
            unit_price: DOMAIN_PRICE,
            extended_monthly: Math.max(0, assets.domains - tierConfig.included.domains) * DOMAIN_PRICE,
            billing: 'monthly',
          },
          {
            category: 'Cloud Accounts',
            description: 'Cloud exposure monitoring',
            metric: `${assets.cloud} accounts`,
            unit_price: CLOUD_PRICE,
            extended_monthly: Math.max(0, assets.cloud - tierConfig.included.cloud) * CLOUD_PRICE,
            billing: 'monthly',
          },
          {
            category: 'IP Ranges',
            description: 'IP range monitoring',
            metric: `${assets.ipRanges} ranges`,
            unit_price: IP_RANGE_PRICE,
            extended_monthly: Math.max(0, assets.ipRanges - tierConfig.included.ipRanges) * IP_RANGE_PRICE,
            billing: 'monthly',
          },
          {
            category: 'Onboarding',
            description: 'One-time setup and configuration',
            metric: '1 engagement',
            unit_price: ONE_TIME_ONBOARDING,
            extended_onetime: ONE_TIME_ONBOARDING,
            billing: 'one_time',
          },
          {
            category: 'Discount',
            description: `${discount}% Commercial Discount`,
            discount_percent: discount / 100,
            billing: 'discount',
          },
        ],
        service_package: {
          tier: tier.toUpperCase(),
          maturity_label: `Exposure Management - ${tierConfig.name}`,
          inclusions: tierConfig.features,
        },
        onboarding: {
          steps: [
            'Kick-off & Asset Discovery',
            'Platform Configuration',
            'Initial Scan & Baseline',
            'Alert Tuning',
            'Go Live',
          ],
          fee: ONE_TIME_ONBOARDING,
        },
      };

      const exportOptions: ExportOptions = {
        companyName: 'CompanyX',
        companyTagline: 'Exposure Management',
        proposalDate: new Date(),
      };

      await exportProposalToWord(proposalData, exportOptions);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export proposal. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportToExcel = async () => {
    setExporting('excel');
    try {
      await exportExposureManagementToExcel({
        tier: tierConfig.name,
        term,
        discount,
        assets,
        pricing: {
          monthly: discountedMonthly,
          onboarding: ONE_TIME_ONBOARDING,
          total: totalContractValue,
        },
      });
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to export to Excel.');
    } finally {
      setExporting(null);
    }
  };

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

      {/* Client Name Input */}
      <div className="bg-white rounded-3xl border p-8 space-y-6">
        <SectionTitle title="Client Information" />
        <div>
          <label className="text-xs font-bold uppercase text-slate-500">Client Name</label>
          <input
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Enter client name for proposal"
            className="mt-2 w-full rounded-xl border px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

        {/* Export Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleExportToExcel}
            disabled={exporting !== null}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {exporting === 'excel' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} />
                Export Excel
              </>
            )}
          </button>

          <button
            onClick={handleExportToWord}
            disabled={exporting !== null}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {exporting === 'docx' ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download size={18} />
                Export Proposal
              </>
            )}
          </button>
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
