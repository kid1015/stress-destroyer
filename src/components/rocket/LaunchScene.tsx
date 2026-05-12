'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export default function LaunchScene() {
  const { setScene } = useAppStore();
  const [rocketGlow, setRocketGlow] = useState(false);
  const [trashOnRocket, setTrashOnRocket] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [launchPhase, setLaunchPhase] = useState<'idle' | 'rumble' | 'liftoff'>('idle');
  const rocketRef = useRef<HTMLDivElement>(null);
  const { play } = useSoundEffects();

  function handleTrashDragEnd(info: { point: { x: number; y: number } }) {
    if (!rocketRef.current) return;
    const rect = rocketRef.current.getBoundingClientRect();
    const { x, y } = info.point;
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      setTrashOnRocket(true);
      setRocketGlow(true);
      play('complete');
      setTimeout(() => setRocketGlow(false), 600);
    }
  }

  function handleLaunch() {
    if (!trashOnRocket) return;
    setLaunched(true);
    setLaunchPhase('rumble');
    setTimeout(() => {
      setLaunchPhase('liftoff');
      play('launch');
    }, 900);
    setTimeout(() => setScene('fly'), 3400);
  }

  return (
    <div className="scene-container overflow-hidden" style={{ background: '#06060a' }}>
      <StarField count={90} />

      <AnimatePresence>
        {launchPhase === 'liftoff' && <LaunchFlames />}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 flex flex-col items-center gap-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-2xl font-display font-bold text-white">
            {launched
              ? <span style={{ color: '#ff6b2d' }}>🔥 발사!!!</span>
              : trashOnRocket
              ? <span style={{ color: '#00e5b0' }}>장전 완료! 발사 준비 🚀</span>
              : <>쓰레기통을 <span style={{ color: '#ff6b2d' }}>우주선</span>에 실어</>}
          </h2>
          <p className="text-white/35 text-sm font-body mt-2">
            {launched ? '나쁜 기억이 우주로...' : trashOnRocket ? '버튼을 눌러 우주로 날려버려!' : '드래그해서 우주선 위에 올려놔'}
          </p>
        </motion.div>

        <div className="relative flex flex-col items-center gap-5 w-full">
          <motion.div
            ref={rocketRef}
            animate={
              launchPhase === 'rumble' ? { x: [-3, 3, -2, 4, -3, 2, 0], y: [0, -3, 1, -2, 0] } :
              launchPhase === 'liftoff' ? { y: -1000, opacity: 0 } :
              { y: [0, -8, 0] }
            }
            transition={
              launchPhase === 'rumble' ? { duration: 0.9 } :
              launchPhase === 'liftoff' ? { duration: 2.5, ease: [0.15, 0, 0.75, 1] } :
              { y: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }
            }
            className="flex flex-col items-center relative"
            style={{ filter: rocketGlow ? 'drop-shadow(0 0 24px rgba(0,229,176,0.7))' : trashOnRocket ? 'drop-shadow(0 0 14px rgba(0,229,176,0.35))' : 'none' }}
          >
            <RocketSVG size={110} showFlame={launchPhase === 'liftoff'} />
            {trashOnRocket && (
              <motion.div initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="absolute -bottom-7 text-2xl">
                🗑️
              </motion.div>
            )}
          </motion.div>

          <div className="flex items-end gap-4 -mt-3">
            <div style={{ width: '5px', height: '36px', background: 'linear-gradient(180deg, #3d9eff33, transparent)', borderRadius: '3px', transform: 'rotate(-10deg)' }} />
            <div style={{ width: '5px', height: '48px', background: 'linear-gradient(180deg, #3d9eff44, transparent)', borderRadius: '3px' }} />
            <div style={{ width: '5px', height: '36px', background: 'linear-gradient(180deg, #3d9eff33, transparent)', borderRadius: '3px', transform: 'rotate(10deg)' }} />
          </div>

          <AnimatePresence>
            {!trashOnRocket && (
              <motion.div
                drag
                dragConstraints={{ left: -160, right: 160, top: -300, bottom: 60 }}
                onDragEnd={(_, info) => handleTrashDragEnd(info)}
                whileDrag={{ scale: 1.18, zIndex: 50 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0 }}
                className="glass-card p-5 flex flex-col items-center gap-1 border-2 border-dashed cursor-grab active:cursor-grabbing"
                style={{ minWidth: '110px', borderColor: '#b347ff66' }}
              >
                <div className="text-4xl">🗑️</div>
                <p className="text-white/40 text-xs font-mono">드래그!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {trashOnRocket && !launched && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              onClick={handleLaunch} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="btn-neon w-full text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #ff6b2d, #ff2d78)', boxShadow: '0 0 40px rgba(255,107,45,0.45)' }}>
              🚀 발사!!!
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RocketSVG({ size = 110, showFlame }: { size?: number; showFlame: boolean }) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 90 144" fill="none">
      <defs>
        <linearGradient id="lrBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c8d8f0" /><stop offset="40%" stopColor="#ffffff" /><stop offset="100%" stopColor="#8aabcf" />
        </linearGradient>
        <linearGradient id="lrNose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0eeff" /><stop offset="100%" stopColor="#7aaad4" />
        </linearGradient>
        <linearGradient id="lrFin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b0c8e8" /><stop offset="100%" stopColor="#6a96c0" />
        </linearGradient>
        <linearGradient id="lrFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe033" /><stop offset="45%" stopColor="#ff6b2d" /><stop offset="100%" stopColor="#ff2d78" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lrWindow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#a8d8ff" /><stop offset="100%" stopColor="#2060a0" />
        </radialGradient>
        <filter id="lrGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
      </defs>
      {showFlame && (
        <motion.g animate={{ scaleY: [1, 1.3, 0.8, 1.2, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 0.15, repeat: Infinity }} style={{ originX: '45px', originY: '118px' }}>
          <ellipse cx="45" cy="132" rx="11" ry="22" fill="url(#lrFlame)" filter="url(#lrGlow)" />
          <ellipse cx="45" cy="122" rx="5" ry="10" fill="#fff5a0" opacity="0.85" />
        </motion.g>
      )}
      <path d="M28 88 L13 114 L28 109 Z" fill="url(#lrFin)" />
      <path d="M62 88 L77 114 L62 109 Z" fill="url(#lrFin)" />
      <rect x="28" y="42" width="34" height="76" rx="6" fill="url(#lrBody)" />
      <line x1="34" y1="48" x2="34" y2="112" stroke="white" strokeWidth="0.6" opacity="0.22" />
      <line x1="56" y1="48" x2="56" y2="112" stroke="#8aabcf" strokeWidth="0.6" opacity="0.18" />
      <rect x="33" y="108" width="24" height="10" rx="3" fill="#7aaad4" />
      <rect x="37" y="110" width="16" height="6" rx="2" fill="#4e7ca8" />
      <path d="M28 46 Q28 8 45 4 Q62 8 62 46 Z" fill="url(#lrNose)" />
      <circle cx="45" cy="66" r="11" fill="url(#lrWindow)" />
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

function LaunchFlames() {
  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {Array.from({ length: 22 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{
            left: `calc(50% + ${(Math.random() - 0.5) * 50}px)`, top: '55%',
            width: 5 + Math.random() * 10, height: 5 + Math.random() * 10,
            background: ['#ff6b2d', '#ff2d78', '#ffe033', '#ffffff88'][Math.floor(Math.random() * 4)],
          }}
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{ y: 80 + Math.random() * 80, opacity: 0, scale: 0 }}
          transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: Math.random() * 0.3 }} />
      ))}
    </div>
  );
}

function StarField({ count }: { count: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 2 + 0.4, delay: Math.random() * 4,
  }));
  return (
    <div className="star-field">
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.1, 1, 0.1] }}
          transition={{ duration: 2 + Math.random() * 3, delay: s.delay, repeat: Infinity }} />
      ))}
    </div>
  );
}
