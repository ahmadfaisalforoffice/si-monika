import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Eye, ExternalLink, X, CheckCircle } from 'lucide-react';

export default function ChecklistComplete() {
  const { activities } = useStore();
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const completeActivities = activities.filter(
    a => a.status === 'Dokumen Lengkap' || a.status === 'Administrasi Selesai'
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800">Checklist Complete</h2>
        <p className="text-sm text-slate-500 mt-1">Daftar kegiatan yang dokumen administrasinya sudah dinyatakan lengkap.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
              {completeActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Belum ada kegiatan dengan dokumen lengkap
                  </td>
                </tr>
              ) : (
                completeActivities.map((activity) => (
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
                        activity.status === 'Administrasi Selesai'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => setSelectedActivity(activity)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Detail
                      </button>
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
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 mr-2" />
                Detail Dokumen Lengkap
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
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Nomor BA</p>
                  <p className="text-sm font-medium text-slate-900 mt-1.5">{selectedActivity.nomorBeritaAcara}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tanggal</p>
                  <p className="text-sm font-medium text-slate-900 mt-1.5">
                    {format(new Date(selectedActivity.tanggalMulai), 'dd MMM yyyy', { locale: id })}
                  </p>
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
                <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">✓</span>
                Status Dokumen
              </h4>
              <ul className="space-y-2.5">
                {Object.entries(selectedActivity.dokumenChecklist || {})
                  .filter(([docName]) => {
                    if (selectedActivity.tempatKegiatan === 'Dalam Kantor') {
                      return docName !== 'Surat Tugas Sekretariat' && docName !== 'Surat Tugas KPU';
                    }
                    return true;
                  })
                  .map(([docName, isChecked]) => (
                    <li key={docName} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white shadow-sm">
                      <span className="text-sm font-medium text-slate-700">{docName}</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Lengkap
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 shrink-0 flex justify-end">
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
    </div>
  );
}
