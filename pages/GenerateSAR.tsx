
import { useState } from 'react';
import { FileText, Wand2, Copy, Download, MessageSquare, ShieldAlert } from 'lucide-react';
import { geminiService } from '../services/gemini';

export default function GenerateSAR() {
  const [context, setContext] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!context.trim()) return;
    setLoading(true);
    const result = await geminiService.generateSAR(context);
    setReport(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">xMDR SAR Generator</h1>
        <p className="text-slate-500 mt-1">Generate AI-powered Security Analysis Reports (SAR) for executive presentations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <MessageSquare size={24} />
            <h2 className="text-xl font-bold text-slate-900">Analysis Context</h2>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Describe the security incident, vulnerability, or specific environment details you want the report to focus on.
          </p>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full h-64 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700 leading-relaxed"
            placeholder="e.g., Analysis of the recent CVE-2024 vulnerability impacting our Linux servers, including potential exploitation paths and remediation strategy for a retail client..."
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !context}
            className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all group"
          >
            {loading ? 'Processing Analysis...' : 'Generate AI Report'} 
            {!loading && <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                <span className="text-sm font-bold text-slate-700">Security Analysis Report</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigator.clipboard.writeText(report)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Copy to Clipboard">
                  <Copy size={16} />
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Download PDF">
                  <Download size={16} />
                </button>
              </div>
            </div>
            <div className="p-8 flex-1 prose prose-slate max-w-none">
              {report ? (
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-serif text-lg">
                  {report}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                  <FileText size={64} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="font-medium">Analysis output will appear here</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-lg shadow-blue-500/20">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              <ShieldAlert size={18} /> Disclaimer
            </h4>
            <p className="text-xs text-blue-100 leading-relaxed">
              Reports are generated using large language models. Always verify technical details, specific CVE data, and regulatory recommendations against official xMDR advisory standards before presenting to clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
