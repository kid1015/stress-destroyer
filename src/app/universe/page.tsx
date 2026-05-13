'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';

interface Star {
  id: string;
  year: number;
  month: number;
  day: number;
  created_at: string;
}

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

// 별 위치를 우주 느낌으로 랜덤 배치 (시드 기반으로 고정)
function getStarPosition(day: number, seed: number) {
  const hash = (day * 137 + seed * 31) % 1000;
  const angle = (hash / 1000) * Math.PI * 2;
  const radius = 25 + ((day * seed * 7) % 100) * 0.45;
  return {
    x: 50 + Math.cos(angle) * radius * 0.6,
    y: 50 + Math.sin(angle) * radius * 0.5,
  };
}

export default function UniversePage() {
  const router = useRouter();
  const supabase = createClient();
  const { setScene } = useAppStore();
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data } = await supabase
        .from('stars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (data) setStars(data);
      setLoading(false);
    }
    init();
  }, []);

  const starsThisMonth = stars.filter(s => s.year === viewYear && s.month === viewMonth);
  const totalStars = stars.length;

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(v => v - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewYear(v => v + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  }

  function handleBack() {
    setScene('explode');
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl">🌟</motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-950 overflow-hidden relative">
      {/* 배경 별 */}
      <BackgroundStars />

      {/* 성운 효과 */}
      <div className="fixed inset-0 pointer-events-none">
        <div style={{ position: 'absolute', top: '15%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(179,71,255,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(61,158,255,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleBack} className="text-white/40 hover:text-white transition-colors text-sm font-mono">
            ← 돌아가기
          </button>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="text-white/25 hover:text-white/50 transition-colors text-xs font-mono">
            로그아웃
          </button>
        </div>

        {/* 타이틀 */}
        <div className="text-center mb-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-display font-bold text-white mb-1">나의 우주 🌌</h1>
            <p className="text-white/40 text-sm font-body">
              지금까지 <span style={{ color: '#b347ff' }}>{totalStars}개</span>의 고민을 날려버렸어
            </p>
          </motion.div>
        </div>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth}
            className="w-10 h-10 flex items-center justify-center rounded-full glass-card text-white/50 hover:text-white transition-colors text-xl">
            ‹
          </button>
          <div className="text-center">
            <h2 className="text-lg font-display font-bold text-white">
              {viewYear}년 {MONTH_NAMES[viewMonth - 1]}
            </h2>
            <p className="text-xs font-mono text-white/30">
              {starsThisMonth.length > 0 ? `✦ ${starsThisMonth.length}개의 별` : '이번 달 별이 없어'}
            </p>
          </div>
          <button onClick={nextMonth}
            className="w-10 h-10 flex items-center justify-center rounded-full glass-card text-white/50 hover:text-white transition-colors text-xl">
            ›
          </button>
        </div>

        {/* 우주 별 뷰 */}
        <div className="relative flex-1 glass-card overflow-hidden"
          style={{ minHeight: '340px', background: 'rgba(6,6,10,0.8)' }}>

          {/* 우주 배경 점들 */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{
                width: Math.random() > 0.8 ? 2 : 1,
                height: Math.random() > 0.8 ? 2 : 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.1 + Math.random() * 0.2,
              }} />
          ))}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${viewYear}-${viewMonth}`}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              {starsThisMonth.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="text-4xl opacity-30">🌑</div>
                  <p className="text-white/20 text-sm font-body">이번 달엔 아직 별이 없어</p>
                  <p className="text-white/15 text-xs font-mono">고민을 날려버리면 별이 생겨요</p>
                </div>
              ) : (
                starsThisMonth.map((star, idx) => {
                  const pos = getStarPosition(star.day, viewMonth * 100 + viewYear);
                  return (
                    <StarDot
                      key={star.id}
                      star={star}
                      x={pos.x}
                      y={pos.y}
                      idx={idx}
                      onClick={() => setSelectedStar(star)}
                    />
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-display font-bold text-white">{totalStars}</p>
            <p className="text-xs font-mono text-white/40 mt-1">총 날려버린 고민</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-display font-bold text-white">
              {new Set(stars.map(s => `${s.year}-${s.month}`)).size}
            </p>
            <p className="text-xs font-mono text-white/40 mt-1">활동한 달</p>
          </div>
        </div>

        <p className="text-center text-white/10 text-xs font-mono mt-4">
          © 2026 박수민. All rights reserved.
        </p>
      </div>

      {/* 별 클릭 팝업 */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedStar(null)}
          >
            <motion.div
              className="glass-card p-6 text-center space-y-3 max-w-xs w-full"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 20, -20, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-4xl"
              >✦</motion.div>
              <p className="text-white font-display text-lg">
                {selectedStar.year}년 {selectedStar.month}월 {selectedStar.day}일
              </p>
              <p className="text-white/50 text-sm font-body">이날 고민을 우주로 날려버렸어 🚀</p>
              <button onClick={() => setSelectedStar(null)}
                className="text-white/30 text-xs font-mono hover:text-white transition-colors">닫기</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 별 컴포넌트
function StarDot({ star, x, y, idx, onClick }: {
  star: Star; x: number; y: number; idx: number; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const colors = ['#ffffff', '#b347ff', '#3d9eff', '#00e5b0', '#ffe033', '#ff2d78'];
  const color = colors[idx % colors.length];

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: idx * 0.08, type: 'spring', stiffness: 200 }}
      className="absolute flex items-center justify-center"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {/* 별빛 글로우 */}
      <motion.div
        className="absolute rounded-full"
        animate={hovered
          ? { scale: [1, 1.8, 1.4], opacity: [0.3, 0.6, 0.4] }
          : { scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }
        }
        transition={{ duration: hovered ? 0.6 : 2 + idx * 0.3, repeat: Infinity }}
        style={{ width: 24, height: 24, background: color, filter: 'blur(6px)' }}
      />
      {/* 별 본체 */}
      <motion.div
        animate={hovered
          ? { scale: [1, 1.6, 1.3, 1.5], rotate: [0, 30, -30, 0] }
          : { scale: [1, 1.15, 1] }
        }
        transition={{ duration: hovered ? 0.5 : 2 + idx * 0.4, repeat: Infinity }}
        className="relative z-10 text-base select-none"
        style={{ color, textShadow: `0 0 8px ${color}, 0 0 20px ${color}` }}
      >
        ✦
      </motion.div>
      {/* 호버 시 날짜 표시 */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute -bottom-6 whitespace-nowrap text-xs font-mono text-white/70 pointer-events-none"
          >
            {star.month}/{star.day}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function BackgroundStars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.3, delay: Math.random() * 4,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none">
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.05, 0.4, 0.05] }}
          transition={{ duration: 2 + Math.random() * 3, delay: s.delay, repeat: Infinity }} />
      ))}
    </div>
  );
}
