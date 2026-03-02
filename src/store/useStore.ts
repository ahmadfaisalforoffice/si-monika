import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

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
  setActivities: (activities: Activity[]) => void;
  fetchActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'status' | 'dokumenChecklist' | 'createdAt'>) => Promise<void>;
  updateActivityStatus: (id: string, status: ActivityStatus, checklist: Record<string, boolean>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
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
      setActivities: (activities) => set({ activities }),
      fetchActivities: async () => {
        try {
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          if (data) {
            const mappedData = data.map((item: any) => {
              const { created_at, ...rest } = item;
              return {
                ...rest,
                createdAt: created_at || rest.createdAt,
              };
            });
            set({ activities: mappedData as Activity[] });
          }
        } catch (error) {
          console.error('Error fetching activities:', error);
        }
      },
      addActivity: async (activityData) => {
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
        const status = 'Diajukan';
        const dokumenChecklist = getInitialChecklist(activityData.tempatKegiatan);

        const newActivity: Activity = {
          ...activityData,
          id,
          status,
          dokumenChecklist,
          createdAt,
        };
        
        const dbActivity = {
          ...activityData,
          id,
          status,
          dokumenChecklist,
          created_at: createdAt,
        };
        
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
            .update({ status, dokumenChecklist: checklist })
            .eq('id', id);
            
          if (error) throw error;
          
          set((state) => {
            const activity = state.activities.find(a => a.id === id);
            if (!activity) return state;

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
