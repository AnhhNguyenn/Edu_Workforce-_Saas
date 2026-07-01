import { create } from 'zustand';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'danger';
  createdAt: Date;
  read: boolean;
  link?: string;
}

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setNotifications: (ns: AppNotification[]) => void;
  
  upgradeModalOpen: boolean;
  setUpgradeModalOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true, // Mặc định mở trên desktop
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  notifications: [],
  unreadCount: 0,
  addNotification: (n) => set((state) => {
    const newNotif: AppNotification = {
      ...n,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
      read: false
    };
    const newNs = [newNotif, ...state.notifications];
    return { notifications: newNs, unreadCount: state.unreadCount + 1 };
  }),
  markAsRead: (id) => set((state) => {
    const newNs = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    return { notifications: newNs, unreadCount: Math.max(0, state.unreadCount - 1) };
  }),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),
  setNotifications: (ns) => set({ notifications: ns, unreadCount: ns.filter(n => !n.read).length }),

  upgradeModalOpen: false,
  setUpgradeModalOpen: (isOpen) => set({ upgradeModalOpen: isOpen }),
}));
