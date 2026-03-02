import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'admin' | 'user' | 'pic';

export type User = {
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
  addActivity: (activity: Omit<Activity, 'id' | 'status' | 'dokumenChecklist' | 'createdAt'>) => void;
  updateActivityStatus: (id: string, status: ActivityStatus, checklist: Record<string, boolean>) => void;
  deleteActivity: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
}

const initialUsers: User[] = [
  { username: 'admin', password: 'adminadminan', role: 'admin', nama_lengkap: 'Administrator' },
  { username: 'pic', password: 'picuhuy', role: 'pic', nama_lengkap: 'PIC Administrasi' },
  { username: 'subbagrendatin', password: 'rendatin', role: 'user', nama_lengkap: 'Sub Bagian Perencanaan, Data dan Informasi' },
  { username: 'subbagkul', password: 'keuanganumumlogistik', role: 'user', nama_lengkap: 'Sub Bagian Keuangan, Umum, dan Logistik' },
  { username: 'subbagsdmparmas', password: 'sdmparmas', role: 'user', nama_lengkap: 'Sub Bagian SDM dan Partisipasi Hubungan Masyarakat' },
  { username: 'subbagtekhum', password: 'teknishukum', role: 'user', nama_lengkap: 'Sub Bagian Teknis Penyelenggaraan Pemilu, dan Hukum' }
];

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
      addActivity: (activityData) => {
        const newActivity: Activity = {
          ...activityData,
          id: Date.now().toString(),
          status: 'Diajukan',
          dokumenChecklist: getInitialChecklist(activityData.tempatKegiatan),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          activities: [newActivity, ...state.activities],
        }));
        
        // Notify PIC
        get().addNotification({
          userId: 'pic',
          message: `Kegiatan baru diajukan: ${newActivity.judulKegiatan} oleh ${newActivity.subBagian}`,
          activityId: newActivity.id,
        });
      },
      updateActivityStatus: (id, status, checklist) => {
        set((state) => {
          const activity = state.activities.find(a => a.id === id);
          if (!activity) return state;

          const updatedActivities = state.activities.map((a) =>
            a.id === id ? { ...a, status, dokumenChecklist: checklist } : a
          );

          return { activities: updatedActivities };
        });
      },
      deleteActivity: (id) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
          // Optionally, we could also delete related notifications here if needed, 
          // but keeping them might be fine or we can clean them up.
          notifications: state.notifications.filter((n) => n.activityId !== id)
        }));
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
