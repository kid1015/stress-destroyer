'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('이메일 또는 비밀번호가 틀렸어요');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-void-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-2xl font-display font-bold text-white">로그인</h1>
          <p className="text-white/40 text-sm mt-1">내 우주를 보려면 로그인해주세요</p>
        </div>
        <div className="glass-card p-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1.5 block">이메일</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="w-full bg-surface-overlay border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-400 transition-all" />
            </div>
            <div>
              <label className="text-xs font-mono text-white/40 uppercase tracking-wider mb-1.5 block">비밀번호</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-surface-overlay border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-400 transition-all" />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-display font-semibold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #ff2d78, #b347ff)' }}>
              {loading ? '...' : '로그인'}
            </button>
          </form>
          <p className="text-center text-sm text-white/30">
            계정이 없나요?{' '}
            <Link href="/auth/signup" className="text-purple-400 underline">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
