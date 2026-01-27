import { Lock, FileText } from 'lucide-react';

export default function OffensiveScope() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">
          Engagement Scope
        </h1>
        <p className="text-slate-500 mt-1">
          Define Red Team, Pentest, and Vulnerability Assessment parameters.
        </p>
      </header>

      <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Scoping Inputs */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-blue-600">
              <Lock size={24} />
              <h2 className="text-xl font-bold text-slate-900">
                Scoping Details
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Test Type
                </label>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>External Penetration Test</option>
                  <option>Internal Infrastructure Audit</option>
                  <option>Web Application Pentest</option>
                  <option>Red Team Simulation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Number of IP Addresses / Assets
                </label>
                <input
                  type="number"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Compliance Requirements
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['PCI DSS', 'ISO 27001', 'SOC2', 'GDPR'].map(c => (
                    <label
                      key={c}
                      className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Preview */}
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-slate-400" />
              Summary Preview
            </h3>

            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                Your offensive engagement will follow a standard methodology:
                reconnaissance, vulnerability analysis, exploitation, and
                post-exploitation reporting.
              </p>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-2">
                  Estimated Duration
                </p>
                <p>10–15 Professional Service Days</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 mb-2">
                  Deliverables
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Executive Summary</li>
                  <li>Technical Vulnerability Report</li>
                  <li>Strategic Remediation Roadmap</li>
                </ul>
              </div>
            </div>

            <button className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-all">
              Save Scoping Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
