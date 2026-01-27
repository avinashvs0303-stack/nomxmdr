import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Check, X } from 'lucide-react';

type PendingUser = {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
};

export default function AdminApprovals() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, email, display_name, created_at')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: true });

    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const approveUser = async (id: string) => {
    await supabase
      .from('profiles')
      .update({ approval_status: 'approved' })
      .eq('id', id);

    loadUsers();
  };

  const rejectUser = async (id: string) => {
    await supabase
      .from('profiles')
      .update({ approval_status: 'rejected' })
      .eq('id', id);

    loadUsers();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Pending User Approvals
      </h1>

      {loading ? (
        <p>Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-slate-500">No pending users</p>
      ) : (
        <div className="bg-white rounded-3xl border shadow-sm divide-y">
          {users.map(u => (
            <div key={u.id} className="p-6 flex justify-between items-center">
              <div>
                <p className="font-bold">{u.display_name}</p>
                <p className="text-sm text-slate-500">{u.email}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => approveUser(u.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-2"
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={() => rejectUser(u.id)}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold flex items-center gap-2"
                >
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
