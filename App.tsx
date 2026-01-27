
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import {
  ShieldCheck, ShieldAlert, FileText,
  Settings, LogOut, Calculator,
  Lock, Globe, Newspaper, Info, Briefcase, UserCheck, ChevronRight
} from 'lucide-react';
import { supabase } from './services/supabase';
import { UserProfile } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PendingPage from './pages/PendingPage';
import DefensivePricing from './pages/DefensivePricing';
import SolutionsCalculator from './pages/SolutionsCalculator';
import ProposalViewer from './pages/ProposalViewer';
import ServicePackages from './pages/ServicePackages';
import OffensiveScope from './pages/OffensiveScope';
import DarkWebMonitor from './pages/DarkWebMonitor';
import SecurityNews from './pages/SecurityNews';
import GenerateSAR from './pages/GenerateSAR';
import MyProposals from './pages/MyProposals';
import AdminUsers from './pages/AdminUsers';
import AdminProposals from './pages/AdminProposals';
import ExposureManagementPricing from './pages/ExposureManagementPricing';
import AdminApprovals from './pages/AdminApprovals';


const Layout = ({
  children,
  user,
  setUser,
  theme,
  setTheme
}: {
  children?: React.ReactNode;
  user: UserProfile;
  setUser: (user: UserProfile | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}) => {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const menuItems = [
    {
      section: 'Defensive Security',
      items: [
        { name: 'Pricing Calculator', path: '/defensive/pricing', icon: <Calculator size={18} /> },
        { name: 'Exposure Management', path: '/defensive/exposure-management', icon: <ShieldAlert size={18} /> },
        { name: 'Solutions Calculator', path: '/defensive/solutions', icon: <Info size={18} /> },
        { name: 'Service Packages', path: '/defensive/packages', icon: <Briefcase size={18} /> }
      ]
    },
    {
      section: 'Offensive Security',
      items: [
        { name: 'Engagement Scope', path: '/offensive/scope', icon: <Lock size={18} /> },
        { name: 'Dark Web Monitoring', path: '/offensive/dark-web', icon: <Globe size={18} /> }
      ]
    },
    {
      section: 'Security Advisory',
      items: [
        { name: 'Security News', path: '/advisory/news', icon: <Newspaper size={18} /> },
        { name: 'Generate SAR', path: '/advisory/sar', icon: <FileText size={18} /> }
      ]
    },
    {
      section: 'Proposals',
      items: [
        { name: 'My Proposals', path: '/my-proposals', icon: <FileText size={18} /> }
      ]
    }
  ];

 if (user.role === 'super_admin') {
  menuItems.push({
    section: 'Administration',
    items: [
      {
        name: 'Pending Approvals',
        path: '/admin/approvals',
        icon: <UserCheck size={18} />,
      },
      {
        name: 'All Users',
        path: '/admin/users',
        icon: <UserCheck size={18} />,
      },
      {
        name: 'Manage Proposals',
        path: '/admin/proposals',
        icon: <Settings size={18} />,
      },
    ],
  });
}


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* SIDEBAR - DEEP DARK THEME */}
      <aside className="w-80 bg-slate-950 flex flex-col shadow-2xl z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">X</div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg tracking-tight leading-none">xMDR</span>
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">Portal</span>
            </div>
          </div>

          <nav className="space-y-8 custom-scrollbar overflow-y-auto max-h-[calc(100vh-250px)]">
            {menuItems.map(group => (
              <div key={group.section} className="space-y-1">
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{group.section}</p>
                {group.items.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                      location.pathname === item.path 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1' 
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>{item.icon}</span>
                      <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                    </div>
                    {location.pathname === item.path && <ChevronRight size={14} className="text-white/50" />}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* PROFILE FOOTER */}
        <div className="mt-auto p-6 bg-black/40 border-t border-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-500 font-bold uppercase">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-red-400 text-xs font-bold hover:bg-red-500/10 hover:text-red-300 transition-all border border-slate-800"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT - LIGHT CLEAN THEME */}
      <main className="flex-1 overflow-y-auto p-12 bg-slate-50 custom-scrollbar">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const loadUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      setUser(profile as UserProfile);
      setLoading(false);
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl animate-bounce mb-4 shadow-2xl shadow-blue-500/40">X</div>
        <div className="text-slate-400 font-bold tracking-widest text-xs uppercase animate-pulse">Initialising Systems</div>
      </div>
    );
  }

  if (!user) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={setUser} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    );
  }

  if (user.approval_status !== 'approved') {
    return (
      <HashRouter>
        <Routes>
          <Route path="/pending" element={<PendingPage user={user} onLogout={() => setUser(null)} />} />
          <Route path="*" element={<Navigate to="/pending" />} />
        </Routes>
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Layout user={user} setUser={setUser} theme={theme} setTheme={setTheme}>
        <Routes>
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/defensive/pricing" element={<DefensivePricing />} />
          <Route path="/defensive/solutions" element={<SolutionsCalculator />} />
          <Route path="/defensive/packages" element={<ServicePackages />} />
           <Route path="/defensive/exposure-management" element={<ExposureManagementPricing />} />
           <Route path="/proposals/:id" element={<ProposalViewer />} />
          <Route path="/offensive/scope" element={<OffensiveScope />} />
          <Route path="/offensive/dark-web" element={<DarkWebMonitor />} />
          <Route path="/advisory/news" element={<SecurityNews />} />
          <Route path="/advisory/sar" element={<GenerateSAR />} />
          <Route path="/my-proposals" element={<MyProposals />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/proposals" element={<AdminProposals />} />
          <Route path="*" element={<Navigate to="/defensive/pricing" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
