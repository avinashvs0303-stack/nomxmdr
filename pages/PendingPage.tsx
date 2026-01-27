import { UserProfile } from '../types';
import { Clock, LogOut } from 'lucide-react';

export default function PendingPage({
  user,
  onLogout
}: {
  user: UserProfile;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl shadow-2xl text-center">
          <div className="inline-flex w-20 h-20 bg-blue-600/10 rounded-full items-center justify-center text-blue-500 mb-8 animate-pulse">
            <Clock size={40} />
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Pending Approval
          </h1>

          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Hi <span className="font-semibold text-white">{user.full_name}</span>,
            your account is currently in the approval queue. An administrator
            needs to verify your identity before you can access the portal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Status
              </p>
              <p className="text-blue-400 font-semibold">
                Verification Required
              </p>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Role
              </p>
              <p className="text-white font-semibold">
                {user.role.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-xl hover:bg-slate-800"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
