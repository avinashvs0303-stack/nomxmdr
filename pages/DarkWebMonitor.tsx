import React from 'react';
import { Globe, ShieldAlert, Download, Eye } from 'lucide-react';
import { exportDarkWebMonitoringToExcel } from '../services/exportService';

const DarkWebMonitoringServices: React.FC = () => {
  const TableHeader = ({ title }: { title: string }) => (
    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-12 mb-4 pb-2 border-b border-blue-100 flex items-center gap-2">
      <Eye size={16} /> {title}
    </h3>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Dark Web Monitoring Services
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Continuous monitoring of dark web marketplaces, forums, and breach repositories
            to detect leaked credentials, corporate domains, brands, and executive exposure.
          </p>
        </div>

        <button
          onClick={exportDarkWebMonitoringToExcel}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
        >
          <Download size={18} />
          Export Proposal
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Core"
          desc="Baseline dark web visibility for domains and credentials"
          color="blue"
        />
        <SummaryCard
          title="Advanced"
          desc="Expanded coverage with alerting, enrichment, and response workflows"
          color="indigo"
        />
        <SummaryCard
          title="Elite"
          desc="Executive exposure, brand protection, and SOC-integrated response"
          color="slate"
        />
      </div>

      {/* Service Comparison */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8">

        <TableHeader title="1. Monitoring Scope" />
        <ComparisonTable rows={[
          { name: 'Dark Web Marketplaces & Forums', core: true, advanced: true, elite: true },
          { name: 'Paste Sites & Breach Dumps', core: true, advanced: true, elite: true },
          { name: 'Corporate Domain Monitoring', core: true, advanced: true, elite: true },
          { name: 'Employee Credential Exposure', core: true, advanced: true, elite: true },
          { name: 'Executive / VIP Exposure', core: '–', advanced: true, elite: true },
          { name: 'Brand & Impersonation Monitoring', core: '–', advanced: true, elite: true },
        ]} />

        <TableHeader title="2. Detection & Intelligence" />
        <ComparisonTable rows={[
          { name: 'Credential Validation & Context Enrichment', core: '–', advanced: true, elite: true },
          { name: 'Threat Actor & Source Attribution', core: '–', advanced: true, elite: true },
          { name: 'Risk Severity Scoring', core: true, advanced: true, elite: true },
          { name: 'Dark Web Intelligence Analyst Review', core: '–', advanced: true, elite: true },
        ]} />

        <TableHeader title="3. Alerting & Response" />
        <ComparisonTable rows={[
          { name: 'Real-Time Alerts', core: true, advanced: true, elite: true },
          { name: 'SOC Escalation & Case Creation', core: '–', advanced: true, elite: true },
          { name: 'Credential Reset & Advisory Guidance', core: '–', advanced: true, elite: true },
          { name: 'Incident Response Support', core: '–', advanced: 'Optional', elite: true },
        ]} />

        <TableHeader title="4. Reporting & Governance" />
        <ComparisonTable rows={[
          { name: 'Monthly Exposure Reports', core: true, advanced: true, elite: true },
          { name: 'Executive Risk Reporting', core: '–', advanced: true, elite: true },
          { name: 'Quarterly Threat Landscape Review', core: '–', advanced: '–', elite: true },
        ]} />

        <TableHeader title="5. Commercial Model (Indicative)" />
        <ComparisonTable rows={[
          { name: 'Base Monitoring Fee (Monthly)', core: '✓', advanced: '✓', elite: '✓' },
          { name: 'Included Domains / Brands', core: '1', advanced: '3', elite: '5+' },
          { name: 'Included Executives', core: '–', advanced: '2', elite: '5+' },
          { name: 'Additional Assets', core: 'Add-on', advanced: 'Add-on', elite: 'Add-on' },
        ]} />

      </div>
    </div>
  );
};

/* ======================
   Shared Components
====================== */

const SummaryCard = ({ title, desc, color }: { title: string; desc: string; color: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    slate: 'border-slate-300 bg-slate-900 text-white',
  };

  return (
    <div className={`p-6 rounded-2xl border-2 shadow-sm ${colorMap[color]} hover:scale-[1.02] transition-transform`}>
      <h3 className="text-xl font-black mb-2 uppercase">{title}</h3>
      <p className={`text-sm ${color === 'slate' ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
    </div>
  );
};

const ComparisonTable = ({ rows }: { rows: any[] }) => {
  const Status = ({ v }: { v: boolean | string }) => {
    if (v === true) return <ShieldAlert size={18} className="text-emerald-500 mx-auto" />;
    if (v === '–') return <span className="text-slate-300 text-sm block text-center">–</span>;
    return <span className="text-xs font-bold text-slate-600 block text-center">{v}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 w-[40%]">Feature</th>
            <th className="text-center text-xs font-bold text-blue-600">Core</th>
            <th className="text-center text-xs font-bold text-blue-600">Advanced</th>
            <th className="text-center text-xs font-bold text-blue-600">Elite</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-blue-50/30">
              <td className="px-6 py-4 font-semibold text-slate-700">{r.name}</td>
              <td><Status v={r.core} /></td>
              <td><Status v={r.advanced} /></td>
              <td><Status v={r.elite} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DarkWebMonitoringServices;
