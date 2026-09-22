import { useState } from 'react';
import { login, register } from '../data';
import { useApp } from '../context';

interface Props {
  mode: 'login' | 'register';
}

function isValidEmail(email: string) {
  return email.endsWith('@gmail.com') || email.endsWith('@kku.ac.th');
}

function isValidPassword(password: string) {
  return /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(password);
}

export default function AuthPage({ mode: initialMode }: Props) {
  const { setCurrentUser, navigate } = useApp();
  const [mode, setMode] = useState(initialMode);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 300));

    if (mode === 'login') {
      const user = login(email, password);
      if (user) {
        setCurrentUser(user);
        navigate({ name: 'home' });
      } else {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง ลองบัญชีทดสอบ: alice@kku.ac.th / demo123');
      }
    } else {
      if (!displayName.trim()) { setError('กรุณากรอกชื่อผู้ใช้'); setLoading(false); return; }
      if (!isValidEmail(email)) { setError('อีเมลต้องเป็น @gmail.com หรือ @kku.ac.th เท่านั้น'); setLoading(false); return; }
      if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); setLoading(false); return; }
      if (!isValidPassword(password)) { setError('รหัสผ่านต้องเป็นภาษาอังกฤษ ตัวเลข หรืออักขระพิเศษเท่านั้น'); setLoading(false); return; }
      const user = register(displayName.trim(), email, password);
      if (user) {
        setCurrentUser(user);
        navigate({ name: 'home' });
      } else {
        setError('อีเมลนี้ถูกใช้งานแล้ว');
      }
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setDisplayName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🔍</span>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: '#1E293B' }} className="mt-2">
            {mode === 'login' ? 'ยินดีต้อนรับกลับ' : 'สมัครสมาชิก'}
          </h1>
          <p className="text-gray-500 mt-1">
            {mode === 'login' ? 'เข้าสู่ระบบ KKU Lost & Found' : 'เข้าร่วม KKU Lost & Found'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อผู้ใช้</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                  placeholder="ชื่อผู้ใช้"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@gmail.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder={mode === 'register' ? 'อย่างน้อย 6 ตัวอักษร' : '••••••••'}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1E293B] text-white rounded-xl font-medium hover:bg-[#0F172A] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'กรุณารอสักครู่...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {mode === 'login' ? 'ยังไม่มีบัญชี? ' : 'มีบัญชีอยู่แล้ว? '}
              <button onClick={switchMode} className="font-medium text-[#1E293B] hover:underline">
                {mode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
