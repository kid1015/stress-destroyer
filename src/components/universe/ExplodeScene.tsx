'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { GA } from '@/lib/analytics';
import { useSoundEffects } from '@/hooks/useSoundEffects';

type Phase = 'ascend' | 'flying' | 'explode' | 'celebrate';

interface Particle {
  id: number; x: number; y: number;
  angle: number; speed: number; length: number;
  color: string; opacity: number;
}

// LED 레이저 폭죽 색상
const LASER_COLORS = [
  '#ff2d78', '#ff2d78',
  '#b347ff', '#b347ff',
  '#3d9eff', '#3d9eff',
  '#00e5b0', '#00e5b0',
  '#ffe033',
  '#ffffff',
  '#ff6b2d',
];

export default function ExplodeScene() {
  const { reset, setScene } = useAppStore();
  const supabase = createClient();
  const router = useRouter();
  const { play } = useSoundEffects();
  const [phase, setPhase] = useState<Phase>('ascend');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [starStreaks, setStarStreaks] = useState<{ id: number; y: number; speed: number; opacity: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    GA.sceneExplode();

    // 1. 우주선 날아가기 (왼→오)
    const t1 = setTimeout(() => {
      setPhase('flying');
      // 별 스트릭 생성
      setStarStreaks(Array.from({ length: 20 }, (_, i) => ({
        id: i,
        y: Math.random() * 100,
        speed: 0.6 + Math.random() * 0.8,
        opacity: 0.4 + Math.random() * 0.6,
      })));
    }, 400);

    // 2. 폭발
    const t2 = setTimeout(async () => {
      setPhase('explode');
      play('explode');
      spawnLaserParticles();

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
        const { count } = await supabase.from('stars').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        GA.starCreated(count || 0);
      }
    }, 2200);

    // 3. 축하
    const t3 = setTimeout(() => setPhase('celebrate'), 3400);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); cancelAnimationFrame(animFrameRef.current); };
  }, []);

  // LED 레이저 파티클 생성
  function spawnLaserParticles() {
    const count = 48;
    setParticles(Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50,
      y: 42,
      angle: (i / count) * Math.PI * 2,
      speed: 120 + Math.random() * 180,
      length: 60 + Math.random() * 120,
      color: LASER_COLORS[i % LASER_COLORS.length],
      opacity: 1,
    })));

    // Canvas 폭발 애니메이션
    setTimeout(() => drawExplosion(), 50);
  }

  function drawExplosion() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.42;
    let frame = 0;
    const maxFrames = 50;

    function animate() {
      if (frame >= maxFrames) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        return;
      }
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const progress = frame / maxFrames;

      // 여러 파티클 그리기
      for (let i = 0; i < 48; i++) {
        const angle = (i / 48) * Math.PI * 2;
        const dist = progress * (150 + (i % 5) * 40);
        const x2 = cx + Math.cos(angle) * dist;
        const y2 = cy + Math.sin(angle) * dist;
        const x1 = cx + Math.cos(angle) * Math.max(0, dist - 80);
        const y1 = cy + Math.sin(angle) * Math.max(0, dist - 80);

        const color = LASER_COLORS[i % LASER_COLORS.length];
        const alpha = Math.max(0, 1 - progress * 1.2);

        const grad = ctx!.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `${color}00`);
        grad.addColorStop(1, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);

        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 2.5;
        ctx!.shadowColor = color;
        ctx!.shadowBlur = 12;
        ctx!.stroke();

        // 끝점 빛나는 점
        ctx!.beginPath();
        ctx!.arc(x2, y2, 3, 0, Math.PI * 2);
        ctx!.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        ctx!.shadowBlur = 20;
        ctx!.fill();
      }

      // 중심 폭발 플래시
      if (progress < 0.3) {
        const flashAlpha = (0.3 - progress) / 0.3;
        const radGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 80 * progress + 20);
        radGrad.addColorStop(0, `rgba(255,255,255,${flashAlpha * 0.9})`);
        radGrad.addColorStop(0.5, `rgba(255,45,120,${flashAlpha * 0.5})`);
        radGrad.addColorStop(1, `rgba(179,71,255,0)`);
        ctx!.beginPath();
        ctx!.arc(cx, cy, 80 * progress + 20, 0, Math.PI * 2);
        ctx!.fillStyle = radGrad;
        ctx!.shadowBlur = 0;
        ctx!.fill();
      }

      frame++;
      animFrameRef.current = requestAnimationFrame(animate);
    }

    animate();
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: 'radial-gradient(ellipse at 50% 40%, #0d0820 0%, #06060a 100%)' }}>

      {/* Canvas 레이어 (폭발 효과) */}
      <canvas ref={canvasRef} className="fixed inset-0 z-30 pointer-events-none" />

      {/* 배경 별 */}
      <StarField />

      {/* 날아가는 별 스트릭 (flying phase) */}
      <AnimatePresence>
        {phase === 'flying' && starStreaks.map((s) => (
          <motion.div key={s.id}
            className="fixed pointer-events-none z-10"
            style={{ top: `${s.y}%`, right: '-200px', height: '1.5px', background: `linear-gradient(90deg, transparent, rgba(255,255,255,${s.opacity}))` }}
            initial={{ width: 0, x: 0 }}
            animate={{ width: [0, 120 + s.speed * 80, 0], x: [0, -window.innerWidth - 300] }}
            transition={{ duration: s.speed, ease: 'linear', repeat: Infinity, delay: Math.random() * s.speed }}
          />
        ))}
      </AnimatePresence>

      {/* 우주선 */}
      <AnimatePresence>
        {(phase === 'ascend' || phase === 'flying') && (
          <motion.div
            className="fixed z-20"
            style={{ top: '40%', transform: 'translateY(-50%)' }}
            initial={{ x: '-150px', opacity: 0 }}
            animate={
              phase === 'ascend'
                ? { x: '-50px', opacity: 1 }
                : { x: '110vw', opacity: [0, 1, 1, 0.8] }
            }
            transition={
              phase === 'ascend'
                ? { duration: 0.4, ease: 'easeOut' }
                : { duration: 1.8, ease: [0.4, 0, 1, 0.6] }
            }
          >
            <RocketSVG size={90} />
            {/* 엔진 불꽃 */}
            <motion.div
              className="absolute"
              style={{ right: '100%', top: '50%', transform: 'translateY(-50%)' }}
              animate={{ scaleX: [1, 1.4, 0.8, 1.2, 1], opacity: [1, 0.8, 1] }}
              transition={{ duration: 0.12, repeat: Infinity }}
            >
              <div style={{ width: '60px', height: '16px', background: 'linear-gradient(90deg, transparent, #ff6b2d, #ffe033)', filter: 'blur(3px)', borderRadius: '0 8px 8px 0' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 폭발 플래시 */}
      <AnimatePresence>
        {phase === 'explode' && (
          <motion.div className="fixed inset-0 pointer-events-none z-40"
            initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }}
            style={{ background: 'radial-gradient(circle at 50% 42%, #fff 0%, #ff2d78 30%, transparent 65%)' }} />
        )}
      </AnimatePresence>

      {/* 축하 메시지 */}
      <AnimatePresence>
        {phase === 'celebrate' && (
          <motion.div className="fixed inset-0 flex flex-col items-center justify-center z-20 px-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14 }}
              className="text-center flex flex-col items-center gap-6 w-full max-w-sm">
              <motion.div animate={{ rotate: [0, -12, 12, -8, 0], scale: [1, 1.12, 1] }}
                transition={{ duration: 0.7, delay: 0.3 }}>
                <RocketSVG size={80} />
              </motion.div>
              <div>
                <h2 className="text-4xl font-display font-bold text-white mb-3">사라졌어!</h2>
                <p className="text-white/55 font-body text-lg leading-relaxed">
                  그 고민들,<br />
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
                <p className="text-white/15 text-xs font-mono">© 2026 박수민. All rights reserved.</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RocketSVG({ size = 90 }: { size?: number }) {
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
        <radialGradient id="erWindow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#a8d8ff" /><stop offset="100%" stopColor="#2060a0" />
        </radialGradient>
      </defs>
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

function StarField() {
  const stars = Array.from({ length: 120 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2 + 0.3, delay: Math.random() * 4, duration: 1.5 + Math.random() * 3,
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
