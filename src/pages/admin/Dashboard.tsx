import React from 'react';
import { useStore } from '../../store/useStore';
import { Activity, FileText, Clock, CheckCircle, XCircle, Hourglass, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AdminDashboard() {
  const { activities, profiles } = useStore();

  const stats = {
    users: profiles.length,
    total: activities.length,
    diajukan: activities.filter(a => a.status === 'Diajukan').length,
    proses: activities.filter(a => a.status === 'Dalam Proses Administrasi').length,
    belumLengkap: activities.filter(a => a.status === 'Dokumen Belum Lengkap').length,
    lengkap: activities.filter(a => a.status === 'Dokumen Lengkap').length,
    selesai: activities.filter(a => a.status === 'Administrasi Selesai').length,
  };

  const recentActivities = activities.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-transparent pb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 mt-1">Ringkasan data administrasi kegiatan</p>
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
              <p className="text-sm font-medium text-green-100 mb-1">Dokumen Lengkap</p>
              <p className="text-4xl font-bold">{stats.lengkap}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Administrasi Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1">
          <div className="flex items-center mb-6">
            <BarChart2 className="w-5 h-5 text-slate-600 mr-2" />
            <h3 className="text-lg font-bold text-slate-800">Status Administrasi</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl border border-slate-50">
              <div className="flex items-center">
                <span className="mr-3 text-lg">📥</span>
                <span className="text-sm font-medium text-slate-700">Diajukan</span>
              </div>
              <span className="text-lg font-bold text-[#1e40af]">
                {stats.diajukan}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#fefce8] rounded-xl border border-yellow-50">
              <div className="flex items-center">
                <span className="mr-3 text-lg">⏳</span>
                <span className="text-sm font-medium text-slate-700">Dalam Proses Administrasi</span>
              </div>
              <span className="text-lg font-bold text-[#b45309]">
                {stats.proses}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#fef2f2] rounded-xl border border-red-50">
              <div className="flex items-center">
                <span className="mr-3 text-lg">❌</span>
                <span className="text-sm font-medium text-slate-700">Dokumen Belum Lengkap</span>
              </div>
              <span className="text-lg font-bold text-[#b91c1c]">
                {stats.belumLengkap}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#f0fdf4] rounded-xl border border-green-50">
              <div className="flex items-center">
                <span className="mr-3 text-lg">✅</span>
                <span className="text-sm font-medium text-slate-700">Dokumen Lengkap</span>
              </div>
              <span className="text-lg font-bold text-[#15803d]">
                {stats.lengkap}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#f0fdf4] rounded-xl border border-green-50">
              <div className="flex items-center">
                <span className="mr-3 text-lg">🎉</span>
                <span className="text-sm font-medium text-slate-700">Administrasi Selesai</span>
              </div>
              <span className="text-lg font-bold text-[#15803d]">
                {stats.selesai}
              </span>
            </div>
          </div>
        </div>

        {/* History Kegiatan Terbaru */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2 flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 bg-white">
            <h3 className="text-lg font-bold text-slate-800">History Kegiatan Terbaru</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Kegiatan & Sub Bagian
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {recentActivities.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                      Belum ada data kegiatan
                    </td>
                  </tr>
                ) : (
                  recentActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{activity.judulKegiatan}</div>
                        <div className="text-xs text-slate-500 mt-1">{activity.subBagian}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {format(new Date(activity.tanggalMulai), 'dd MMM yyyy', { locale: id })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
    </div>
  );
}
