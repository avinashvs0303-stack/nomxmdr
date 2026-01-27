import { useState, useMemo, useEffect } from 'react';
import {
  Save,
  FileDown,
  CheckCircle2,
  Shield,
  Rocket,
  Zap,
  Plus,
  Minus,
  TrendingUp,
  Calendar,
  Clock,
  Activity,
  Target,
  Layers,
  PlayCircle,
  Lock,
} from 'lucide-react';
import { SecurityPackage } from '../types';
import { supabase } from '../services/supabase';
import { MDR_SERVICE_PACKAGES } from './mdrServicePackages';
import { useSearchParams } from 'react-router-dom';

/* =========================
   TYPES & CONSTANTS
========================= */

interface Addon {
  id: string;
  name: string;
  description: string;
}

const ADDONS: Addon[] = [
  { id: 'siem_int', name: 'SIEM Integration', description: 'Custom integration of log sources.' },
  { id: 'siem_mgmt', name: 'SIEM Management & Maintenance', description: 'Ongoing care for SIEM health.' },
  { id: 'vulnerability', name: 'Vulnerability Assessment / Mgmt', description: 'Continuous scanning and reporting.' },
  { id: 'hybrid_soc', name: 'Hybrid SOC (after hours)', description: 'After-hours escalation and coverage.' },
  { id: 'expert_adv', name: 'Expert Advisory Services', description: 'Strategic CISO-level security guidance.' },
  { id: 'voc', name: 'Vulnerability Operations Center (VOC)', description: 'Dedicated vulnerability lifecycle management.' },
  { id: 'purple_team', name: 'Purple Teaming - Attack Simulations', description: 'Collaborative offense-defense exercises.' },
  { id: 'mail_phish', name: 'Mail Phishing Campaign', description: 'User awareness and simulation.' },
  { id: 'mitre_attck', name: 'MITRE ATT&CK Threat Modelling', description: 'Adversary-focused defensive mapping.' },
  { id: 'xdr_impl', name: 'EDR/NDR/XDR — Implementation & Mgmt', description: 'Full stack implementation services.' },
  { id: 'xdr_mgmt_ot', name: 'EDR/NDR/XDR — Management', description: 'Ongoing platform tuning and management.' },
  { id: 'deception', name: 'Deception (Honeypots)', description: 'Deployment of decoy assets.' },
  { id: 'pen_testing', name: 'Security Consulting / Pen testing', description: 'Point-in-time offensive validation.' },
  { id: 'xsoar', name: 'Dedicated XSOAR Tenant', description: 'Dedicated XSOAR platform services.' },
];

const PACKAGES = {
  [SecurityPackage.CORE]: {
    base: 2500,
    perEndpoint: 4,
    perNdrIp: 1,
    maturity: 'Level 2 - Managed Visibility',
    onboarding: 10000,
    icon: <Shield size={18} />,
  },
  [SecurityPackage.ADVANCE]: {
    base: 5000,
    perEndpoint: 6,
    perNdrIp: 1,
    maturity: 'Level 4 - Proactive Defense',
    onboarding: 15000,
    icon: <Rocket size={18} />,
  },
  [SecurityPackage.ELITE]: {
    base: 9000,
    perEndpoint: 10,
    perNdrIp: 1,
    maturity: 'Level 5 - Full Optimized SOC',
    onboarding: 20000,
    icon: <Zap size={18} />,
  },
};

const SIEM_TIERS = [
  { id: 'none', name: 'No SIEM Log Tier', price: 0, desc: 'Logs managed locally' },
  { id: '10gb', name: '10GB Log Tier (20 Alerts)', price: 200, desc: 'Includes 20 Alerts Tuning' },
  { id: '50gb', name: '50GB Log Tier', price: 800, desc: 'Extended visibility' },
  { id: '100gb', name: '100GB Log Tier', price: 1500, desc: 'Large environment scaling' },
  { id: '500gb', name: '500GB Log Tier', price: 5000, desc: 'Enterprise data hub' },
];

/* =========================
   COMPONENT
========================= */

