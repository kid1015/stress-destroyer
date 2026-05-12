'use client';

import { useCallback, useRef } from 'react';

export function useSoundEffects() {
  const ctxRef = useRef<AudioContext | null>(null);

  function getCtx(): AudioContext {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }

  // 파지지직
  const playShred = useCallback(() => {
    try {
      const ctx = getCtx();
      const totalDuration = 1.8;
      const burstCount = 18;
      for (let b = 0; b < burstCount; b++) {
        const startTime = ctx.currentTime + b * (totalDuration / burstCount);
        const burstDuration = 0.06 + Math.random() * 0.06;
        const bufLen = Math.floor(ctx.sampleRate * burstDuration);
        const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const hiFilter = ctx.createBiquadFilter();
        hiFilter.type = 'highpass';
        hiFilter.frequency.value = 2000 + Math.random() * 1000;
        const bandFilter = ctx.createBiquadFilter();
        bandFilter.type = 'bandpass';
        bandFilter.frequency.value = 3000 + Math.random() * 2000;
        bandFilter.Q.value = 0.8;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0, startTime);
        gain.gain.linearRampToValueAtTime(0.35, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + burstDuration);
        source.connect(hiFilter); hiFilter.connect(bandFilter); bandFilter.connect(gain); gain.connect(ctx.destination);
        source.start(startTime); source.stop(startTime + burstDuration);
      }
    } catch {}
  }, []);

  // 스르륵
  const playDrop = useCallback(() => {
    try {
      const ctx = getCtx();
      const duration = 0.18;
      const bufLen = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(600, ctx.currentTime + duration);
      filter.Q.value = 2.5;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      source.start(); source.stop(ctx.currentTime + duration);
    } catch {}
  }, []);

  // 발사
  const playLaunch = useCallback(() => {
    try {
      const ctx = getCtx();
      const duration = 2.2;
      const bufLen = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const loFilter = ctx.createBiquadFilter();
      loFilter.type = 'lowpass';
      loFilter.frequency.setValueAtTime(150, ctx.currentTime);
      loFilter.frequency.linearRampToValueAtTime(500, ctx.currentTime + duration);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0, ctx.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.4);
      noiseGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + duration);
      noise.connect(loFilter); loFilter.connect(noiseGain); noiseGain.connect(ctx.destination);
      noise.start(); noise.stop(ctx.currentTime + duration);
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 1.8);
      oscGain.gain.setValueAtTime(0.18, ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 1.8);
      osc.connect(oscGain); oscGain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 1.8);
    } catch {}
  }, []);

  // 강렬한 폭발음
  const playExplode = useCallback(() => {
    try {
      const ctx = getCtx();

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -3;
      compressor.knee.value = 2;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.0001;
      compressor.release.value = 0.05;
      compressor.connect(ctx.destination);

      // 쿵 — 초저음 임팩트
      const boom = (delay: number, vol: number) => {
        const dur = 1.8;
        const len = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          const t = i / ctx.sampleRate;
          d[i] = (Math.random() * 2 - 1) * Math.exp(-t * 4);
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;

        const sub = ctx.createBiquadFilter();
        sub.type = 'lowpass';
        sub.frequency.value = 80;
        const subG = ctx.createGain();
        subG.gain.setValueAtTime(vol * 1.8, ctx.currentTime + delay);
        subG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);

        const body = ctx.createBiquadFilter();
        body.type = 'bandpass';
        body.frequency.value = 300;
        body.Q.value = 0.3;
        const bodyG = ctx.createGain();
        bodyG.gain.setValueAtTime(vol * 1.2, ctx.currentTime + delay);
        bodyG.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur * 0.5);

        const src2 = ctx.createBufferSource();
        src2.buffer = buf;

        src.connect(sub); sub.connect(subG); subG.connect(compressor);
        src2.connect(body); body.connect(bodyG); bodyG.connect(compressor);
        src.start(ctx.currentTime + delay); src.stop(ctx.currentTime + delay + dur);
        src2.start(ctx.currentTime + delay); src2.stop(ctx.currentTime + delay + dur);
      }

      // 파직 — 고음 임팩트 크래클
      const crack = (delay: number, vol: number) => {
        const dur = 0.08;
        const len = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.exp(-i / len * 8);
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 1500;
        f.Q.value = 0.1;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, ctx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
        src.connect(f); f.connect(g); g.connect(compressor);
        src.start(ctx.currentTime + delay);
        src.stop(ctx.currentTime + delay + dur);
      }

      // 쉬이익 — 압력 방출
      const hiss = (delay: number) => {
        const dur = 1.2;
        const len = Math.floor(ctx.sampleRate * dur);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.setValueAtTime(2000, ctx.currentTime + delay);
        f.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + delay + dur);
        f.Q.value = 0.5;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, ctx.currentTime + delay);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
        src.connect(f); f.connect(g); g.connect(compressor);
        src.start(ctx.currentTime + delay);
        src.stop(ctx.currentTime + delay + dur);
      }

      // 3연발 펑펑펑
      boom(0.0, 1.0);
      crack(0.0, 1.2); crack(0.02, 0.9); crack(0.04, 1.0);
      hiss(0.05);

      boom(0.28, 0.9);
      crack(0.28, 1.0); crack(0.30, 0.8); crack(0.32, 0.9);
      hiss(0.32);

      boom(0.58, 1.0);
      crack(0.58, 1.1); crack(0.60, 0.9); crack(0.62, 1.0); crack(0.65, 0.8);
      hiss(0.62);

      // 마무리 잔향
      boom(0.9, 0.4);
      crack(0.9, 0.6); crack(0.95, 0.5); crack(1.0, 0.4);

    } catch {}
  }, []);

  // 완료
  const playComplete = useCallback(() => {
    try {
      const ctx = getCtx();
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0, ctx.currentTime + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.35);
      });
    } catch {}
  }, []);

  const play = useCallback((key: 'shred' | 'drop' | 'launch' | 'explode' | 'complete') => {
    if (key === 'shred') playShred();
    else if (key === 'drop') playDrop();
    else if (key === 'launch') playLaunch();
    else if (key === 'explode') playExplode();
    else if (key === 'complete') playComplete();
  }, [playShred, playDrop, playLaunch, playExplode, playComplete]);

  const stop = useCallback((_key: string) => {}, []);

  return { play, stop };
}
