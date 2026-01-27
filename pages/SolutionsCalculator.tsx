import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Download, Link2, Calculator, ShieldAlert } from 'lucide-react';
import { exportSolutionsToExcel } from '../services/exportService';

type ProductType = 'EDR' | 'SIEM' | 'NDR' | 'CUSTOM';

type LineItem = {
  id: string;
  type: ProductType;
  name: string;

  // Quantities
  endpoints?: number; // EDR
  gbPerDay?: number;  // SIEM
  sensors?: number;   // NDR

  // Commercials
  sku?: string;
  unitMsrp: number;     // monthly MSRP per unit (endpoint / GB/day / sensor)
  resellerMarginPct: number; // margin you keep (internal)
  customerDiscountPct: number; // discount you give customer
  oneTimeOnboarding: number;  // one-time fee for this line (optional)
};

const DEFAULT_CATALOG: Record<ProductType, { name: string; unitMsrp: number; marginPct: number; discountPct: number; }[]> = {
  EDR: [
    { name: 'Managed EDR', unitMsrp: 12, marginPct: 25, discountPct: 0 }, // €/endpoint/month
  ],
  SIEM: [
    { name: 'Managed SIEM', unitMsrp: 18, marginPct: 25, discountPct: 0 }, // €/GB/day/month (illustrative)
  ],
  NDR: [
    { name: 'Managed NDR', unitMsrp: 250, marginPct: 25, discountPct: 0 }, // €/sensor/month
  ],
  CUSTOM: [
    { name: 'Custom Product', unitMsrp: 100, marginPct: 25, discountPct: 0 },
  ],
};

const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

