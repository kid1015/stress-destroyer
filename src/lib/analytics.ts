// GA4 커스텀 이벤트 트래킹
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// ── 씬 이벤트 ──
export const GA = {
  // 씬 진입
  sceneWrite: () => trackEvent('scene_1_write', { scene: '메모장 입력' }),
  sceneShred: () => trackEvent('scene_2_shred', { scene: '파쇄기' }),
  sceneCollect: () => trackEvent('scene_3_collect', { scene: '파쇄 조각 수거' }),
  sceneLaunch: () => trackEvent('scene_4_launch', { scene: '쓰레기통 우주선 탑재' }),
  sceneFly: () => trackEvent('scene_5_fly', { scene: '발사 준비' }),
  sceneExplode: () => trackEvent('scene_6_explode', { scene: '발사 완료' }),

  // 버튼 클릭
  clickShredBtn: () => trackEvent('click_shred_btn', { button: '파쇄기에 넣기 CTA' }),
  clickDragShred: () => trackEvent('click_drag_shred', { button: '파쇄 조각 드래그' }),
  clickDragTrash: () => trackEvent('click_drag_trash_to_rocket', { button: '쓰레기통 우주선으로 드래그' }),
  clickLaunchBtn: () => trackEvent('click_launch_btn', { button: '발사 CTA' }),
  clickRetryBtn: () => trackEvent('click_retry_btn', { button: '또 날려버리기 CTA' }),
};
