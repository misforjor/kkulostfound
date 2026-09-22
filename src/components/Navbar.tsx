import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { logout } from '../data';

export default function Navbar() {
  const { currentUser, setCurrentUser, navigate, view } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    navigate({ name: 'home' });
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">
          <button
            onClick={() => navigate({ name: 'home' })}
            className="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🔍</span>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.375rem', color: '#1E293B', lineHeight: 1 }}>
              KKU Lost &amp; Found
            </span>
          </button>

          <div className="ml-auto flex items-center gap-3">
            {currentUser ? (
              <>
                <button
                  onClick={() => navigate({ name: 'create-post' })}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#1E293B] text-white rounded-full text-sm font-medium hover:bg-[#0F172A] transition-colors"
                >
                  <span>+</span>
                  <span>โพสต์ใหม่</span>
                </button>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(o => !o)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {currentUser.profileImage ? (
                      <img src={currentUser.profileImage} className="w-8 h-8 rounded-full object-cover" alt={currentUser.displayName} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-sm font-semibold">
                        {currentUser.displayName[0].toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-32 truncate">
                      {currentUser.displayName}
                    </span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 overflow-hidden">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                      <button
                        onClick={() => { navigate({ name: 'create-post' }); setMenuOpen(false); }}
                        className="sm:hidden w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        + โพสต์ใหม่
                      </button>
                      <button
                        onClick={() => { navigate({ name: 'my-posts' }); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        โพสต์ของฉัน
                      </button>
                      <button
                        onClick={() => { navigate({ name: 'profile' }); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        ตั้งค่าโปรไฟล์
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate({ name: 'auth', authMode: 'login' })}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => navigate({ name: 'auth', authMode: 'register' })}
                  className="px-4 py-2 bg-[#1E293B] text-white rounded-full text-sm font-medium hover:bg-[#0F172A] transition-colors"
                >
                  สมัครสมาชิก
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