export default function DefensivePricing() {
  const [searchParams] = useSearchParams();
  const existingProposalId = searchParams.get('proposalId');

  const [loadedProposal, setLoadedProposal] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [client, setClient] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<SecurityPackage>(SecurityPackage.CORE);
  const [endpoints, setEndpoints] = useState(100);
  const [ndrIps, setNdrIps] = useState(50);
  const [siemTier, setSiemTier] = useState('none');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addonDays, setAddonDays] = useState<Record<string, number>>({});
  const [contractTerm, setContractTerm] = useState<12 | 36 | 60>(12);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  /* =========================
     LOAD EXISTING (EDIT MODE)
  ========================= */

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
      setSelectedPkg(d.maturity || SecurityPackage.CORE);
      setEndpoints(d.inputs?.endpoints ?? 100);
      setNdrIps(d.inputs?.ndrIps ?? 50);
      setSiemTier(d.inputs?.siemTier ?? 'none');
      setContractTerm(d.inputs?.contractTerm ?? 12);

      const addons = d.addons || [];
      setSelectedAddons(addons.map((a: any) => a.id));

      const daysMap: Record<string, number> = {};
      addons.forEach((a: any) => (daysMap[a.id] = a.days || 1));
      setAddonDays(daysMap);
    };

    loadExisting();
  }, [existingProposalId]);

  /* =========================
     CALCULATIONS
  ========================= */

  const totals = useMemo(() => {
    const pkg = PACKAGES[selectedPkg];
    const siem = SIEM_TIERS.find(t => t.id === siemTier);

    const baseMonthly =
      pkg.base +
      endpoints * pkg.perEndpoint +
      ndrIps * pkg.perNdrIp +
      (siem?.price || 0);

    const addonPrice = selectedAddons.reduce(
      (sum, id) => sum + (addonDays[id] || 1) * 1250,
      0
    );

    const totalOneTime = pkg.onboarding + addonPrice;
    const termDiscount = contractTerm === 36 ? 0.15 : contractTerm === 60 ? 0.25 : 0;

    return {
      baseMonthly,
      monthly: baseMonthly * (1 - termDiscount),
      yearly: baseMonthly * (1 - termDiscount) * 12,
      oneTime: totalOneTime,
      termDiscount,
    };
  }, [selectedPkg, endpoints, ndrIps, siemTier, selectedAddons, addonDays, contractTerm]);

  /* =========================
     ACTIONS
  ========================= */

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const updateAddonDays = (id: string, days: number) => {
    setAddonDays(prev => ({ ...prev, [id]: Math.max(1, days) }));
  };

  const buildLineItems = () => {
  const items: any[] = [];

  items.push({
    category: 'Service Tier',
    description: `${selectedPkg} Managed MDR`,
    metric: '1 Base Platform',
    unit_price: pkg.base,
    extended_monthly: pkg.base,
    billing: 'monthly',
  });

  items.push({
    category: 'Endpoints',
    description: 'Managed Identities & Devices',
    metric: `${endpoints} Units`,
    unit_price: pkg.perEndpoint,
    extended_monthly: endpoints * pkg.perEndpoint,
    billing: 'monthly',
  });

  items.push({
    category: 'NDR Visibility',
    description: 'IP Network Detection Nodes',
    metric: `${ndrIps} Units`,
    unit_price: pkg.perNdrIp,
    extended_monthly: ndrIps * pkg.perNdrIp,
    billing: 'monthly',
  });

  if (siem?.price) {
    items.push({
      category: 'SIEM Tier',
      description: siem.name,
      metric: '1 Logic Bundle',
      unit_price: siem.price,
      extended_monthly: siem.price,
      billing: 'monthly',
    });
  }

  if (selectedAddons.length) {
    items.push({
      category: 'Professional Services',
      description: selectedAddons.map(id => {
        const a = ADDONS.find(x => x.id === id);
        return `${a?.name} (${addonDays[id] || 1} Days)`;
      }),
      metric: '€1,250 / Day',
      unit_price: 1250,
      extended_onetime: selectedAddons.reduce(
        (s, id) => s + (addonDays[id] || 1) * 1250,
        0
      ),
      billing: 'one_time',
    });
  }

  items.push({
    category: 'Contractual Adjustments',
    description: `${contractTerm} Month Commitment Discount`,
    discount_percent: totals.termDiscount,
    billing: 'discount',
  });

  return items;
};

  const handleSave = async () => {
    if (isLocked) return;

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      alert('Not authenticated');
      return;
    }

    const servicePackage = MDR_SERVICE_PACKAGES[selectedPkg];

    const payloadData = {
      calculator: 'defensive_pricing',
      client: { name: client || null },
      inputs: { endpoints, ndrIps, siemTier, contractTerm },
      addons: selectedAddons.map(id => ({
        id,
        days: addonDays[id] || 1,
      })),
      pricing: totals,

      maturity: selectedPkg,
       // ✅ ADD THIS
      maturity_summary: {
        level: PACKAGES[selectedPkg].maturity,
        tier: selectedPkg,
      },

      // ✅ ADD THIS
      line_items: buildLineItems(),
      service_package: {
        tier: selectedPkg,
        maturity_label: servicePackage.maturityLabel,
        inclusions: servicePackage.inclusions,
      },

      onboarding: {
        steps: ['Kick-off', 'Integration', 'Tuning', 'Validation', 'Go Live'],
        fee: PACKAGES[selectedPkg].onboarding,
      },
    };

    let error: any = null;

    if (existingProposalId) {
      // update existing draft
      const resp = await supabase
        .from('proposals')
        .update({
          data: payloadData,
          // status NOT changed here
        })
        .eq('id', existingProposalId);

      error = resp.error;
    } else {
      // create new draft
      const proposalId = crypto.randomUUID();
      const resp = await supabase.from('proposals').insert([{
        id: proposalId,
        user_id: user.id,
        status: 'draft',
        calculator_type: 'defensive',
        tags: ['xMDR'],
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

    setSaveStatus('Draft saved successfully');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const pkg = PACKAGES[selectedPkg];
  const siem = SIEM_TIERS.find(t => t.id === siemTier);

  return (
    <div className="space-y-6 pb-12">
      <header className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            xMDR Pricing <span className="text-blue-600">Calculator</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Commercial Architecture Studio
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 bg-white text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
            <FileDown size={14} /> Export
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isLocked}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all disabled:opacity-60"
          >
            <Save size={14} /> {saving ? '...' : isLocked ? 'Locked' : 'Save'}
          </button>
        </div>
      </header>

      {saveStatus && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center gap-3 animate-in zoom-in duration-300">
          <CheckCircle2 size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">{saveStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          {/* CLIENT INFO & TERM */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Client Identification
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. Global Enterprise Corp"
                className="w-full text-xs font-bold bg-slate-50 border-none rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                Engagement Period
              </label>
              <div className="flex gap-1 p-1 bg-slate-50 rounded-lg">
                {[12, 36, 60].map(term => (
                  <button
                    key={term}
                    onClick={() => setContractTerm(term as any)}
                    className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                      contractTerm === term
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {term} Months
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* PACKAGE & SCOPE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                1. Managed Service Tier
              </label>
              <div className="space-y-1.5">
                {(Object.keys(PACKAGES) as SecurityPackage[]).map(pkgName => (
                  <button
                    key={pkgName}
                    onClick={() => setSelectedPkg(pkgName)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                      selectedPkg === pkgName
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className={`${selectedPkg === pkgName ? 'text-blue-600' : 'text-slate-400'}`}>
                      {PACKAGES[pkgName].icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 leading-none">{pkgName}</p>
                      <p className="text-[8px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">
                        Base €{PACKAGES[pkgName].base.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                2. Coverage Scope
              </label>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Endpoints / IDs</p>
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button onClick={() => setEndpoints(Math.max(0, endpoints - 1))} className="p-1 hover:bg-slate-200 rounded-md">
                      <Minus size={12} />
                    </button>
                    <input
                      type="number"
                      value={endpoints}
                      onChange={(e) => setEndpoints(parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-center font-black text-xs outline-none"
                    />
                    <button onClick={() => setEndpoints(endpoints + 1)} className="p-1 hover:bg-slate-200 rounded-md">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">NDR IP Addresses</p>
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button onClick={() => setNdrIps(Math.max(0, ndrIps - 1))} className="p-1 hover:bg-slate-200 rounded-md">
                      <Minus size={12} />
                    </button>
                    <input
                      type="number"
                      value={ndrIps}
                      onChange={(e) => setNdrIps(parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-center font-black text-xs outline-none"
                    />
                    <button onClick={() => setNdrIps(ndrIps + 1)} className="p-1 hover:bg-slate-200 rounded-md">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                3. SIEM Log Volume
              </label>
              <div className="space-y-2">
                <select
                  value={siemTier}
                  onChange={(e) => setSiemTier(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                >
                  {SIEM_TIERS.map(tier => (
                    <option key={tier.id} value={tier.id}>{tier.name}</option>
                  ))}
                </select>
                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-[8px] text-blue-600 font-black uppercase tracking-widest leading-relaxed">
                    {SIEM_TIERS.find(t => t.id === siemTier)?.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ADDONS */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
              <span className="w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center text-[8px] font-bold">4</span>
              Strategic Advisory & Implementation (€1,250 / Day)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ADDONS.map(addon => (
                <div
                  key={addon.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                    selectedAddons.includes(addon.id)
                      ? 'border-blue-600 bg-blue-50/20 shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleAddon(addon.id)}
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                        selectedAddons.includes(addon.id)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedAddons.includes(addon.id) && <CheckCircle2 size={10} />}
                    </button>

                    <div className="truncate">
                      <p className="text-[10px] font-black text-slate-900 leading-none truncate">{addon.name}</p>
                      <p className="text-[8px] text-slate-500 mt-0.5 truncate">{addon.description}</p>
                    </div>
                  </div>

                  {selectedAddons.includes(addon.id) && (
                    <div className="flex items-center gap-1.5 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 ml-2">
                      <button
                        onClick={() => updateAddonDays(addon.id, (addonDays[addon.id] || 1) - 1)}
                        className="p-0.5 text-slate-400 hover:text-slate-900"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-[9px] font-black w-2 text-center">{addonDays[addon.id] || 1}</span>
                      <button
                        onClick={() => updateAddonDays(addon.id, (addonDays[addon.id] || 1) + 1)}
                        className="p-0.5 text-slate-400 hover:text-slate-900"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SUMMARY & MATURITY & JOURNEY COLUMN */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-6 space-y-4">
            {/* FINANCIAL SUMMARY */}
            <div className="bg-slate-950 text-white rounded-xl p-5 shadow-xl border border-slate-800">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                <TrendingUp size={14} className="text-blue-600" />
                <h3 className="text-[10px] font-black tracking-widest uppercase italic">Commercial Summary</h3>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                  <span>Activation Fee</span>
                  <span className="text-white">€{pkg.onboarding.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                  <span>Monthly Opex</span>
                  <span className="text-white">€{totals.monthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                  <span>Contract Term</span>
                  <span className="text-white">{contractTerm}M</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div>
                  <p className="text-blue-500 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Total One-Time</p>
                  <p className="text-2xl font-black tracking-tighter">€{Math.round(totals.oneTime).toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-blue-500 text-[8px] font-black uppercase tracking-[0.2em]">Monthly Recurring</p>
                    {totals.termDiscount > 0 && (
                      <span className="bg-blue-600/20 text-blue-400 text-[7px] font-black px-1 py-0.5 rounded uppercase tracking-tighter">
                        -{totals.termDiscount * 100}% DISCOUNT
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-black tracking-tighter">€{Math.round(totals.monthly).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* MATURITY MAP */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-[9px] font-black mb-3 flex items-center gap-2 uppercase tracking-widest text-slate-900">
                <Target size={14} className="text-blue-600" />
                Strategic Maturity Level
              </h3>
              <p className="text-[10px] font-black text-blue-600 mb-2 italic">{pkg.maturity}</p>
              <p className="text-[9px] text-slate-500 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                Tier focused on {selectedPkg === SecurityPackage.ELITE
                  ? 'custom automation, advanced response playbooks and VOC operations.'
                  : selectedPkg === SecurityPackage.ADVANCE
                  ? 'proactive threat hunting across full XDR/NDR telemetry.'
                  : 'establishing core detection visibility and 24/7 managed response.'}
              </p>
            </div>

            {/* ONBOARDING JOURNEY */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-[9px] font-black text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <PlayCircle size={14} className="text-blue-600" />
                Onboarding Journey
              </h3>
              <div className="space-y-3">
                {[
                  { step: 1, label: 'Kick-off', icon: <Calendar size={12} /> },
                  { step: 2, label: 'Integration', icon: <Layers size={12} /> },
                  { step: 3, label: 'Tuning', icon: <Activity size={12} /> },
                  { step: 4, label: 'Validation', icon: <Target size={12} /> },
                  { step: 5, label: 'Go Live', icon: <Lock size={12} /> },
                ].map(item => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">
                      {item.step}
                    </div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED BREAKUP TABLE */}
        <div className="lg:col-span-4 mt-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={14} className="text-blue-600" />
                Detailed Line-Item Cost Analysis
              </h3>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Pricing Subject to Term Verification
              </span>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Metric / Qty</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Extended Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="px-6 py-3 text-[10px] font-black text-slate-900">Service Tier</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">{selectedPkg} Managed MDR</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">1 Base Platform</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">€{pkg.base.toLocaleString()}</td>
                  <td className="px-6 py-3 text-[10px] font-black text-slate-900 text-right">€{pkg.base.toLocaleString()} / mo</td>
                </tr>

                <tr>
                  <td className="px-6 py-3 text-[10px] font-black text-slate-900">Endpoints</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">Managed Identities & Devices</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">{endpoints} Units</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">€{pkg.perEndpoint}</td>
                  <td className="px-6 py-3 text-[10px] font-black text-slate-900 text-right">
                    €{(endpoints * pkg.perEndpoint).toLocaleString()} / mo
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-3 text-[10px] font-black text-slate-900">NDR Visibility</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">IP Network Detection Nodes</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">{ndrIps} Units</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">€{pkg.perNdrIp}</td>
                  <td className="px-6 py-3 text-[10px] font-black text-slate-900 text-right">
                    €{(ndrIps * pkg.perNdrIp).toLocaleString()} / mo
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-3 text-[10px] font-black text-slate-900">SIEM Tier</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">{siem?.name}</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">1 Logic Bundle</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">€{(siem?.price || 0).toLocaleString()}</td>
                  <td className="px-6 py-3 text-[10px] font-black text-slate-900 text-right">
                    €{(siem?.price || 0).toLocaleString()} / mo
                  </td>
                </tr>

                {selectedAddons.length > 0 && (
                  <tr>
                    <td className="px-6 py-3 text-[10px] font-black text-blue-600">Professional Services</td>
                    <td className="px-6 py-3 text-[10px] text-slate-600 font-medium" colSpan={2}>
                      {selectedAddons.map(id => {
                        const a = ADDONS.find(ad => ad.id === id);
                        return <div key={id}>• {a?.name} ({addonDays[id] || 1} Days)</div>;
                      })}
                    </td>
                    <td className="px-6 py-3 text-[10px] text-slate-600 font-medium">€1,250 / Day</td>
                    <td className="px-6 py-3 text-[10px] font-black text-slate-900 text-right">
                      €{selectedAddons.reduce((s, id) => s + (addonDays[id] || 1) * 1250, 0).toLocaleString()} (One-Time)
                    </td>
                  </tr>
                )}

                <tr className="bg-slate-50">
                  <td className="px-6 py-3 text-[10px] font-black text-slate-900">Contractual Adjustments</td>
                  <td className="px-6 py-3 text-[10px] text-slate-500 font-bold italic" colSpan={3}>
                    {contractTerm} Month Commitment Discount
                  </td>
                  <td className="px-6 py-3 text-[10px] font-black text-blue-600 text-right">
                    -{Math.round(totals.termDiscount * 100)}% Applied
                  </td>
                </tr>
              </tbody>

              <tfoot>
                <tr className="bg-slate-900 text-white">
                  <td className="px-6 py-4 text-[11px] font-black uppercase tracking-widest" colSpan={4}>
                    Consolidated Annual Recurring Value (ARV)
                  </td>
                  <td className="px-6 py-4 text-xl font-black text-right">
                    €{Math.round(totals.yearly).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
