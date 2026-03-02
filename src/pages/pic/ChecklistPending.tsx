import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Edit, ExternalLink, Save, X, AlertTriangle } from 'lucide-react';

export default function ChecklistPending() {
  const { activities, updateActivityStatus, addNotification } = useStore();
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const pendingActivities = activities.filter(
    a => a.status === 'Diajukan' || a.status === 'Dalam Proses Administrasi' || a.status === 'Dokumen Belum Lengkap'
  );

  const handleOpenChecklist = (activity: any) => {
    setSelectedActivity(activity);
    setChecklist(activity.dokumenChecklist ? { ...activity.dokumenChecklist } : {});
  };

  const handleCheckboxChange = (docName: string) => {
    setChecklist(prev => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  const handleUpdateStatus = (isComplete: boolean) => {
    if (!selectedActivity) return;

    const newStatus = isComplete ? 'Dokumen Lengkap' : 'Dokumen Belum Lengkap';
    updateActivityStatus(selectedActivity.id, newStatus, checklist);

    // Generate message for user
    const incompleteDocs = Object.entries(checklist)
      .filter(([_, isChecked]) => !isChecked)
      .map(([name]) => name);

    let message = `Status kegiatan "${selectedActivity.judulKegiatan}" diperbarui menjadi ${newStatus}.`;
    if (!isComplete && incompleteDocs.length > 0) {
      message += ` Dokumen yang belum lengkap: ${incompleteDocs.join(', ')}.`;
    }

    addNotification({
      userId: selectedActivity.createdBy,
      message,
      activityId: selectedActivity.id,
    });

    setSelectedActivity(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800">Checklist Pending</h2>
        <p className="text-sm text-slate-500 mt-1">Daftar pengajuan kegiatan yang perlu diperiksa kelengkapan dokumennya.</p>
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
              {pendingActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Tidak ada pengajuan kegiatan pending
                  </td>
                </tr>
              ) : (
                pendingActivities.map((activity) => (
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
                        activity.status === 'Dokumen Belum Lengkap'
                          ? 'bg-red-100 text-red-800'
                          : activity.status === 'Dalam Proses Administrasi'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleOpenChecklist(activity)}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1.5" /> Tindak Lanjut
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Checklist */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedActivity(null)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Tindak Lanjut Checklist Dokumen
              </h3>
              <button onClick={() => setSelectedActivity(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto bg-white flex-1">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Judul Kegiatan</p>
                    <p className="text-sm font-medium text-slate-900 mt-1.5">{selectedActivity.judulKegiatan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sub Bagian</p>
                    <p className="text-sm font-medium text-slate-900 mt-1.5">{selectedActivity.subBagian}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Dasar Pelaksanaan</p>
                    <p className="text-sm text-slate-800 mt-1.5 whitespace-pre-wrap leading-relaxed">{selectedActivity.dasarPelaksanaan}</p>
                  </div>
                  <div className="md:col-span-2">
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
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-xs">✓</span>
                  Checklist Kelengkapan
                </h4>
                <div className="space-y-2.5">
                  {Object.entries(checklist).map(([docName, isChecked]) => (
                    <label key={docName} className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all duration-200 ${isChecked ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(docName)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-colors"
                      />
                      <span className={`ml-3.5 text-sm font-medium flex-1 ${isChecked ? 'text-blue-900' : 'text-slate-700'}`}>{docName}</span>
                      {isChecked ? (
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-semibold shadow-sm">Ada</span>
                      ) : (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">Belum Ada</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center text-xs sm:text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 w-full sm:w-auto">
                <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                Pastikan semua dokumen diperiksa
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(false)}
                  className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-red-200 px-4 py-2.5 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none transition-colors shadow-sm"
                >
                  Belum Lengkap
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(true)}
                  className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent px-4 py-2.5 bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" /> Dokumen Lengkap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
