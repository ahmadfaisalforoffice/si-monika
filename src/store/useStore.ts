import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type Role = 'admin' | 'user' | 'pic';

export type User = {
  id: string;
  email: string;
  role: Role;
  nama_lengkap: string;
  username?: string;
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
  currentUser: User | null;
  profiles: User[];
  activities: Activity[];
  notifications: Notification[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  fetchProfiles: () => Promise<void>;
  setActivities: (activities: Activity[]) => void;
  fetchActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'status' | 'dokumenChecklist' | 'createdAt'>) => Promise<void>;
  updateActivityStatus: (id: string, status: ActivityStatus, checklist: Record<string, boolean>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
}

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

const mapDbToChecklist = (item: any) => {
  const checklist: Record<string, boolean> = {
    'Berita Acara (BA) Pleno': item.chk_berita_acara_pleno,
    'Nota Dinas': item.chk_nota_dinas,
    'Kerangka Acuan Kerja (KAK) / TOR': item.chk_kak_tor,
    'Laporan Kegiatan': item.chk_laporan_kegiatan,
    'Undangan Eksternal': item.chk_undangan_eksternal,
    'Undangan Internal': item.chk_undangan_internal,
    'Daftar Hadir Eksternal': item.chk_daftar_hadir_eksternal,
    'Daftar Hadir Internal': item.chk_daftar_hadir_internal,
    'Foto/Dokumentasi Kegiatan': item.chk_foto_dokumentasi,
  };

  if (item.tempat_kegiatan === 'Luar Kantor') {
    checklist['Surat Tugas Sekretariat'] = item.chk_surat_tugas_sekretariat;
    checklist['Surat Tugas KPU'] = item.chk_surat_tugas_kpu;
  }

  return checklist;
};

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
      currentUser: null,
      profiles: [],
      activities: [],
      notifications: [],
      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            set({
              currentUser: {
                id: data.user.id,
                email: data.user.email!,
                role: profile.role as Role,
                nama_lengkap: profile.nama_lengkap,
                username: profile.username,
              },
            });
          }
        }
      },
      logout: async () => {
        await supabase.auth.signOut();
        set({ currentUser: null, activities: [], notifications: [] });
      },
      updatePassword: async (newPassword) => {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) throw error;
      },
      checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            set({
              currentUser: {
                id: session.user.id,
                email: session.user.email!,
                role: profile.role as Role,
                nama_lengkap: profile.nama_lengkap,
                username: profile.username,
              },
            });
            // Fetch initial data
            get().fetchActivities();
            if (profile.role === 'admin') {
              get().fetchProfiles();
            }
          }
        }
      },
      fetchProfiles: async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*');
          
          if (error) throw error;
          if (data) {
            set({ profiles: data.map(p => ({
              id: p.id,
              email: '', // Email is not in profiles table usually for privacy
              role: p.role as Role,
              nama_lengkap: p.nama_lengkap,
              username: p.username
            })) });
          }
        } catch (error) {
          console.error('Error fetching profiles:', error);
        }
      },
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
        const currentUser = get().currentUser;
        if (!currentUser) throw new Error('User not logged in');

        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const status = 'Diajukan';
        const dokumenChecklist = getInitialChecklist(activityData.tempatKegiatan);

        const newActivity: Activity = {
          ...activityData,
          id,
          status,
          dokumenChecklist,
          createdAt,
          createdBy: currentUser.id,
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
          
          // Notify PIC (Hardcoded ID for PIC if needed, or broadcast)
          get().addNotification({
            userId: 'pic-id', // This should ideally be dynamic or handled by server
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
      name: 'simonika-storage-v2',
    }
  )
);
