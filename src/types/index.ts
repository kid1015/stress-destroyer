// ───────────────────────────────
// 앱 단계 (scene)
// ───────────────────────────────
export type AppScene =
  | 'write'       // 종이에 텍스트 작성
  | 'shred'       // 파쇄기에 갈리는 중
  | 'collect'     // 파쇄된 조각들 쓰레기통으로 드래그
  | 'launch'      // 쓰레기통 → 우주선 드래그
  | 'fly'         // 우주선 날아가는 중
  | 'explode'     // 우주선 폭죽으로 터짐
  | 'celebrate';  // 축하 화면

// ───────────────────────────────
// 종이 조각 (파쇄 후)
// ───────────────────────────────
export interface PaperShred {
  id: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  color: string;
  inTrash: boolean;
}

// ───────────────────────────────
// 나쁜 기억 (Supabase 저장용)
// ───────────────────────────────
export interface BadMemory {
  id: string;
  user_id?: string;
  content: string;
  destroyed_at: string;
  session_id: string;
}

// ───────────────────────────────
// 파티클 (폭죽 효과)
// ───────────────────────────────
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  shape: 'circle' | 'star' | 'heart' | 'spark';
}

// ───────────────────────────────
// 드래그 상태
// ───────────────────────────────
export interface DragState {
  isDragging: boolean;
  target: 'trash' | 'rocket' | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

// ───────────────────────────────
// 앱 전체 상태 (Zustand)
// ───────────────────────────────
export interface AppState {
  scene: AppScene;
  text: string;
  shreds: PaperShred[];
  shredsInTrash: number;
  isTrashFull: boolean;
  sessionId: string;

  // actions
  setText: (text: string) => void;
  startShred: () => void;
  addShredToTrash: (id: string) => void;
  setScene: (scene: AppScene) => void;
  reset: () => void;
}
