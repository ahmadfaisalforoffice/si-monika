import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type Role = 'admin' | 'user' | 'pic';

export type User = {
  id: string;
  username: string;
  password?: string;
  role: Role;
  nama_lengkap: string;
};

export type ActivityStatus = 'Diajukan' | 'Dalam Proses Administrasi' | 'Dokumen Belum Lengkap' | 'Dokumen Lengkap' | 'Administrasi Selesai';

export type Activity = {
  id: string;
  subBagian: string;
  namaKepalaSubBagian: string;
  judulKegiatan: string;
  tempatKegiatan: 'Dalam Kantor' | 'Luar Kantor';
  lokasiKegiatan: string;
  nomorBeritaAcara: string;
  linkDokumen: string;
  dasarPelaksanaan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  lamaKegiatan: number;
  status: ActivityStatus;
  dokumenChecklist: Record<string, boolean>;
  createdAt: string;
  createdBy: string;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  activityId?: string;
};

interface StoreState {
  users: User[];
  currentUser: User | null;
  activities: Activity[];
  notifications: Notification[];
  login: (user: User) => void;
  logout: () => void;
  updateUserPassword: (username: string, newPassword: string) => void;
  setActivities: (activities: Activity[]) => void;
  fetchActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'status' | 'dokumenChecklist' | 'createdAt'>) => Promise<void>;
  updateActivityStatus: (id: string, status: ActivityStatus, checklist: Record<string, boolean>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
}

const initialUsers: User[] = [
  { id: '00000000-0000-0000-0000-000000000001', username: 'admin', password: 'adminadminan', role: 'admin', nama_lengkap: 'Administrator' },
  { id: '00000000-0000-0000-0000-000000000002', username: 'pic', password: 'picuhuy', role: 'pic', nama_lengkap: 'PIC Administrasi' },
  { id: '00000000-0000-0000-0000-000000000003', username: 'subbagrendatin', password: 'rendatin', role: 'user', nama_lengkap: 'Sub Bagian Perencanaan, Data dan Informasi' },
  { id: '00000000-0000-0000-0000-000000000004', username: 'subbagkul', password: 'keuanganumumlogistik', role: 'user', nama_lengkap: 'Sub Bagian Keuangan, Umum, dan Logistik' },
  { id: '00000000-0000-0000-0000-000000000005', username: 'subbagsdmparmas', password: 'sdmparmas', role: 'user', nama_lengkap: 'Sub Bagian SDM dan Partisipasi Hubungan Masyarakat' },
  { id: '00000000-0000-0000-0000-000000000006', username: 'subbagtekhum', password: 'teknishukum', role: 'user', nama_lengkap: 'Sub Bagian Teknis Penyelenggaraan Pemilu, dan Hukum' }
];

const mapChecklistToDb = (checklist: Record<string, boolean>) => ({
  chk_berita_acara_pleno: checklist['Berita Acara (BA) Pleno'] || false,
  chk_nota_dinas: checklist['Nota Dinas'] || false,
  chk_kak_tor: checklist['Kerangka Acuan Kerja (KAK) / TOR'] || false,
  chk_laporan_kegiatan: checklist['Laporan Kegiatan'] || false,
  chk_undangan_eksternal: checklist['Undangan Eksternal'] || false,
  chk_undangan_internal: checklist['Undangan Internal'] || false,
  chk_daftar_hadir_eksternal: checklist['Daftar Hadir Eksternal'] || false,
  chk_daftar_hadir_internal: checklist['Daftar Hadir Internal'] || false,
  chk_foto_dokumentasi: checklist['Foto/Dokumentasi Kegiatan'] || false,
  chk_surat_tugas_sekretariat: checklist['Surat Tugas Sekretariat'] || false,
  chk_surat_tugas_kpu: checklist['Surat Tugas KPU'] || false,
});

const mapDbToChecklist = (item: any) => ({
  'Berita Acara (BA) Pleno': item.chk_berita_acara_pleno,
  'Nota Dinas': item.chk_nota_dinas,
  'Kerangka Acuan Kerja (KAK) / TOR': item.chk_kak_tor,
  'Laporan Kegiatan': item.chk_laporan_kegiatan,
  'Undangan Eksternal': item.chk_undangan_eksternal,
  'Undangan Internal': item.chk_undangan_internal,
  'Daftar Hadir Eksternal': item.chk_daftar_hadir_eksternal,
  'Daftar Hadir Internal': item.chk_daftar_hadir_internal,
  'Foto/Dokumentasi Kegiatan': item.chk_foto_dokumentasi,
  'Surat Tugas Sekretariat': item.chk_surat_tugas_sekretariat,
  'Surat Tugas KPU': item.chk_surat_tugas_kpu,
});

