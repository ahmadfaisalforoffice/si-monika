import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Key, Save, X } from 'lucide-react';

export default function KelolaAkun() {
  const { profiles, fetchProfiles } = useStore();
  const [message, setMessage] = useState({ type: '', text: '' });

  React.useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const nonAdminUsers = profiles.filter(u => u.role !== 'admin');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800">Daftar Akun Pengguna</h2>
        <p className="text-sm text-slate-500 mt-1">Daftar akun User dan PIC yang terdaftar di sistem.</p>
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
          <strong>Catatan:</strong> Pengelolaan akun (tambah/hapus/reset password) saat ini dilakukan melalui Dashboard Supabase Authentication demi keamanan.
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {nonAdminUsers.length > 0 ? (
                nonAdminUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{user.nama_lengkap}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        user.role === 'pic' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-500">
                    Belum ada data akun.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
