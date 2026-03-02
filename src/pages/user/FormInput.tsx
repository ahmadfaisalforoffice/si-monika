import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Save, RefreshCw } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function FormInput() {
  const { currentUser, addActivity } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    subBagian: currentUser?.nama_lengkap || '',
    namaKepalaSubBagian: '',
    judulKegiatan: '',
    tempatKegiatan: 'Dalam Kantor' as 'Dalam Kantor' | 'Luar Kantor',
    lokasiKegiatan: '',
    nomorBeritaAcara: '',
    linkDokumen: '',
    dasarPelaksanaan: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    lamaKegiatan: 0,
  });

  useEffect(() => {
    if (formData.tanggalMulai && formData.tanggalSelesai) {
      const start = parseISO(formData.tanggalMulai);
      const end = parseISO(formData.tanggalSelesai);
      const diff = differenceInDays(end, start) + 1;
      setFormData(prev => ({ ...prev, lamaKegiatan: diff > 0 ? diff : 0 }));
    }
  }, [formData.tanggalMulai, formData.tanggalSelesai]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      await addActivity({
        ...formData,
        createdBy: currentUser.username,
      });
      
      alert('Kegiatan berhasil diajukan!');
      navigate('/user/monitoring');
    } catch (error) {
      alert('Gagal mengajukan kegiatan. Silakan coba lagi.');
    }
  };

  const handleReset = () => {
    setFormData({
      subBagian: currentUser?.nama_lengkap || '',
      namaKepalaSubBagian: '',
      judulKegiatan: '',
      tempatKegiatan: 'Dalam Kantor',
      lokasiKegiatan: '',
      nomorBeritaAcara: '',
      linkDokumen: '',
      dasarPelaksanaan: '',
      tanggalMulai: '',
      tanggalSelesai: '',
      lamaKegiatan: 0,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Form Input Kegiatan</h3>
            <p className="text-sm text-slate-500 mt-1">Lengkapi data kegiatan untuk pengajuan dokumen administrasi.</p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sub Bagian</label>
                <select
                  name="subBagian"
                  required
                  value={formData.subBagian}
                  onChange={handleChange}
                  className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border bg-slate-50"
                  disabled
                >
                  <option value="Sub Bagian Perencanaan, Data dan Informasi">Sub Bagian Perencanaan, Data dan Informasi</option>
                  <option value="Sub Bagian Keuangan, Umum, dan Logistik">Sub Bagian Keuangan, Umum, dan Logistik</option>
                  <option value="Sub Bagian Teknis Penyelenggaraan Pemilu, dan Hukum">Sub Bagian Teknis Penyelenggaraan Pemilu, dan Hukum</option>
                  <option value="Sub Bagian SDM dan Partisipasi Hubungan Masyarakat">Sub Bagian SDM dan Partisipasi Hubungan Masyarakat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama dan Gelar Kepala Sub Bagian</label>
                <input
                  type="text"
                  name="namaKepalaSubBagian"
                  required
                  value={formData.namaKepalaSubBagian}
                  onChange={handleChange}
                  className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border"
                  placeholder="Contoh: Budi Santoso, S.Kom., M.Si."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Kegiatan</label>
                <input
                  type="text"
                  name="judulKegiatan"
                  required
                  value={formData.judulKegiatan}
                  onChange={handleChange}
                  className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border"
                  placeholder="Masukkan judul kegiatan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tempat Kegiatan</label>
                <select
                  name="tempatKegiatan"
                  required
                  value={formData.tempatKegiatan}
                  onChange={handleChange}
                  className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border"
                >
                  <option value="Dalam Kantor">Dalam Kantor</option>
                  <option value="Luar Kantor">Luar Kantor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi Kegiatan</label>
                <input
                  type="text"
                  name="lokasiKegiatan"
                  required
                  value={formData.lokasiKegiatan}
                  onChange={handleChange}
                  className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border"
                  placeholder="Contoh: Aula KPU Kerinci"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Berita Acara</label>
                <input
                  type="text"
                  name="nomorBeritaAcara"
                  required
                  value={formData.nomorBeritaAcara}
                  onChange={handleChange}
                  className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border"
                  placeholder="Contoh: 01/BA/KPU-KRC/2023"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link Dokumen (Google Drive, dll)</label>
                <input
                  type="url"
                  name="linkDokumen"
                  required
                  value={formData.linkDokumen}
                  onChange={handleChange}
                  className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Dasar Pelaksanaan Kegiatan</label>
                <textarea
                  name="dasarPelaksanaan"
                  required
                  rows={4}
                  value={formData.dasarPelaksanaan}
                  onChange={handleChange}
                  className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border"
                  placeholder="Jelaskan dasar pelaksanaan kegiatan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  name="tanggalMulai"
                  required
                  value={formData.tanggalMulai}
                  onChange={handleChange}
                  className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  name="tanggalSelesai"
                  required
                  value={formData.tanggalSelesai}
                  onChange={handleChange}
                  className="block w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2.5 px-3 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lama Kegiatan (Hari)</label>
                <input
                  type="number"
                  name="lamaKegiatan"
                  readOnly
                  value={formData.lamaKegiatan}
                  className="block w-full border-slate-300 rounded-lg shadow-sm bg-slate-50 sm:text-sm py-2.5 px-3 border text-slate-500"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-end space-x-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
