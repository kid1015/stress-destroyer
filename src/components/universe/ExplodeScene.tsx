'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { GA } from '@/lib/analytics';
import confetti from 'canvas-confetti';
import { useSoundEffects } from '@/hooks/useSoundEffects';

type Phase = 'ascend' | 'flying' | 'explode' | 'celebrate';

interface Particle {
  id: number; x: number; y: number;
  emoji: string; vx: number; vy: number; size: number; rotate: number;
}

const EMOJIS = ['✨', '⭐', '🌟', '💫', '🎆', '🎇', '🌈', '💜', '💙', '🩷', '🌸', '🎉'];

export default function ExplodeScene() {
  const { reset, setScene } = useAppStore();
  const supabase = createClient();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('ascend');
  const [particles, setParticles] = useState<Particle[]>([]);
  const { play } = useSoundEffects();

  useEffect(() => {
    GA.sceneExplode();
    const t1 = setTimeout(() => setPhase('flying'), 2200);
    const t2 = setTimeout(() => {
      setPhase('explode');
      play('explode');
      triggerConfetti();
      spawnParticles();
    }, 4200);
    const t3 = setTimeout(async () => {
      setPhase('celebrate');
      // 별 저장
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const now = new Date();
        await supabase.from('stars').insert({
          user_id: user.id,
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          day: now.getDate(),
        });
      }
    }, 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [play]);

  function triggerConfetti() {
    const colors = ['#ff2d78', '#b347ff', '#3d9eff', '#00e5b0', '#ffe033', '#ff6b2d'];
    confetti({ particleCount: 220, spread: 160, origin: { x: 0.5, y: 0.4 }, colors, scalar: 1.5, gravity: 0.5 });
    setTimeout(() => {
      confetti({ particleCount: 90, angle: 60, spread: 80, origin: { x: 0.1, y: 0.4 }, colors });
      confetti({ particleCount: 90, angle: 120, spread: 80, origin: { x: 0.9, y: 0.4 }, colors });
    }, 300);
    setTimeout(() => {
      confetti({ particleCount: 140, spread: 130, origin: { x: 0.5, y: 0.35 }, colors, shapes: ['star'], scalar: 2.2 });
    }, 600);
  }

  function spawnParticles() {
    setParticles(Array.from({ length: 28 }, (_, i) => ({
      id: i, x: 50 + (Math.random() - 0.5) * 10, y: 38 + (Math.random() - 0.5) * 10,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      vx: (Math.random() - 0.5) * 340, vy: (Math.random() - 0.5) * 340,
      size: 20 + Math.random() * 26, rotate: Math.random() * 720 - 360,
    })));
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{
        background: phase === 'celebrate'
          ? 'radial-gradient(ellipse at 50% 35%, #120820 0%, #06060a 100%)'
          : 'radial-gradient(ellipse at 50% 40%, #0d0820 0%, #06060a 100%)'
      }} />
      <StarField count={phase === 'celebrate' ? 160 : 110} />

      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: 'absolute', top: '10%', right: '8%', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(179,71,255,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '3%', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(61,158,255,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <AnimatePresence>
        {phase !== 'celebrate' && phase !== 'explode' && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ top: phase === 'ascend' ? '70%' : '35%' }}
            initial={phase === 'flying' ? { y: 200, opacity: 0 } : { y: 0 }}
            animate={
              phase === 'ascend' ? { y: -300, opacity: [1, 1, 0] } :
              phase === 'flying' ? { y: [0, -20, 5, -15], opacity: [0, 1, 1, 1] } : {}
            }
            exit={{ scale: 4, opacity: 0 }}
            transition={
              phase === 'ascend' ? { duration: 2.2, ease: [0.2, 0, 0.7, 1] } :
              { duration: 1.4, ease: 'easeOut' }
            }
          >
            <RocketSVG size={90} showFlame={phase === 'ascend'} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'explode' && (
          <motion.div className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }}
            style={{ background: 'radial-gradient(circle at 50% 38%, #fff 0%, #ffb3d9 40%, transparent 70%)' }} />
        )}
      </AnimatePresence>

      {particles.map((p) => (
        <motion.div key={p.id} className="absolute pointer-events-none z-30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: p.vx, y: p.vy, opacity: 0, rotate: p.rotate, scale: [1, 1.6, 0] }}
          transition={{ duration: 2.4, ease: 'easeOut' }}>
          {p.emoji}
        </motion.div>
      ))}

      <AnimatePresence>
        {phase === 'celebrate' && (
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14 }}
              className="text-center flex flex-col items-center gap-6 w-full max-w-sm">
              <motion.div animate={{ rotate: [0, -12, 12, -8, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 0.7, delay: 0.3 }}>
                <RocketSVG size={80} showFlame={false} />
              </motion.div>
              <div>
                <h2 className="text-4xl font-display font-bold text-white mb-3">사라졌어!</h2>
                <p className="text-white/55 font-body text-lg leading-relaxed">
                  그 나쁜 기억들,<br />
                  <span style={{ color: '#ff2d78', fontWeight: 600 }}>우주 끝으로 날아가버렸어.</span><br />
                  이제 없어. 진짜로.
                </p>
              </div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                className="flex flex-col items-center gap-3 w-full">
                <button onClick={() => { GA.clickRetryBtn(); reset(); }} className="btn-neon w-full text-white"
                  style={{ background: 'linear-gradient(135deg, #b347ff, #3d9eff)', boxShadow: '0 0 32px rgba(179,71,255,0.4)' }}>
                  또 날려버리기 🚀
                </button>
                <button onClick={() => { setScene('celebrate' as any); router.push('/universe'); }}
                  className="w-full py-3 rounded-2xl font-display font-semibold text-white/70 border border-white/10 hover:border-white/30 transition-all active:scale-95 text-sm">
                  🌌 내 우주 보러가기
                </button>
                <p className="text-white/25 text-xs font-body">오늘도 잘 버텼어 👏</p>
                <p className="text-white/15 text-xs font-mono mt-1">© 2026 박수민. All rights reserved.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RocketSVG({ size = 90, showFlame }: { size?: number; showFlame: boolean }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 90 144" fill="none">
      <defs>
        <linearGradient id="erBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c8d8f0" /><stop offset="40%" stopColor="#ffffff" /><stop offset="100%" stopColor="#8aabcf" />
        </linearGradient>
        <linearGradient id="erNose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0eeff" /><stop offset="100%" stopColor="#7aaad4" />
        </linearGradient>
        <linearGradient id="erFin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b0c8e8" /><stop offset="100%" stopColor="#6a96c0" />
        </linearGradient>
        <linearGradient id="erFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe033" /><stop offset="45%" stopColor="#ff6b2d" /><stop offset="100%" stopColor="#ff2d78" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="erWindow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#a8d8ff" /><stop offset="100%" stopColor="#2060a0" />
        </radialGradient>
        <filter id="erGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
      </defs>
      {showFlame && (
        <motion.g animate={{ scaleY: [1, 1.3, 0.8, 1.2, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 0.15, repeat: Infinity }} style={{ originX: '45px', originY: '118px' }}>
          <ellipse cx="45" cy="132" rx="11" ry="22" fill="url(#erFlame)" filter="url(#erGlow)" />
          <ellipse cx="45" cy="122" rx="5" ry="10" fill="#fff5a0" opacity="0.85" />
        </motion.g>
      )}
      <path d="M28 88 L13 114 L28 109 Z" fill="url(#erFin)" />
      <path d="M62 88 L77 114 L62 109 Z" fill="url(#erFin)" />
      <rect x="28" y="42" width="34" height="76" rx="6" fill="url(#erBody)" />
      <line x1="34" y1="48" x2="34" y2="112" stroke="white" strokeWidth="0.6" opacity="0.22" />
      <line x1="56" y1="48" x2="56" y2="112" stroke="#8aabcf" strokeWidth="0.6" opacity="0.18" />
      <rect x="33" y="108" width="24" height="10" rx="3" fill="#7aaad4" />
      <rect x="37" y="110" width="16" height="6" rx="2" fill="#4e7ca8" />
      <path d="M28 46 Q28 8 45 4 Q62 8 62 46 Z" fill="url(#erNose)" />
      <circle cx="45" cy="66" r="11" fill="url(#erWindow)" />
      <circle cx="45" cy="66" r="11" fill="none" stroke="white" strokeWidth="1.2" opacity="0.5" />
      <ellipse cx="41" cy="62" rx="4" ry="3" fill="white" opacity="0.22" transform="rotate(-20 41 62)" />
      <path d="M36 30 Q40 14 45 10" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.28" />
      <line x1="28" y1="80" x2="62" y2="80" stroke="white" strokeWidth="0.5" opacity="0.12" />
      <line x1="28" y1="96" x2="62" y2="96" stroke="white" strokeWidth="0.5" opacity="0.1" />
      <rect x="28" y="82" width="4" height="12" rx="1" fill="#ff2d78" opacity="0.72" />
      <rect x="58" y="82" width="4" height="12" rx="1" fill="#ff2d78" opacity="0.72" />
    </svg>
  );
}

function StarField({ count }: { count: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2.2 + 0.3, delay: Math.random() * 4, duration: 1.5 + Math.random() * 3,
  }));
  return (
    <div className="star-field">
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.1, 1, 0.1] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity }} />
      ))}
    </div>
  );
}