export default function SolutionsCalculator() {
  const [termMonths, setTermMonths] = useState(12);
  const [billingFrequency, setBillingFrequency] = useState<'Monthly' | 'Quarterly' | 'Annual'>('Monthly');

  // Global commercial controls (optional)
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // Add line UI
  const [newType, setNewType] = useState<ProductType>('EDR');
  const [newVariantIndex, setNewVariantIndex] = useState(0);

  const [items, setItems] = useState<LineItem[]>([
    // Start empty or seed with one line
  ]);

  const addLine = () => {
    const variant = DEFAULT_CATALOG[newType][newVariantIndex] ?? DEFAULT_CATALOG[newType][0];
    const base: LineItem = {
      id: uuid(),
      type: newType,
      name: variant.name,
      unitMsrp: variant.unitMsrp,
      resellerMarginPct: variant.marginPct,
      customerDiscountPct: variant.discountPct,
      oneTimeOnboarding: 0,
    };

    // sensible defaults per type
    if (newType === 'EDR') base.endpoints = 250;
    if (newType === 'SIEM') base.gbPerDay = 10;
    if (newType === 'NDR') base.sensors = 2;
    if (newType === 'CUSTOM') base.endpoints = undefined;

    setItems(prev => [...prev, base]);
  };

  const removeLine = (id: string) => setItems(prev => prev.filter(x => x.id !== id));

  const updateLine = (id: string, patch: Partial<LineItem>) => {
    setItems(prev => prev.map(x => (x.id === id ? { ...x, ...patch } : x)));
  };

  const lineUnits = (x: LineItem) => {
    if (x.type === 'EDR') return x.endpoints ?? 0;
    if (x.type === 'SIEM') return x.gbPerDay ?? 0;
    if (x.type === 'NDR') return x.sensors ?? 0;
    // Custom: treat endpoints as generic "units" if you want, otherwise 1
    return 1;
  };

  const lineUnitLabel = (t: ProductType) => {
    if (t === 'EDR') return 'Endpoints';
    if (t === 'SIEM') return 'GB/day';
    if (t === 'NDR') return 'Sensors';
    return 'Units';
  };

  const pricing = useMemo(() => {
    const lines = items.map(x => {
      const units = lineUnits(x);
      const msrpMonthly = units * x.unitMsrp;

      // Customer list price (what you charge before discounts)
      // Here: apply your reseller margin as uplift vs MSRP, or treat MSRP as list.
      // Common reseller approach: MSRP is vendor list; your sell price uses margin & discount.
      const sellListMonthly = msrpMonthly * (1 + x.resellerMarginPct / 100);

      // Apply line discount + optional global discount
      const effectiveDiscount = 1 - (x.customerDiscountPct + globalDiscount) / 100;
      const discountedMonthly = Math.max(0, sellListMonthly * effectiveDiscount);

      return {
        ...x,
        units,
        msrpMonthly,
        sellListMonthly,
        discountedMonthly,
      };
    });

    const recurringMonthly = lines.reduce((s, l) => s + l.discountedMonthly, 0);
    const oneTime = lines.reduce((s, l) => s + (l.oneTimeOnboarding || 0), 0);

    const tcv = recurringMonthly * termMonths + oneTime;

    return { lines, recurringMonthly, oneTime, tcv };
  }, [items, termMonths, globalDiscount]);

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Solutions Calculator</h1>
          <p className="text-slate-500 mt-2">
            Build a bespoke offer by mixing EDR, SIEM, NDR and optional services. Export as a proposal-ready sheet.
          </p>
        </div>

        <button
          onClick={() =>
            exportSolutionsToExcel({
              termMonths,
              billingFrequency,
              globalDiscount,
              items: pricing.lines.map(l => ({
                type: l.type,
                name: l.name,
                sku: l.sku || '',
                units: l.units,
                unitLabel: lineUnitLabel(l.type),
                unitMsrp: l.unitMsrp,
                resellerMarginPct: l.resellerMarginPct,
                lineDiscountPct: l.customerDiscountPct,
                globalDiscountPct: globalDiscount,
                listMonthly: l.sellListMonthly,
                customerMonthly: l.discountedMonthly,
                oneTimeOnboarding: l.oneTimeOnboarding || 0,
              })),
              totals: {
                recurringMonthly: pricing.recurringMonthly,
                oneTime: pricing.oneTime,
                tcv: pricing.tcv,
              },
            })
          }
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          <Download size={18} />
          Export Proposal
        </button>
      </div>

      {/* Quick Links (combined offer flow) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Link2 size={18} />
          </div>
          <div>
            <p className="font-bold text-slate-900">Combine with other modules</p>
            <p className="text-sm text-slate-500">
              Use these pages for detailed pricing and export each module, or export a combined proposal from here.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a href="#/defensive/exposure-management" className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-100">
            Exposure Management
          </a>
          <a href="#/offensive/dark-web" className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-100">
            Dark Web Monitoring
          </a>
          <a href="#/defensive/packages" className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-100">
            MDR Packages
          </a>
        </div>
      </div>

      {/* Commercial Terms */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-sm">
          <Calculator size={16} /> Commercial Terms
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select label="Contract Term (Months)" value={termMonths} onChange={setTermMonths} options={[12, 36, 60]} />
          <Select label="Billing Frequency" value={billingFrequency} onChange={setBillingFrequency} options={['Monthly', 'Quarterly', 'Annual']} />
          <NumberInput label="Global Discount (%)" value={globalDiscount} onChange={setGlobalDiscount} />
        </div>
      </div>

      {/* Add Product */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-sm">
          <ShieldAlert size={16} /> Add Products
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select label="Type" value={newType} onChange={(v: ProductType) => { setNewType(v); setNewVariantIndex(0); }} options={['EDR', 'SIEM', 'NDR', 'CUSTOM']} />
          <Select
            label="Product"
            value={newVariantIndex}
            onChange={setNewVariantIndex}
            options={DEFAULT_CATALOG[newType].map((p, idx) => ({ label: p.name, value: idx }))}
          />
          <div className="md:col-span-2 flex items-end">
            <button onClick={addLine} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold">
              <Plus size={16} /> Add to proposal
            </button>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
          Proposal Line Items
        </h3>

        {items.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-50 border border-slate-100 text-center text-slate-500">
            Add EDR / SIEM / NDR products to start pricing.
          </div>
        ) : (
          <div className="space-y-4">
            {pricing.lines.map((l) => (
              <div key={l.id} className="rounded-2xl border border-slate-200 p-5 hover:bg-blue-50/20 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <p className="text-lg font-black text-slate-900">{l.name}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {l.type} {l.sku ? `• SKU ${l.sku}` : ''}
                    </p>
                  </div>

                  <button onClick={() => removeLine(l.id)} className="text-red-500 hover:text-red-600 flex items-center gap-2 font-bold text-sm">
                    <Trash2 size={16} /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
                  {/* Quantity */}
                  <NumberInput
                    label={lineUnitLabel(l.type)}
                    value={l.type === 'EDR' ? (l.endpoints ?? 0) : l.type === 'SIEM' ? (l.gbPerDay ?? 0) : l.type === 'NDR' ? (l.sensors ?? 0) : 1}
                    onChange={(v: number) => {
                      if (l.type === 'EDR') updateLine(l.id, { endpoints: v });
                      if (l.type === 'SIEM') updateLine(l.id, { gbPerDay: v });
                      if (l.type === 'NDR') updateLine(l.id, { sensors: v });
                    }}
                  />

                  <TextInput label="SKU (optional)" value={l.sku ?? ''} onChange={(v: string) => updateLine(l.id, { sku: v })} />

                  <NumberInput label="Unit MSRP (€ / mo)" value={l.unitMsrp} onChange={(v: number) => updateLine(l.id, { unitMsrp: v })} />
                  <NumberInput label="Reseller Margin (%)" value={l.resellerMarginPct} onChange={(v: number) => updateLine(l.id, { resellerMarginPct: v })} />
                  <NumberInput label="Line Discount (%)" value={l.customerDiscountPct} onChange={(v: number) => updateLine(l.id, { customerDiscountPct: v })} />
                  <NumberInput label="Onboarding (€ one-time)" value={l.oneTimeOnboarding} onChange={(v: number) => updateLine(l.id, { oneTimeOnboarding: v })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <PricePill label="List Monthly" value={`€ ${l.sellListMonthly.toFixed(2)}`} />
                  <PricePill label="Customer Monthly" value={`€ ${l.discountedMonthly.toFixed(2)}`} />
                  <PricePill label="Units" value={`${l.units} ${lineUnitLabel(l.type)}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl">
        <h3 className="text-xl font-black mb-6">Totals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TotalCard label="Recurring Monthly" value={`€ ${pricing.recurringMonthly.toFixed(2)}`} />
          <TotalCard label="One-time (Onboarding)" value={`€ ${pricing.oneTime.toFixed(2)}`} />
          <TotalCard label={`Total Contract (${termMonths} mo)`} value={`€ ${pricing.tcv.toFixed(2)}`} highlight />
        </div>
      </div>
    </div>
  );
}

/* ======================
   UI helpers
====================== */

function Select({ label, value, onChange, options }: any) {
  const normalized = options.map((o: any) => (typeof o === 'object' ? o : { label: String(o), value: o }));
  return (
    <div>
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          const num = Number(v);
          onChange(Number.isNaN(num) ? v : num);
        }}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
      >
        {normalized.map((o: any) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function NumberInput({ label, value, onChange }: any) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
      />
    </div>
  );
}

function TextInput({ label, value, onChange }: any) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold"
      />
    </div>
  );
}

function PricePill({ label, value }: any) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="text-lg font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function TotalCard({ label, value, highlight }: any) {
  return (
    <div className={`p-4 rounded-2xl ${highlight ? 'bg-emerald-600' : 'bg-slate-800'}`}>
      <p className="text-xs uppercase tracking-widest opacity-80">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}
