import React, { useState } from 'react';
import {
  Users,
  Cog,
  Cpu,
  Shield,
  Clock,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Layers,
  Target,
  Eye,
  Zap,
  FileText,
  MessageSquare,
  Bell,
  Activity,
  Server,
  Cloud,
  Lock,
  GitBranch,
  BarChart3,
  Headphones,
  UserCheck,
  ShieldCheck,
  Workflow,
  Timer,
  AlertCircle,
} from 'lucide-react';

/* ======================
   TYPES
====================== */

type TabKey = 'people' | 'process' | 'technology';

interface SLAItem {
  priority: string;
  label: string;
  description: string;
  ackTime: string;
  alertMethod: string;
  color: string;
  bgColor: string;
}

/* ======================
   CONSTANTS
====================== */

const SLA_DATA: SLAItem[] = [
  {
    priority: 'P1',
    label: 'Critical',
    description: 'Significant damage, corruption, loss or compromise of confidential, critical information. Potential damages to public image and customer confidence.',
    ackTime: '15 Minutes',
    alertMethod: 'Ticket / Email / Call / MIM',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
  {
    priority: 'P2',
    label: 'High',
    description: 'Damage, corruption, or loss of replaceable information. Moderate impact on operations or reputation.',
    ackTime: '30 Minutes',
    alertMethod: 'Ticket / Email / Call / MIM',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  {
    priority: 'P3',
    label: 'Medium',
    description: 'Inconvenience, minor costs associated with recovery, unintentional actions. Little material impact on operations.',
    ackTime: '4 Hours',
    alertMethod: 'Ticket / Email',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  {
    priority: 'P4',
    label: 'Low',
    description: 'Limited impact to a small number of users. Minor inconvenience without material effect.',
    ackTime: '8 Hours',
    alertMethod: 'Ticket / Email',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
];

const TEAM_ROLES = [
  {
    title: 'Security Analysts',
    coverage: '24x7',
    description: 'Frontline monitoring, alert triage, and initial incident response.',
    icon: <Eye size={20} />,
  },
  {
    title: 'Senior Security Analysts',
    coverage: '24x7',
    description: 'Advanced threat investigation, escalation handling, and mentorship.',
    icon: <ShieldCheck size={20} />,
  },
  {
    title: 'SIEM / SOAR Consultants',
    coverage: '8x5',
    description: 'Platform engineering, use-case development, and automation.',
    icon: <Cog size={20} />,
  },
  {
    title: 'Service Delivery Manager',
    coverage: '8x5',
    description: 'Governance, reporting, QBRs, and customer relationship management.',
    icon: <UserCheck size={20} />,
  },
];

const WORKFLOW_PHASES = [
  {
    phase: 'Plan',
    color: 'bg-blue-500',
    steps: [
      'Event Source Integration',
      'SIEM Solution Setup',
      'Establish Monitoring Procedures',
    ],
  },
  {
    phase: 'Detect',
    color: 'bg-blue-600',
    steps: [
      'Threat Intelligence Feeds',
      '24x7 SOC Monitoring',
      'Verification & Prioritization',
      'Incident Assignment',
    ],
  },
  {
    phase: 'Respond',
    color: 'bg-blue-700',
    steps: [
      'L1 Initial Triage (SOAR)',
      'L2 Detailed Investigation',
      'L3 In-depth Analysis',
      'Forensics / 3rd Party Escalation',
    ],
  },
  {
    phase: 'Post Incident',
    color: 'bg-blue-800',
    steps: [
      'Follow Up Report',
      'Lessons Learned',
      'Incident Data Collection',
      'Evidence Retention',
    ],
  },
];

const TECH_STACK = [
  {
    category: 'Detection',
    items: [
      { name: 'Microsoft Defender', desc: 'EDR / XDR' },
      { name: 'Splunk', desc: 'SIEM' },
      { name: 'Custom Detections', desc: 'Use-Cases' },
    ],
    icon: <Eye size={24} />,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    category: 'Orchestration',
    items: [
      { name: 'Cortex XSOAR', desc: 'SOAR Platform' },
      { name: 'Playbooks', desc: 'Automated Response' },
      { name: 'Integrations', desc: 'API Connectors' },
    ],
    icon: <Workflow size={24} />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    category: 'Intelligence',
    items: [
      { name: 'Threat Feeds', desc: 'Real-time CTI' },
      { name: 'Attacker Database', desc: 'IOC Repository' },
      { name: 'Threat Models', desc: 'MITRE ATT&CK' },
    ],
    icon: <Target size={24} />,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    category: 'Service Management',
    items: [
      { name: 'ITSM Integration', desc: 'Ticketing' },
      { name: 'Salesforce', desc: 'Case Management' },
      { name: 'Reporting', desc: 'Dashboards' },
    ],
    icon: <FileText size={24} />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
];

const RACI_ITEMS = [
  { activity: 'Cybersecurity Incident Response Plan', soc: 'R,A', customer: 'C,I' },
  { activity: 'Development and Provision of DAP', soc: 'R,A', customer: 'C,I' },
  { activity: 'Alert Monitoring & Categorization', soc: 'R,A', customer: 'C,I' },
  { activity: 'Security Incident Investigation', soc: 'R,A', customer: 'C,I' },
  { activity: 'Escalate & Coordinate Response', soc: 'R,A', customer: 'C,I' },
  { activity: 'Implement Resolution & Recovery', soc: 'C,I', customer: 'R,A' },
  { activity: 'XSOAR Administration & Development', soc: 'R,A', customer: 'C,I' },
  { activity: 'Detection Rule Tuning', soc: 'R,A', customer: 'C,I' },
];

/* ======================
   COMPONENT
====================== */

export default function SOCOverview() {
  const [activeTab, setActiveTab] = useState<TabKey>('people');

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'people', label: 'People', icon: <Users size={18} /> },
    { key: 'process', label: 'Process', icon: <Cog size={18} /> },
    { key: 'technology', label: 'Technology', icon: <Cpu size={18} /> },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER */}
      <header className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Security Operations Center
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Managed Detection & Response (MDR) Service Delivery
            </p>
          </div>
        </div>
      </header>

      {/* VALUE PROPOSITION */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-bold mb-4">Why Our SOC?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: <Clock size={24} />, label: '24x7x365', desc: 'Round-the-clock monitoring' },
            { icon: <Headphones size={24} />, label: 'Local Support', desc: 'Native language assistance' },
            { icon: <Zap size={24} />, label: '15 Min SLA', desc: 'Critical incident response' },
            { icon: <ShieldCheck size={24} />, label: 'ISO Certified', desc: '27001, SOC2 Type II' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/30 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-white">{item.label}</p>
                <p className="text-sm text-slate-300">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[600px]">
        {/* ==================== PEOPLE TAB ==================== */}
        {activeTab === 'people' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Operating Model */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-blue-600" />
                Shift Operating Model
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* 24x7 Section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-bold text-orange-600 uppercase tracking-widest">24x7 On Call</span>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Eye size={18} className="text-orange-600" />
                          <span className="font-semibold text-slate-800">Security Analysts</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ShieldCheck size={18} className="text-orange-600" />
                          <span className="font-semibold text-slate-800">Senior Security Analysts</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        Round-the-clock threat monitoring, triage, and incident response
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="hidden md:flex items-center">
                    <ArrowRight size={24} className="text-slate-300" />
                  </div>

                  {/* 8x5 Section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                      <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">8x5 Business Hours</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Cog size={18} className="text-slate-600" />
                          <span className="font-semibold text-slate-800">SIEM / SOAR Consultants</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <UserCheck size={18} className="text-slate-600" />
                          <span className="font-semibold text-slate-800">Service Delivery Manager</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">
                        Engineering, platform optimization, and governance
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Team Roles */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                SOC Team Structure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEAM_ROLES.map((role, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        {role.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-slate-900">{role.title}</h4>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            role.coverage === '24x7' 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {role.coverage}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{role.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-blue-600" />
                Certifications & Compliance
              </h3>
              <div className="flex flex-wrap gap-3">
                {['ISO 9001', 'ISO 14001', 'ISO 22301', 'ISO 27001', 'SOC2 Type II'].map((cert, i) => (
                  <div key={i} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-200">
                    <CheckCircle2 size={16} />
                    <span className="font-bold text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== PROCESS TAB ==================== */}
        {activeTab === 'process' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Incident Response Workflow */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Workflow size={20} className="text-blue-600" />
                Incident Response Workflow
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {WORKFLOW_PHASES.map((phase, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className={`${phase.color} text-white px-4 py-3`}>
                      <span className="font-bold text-sm uppercase tracking-widest">{phase.phase}</span>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {phase.steps.map((step, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <ArrowRight size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-600">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SLA Table */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Timer size={20} className="text-blue-600" />
                Service Level Agreements (SLA)
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Description</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Acknowledgement</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Alert Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SLA_DATA.map((sla, i) => (
                      <tr key={i} className={`border-b border-slate-100 ${sla.bgColor}`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-lg ${sla.color}`}>{sla.priority}</span>
                            <span className={`text-xs font-bold ${sla.color}`}>{sla.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-600 max-w-md">{sla.description}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`font-bold ${sla.color}`}>{sla.ackTime}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-slate-600">{sla.alertMethod}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* RACI Matrix */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GitBranch size={20} className="text-blue-600" />
                RACI Matrix
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <p className="text-xs text-slate-500">
                    <strong>R</strong> = Responsible | <strong>A</strong> = Accountable | <strong>C</strong> = Consult | <strong>I</strong> = Informed
                  </p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-widest">Activity</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50">MDR SOC</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50">Customer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RACI_ITEMS.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-700">{item.activity}</td>
                        <td className="px-4 py-3 text-center font-bold text-blue-600 bg-blue-50/50">{item.soc}</td>
                        <td className="px-4 py-3 text-center font-bold text-amber-600 bg-amber-50/50">{item.customer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Escalation Path */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-blue-600" />
                Escalation Path
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-4">
                {[
                  { level: 'L1', title: 'Initial Triage', desc: 'Alert verification, basic containment', time: '0-15 min' },
                  { level: 'L2', title: 'Investigation', desc: 'Detailed analysis, remediation', time: '15-60 min' },
                  { level: 'L3', title: 'Advanced Analysis', desc: 'Complex threats, forensics', time: 'As needed' },
                  { level: 'MIM', title: 'Major Incident', desc: 'Executive escalation, war room', time: 'Critical' },
                ].map((item, i) => (
                  <React.Fragment key={i}>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 text-center flex-1 w-full md:w-auto">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mx-auto mb-2">
                        {item.level}
                      </div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                      <p className="text-xs font-bold text-blue-600 mt-2">{item.time}</p>
                    </div>
                    {i < 3 && (
                      <ArrowRight size={20} className="text-slate-300 hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ==================== TECHNOLOGY TAB ==================== */}
        {activeTab === 'technology' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Tech Stack */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers size={20} className="text-blue-600" />
                Technology Stack
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {TECH_STACK.map((tech, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className={`${tech.bg} p-4 border-b border-slate-100`}>
                      <div className="flex items-center gap-3">
                        <div className={tech.color}>{tech.icon}</div>
                        <h4 className="font-bold text-slate-900">{tech.category}</h4>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {tech.items.map((item, j) => (
                        <div key={j} className="flex justify-between items-center">
                          <span className="font-semibold text-sm text-slate-700">{item.name}</span>
                          <span className="text-xs text-slate-400">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Architecture Overview */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Server size={20} className="text-blue-600" />
                Integration Architecture
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Data Sources */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-widest">Data Sources</h4>
                    <div className="space-y-2">
                      {[
                        { icon: <Server size={16} />, label: 'Endpoints & Servers' },
                        { icon: <Cloud size={16} />, label: 'Cloud Workloads' },
                        { icon: <Activity size={16} />, label: 'Network Traffic' },
                        { icon: <Lock size={16} />, label: 'Identity Systems' },
                        { icon: <Mail size={16} />, label: 'Email Gateways' },
                      ].map((src, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                          <span className="text-slate-400">{src.icon}</span>
                          {src.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Processing Layer */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-widest">Processing</h4>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="font-bold text-blue-600 text-sm">SIEM</p>
                          <p className="text-xs text-slate-500">Log aggregation & correlation</p>
                        </div>
                        <ArrowRight size={16} className="text-blue-300 mx-auto" />
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="font-bold text-blue-600 text-sm">SOAR (XSOAR)</p>
                          <p className="text-xs text-slate-500">Orchestration & automation</p>
                        </div>
                        <ArrowRight size={16} className="text-blue-300 mx-auto" />
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="font-bold text-blue-600 text-sm">Threat Intel</p>
                          <p className="text-xs text-slate-500">Enrichment & context</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Output */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-widest">Outputs</h4>
                    <div className="space-y-2">
                      {[
                        { icon: <Bell size={16} />, label: 'Alert Notifications' },
                        { icon: <FileText size={16} />, label: 'Incident Tickets' },
                        { icon: <BarChart3 size={16} />, label: 'Security Reports' },
                        { icon: <MessageSquare size={16} />, label: 'Escalation Calls' },
                        { icon: <Activity size={16} />, label: 'Real-time Dashboards' },
                      ].map((out, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                          <span className="text-emerald-500">{out.icon}</span>
                          {out.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Supported Integrations */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Cpu size={20} className="text-blue-600" />
                Supported Integrations
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  'Microsoft Defender',
                  'Splunk',
                  'QRadar',
                  'Sentinel',
                  'Cortex XSOAR',
                  'CrowdStrike',
                  'Palo Alto',
                  'ServiceNow',
                  'Jira',
                  'Salesforce',
                  'Slack',
                  'Teams',
                ].map((tool, i) => (
                  <div key={i} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-default">
                    {tool}
                  </div>
                ))}
              </div>
            </section>

            {/* Key Capabilities */}
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap size={20} className="text-blue-600" />
                Key Capabilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Automated Triage', desc: 'SOAR playbooks reduce MTTR by 80%', icon: <Zap size={20} /> },
                  { title: 'Threat Hunting', desc: 'Proactive detection of advanced threats', icon: <Target size={20} /> },
                  { title: 'Real-time Correlation', desc: 'Cross-platform event analysis', icon: <Activity size={20} /> },
                  { title: 'Custom Use-Cases', desc: 'Tailored detection rules for your environment', icon: <Cog size={20} /> },
                  { title: 'API Integration', desc: 'Seamless connectivity with your stack', icon: <GitBranch size={20} /> },
                  { title: 'Compliance Reporting', desc: 'Automated regulatory reports', icon: <FileText size={20} /> },
                ].map((cap, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                      {cap.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{cap.title}</h4>
                      <p className="text-sm text-slate-500">{cap.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
