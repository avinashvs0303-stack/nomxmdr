
// Added useState to imports
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';
import { UserCheck, UserX, Clock, Mail } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Load users from Supabase
  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
      } else {
        setUsers(data as UserProfile[]);
      }

      setLoading(false);
    };

    loadUsers();
  }, []);

  // 2️⃣ Update user status (approve / reject)
  const handleUpdateStatus = async (
    id: string,
    status: 'approved' | 'rejected'
  ) => {
    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      return;
    }

    // Update UI locally
    setUsers(prev =>
      prev.map(u => u.id === id ? { ...u, approval_status: status } : u )
    );
  };

  const pendingUsers = users.filter(u => u.approval_status === 'pending');
  const activeUsers = users.filter(u => u.approval_status === 'approved');


  if (loading) {
    return (
      <div className="text-slate-500 font-medium">
        Loading users…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">
          User Approvals
        </h1>
        <p className="text-slate-500 mt-1">
          Review and approve new team member access requests.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Pending
            </p>
            <p className="text-2xl font-black text-slate-900">
              {pendingUsers.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Approved
            </p>
            <p className="text-2xl font-black text-slate-900">
              {activeUsers.length}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900">
            Access Requests
          </h3>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 font-medium">
              No pending requests at this time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingUsers.map(user => (
              <div
                key={user.id}
                className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                    {user.full_name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {user.full_name}
                    </h4>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <Mail size={14} /> {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      handleUpdateStatus(user.id, 'rejected')
                    }
                    className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 font-bold text-sm rounded-xl"
                  >
                    <UserX size={18} /> Deny
                  </button>

                  <button
                    onClick={() =>
                      handleUpdateStatus(user.id, 'approved')
                    }
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-500"
                  >
                    <UserCheck size={18} /> Approve Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Users */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900">
            Active Users
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {activeUsers.map(user => (
            <div
              key={user.id}
              className="p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {user.full_name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    {user.full_name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Role
                  </p>
                  <p className="text-sm font-bold text-slate-900 capitalize">
                    {user.role}
                  </p>
                </div>

                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-widest">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
