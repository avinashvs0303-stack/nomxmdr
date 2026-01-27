import React from 'react';
import { CheckCircle2, Minus, Download, Shield, Info } from 'lucide-react';
import { exportPackagesToExcel } from '../services/exportService';

const MdrPackagesView: React.FC = () => {
  const handleExport = () => {
    exportPackagesToExcel();
  };

  const TableHeader = ({ title }: { title: string }) => (
    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-12 mb-4 pb-2 border-b border-blue-100 flex items-center gap-2">
      <Shield size={16} /> {title}
    </h3>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Nomios MDR Service Packages
          </h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <Info size={16} className="text-blue-500" />
            Standardized service levels designed for different organizational security maturities.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20 active:scale-95 group"
        >
          <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          Export Comparison Matrix
        </button>
      </div>

      {/* Package Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <PackageSummaryCard
          title="Core"
          desc="Organizations starting MDR with essential detection & response"
          color="blue"
        />
        <PackageSummaryCard
          title="Advanced"
          desc="Mature security teams needing extended automation and governance"
          color="indigo"
        />
        <PackageSummaryCard
          title="Elite"
          desc="Enterprise / regulated environments requiring full SOC partnership"
          color="slate"
        />
      </div>

      {/* Comparison Tables */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 overflow-hidden">

        {/* 1 */}
        <TableHeader title="1. Framework & Commercial Terms" />
        <ComparisonTable rows={[
          { name: "Service Term (months)", core: "12 / 36 / 60", advanced: "36 / 60", elite: "36 / 60" },
          { name: "Predictable Costs (Fixed Fee Model)", core: true, advanced: true, elite: true },
          { name: "Monthly / Quarterly / Annual Billing", core: true, advanced: true, elite: true },
          { name: "Annual Billing Discount", core: "–", advanced: "–", elite: "2%" },
          { name: "ISO 9001, 14001, 22301, 27001 & SOC2 Type II Certified", core: true, advanced: true, elite: true },
          { name: "24×7 SOC (Netherlands)", core: true, advanced: true, elite: true },
          { name: "Local Support Phone Number", core: true, advanced: true, elite: true },
          { name: "Online Support Portal", core: true, advanced: true, elite: true },
          { name: "Local Language Support", core: "8×5", advanced: "8×5", elite: "8x5" },
        ]} />

        {/* 2 */}
        <TableHeader title="2. Security Technology & Platform Coverage" />
        <ComparisonTable rows={[
          { name: "Security Technology Integration", core: "EDR", advanced: "XDR", elite: "XDR / SIEM" },
          { name: "24×7 Detection, Response & Eyes-on-Screen", core: true, advanced: true, elite: true },
          { name: "Automated Incident Triage & Containment", core: true, advanced: true, elite: true },
          { name: "Nomios SOAR Platform", core: true, advanced: true, elite: true },
          { name: "Cyber Threat Intelligence (CTI) Feeds", core: true, advanced: true, elite: true },
          { name: "Cyber Knowledge & Intelligence Sharing", core: true, advanced: true, elite: true },
          { name: "ITSM Service Integration", core: true, advanced: true, elite: true },
          { name: "Platform Health Monitoring (Logs & Alerts)", core: true, advanced: true, elite: true },
        ]} />

        {/* 3 */}
        <TableHeader title="3. Onboarding & Operations" />
        <ComparisonTable rows={[
          { name: "Streamlined Onboarding Project Coordination", core: true, advanced: true, elite: true },
          { name: "Security Operations Reporting (Monthly & Automated)", core: true, advanced: true, elite: true },
          { name: "Customizable Security Operations Reporting", core: "–", advanced: true, elite: true },
          { name: "Major Incident Response (P1 & P2) with Root Cause Analysis", core: "–", advanced: true, elite: true },
          { name: "Orchestration with Customer Security Tools", core: "–", advanced: true, elite: true },
        ]} />

        {/* 4 */}
        <TableHeader title="4. Governance & Service Management" />
        <ComparisonTable rows={[
          { name: "Monthly Operational Governance Meeting", core: "–", advanced: true, elite: true },
          { name: "Quarterly Business Review (QBR)", core: "–", advanced: true, elite: true },
          { name: "Designated Service Delivery Manager", core: "–", advanced: "–", elite: true },
          { name: "Proactive Threat Hunting", core: "–", advanced: "–", elite: true },
          { name: "Microsoft Teams Incident Collaboration (War Room)", core: "–", advanced: "–", elite: true },
        ]} />

        {/* 5 */}
        <TableHeader title="5. Advanced Security Capabilities" />
        <ComparisonTable rows={[
          { name: "Digital Forensics & Incident Response (CSIRT / DFIR)", core: true, advanced: true, elite: true },
          { name: "Vulnerability Management", core: true, advanced: true, elite: true },
          { name: "Hybrid SOC (After-Hours Customer SOC Extension)", core: "–", advanced: true, elite: true },
          { name: "Purple Teaming (Attack Simulations)", core: "–", advanced: true, elite: true },
          { name: "Mail Phishing Campaigns", core: "–", advanced: true, elite: true },
          { name: "MITRE ATT&CK-Based Threat Modelling", core: "–", advanced: "1× / year", elite: "2× / year" },
        ]} />

        {/* 6 */}
        <TableHeader title="6. SIEM Capabilities" />
        <ComparisonTable rows={[
          { name: "Integrate Existing SIEM into Nomios SOAR", core: "–", advanced: "–", elite: true },
          { name: "Supported SIEMs (Splunk, QRadar, Sentinel)", core: "–", advanced: "–", elite: true },
          { name: "SOC Engineering (Build, Config, Setup)", core: "–", advanced: "–", elite: true },
          { name: "SOC Content Engineering (30 Standard Use-Cases)", core: "–", advanced: "–", elite: true },
          { name: "SOC Security Assessment & Asset Mapping", core: "–", advanced: "–", elite: true },
          { name: "Real-Time SIEM Dashboards", core: "–", advanced: "–", elite: true },
          { name: "Licenses / Hosting / Hardware", core: "Excluded", advanced: "Excluded", elite: "Excluded" },
        ]} />

        {/* 7 */}
        <TableHeader title="7. Complementary Security Services" />
        <ComparisonTable rows={[
          { name: "EDR / NDR / XDR Implementation & Management", core: true, advanced: true, elite: true },
          { name: "Deception (Honeypots)", core: true, advanced: true, elite: true },
          { name: "Security Consulting, Assessment & Pentesting", core: true, advanced: true, elite: true },
          { name: "Security Expert Advisory Services", core: true, advanced: true, elite: true },
          { name: "Vulnerability Operations Center (VOC)", core: true, advanced: true, elite: true },
          { name: "IoT / OT Security Monitoring", core: "–", advanced: "–", elite: true },
        ]} />

      </div>
    </div>
  );
};

const PackageSummaryCard = ({ title, desc, color }: { title: string; desc: string; color: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    slate: 'border-slate-300 bg-slate-900 text-white',
  };

  return (
    <div className={`p-6 rounded-2xl border-2 shadow-sm ${colorMap[color]} transition-all hover:scale-[1.02] duration-300`}>
      <h3 className="text-xl font-black mb-2 uppercase tracking-tight">{title}</h3>
      <p className={`text-sm ${color === 'slate' ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
    </div>
  );
};

const ComparisonTable = ({ rows }: { rows: any[] }) => {
  const StatusIcon = ({ status }: { status: boolean | string }) => {
    if (status === true) return <CheckCircle2 size={20} className="text-emerald-500 mx-auto" />;
    if (status === "–" || status === false) return <Minus size={18} className="text-slate-200 mx-auto" />;
    return <span className="text-xs font-bold text-slate-600 block text-center">{status}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase w-[40%]">Feature</th>
            <th className="px-4 py-3 text-xs font-bold text-blue-600 uppercase text-center">Core</th>
            <th className="px-4 py-3 text-xs font-bold text-blue-600 uppercase text-center">Advanced</th>
            <th className="px-4 py-3 text-xs font-bold text-blue-600 uppercase text-center">Elite</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 text-sm font-semibold text-slate-700">{row.name}</td>
              <td className="px-4 py-4"><StatusIcon status={row.core} /></td>
              <td className="px-4 py-4"><StatusIcon status={row.advanced} /></td>
              <td className="px-4 py-4"><StatusIcon status={row.elite} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MdrPackagesView;
