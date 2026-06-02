'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { GA } from '@/lib/analytics';

interface Star {
  id: string;
  year: number;
  month: number;
  day: number;
  created_at: string;
}

const MONTH_NAMES = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

// 우주 성장 단계
function getUniverseLevel(total: number) {
  if (total >= 20) return { level: 4, name: '풀 갤럭시', emoji: '🎆' };
  if (total >= 15) return { level: 3, name: '은하수 형성', emoji: '💫' };
  if (total >= 10) return { level: 2, name: '성운 등장', emoji: '🌌' };
  if (total >= 5)  return { level: 1, name: '별이 생기기 시작', emoji: '🌟' };
  return { level: 0, name: '텅 빈 우주', emoji: '🌑' };
}

// 스트릭 계산
function getStreak(stars: Star[]) {
  if (stars.length === 0) return 0;
  const uniqueDates = Array.from(new Set(stars.map(s => `${s.year}-${String(s.month).padStart(2,'0')}-${String(s.day).padStart(2,'0')}`))).sort().reverse();
  const dates = uniqueDates;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === i || (i === 0 && diff <= 1)) streak++;
    else break;
  }
  return streak;
}

// 별 색상 (스트릭에 따라)
function getStarColor(streak: number, idx: number) {
  if (streak >= 7) {
    const rainbow = ['#ff2d78','#ff6b2d','#ffe033','#00e5b0','#3d9eff','#b347ff'];
    return rainbow[idx % rainbow.length];
  }
  if (streak >= 3) return '#ffd700';
  const colors = ['#ffffff','#b347ff','#3d9eff','#00e5b0','#ffe033','#ff2d78','#c8a0ff'];
  return colors[idx % colors.length];
}

