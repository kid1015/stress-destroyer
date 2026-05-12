import { create } from 'zustand';
import { AppState, AppScene, PaperShred } from '@/types';

function generateShreds(text: string): PaperShred[] {
  const count = 10;
  const colors = ['#fafaf7', '#f5f0e8', '#e8e4dc', '#fef9e3', '#fce4e4'];

  return Array.from({ length: count }, (_, i) => ({
    id: `shred-${i}-${Date.now()}`,
    x: 40 + Math.random() * 20,
    y: 50 + Math.random() * 10,
    rotation: Math.random() * 360,
    width: 28 + Math.random() * 24,
    height: 10 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    inTrash: false,
  }));
}

function generateSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useAppStore = create<AppState>((set, get) => ({
  scene: 'write',
  text: '',
  shreds: [],
  shredsInTrash: 0,
  isTrashFull: false,
  sessionId: generateSessionId(),

  setText: (text) => set({ text }),

  startShred: () => {
    const { text } = get();
    const shreds = generateShreds(text);
    set({ scene: 'shred', shreds });
  },

  addShredToTrash: (id) => {
    set((state) => {
      const updated = state.shreds.map((s) =>
        s.id === id ? { ...s, inTrash: true } : s
      );
      const inTrashCount = updated.filter((s) => s.inTrash).length;
      const isTrashFull = inTrashCount >= updated.length;
      return {
        shreds: updated,
        shredsInTrash: inTrashCount,
        isTrashFull,
        scene: isTrashFull ? 'launch' : 'collect',
      };
    });
  },

  setScene: (scene: AppScene) => set({ scene }),

  reset: () => set({
    scene: 'write',
    text: '',
    shreds: [],
    shredsInTrash: 0,
    isTrashFull: false,
    sessionId: generateSessionId(),
  }),
}));
