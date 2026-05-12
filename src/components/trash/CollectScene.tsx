'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { GA } from '@/lib/analytics';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export default function CollectScene() {
  const { shreds, addShredToTrash, shredsInTrash, isTrashFull } = useAppStore();

  useEffect(() => { GA.sceneCollect(); }, []);
  const [trashGlow, setTrashGlow] = useState(false);
  const trashRef = useRef<HTMLDivElement>(null);
  const { play } = useSoundEffects();

  const pendingShreds = shreds.filter((s) => !s.inTrash);
  const progress = shredsInTrash / shreds.length;

  function handleDragEnd(shredId: string, info: { point: { x: number; y: number } }) {
    if (!trashRef.current) return;
    const rect = trashRef.current.getBoundingClientRect();
    const { x, y } = info.point;
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      addShredToTrash(shredId);
      play('drop');
      GA.clickDragShred();
      setTrashGlow(true);
      setTimeout(() => setTrashGlow(false), 400);
    }
  }

  return (
    <div className="scene-container bg-void-950">
      <Stars />

      <div className="relative z-10 w-full max-w-lg mx-auto px-6 flex flex-col items-center gap-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-2xl font-display font-bold text-white">
            {isTrashFull ? (
              <span className="neon-text-mint">쓰레기통 꽉 찼어! 🗑</span>
            ) : (
              <>조각들을 <span className="neon-text-purple">쓰레기통</span>으로 드래그해</>
            )}
          </h2>
          <p className="text-white/40 text-sm font-body mt-2">
            {isTrashFull ? '이제 우주선에 실어보내자' : `${shredsInTrash} / ${shreds.length} 수거됨`}
          </p>
        </motion.div>

        {/* 진행 바 */}
        <div className="w-full h-1.5 bg-surface-overlay rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #b347ff, #00e5b0)' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>

        {/* 파쇄 조각들 */}
        <div className="relative w-full h-48 glass-card overflow-hidden">
          <p className="absolute top-3 left-4 text-white/20 text-xs font-mono">파쇄된 조각들</p>
          <AnimatePresence>
            {pendingShreds.map((shred, i) => (
              <motion.div
                key={shred.id}
                drag
                dragConstraints={{ left: -200, right: 200, top: -100, bottom: 100 }}
                onDragEnd={(_, info) => handleDragEnd(shred.id, info)}
                whileDrag={{ scale: 1.2, zIndex: 50 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: i * 0.02 }}
                className="absolute draggable"
                style={{
                  left: `${15 + (i % 10) * 8}%`,
                  top: `${30 + Math.floor(i / 10) * 30}%`,
                  width: shred.width,
                  height: shred.height,
                  background: shred.color,
                  rotate: shred.rotation,
                  borderRadius: '1px',
                  cursor: 'grab',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              />
            ))}
          </AnimatePresence>

          {pendingShreds.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/30 text-sm font-body">모두 수거됐어!</p>
            </div>
          )}
        </div>

        {/* 쓰레기통 드롭존 */}
        <motion.div
          ref={trashRef}
          animate={{
            boxShadow: trashGlow
              ? '0 0 40px rgba(179, 71, 255, 0.8)'
              : isTrashFull
              ? '0 0 30px rgba(0, 229, 176, 0.5)'
              : '0 0 0px transparent',
          }}
          className="glass-card p-6 flex flex-col items-center gap-3 w-40 border-2 border-dashed border-white/20"
          style={{ borderColor: trashGlow ? '#b347ff' : undefined }}
        >
          <motion.div
            animate={{ scale: trashGlow ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.3 }}
            className="text-5xl"
          >
            {isTrashFull ? '🗑️' : '🗑'}
          </motion.div>
          <p className="text-white/50 text-xs font-mono text-center">
            {isTrashFull ? `${shredsInTrash}개 수거` : '여기에 드래그'}
          </p>
          {shredsInTrash > 0 && (
            <div className="flex flex-wrap gap-0.5 justify-center max-w-20">
              {Array.from({ length: Math.min(shredsInTrash, 12) }).map((_, i) => (
                <div key={i} className="w-2 h-0.5 bg-white/30 rounded-full" />
              ))}
            </div>
          )}
        </motion.div>

        {/* 다음 안내 */}
        <AnimatePresence>
          {isTrashFull && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <p className="text-neon-mint text-sm font-body animate-pulse">
                ↑ 이제 쓰레기통을 우주선으로 드래그해봐!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stars() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5, delay: Math.random() * 3,
  }));
  return (
    <div className="star-field">
      {stars.map((s) => (
        <motion.div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: 2 + Math.random() * 2, delay: s.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}
