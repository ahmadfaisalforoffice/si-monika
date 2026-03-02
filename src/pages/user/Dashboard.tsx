import React from 'react';
import { useStore } from '../../store/useStore';
import { FileText, CheckCircle, Clock, AlertCircle, BarChart2, XCircle, Hourglass } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function UserDashboard() {
  const { currentUser, activities } = useStore();

  const userActivities = activities.filter(a => a.createdBy === currentUser?.id || a.createdBy === currentUser?.username);
  
  const stats = {
    total: userActivities.length,
    diajukan: userActivities.filter(a => a.status === 'Diajukan').length,
    proses: userActivities.filter(a => a.status === 'Dalam Proses Administrasi').length,
    belumLengkap: userActivities.filter(a => a.status === 'Dokumen Belum Lengkap').length,
    lengkap: userActivities.filter(a => a.status === 'Dokumen Lengkap').length,
    selesai: userActivities.filter(a => a.status === 'Administrasi Selesai').length,
  };

  const recentActivities = userActivities.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-transparent pb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Selamat Datang, {currentUser?.nama_lengkap}</h2>
          <p className="text-slate-500 mt-1">Pantau status kelengkapan dokumen administrasi kegiatan Anda di sini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Kegiatan */}
        <div className="bg-[#3b82f6] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-100 mb-1">Total Kegiatan</p>
              <p className="text-4xl font-bold">{stats.total}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <BarChart2 className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Dokumen Lengkap */}
        <div className="bg-[#22c55e] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-green-100 mb-1">Selesai</p>
              <p className="text-4xl font-bold">{stats.lengkap + stats.selesai}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        
        {/* Belum Lengkap */}
        <div className="bg-[#ef4444] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-red-100 mb-1">Belum Lengkap</p>
              <p className="text-4xl font-bold">{stats.belumLengkap}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <XCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Dalam Proses */}
        <div className="bg-[#f59e0b] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-orange-100 mb-1">Dalam Proses</p>
              <p className="text-4xl font-bold">{stats.diajukan + stats.proses}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Hourglass className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-800">Kegiatan Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Judul Kegiatan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {recentActivities.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                    Belum ada data kegiatan
                  </td>
                </tr>
              ) : (
                recentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{activity.judulKegiatan}</div>
                      <div className="text-sm text-slate-500">{activity.nomorBeritaAcara}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(activity.tanggalMulai), 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        activity.status === 'Dokumen Lengkap' || activity.status === 'Administrasi Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activity.status === 'Dokumen Belum Lengkap'
                          ? 'bg-red-100 text-red-800'
                          : activity.status === 'Dalam Proses Administrasi'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