// 별 위치 (우주 느낌)
function getStarPos(day: number, month: number, idx: number) {
  const angle = (idx / 20) * Math.PI * 2 + (day * 0.7);
  const r = 12 + (idx % 5) * 5 + (day % 4) * 2;
  return {
    x: Math.min(85, Math.max(15, 50 + Math.cos(angle) * r * 0.7)),
    y: Math.min(85, Math.max(15, 50 + Math.sin(angle) * r * 0.6)),
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
      const { data } = await supabase.from('stars').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
      if (data) {
        setStars(data);
        const level = getUniverseLevel(data.length).level;
        GA.viewUniverse(data.length, level);
      }
      setLoading(false);
    }
    init();
  }, []);

  const starsThisMonth = stars.filter(s => s.year === viewYear && s.month === viewMonth);
  const totalStars = stars.length;
  const universe = getUniverseLevel(totalStars);
  const streak = getStreak(stars);

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(v => v - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewYear(v => v + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  }

  function handleBack() {
    setScene('write');
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-4xl">🌟</motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-950 overflow-hidden relative">
      <BackgroundStars level={universe.level} />

      {/* 성운 — 레벨에 따라 진해짐 */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div animate={{ opacity: universe.level >= 2 ? 1 : 0 }} transition={{ duration: 2 }}
          style={{ position: 'absolute', top: '10%', right: '8%', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(179,71,255,0.10) 0%, transparent 70%)', borderRadius: '50%' }} />
        <motion.div animate={{ opacity: universe.level >= 2 ? 1 : 0 }} transition={{ duration: 2, delay: 0.5 }}
          style={{ position: 'absolute', bottom: '15%', left: '5%', width: '240px', height: '240px', background: 'radial-gradient(circle, rgba(61,158,255,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        {/* 은하수 — 레벨 3+ */}
        {universe.level >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }}
            style={{ position: 'absolute', top: '30%', left: '0', right: '0', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(179,71,255,0.15), rgba(61,158,255,0.2), rgba(0,229,176,0.15), transparent)', filter: 'blur(8px)' }} />
        )}
        {/* 별똥별 — 레벨 4 */}
        {universe.level >= 4 && <ShootingStars />}
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="text-white/40 hover:text-white transition-colors text-sm font-mono">← 돌아가기</button>
          <button onClick={() => {
  if (window.confirm('로그아웃하면 내 우주 기록이 모두 사라져요. 계속할까요?')) {
    supabase.auth.signOut().then(() => { setScene('write'); router.push('/'); });
  }
}}
  className="text-white/25 hover:text-white/50 transition-colors text-xs font-mono">로그아웃</button>
        </div>

        {/* 우주 레벨 + 타이틀 */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <div className="text-4xl mb-2">{universe.emoji}</div>
          <h1 className="text-2xl font-display font-bold text-white mb-1">나의 우주</h1>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-xs font-mono px-3 py-1 rounded-full"
              style={{ background: 'rgba(179,71,255,0.2)', color: '#b347ff', border: '1px solid rgba(179,71,255,0.3)' }}>
              {universe.name}
            </span>
            <span className="text-white/40 text-xs font-mono">✦ {totalStars}개</span>
            {streak > 0 && (
              <span className="text-xs font-mono px-3 py-1 rounded-full"
                style={{ background: streak >= 7 ? 'linear-gradient(135deg, rgba(255,45,120,0.2), rgba(179,71,255,0.2))' : streak >= 3 ? 'rgba(255,208,0,0.15)' : 'rgba(255,255,255,0.08)', color: streak >= 7 ? '#ff2d78' : streak >= 3 ? '#ffd700' : 'rgba(255,255,255,0.5)', border: `1px solid ${streak >= 7 ? 'rgba(255,45,120,0.3)' : streak >= 3 ? 'rgba(255,208,0,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                🔥 {streak}일 연속
              </span>
            )}
          </div>
        </motion.div>

        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-full glass-card text-white/50 hover:text-white transition-colors text-xl">‹</button>
          <div className="text-center">
            <h2 className="text-base font-display font-bold text-white">{viewYear}년 {MONTH_NAMES[viewMonth - 1]}</h2>
            <p className="text-xs font-mono text-white/30">{starsThisMonth.length > 0 ? `✦ ${starsThisMonth.length}개의 별` : '이번 달 별이 없어'}</p>
          </div>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-full glass-card text-white/50 hover:text-white transition-colors text-xl">›</button>
        </div>

        {/* 우주 뷰 */}
        <div className="relative glass-card overflow-hidden" style={{ minHeight: '300px', background: 'rgba(4,4,10,0.9)' }}>
          {/* 배경 작은 별 */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ width: Math.random() > 0.8 ? 1.5 : 1, height: Math.random() > 0.8 ? 1.5 : 1, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: 0.08 + Math.random() * 0.15 }} />
          ))}

          <AnimatePresence mode="wait">
            <motion.div key={`${viewYear}-${viewMonth}`} className="absolute inset-0"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {starsThisMonth.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="text-4xl opacity-20">🌑</div>
                  <p className="text-white/20 text-sm font-body">이번 달엔 아직 별이 없어</p>
                  <p className="text-white/12 text-xs font-mono">고민을 날려버리면 별이 생겨요</p>
                </div>
              ) : (
                starsThisMonth.map((star, idx) => {
                  const pos = getStarPos(star.day, star.month, idx);
                  const color = getStarColor(streak, idx);
                  return (
                    <StarDot key={star.id} star={star} x={pos.x} y={pos.y} idx={idx} color={color} streak={streak} onClick={() => setSelectedStar(star)} />
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 성장 게이지 */}
        <div className="mt-4 glass-card p-4 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-white/40">우주 성장</span>
            <span style={{ color: '#b347ff' }}>{universe.name}</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #b347ff, #3d9eff, #00e5b0)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(100, (totalStars / 20) * 100)}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }} />
          </div>
          <div className="flex justify-between text-xs font-mono text-white/20">
            <span>0</span>
            <span>5</span>
            <span>10</span>
            <span>15</span>
            <span>20+</span>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="glass-card p-3 text-center">
            <p className="text-xl font-display font-bold text-white">{totalStars}</p>
            <p className="text-xs font-mono text-white/30 mt-0.5">총 별</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-xl font-display font-bold" style={{ color: streak >= 3 ? '#ffd700' : 'white' }}>{streak}</p>
            <p className="text-xs font-mono text-white/30 mt-0.5">연속 일수</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-xl font-display font-bold text-white">
              {new Set(stars.map(s => `${s.year}-${s.month}`)).size}
            </p>
            <p className="text-xs font-mono text-white/30 mt-0.5">활동한 달</p>
          </div>
        </div>

        <p className="text-center text-white/10 text-xs font-mono mt-4">© 2026 박수민. All rights reserved.</p>
      </div>

      {/* 별 팝업 */}
      <AnimatePresence>
        {selectedStar && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedStar(null)}>
            <motion.div className="glass-card p-6 text-center space-y-3 max-w-xs w-full"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}>
              <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, 20, -20, 0] }}
                transition={{ duration: 1, repeat: Infinity }} className="text-4xl">✦</motion.div>
              <p className="text-white font-display text-lg">
                {selectedStar.year}년 {selectedStar.month}월 {selectedStar.day}일
              </p>
              <p className="text-white/50 text-sm font-body">
                {getEncouragement()}
              </p>
              <button onClick={() => setSelectedStar(null)} className="text-white/30 text-xs font-mono hover:text-white transition-colors">닫기</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 응원 메시지
const ENCOURAGEMENTS = [
  "그 고민은 이제 우주 먼지야 ✨",
  "날려버린 만큼 가벼워졌을 거야 💜",
  "오늘도 잘 버텼어 🚀",
  "버려야 할 건 버릴 줄 아는 사람이야",
  "이날의 나, 진짜 잘했다",
  "우주가 네 고민을 가져갔어 🌌",
  "그거 없어도 잘 살 수 있어",
  "날린 만큼 빈 자리에 좋은 것들이 채워질 거야",
  "완벽하지 않아도 괜찮아, 오늘 하루 살아냈잖아",
  "그 무게 혼자 다 들고 있었던 거야? 대단하다 진짜",
  "어떤 건 그냥 흘려보내도 돼",
  "이날 이후로 조금 더 가벼워졌을 거야 🌟",
  "걱정했던 것들 대부분은 일어나지 않아",
  "별이 됐어. 이제 우주가 가져갔으니까",
  "힘들었던 거 맞아. 그래도 여기까지 왔잖아",
  "오늘의 나한테 수고했다고 해줘 🤍",
  "우주 어딘가에서 네 고민이 별이 됐을 거야 💫",
  "날려버렸으니까 이제 진짜 끝이야",
  "그 고민 붙잡고 있을 필요 없어. 이미 보냈잖아",
  "가끔은 버리는 게 가장 현명한 선택이야",
  "오늘 하루도 수고 많았어 🌙",
  "작은 것도 쌓이면 무거워. 잘 버렸어",
  "이제 그 자리에 더 좋은 게 들어올 거야",
  "우주가 대신 짊어졌어. 넌 이제 좀 쉬어",
  "버린 만큼 앞으로 나아갈 수 있어 🚀",
  "별 하나가 더 생겼어. 네 흔적이야 ✦",
  "살다 보면 이런 날도 있는 거야. 잘 넘겼어",
  "그거 생각하느라 얼마나 힘들었어. 이제 그만해도 돼",
  "넌 생각보다 훨씬 단단한 사람이야",
  "우주도 처음엔 혼돈이었어. 괜찮아 💙",
];
function getEncouragement() {
  return ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
}

// 별 컴포넌트
function StarDot({ star, x, y, idx, color, streak, onClick }: {
  star: Star; x: number; y: number; idx: number; color: string; streak: number; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  function handleClick() {
    GA.clickStarDetail(star.month, star.day);
    onClick();
  }

  return (
    <motion.button onClick={handleClick}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
      className="absolute flex items-center justify-center"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
      {/* 글로우 */}
      <motion.div className="absolute rounded-full"
        animate={hovered
          ? { scale: [1, 2.2, 1.8], opacity: [0.4, 0.7, 0.5] }
          : { scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }
        }
        transition={{ duration: hovered ? 0.5 : 2 + idx * 0.3, repeat: Infinity }}
        style={{ width: 28, height: 28, background: color, filter: 'blur(7px)' }} />
      {/* 본체 */}
      <motion.div
        animate={hovered
          ? { scale: [1, 1.8, 1.5, 1.7], rotate: [0, 40, -40, 0] }
          : { scale: [1, 1.15, 1] }
        }
        transition={{ duration: hovered ? 0.4 : 2.5 + idx * 0.4, repeat: Infinity }}
        className="relative z-10 text-lg select-none"
        style={{ color, textShadow: `0 0 10px ${color}, 0 0 25px ${color}` }}>
        {streak >= 7 ? '★' : streak >= 3 ? '✦' : '·'}
      </motion.div>
      {/* 호버 날짜 */}
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute -bottom-7 whitespace-nowrap text-xs font-mono text-white/60 pointer-events-none bg-black/50 px-2 py-0.5 rounded-full">
            {star.month}/{star.day}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// 배경 별 (레벨에 따라 많아짐)
function BackgroundStars({ level }: { level: number }) {
  const count = 40 + level * 25;
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.8 + 0.3, delay: Math.random() * 5,
    duration: 2 + Math.random() * 4,
  })), [count]);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.05, 0.4, 0.05] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }} />
      ))}
    </div>
  );
}

// 별똥별 (레벨 4)
function ShootingStars() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div key={i}
          className="absolute h-px rounded-full"
          style={{ width: '80px', background: 'linear-gradient(90deg, transparent, white)', top: `${15 + i * 20}%`, left: '-80px' }}
          animate={{ x: ['0vw', '120vw'], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, delay: i * 3 + Math.random() * 2, repeat: Infinity, repeatDelay: 6 + i * 2 }} />
      ))}
    </>
  );
}
