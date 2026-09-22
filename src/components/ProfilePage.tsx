import { useState } from 'react';
import { updateUser, getPostsByUserId } from '../data';
import { useApp } from '../context';

export default function ProfilePage() {
  const { currentUser, setCurrentUser, navigate } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold text-gray-700 mb-4">กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์</p>
        <button onClick={() => navigate({ name: 'auth', authMode: 'login' })} className="px-6 py-2.5 bg-[#1E293B] text-white rounded-full font-medium hover:bg-[#0F172A] transition-colors">
          เข้าสู่ระบบ
        </button>
      </div>
    );
  }

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileImage, setProfileImage] = useState(currentUser.profileImage || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');

  const userPosts = getPostsByUserId(currentUser.id);
  const lostPosts = userPosts.filter(p => p.type === 'ตามหา');
  const foundPosts = userPosts.filter(p => p.type === 'พบของหาย');

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { setError('รูปภาพต้องมีขนาดไม่เกิน 1MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setError('');
    if (!displayName.trim()) { setError('ชื่อที่แสดงห้ามว่าง'); return; }

    const updates: Parameters<typeof updateUser>[1] = {
      displayName: displayName.trim(),
      profileImage: profileImage || undefined,
    };

    if (newPassword) {
      if (password !== currentUser.password) { setError('รหัสผ่านปัจจุบันไม่ถูกต้อง'); return; }
      if (newPassword.length < 6) { setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
      updates.password = newPassword;
    }

    const updated = updateUser(currentUser.id, updates);
    setCurrentUser(updated);
    setEditing(false);
    setPassword('');
    setNewPassword('');
    setSuccess('อัปเดตโปรไฟล์สำเร็จ!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: '#1E293B' }} className="mb-8">
        โปรไฟล์ของฉัน
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-5 mb-8">
          {currentUser.profileImage ? (
            <img src={currentUser.profileImage} className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" alt={currentUser.displayName} />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-3xl font-semibold">
              {currentUser.displayName[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{currentUser.displayName}</h2>
            <p className="text-gray-500 text-sm">{currentUser.email}</p>
            <p className="text-gray-400 text-xs mt-1">
              สมาชิกตั้งแต่ {new Date(currentUser.createdAt).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1E293B]">{userPosts.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">โพสต์ทั้งหมด</p>
          </div>
          <div className="text-center border-x border-gray-200">
            <p className="text-2xl font-bold text-amber-600">{lostPosts.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">ตามหา</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-600">{foundPosts.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">พบของหาย</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">
            {success}
          </div>
        )}

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            แก้ไขโปรไฟล์
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อที่แสดง</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">รูปโปรไฟล์ (ไม่บังคับ)</label>
              <div className="flex gap-2 mb-2">
                <button type="button" onClick={() => setImageMode('url')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${imageMode === 'url' ? 'bg-[#1E293B] text-white' : 'border border-gray-200 text-gray-600'}`}>
                  URL
                </button>
                <button type="button" onClick={() => setImageMode('file')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${imageMode === 'file' ? 'bg-[#1E293B] text-white' : 'border border-gray-200 text-gray-600'}`}>
                  อัปโหลด
                </button>
              </div>
              {imageMode === 'url' ? (
                <input
                  type="url"
                  value={profileImage}
                  onChange={e => setProfileImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 transition-all"
                />
              ) : (
                <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors bg-gray-50">
                  <span className="text-sm text-gray-500">อัปโหลดรูปภาพ (สูงสุด 1MB)</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                </label>
              )}
              {profileImage && (
                <div className="mt-2 relative inline-block">
                  <img src={profileImage} alt="ตัวอย่าง" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                  <button type="button" onClick={() => setProfileImage('')} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">เปลี่ยนรหัสผ่าน (ไม่บังคับ)</p>
              <div className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="รหัสผ่านปัจจุบัน"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 transition-all"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={handleSave} className="flex-1 py-2.5 bg-[#1E293B] text-white rounded-xl text-sm font-medium hover:bg-[#0F172A] transition-colors">
                บันทึกการเปลี่ยนแปลง
              </button>
              <button onClick={() => { setEditing(false); setError(''); setDisplayName(currentUser.displayName); setProfileImage(currentUser.profileImage || ''); }} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                ยกเลิก
              </button>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate({ name: 'my-posts' })}
        className="w-full py-3 border border-gray-200 bg-white rounded-2xl text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
      >
        ดูโพสต์ของฉัน ({userPosts.length})
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