const mapDbToActivity = (item: any): Activity => ({
  id: item.id,
  subBagian: item.sub_bagian,
  namaKepalaSubBagian: item.nama_kepala_sub_bagian,
  judulKegiatan: item.judul_kegiatan,
  tempatKegiatan: item.tempat_kegiatan,
  lokasiKegiatan: item.lokasi_kegiatan,
  nomorBeritaAcara: item.nomor_berita_acara,
  linkDokumen: item.link_dokumen,
  dasarPelaksanaan: item.dasar_pelaksanaan,
  tanggalMulai: item.tanggal_mulai,
  tanggalSelesai: item.tanggal_selesai,
  lamaKegiatan: item.lama_kegiatan,
  status: item.status,
  dokumenChecklist: mapDbToChecklist(item),
  createdAt: item.created_at,
  createdBy: item.created_by,
});

const mapActivityToDb = (activity: Activity) => ({
  id: activity.id,
  sub_bagian: activity.subBagian,
  nama_kepala_sub_bagian: activity.namaKepalaSubBagian,
  judul_kegiatan: activity.judulKegiatan,
  tempat_kegiatan: activity.tempatKegiatan,
  lokasi_kegiatan: activity.lokasiKegiatan,
  nomor_berita_acara: activity.nomorBeritaAcara,
  link_dokumen: activity.linkDokumen,
  dasar_pelaksanaan: activity.dasarPelaksanaan,
  tanggal_mulai: activity.tanggalMulai,
  tanggal_selesai: activity.tanggalSelesai,
  lama_kegiatan: activity.lamaKegiatan,
  status: activity.status,
  created_at: activity.createdAt,
  created_by: activity.createdBy,
  ...mapChecklistToDb(activity.dokumenChecklist),
});

const getInitialChecklist = (tempat: 'Dalam Kantor' | 'Luar Kantor') => {
  const base = {
    'Berita Acara (BA) Pleno': false,
    'Nota Dinas': false,
    'Kerangka Acuan Kerja (KAK) / TOR': false,
    'Laporan Kegiatan': false,
    'Undangan Eksternal': false,
    'Undangan Internal': false,
    'Daftar Hadir Eksternal': false,
    'Daftar Hadir Internal': false,
    'Foto/Dokumentasi Kegiatan': false,
  };
  if (tempat === 'Luar Kantor') {
    return {
      ...base,
      'Surat Tugas Sekretariat': false,
      'Surat Tugas KPU': false,
    };
  }
  return base;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      users: initialUsers,
      currentUser: null,
      activities: [],
      notifications: [],
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      updateUserPassword: (username, newPassword) =>
        set((state) => ({
          users: state.users.map((u) => (u.username === username ? { ...u, password: newPassword } : u)),
          currentUser: state.currentUser?.username === username ? { ...state.currentUser, password: newPassword } : state.currentUser,
        })),
      setActivities: (activities) => set({ activities }),
      fetchActivities: async () => {
        try {
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          if (data) {
            const mappedData = data.map((item: any) => mapDbToActivity(item));
            set({ activities: mappedData });
          }
        } catch (error) {
          console.error('Error fetching activities:', error);
        }
      },
      addActivity: async (activityData) => {
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const status = 'Diajukan';
        const dokumenChecklist = getInitialChecklist(activityData.tempatKegiatan);

        // Find the user's UUID if createdBy is a username
        const user = get().users.find(u => u.username === activityData.createdBy);
        const createdByUuid = user?.id || activityData.createdBy;

        const newActivity: Activity = {
          ...activityData,
          id,
          status,
          dokumenChecklist,
          createdAt,
          createdBy: createdByUuid,
        };
        
        const dbActivity = mapActivityToDb(newActivity);
        
        try {
          const { error } = await supabase
            .from('activities')
            .insert([dbActivity]);
            
          if (error) throw error;
          
          set((state) => ({
            activities: [newActivity, ...state.activities],
          }));
          
          // Notify PIC
          get().addNotification({
            userId: 'pic',
            message: `Kegiatan baru diajukan: ${newActivity.judulKegiatan} oleh ${newActivity.subBagian}`,
            activityId: newActivity.id,
          });
        } catch (error) {
          console.error('Error adding activity:', error);
          throw error;
        }
      },
      updateActivityStatus: async (id, status, checklist) => {
        try {
          const { error } = await supabase
            .from('activities')
            .update({ 
              status, 
              ...mapChecklistToDb(checklist) 
            })
            .eq('id', id);
            
          if (error) throw error;
          
          set((state) => {
            const updatedActivities = state.activities.map((a) =>
              a.id === id ? { ...a, status, dokumenChecklist: checklist } : a
            );

            return { activities: updatedActivities };
          });
        } catch (error) {
          console.error('Error updating activity:', error);
          throw error;
        }
      },
      deleteActivity: async (id) => {
        try {
          const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          
          set((state) => ({
            activities: state.activities.filter((a) => a.id !== id),
            notifications: state.notifications.filter((n) => n.activityId !== id)
          }));
        } catch (error) {
          console.error('Error deleting activity:', error);
          throw error;
        }
      },
      addNotification: (notifData) => {
        const newNotif: Notification = {
          ...notifData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
    }),
    {
      name: 'simonika-storage',
    }
  )
);
