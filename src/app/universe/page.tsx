'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface Star {
  id: string;
  year: number;
  month: number;
  day: number;
  created_at: string;
}

const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export default function UniversePage() {
  const router = useRouter();
  const supabase = createClient();
  const [stars, setStars] = useState<Star[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
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
  const starDays = new Set(starsThisMonth.map(s => s.day));
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const totalStars = stars.length;

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(v => v - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 12) { setViewYear(v => v + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
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
      <StarField />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-white/40 hover:text-white transition-colors text-sm font-mono">
            ← 돌아가기
          </button>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="text-white/30 hover:text-white/60 transition-colors text-xs font-mono">
            로그아웃
          </button>
        </div>

        {/* 타이틀 */}
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-display font-bold text-white mb-1">나의 우주 🌌</h1>
            <p className="text-white/40 text-sm font-body">
              지금까지 <span style={{ color: '#b347ff' }}>{totalStars}개</span>의 고민을 날려버렸어
            </p>
          </motion.div>
        </div>

        {/* 월 네비게이션 */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="text-white/50 hover:text-white transition-colors text-xl px-2">‹</button>
            <h2 className="text-lg font-display font-bold text-white">
              {viewYear}년 {MONTH_NAMES[viewMonth - 1]}
              {starsThisMonth.length > 0 && (
                <span className="ml-2 text-sm font-mono" style={{ color: '#b347ff' }}>
                  ✦ {starsThisMonth.length}
                </span>
              )}
            </h2>
            <button onClick={nextMonth} className="text-white/50 hover:text-white transition-colors text-xl px-2">›</button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-mono text-white/30 py-1">{d}</div>
            ))}
          </div>

          {/* 캘린더 */}
          <div className="grid grid-cols-7 gap-1">
            {/* 빈 칸 */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* 날짜 */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasStar = starDays.has(day);
              const isToday = day === today.getDate() && viewMonth === today.getMonth() + 1 && viewYear === today.getFullYear();
              const starData = starsThisMonth.find(s => s.day === day);

              return (
                <motion.button
                  key={day}
                  onClick={() => hasStar && starData && setSelectedStar(starData)}
                  whileHover={hasStar ? { scale: 1.15 } : {}}
                  whileTap={hasStar ? { scale: 0.95 } : {}}
                  className="aspect-square flex items-center justify-center rounded-full relative"
                  style={{
                    background: hasStar ? 'rgba(179, 71, 255, 0.15)' : 'transparent',
                    border: isToday ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                  }}
                >
                  {hasStar ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                      className="text-base"
                    >
                      ✦
                    </motion.div>
                  ) : (
                    <span className="text-xs font-mono" style={{ color: isToday ? 'white' : 'rgba(255,255,255,0.25)' }}>
                      {day}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {starsThisMonth.length === 0 && (
            <p className="text-center text-white/20 text-sm font-body py-2">
              이번 달엔 아직 날린 고민이 없어
            </p>
          )}
        </div>

        {/* 전체 통계 */}
        <div className="grid grid-cols-2 gap-3">
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

        <p className="text-center text-white/10 text-xs font-mono">
          © 2026 박수민. All rights reserved.
        </p>
      </div>

      {/* 별 클릭 팝업 */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStar(null)}
          >
            <motion.div
              className="glass-card p-6 text-center space-y-3 max-w-xs w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl">✦</div>
              <p className="text-white font-display text-lg">
                {selectedStar.year}년 {selectedStar.month}월 {selectedStar.day}일
              </p>
              <p className="text-white/50 text-sm font-body">
                이날 고민을 우주로 날려버렸어 🚀
              </p>
              <button onClick={() => setSelectedStar(null)}
                className="text-white/30 text-xs font-mono hover:text-white transition-colors">
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2 + 0.3, delay: Math.random() * 4,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none">
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: 2 + Math.random() * 3, delay: s.delay, repeat: Infinity }} />
      ))}
    </div>
  );
}
