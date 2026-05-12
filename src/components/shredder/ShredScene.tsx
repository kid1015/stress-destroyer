'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { GA } from '@/lib/analytics';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export default function ShredScene() {
  const { text, shreds, setScene } = useAppStore();
  const [phase, setPhase] = useState<'insert' | 'shredding' | 'done'>('insert');
  const [visibleShreds, setVisibleShreds] = useState<number[]>([]);
  const { play, stop } = useSoundEffects();

  useEffect(() => {
    GA.sceneShred();
    const t1 = setTimeout(() => {
      setPhase('shredding');
      play('shred');
    }, 800);

    const t2 = setTimeout(() => {
      shreds.forEach((_, i) => {
        setTimeout(() => setVisibleShreds((prev) => [...prev, i]), i * 60);
      });
    }, 1200);

    const t3 = setTimeout(() => {
      setPhase('done');
      stop('shred');
      play('complete');
      setTimeout(() => setScene('collect'), 600);
    }, 1200 + shreds.length * 60 + 800);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); stop('shred'); };
  }, [shreds, setScene, play, stop]);

  const [shredPositions] = useState(() =>
    shreds.map(() => ({
      spreadX: (Math.random() - 0.5) * 200,
      fallY: 40 + Math.random() * 60,
    }))
  );

  return (
    <div className="scene-container bg-void-950">
      <Stars />
      <div className="relative z-10 w-full max-w-lg mx-auto px-6 flex flex-col items-center gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <h2 className="text-2xl font-display font-bold text-white">
            {phase === 'insert' && '파쇄 중...'}
            {phase === 'shredding' && <span className="neon-text-pink">갈아버리는 중 🗂</span>}
            {phase === 'done' && '완전히 갈렸어!'}
          </h2>
        </motion.div>

        <div className="relative flex flex-col items-center w-full">
          <AnimatePresence>
            {phase === 'insert' && (
              <motion.div
                initial={{ y: -80, opacity: 1 }}
                animate={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeIn' }}
                className="absolute z-20 w-36 rounded-xl overflow-hidden"
                style={{ top: '-60px', background: '#fafaf7', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
              >
                <div className="p-3" style={{ minHeight: '70px' }}>
                  <p className="text-void-900/60 line-clamp-3 leading-5"
                    style={{ fontFamily: '-apple-system, sans-serif', fontSize: '13px' }}>
                    {text}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ShredderSVG isActive={phase === 'shredding'} />

          <div className="relative w-80 h-36 -mt-1 overflow-visible">
            {shreds.map((shred, i) => {
              const pos = shredPositions[i] ?? { spreadX: 0, fallY: 40 };
              return (
                <AnimatePresence key={shred.id}>
                  {visibleShreds.includes(i) && (
                    <motion.div
                      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                      animate={{ x: pos.spreadX, y: pos.fallY, rotate: shred.rotation, opacity: [1, 1, 0.9, 0.6] }}
                      transition={{ duration: 0.7 + Math.random() * 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="absolute"
                      style={{ left: '50%', top: 0, width: shred.width, height: shred.height, background: shred.color, borderRadius: '1px', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }}
                    />
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </div>

        <motion.div className="w-full h-1 bg-surface-overlay rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #ff2d78, #b347ff)' }}
            initial={{ width: '0%' }}
            animate={{ width: phase === 'done' ? '100%' : phase === 'shredding' ? '80%' : '20%' }}
            transition={{ duration: 1.2 }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function ShredderSVG({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      animate={isActive ? { x: [-1.5, 1.5, -1.5, 1.5, 0] } : {}}
      transition={{ duration: 0.12, repeat: isActive ? Infinity : 0 }}
    >
      <svg width="260" height="130" viewBox="0 0 260 130" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow"><feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.25)" /></filter>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#e8e8e8" />
          </linearGradient>
          <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5f5f5" /><stop offset="100%" stopColor="#dcdcdc" />
          </linearGradient>
        </defs>
        <rect x="20" y="44" width="220" height="72" rx="16" fill="url(#bodyGrad)" filter="url(#shadow)" />
        <rect x="20" y="44" width="220" height="72" rx="16" fill="none" stroke="#d0d0d0" strokeWidth="1" />
        <rect x="21" y="45" width="218" height="34" rx="14" fill="white" opacity="0.6" />
        <rect x="36" y="24" width="188" height="30" rx="10" fill="url(#topGrad)" filter="url(#shadow)" />
        <rect x="36" y="24" width="188" height="30" rx="10" fill="none" stroke="#d0d0d0" strokeWidth="1" />
        <rect x="50" y="33" width="160" height="10" rx="5" fill="#b0b0b0" />
        <rect x="51" y="34" width="158" height="8" rx="4" fill="#888" />
        {isActive && (
          <>
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 0.25, repeat: Infinity, ease: 'linear' }} style={{ originX: '90px', originY: '38px' }}>
              <circle cx="90" cy="38" r="7" fill="#cccccc" stroke="#aaaaaa" strokeWidth="1" />
              <line x1="90" y1="31" x2="90" y2="45" stroke="#aaaaaa" strokeWidth="1.5" />
              <line x1="83" y1="38" x2="97" y2="38" stroke="#aaaaaa" strokeWidth="1.5" />
            </motion.g>
            <motion.g animate={{ rotate: -360 }} transition={{ duration: 0.25, repeat: Infinity, ease: 'linear' }} style={{ originX: '170px', originY: '38px' }}>
              <circle cx="170" cy="38" r="7" fill="#cccccc" stroke="#aaaaaa" strokeWidth="1" />
              <line x1="170" y1="31" x2="170" y2="45" stroke="#aaaaaa" strokeWidth="1.5" />
              <line x1="163" y1="38" x2="177" y2="38" stroke="#aaaaaa" strokeWidth="1.5" />
            </motion.g>
          </>
        )}
        {Array.from({ length: 11 }).map((_, i) => (
          <g key={i}>
            <rect x={36 + i * 18} y="56" width="5" height="44" rx="2.5" fill={isActive ? '#cccccc' : '#dddddd'} />
            <rect x={37 + i * 18} y="57" width="2" height="42" rx="1" fill="white" opacity="0.5" />
          </g>
        ))}
        <motion.circle cx="228" cy="58" r="5" fill={isActive ? '#00e5b0' : '#cccccc'}
          animate={isActive ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
          transition={{ duration: 0.6, repeat: Infinity }} />
        <circle cx="228" cy="58" r="5" fill="none" stroke="#b0b0b0" strokeWidth="1" />
        <rect x="40" y="112" width="40" height="8" rx="4" fill="#d0d0d0" />
        <rect x="180" y="112" width="40" height="8" rx="4" fill="#d0d0d0" />
        <text x="112" y="98" textAnchor="middle" fill="#aaaaaa" fontSize="9" fontFamily="-apple-system, sans-serif" fontWeight="500" letterSpacing="2">SHREDDER</text>
      </svg>
    </motion.div>
  );
}

function Stars() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 1.5 + 0.5, delay: Math.random() * 3,
  }));
  return (
    <div className="star-field">
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: 2 + Math.random() * 2, delay: s.delay, repeat: Infinity }} />
      ))}
    </div>
  );
}
