'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { GA } from '@/lib/analytics';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function WriteScene() {
  const { text, setText, startShred } = useAppStore();
  const router = useRouter();
  const supabase = createClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [starCount, setStarCount] = useState<number>(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    textareaRef.current?.focus();
    GA.sceneWrite();
  }, []);

  useEffect(() => {
    async function init() {
      let { data: { user } } = await supabase.auth.getUser();

      // 로그인 안 돼있으면 익명 로그인 자동 실행
      if (!user) {
        const { data } = await supabase.auth.signInAnonymously();
        user = data.user;
      }

      if (user) {
        const { count } = await supabase
          .from('stars')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setStarCount(count || 0);
      }

      setReady(true);
    }
    init();
  }, []);

  const handleShred = () => {
    if (!text.trim()) return;
    GA.clickShredBtn();
    startShred();
  };

  const charCount = text.length;
  const isReady = text.trim().length > 0;

  return (
    <div className="scene-container bg-void-950">
      <Stars />
      <div className="relative z-10 w-full max-w-lg mx-auto px-6 flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-white/40 text-sm font-body tracking-widest uppercase mb-3">
            stress destroyer
          </p>
          <h1 className="text-3xl font-display font-bold text-white leading-tight">
            오늘 쌓인 고민들<br />
            <span className="neon-text-pink">우주로 날려버려!</span>
          </h1>
          <p className="text-white/40 text-sm font-body mt-3">
            적은 내용은 파쇄 후 우주로 사라져요 🚀
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full relative"
          style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.6))' }}
        >
          <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#ffffff' }}>
            <div className="flex items-center justify-between px-4 pt-4 pb-2"
              style={{ borderBottom: '1px solid #e5e5ea' }}>
              <div className="flex items-center gap-2">
                <div className="text-base">📝</div>
                <span className="text-black/60 text-sm font-body font-medium">메모</span>
              </div>
              <span className="text-black/30 text-xs font-mono">
                {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="px-4 py-3">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="오늘 진짜 짜증났던 것, 잊고 싶은 것, 다 여기다 쏟아내..."
                className="w-full leading-7"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '17px',
                  minHeight: '180px',
                  lineHeight: '1.6',
                  background: 'transparent',
                  color: '#1c1c1e',
                  caretColor: '#ff2d78',
                }}
                maxLength={500}
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderTop: '1px solid #e5e5ea' }}>
              <div className="flex items-center gap-3">
                <span className="text-black/20 text-lg">Aa</span>
                <span className="text-black/20 text-lg">📷</span>
                <span className="text-black/20 text-lg">✓</span>
              </div>
              <span className="text-black/25 text-xs font-mono">{charCount} / 500</span>
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isReady ? 1 : 0.4, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          onClick={handleShred}
          disabled={!isReady}
          whileHover={isReady ? { scale: 1.03 } : {}}
          whileTap={isReady ? { scale: 0.97 } : {}}
          className="btn-neon w-full text-base"
          style={{
            background: isReady ? 'linear-gradient(135deg, #ff2d78, #b347ff)' : '#2a2a45',
            color: isReady ? 'white' : '#5a5a7a',
            boxShadow: isReady ? '0 0 30px rgba(255, 45, 120, 0.4)' : 'none',
          }}
        >
          🗂 파쇄기에 넣기
        </motion.button>

        {ready && (
          <button
            onClick={() => { GA.clickUniverseBtn(); router.push('/universe'); }}
            className="w-full py-3 rounded-2xl text-sm font-display font-semibold text-white transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #b347ff, #3d9eff)', boxShadow: '0 0 20px rgba(179,71,255,0.3)' }}
          >
            🌌 내 우주 보러가기 · ✦ {starCount}개
          </button>
        )}

        <p className="text-white/15 text-xs font-mono text-center">
          © 2026 박수민. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
  }));

  return (
    <div className="star-field">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: star.duration, delay: star.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}
