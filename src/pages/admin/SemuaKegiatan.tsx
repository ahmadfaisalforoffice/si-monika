import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Filter, Search, Eye, X, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';

export default function SemuaKegiatan() {
  const { activities, deleteActivity } = useStore();
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [subBagianFilter, setSubBagianFilter] = useState('Semua');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activityToDelete, setActivityToDelete] = useState<any>(null);

  const handleDelete = async () => {
    if (activityToDelete) {
      try {
        await deleteActivity(activityToDelete.id);
        setActivityToDelete(null);
      } catch (error) {
        alert('Gagal menghapus kegiatan. Silakan coba lagi.');
      }
    }
  };

  const filteredActivities = activities.filter(a => {
    const matchStatus = statusFilter === 'Semua' || a.status === statusFilter;
    const matchSubBagian = subBagianFilter === 'Semua' || a.subBagian === subBagianFilter;
    return matchStatus && matchSubBagian;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800">Semua Kegiatan</h2>
        <p className="text-sm text-slate-500 mt-1">Daftar seluruh kegiatan dari semua sub bagian.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full sm:w-48 border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border"
            >
              <option value="Semua">Semua Status</option>
              <option value="Diajukan">Diajukan</option>
              <option value="Dalam Proses Administrasi">Dalam Proses Administrasi</option>
              <option value="Dokumen Belum Lengkap">Dokumen Belum Lengkap</option>
              <option value="Dokumen Lengkap">Dokumen Lengkap</option>
              <option value="Administrasi Selesai">Administrasi Selesai</option>
            </select>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            <select
              value={subBagianFilter}
              onChange={(e) => setSubBagianFilter(e.target.value)}
              className="block w-full sm:w-64 border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border"
            >
              <option value="Semua">Semua Sub Bagian</option>
              <option value="Sub Bagian Perencanaan, Data dan Informasi">Sub Bagian Perencanaan, Data dan Informasi</option>
              <option value="Sub Bagian Keuangan, Umum, dan Logistik">Sub Bagian Keuangan, Umum, dan Logistik</option>
              <option value="Sub Bagian Teknis Penyelenggaraan Pemilu, dan Hukum">Sub Bagian Teknis Penyelenggaraan Pemilu, dan Hukum</option>
              <option value="Sub Bagian SDM dan Partisipasi Hubungan Masyarakat">Sub Bagian SDM dan Partisipasi Hubungan Masyarakat</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Kegiatan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Sub Bagian
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Tidak ada data yang sesuai dengan filter
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{activity.judulKegiatan}</div>
                      <div className="text-xs text-slate-500 mt-1">BA: {activity.nomorBeritaAcara}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {activity.subBagian}
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
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => setSelectedActivity(activity)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" /> Detail
                        </button>
                        <button
                          onClick={() => setActivityToDelete(activity)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedActivity(null)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Detail Kegiatan
              </h3>
              <button onClick={() => setSelectedActivity(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto bg-white flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Judul Kegiatan</p>
                  <p className="text-sm font-medium text-slate-900 mt-1.5">{selectedActivity.judulKegiatan}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sub Bagian</p>
                  <p className="text-sm text-slate-900 mt-1.5">{selectedActivity.subBagian}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status</p>
                  <p className="text-sm font-bold text-blue-600 mt-1.5">{selectedActivity.status}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tanggal</p>
                  <p className="text-sm font-medium text-slate-900 mt-1.5">
                    {format(new Date(selectedActivity.tanggalMulai), 'dd MMM yyyy', { locale: id })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tempat</p>
                  <p className="text-sm font-medium text-slate-900 mt-1.5">{selectedActivity.tempatKegiatan}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Lokasi Kegiatan</p>
                  <p className="text-sm font-medium text-slate-900 mt-1.5">{selectedActivity.lokasiKegiatan}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Dasar Pelaksanaan</p>
                  <p className="text-sm text-slate-800 mt-1.5 whitespace-pre-wrap leading-relaxed">{selectedActivity.dasarPelaksanaan}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Link Dokumen</p>
                  <a 
                    href={selectedActivity.linkDokumen} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 mt-1.5 inline-flex items-center break-all"
                  >
                    {selectedActivity.linkDokumen} <ExternalLink className="w-4 h-4 ml-1.5 shrink-0" />
                  </a>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">✓</span>
                Status Dokumen
              </h4>
              <ul className="space-y-2.5">
                {Object.entries(selectedActivity.dokumenChecklist || {}).map(([docName, isChecked]) => (
                  <li key={docName} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <span className="text-sm font-medium text-slate-700">{docName}</span>
                    {isChecked ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Lengkap
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                        Belum
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setActivityToDelete(selectedActivity);
                  setSelectedActivity(null);
                }}
                className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-red-200 px-6 py-2.5 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Kegiatan
              </button>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent px-6 py-2.5 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none transition-colors shadow-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {activityToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setActivityToDelete(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden transform transition-all">
            <div className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Kegiatan?</h3>
              <p className="text-sm text-slate-500 mb-6">
                Apakah Anda yakin ingin menghapus kegiatan <span className="font-semibold text-slate-700">"{activityToDelete.judulKegiatan}"</span>? Tindakan ini tidak dapat dibatalkan dan data akan dihapus secara permanen.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setActivityToDelete(null)}
                  className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-slate-200 px-6 py-3 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent px-6 py-3 bg-red-600 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none transition-colors shadow-sm shadow-red-200"
                >
                  Ya, Hapus Kegiatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
