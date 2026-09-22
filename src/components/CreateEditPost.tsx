import { useState } from 'react';
import { getPostById, createPost, updatePost } from '../data';
import { useApp } from '../context';
import type { PostType, PostStatus } from '../types';
import { LOCATIONS, STATUS_BY_TYPE } from '../types';

export default function CreateEditPost({ postId }: { postId?: string }) {
  const { currentUser, navigate, refresh } = useApp();
  const existing = postId ? getPostById(postId) : undefined;
  const isEdit = !!existing;

  const [type, setType] = useState<PostType>(existing?.type || 'ตามหา');
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [location, setLocation] = useState(existing?.location || LOCATIONS[0]);
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl || '');
  const [contactInfo, setContactInfo] = useState(existing?.contactInfo || '');
  const [status, setStatus] = useState<PostStatus>(existing?.status || 'กำลังตามหาสิ่งของ');
  const [submitting, setSubmitting] = useState(false);
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold text-gray-700 mb-4">กรุณาเข้าสู่ระบบเพื่อสร้างโพสต์</p>
        <button onClick={() => navigate({ name: 'auth', authMode: 'login' })} className="px-6 py-2.5 bg-[#1E293B] text-white rounded-full font-medium hover:bg-[#0F172A] transition-colors">
          เข้าสู่ระบบ
        </button>
      </div>
    );
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('รูปภาพต้องมีขนาดไม่เกิน 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);

    await new Promise(r => setTimeout(r, 300));

    const defaultStatus: PostStatus = type === 'ตามหา' ? 'กำลังตามหาสิ่งของ' : 'กำลังตามหาเจ้าของ';

    if (isEdit && existing) {
      updatePost(existing.id, {
        type, title: title.trim(), description: description.trim(),
        location, imageUrl: imageUrl || undefined,
        contactInfo: contactInfo.trim() || undefined,
        status: STATUS_BY_TYPE[type].includes(status) ? status : defaultStatus,
      });
      refresh();
      navigate({ name: 'post-detail', postId: existing.id });
    } else {
      const post = createPost({
        userId: currentUser.id, type, title: title.trim(),
        description: description.trim(), location,
        imageUrl: imageUrl || undefined,
        contactInfo: contactInfo.trim() || undefined,
        status: defaultStatus,
      });
      refresh();
      navigate({ name: 'post-detail', postId: post.id });
    }
    setSubmitting(false);
  };

  const availableStatuses = STATUS_BY_TYPE[type];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate(isEdit && postId ? { name: 'post-detail', postId } : { name: 'home' })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {isEdit ? 'กลับไปยังโพสต์' : 'กลับไปยังโพสต์ทั้งหมด'}
      </button>

      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: '#1E293B' }} className="mb-6">
        {isEdit ? 'แก้ไขโพสต์' : 'สร้างโพสต์ใหม่'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        {/* ประเภทโพสต์ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">ประเภทโพสต์ *</label>
          <div className="grid grid-cols-2 gap-3">
            {(['ตามหา', 'พบของหาย'] as PostType[]).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  setStatus(t === 'ตามหา' ? 'กำลังตามหาสิ่งของ' : 'กำลังตามหาเจ้าของ');
                }}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                  type === t
                    ? t === 'ตามหา'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {t === 'ตามหา' ? '🔴 ตามหาของหาย' : '🟢 พบของหาย'}
              </button>
            ))}
          </div>
        </div>

        {/* หัวเรื่อง */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">หัวเรื่อง *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="เช่น กระเป๋าสตางค์สีดำ"
            maxLength={100}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all"
          />
        </div>

        {/* รายละเอียด */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">รายละเอียด *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            placeholder="อธิบายของที่หายหรือที่พบ สี ขนาด ยี่ห้อ หรือลักษณะพิเศษ..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all resize-none"
          />
        </div>

        {/* สถานที่ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">สถานที่ *</label>
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 cursor-pointer"
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* สถานะ (แก้ไขเท่านั้น) */}
        {isEdit && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">สถานะ</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as PostStatus)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 cursor-pointer"
            >
              {availableStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* รูปภาพ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">รูปภาพ (ไม่บังคับ)</label>
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={() => setImageMode('url')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${imageMode === 'url' ? 'bg-[#1E293B] text-white' : 'border border-gray-200 text-gray-600'}`}>
              URL
            </button>
            <button type="button" onClick={() => setImageMode('file')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${imageMode === 'file' ? 'bg-[#1E293B] text-white' : 'border border-gray-200 text-gray-600'}`}>
              อัปโหลดไฟล์
            </button>
          </div>

          {imageMode === 'url' ? (
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 transition-all"
            />
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors bg-gray-50">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-500">คลิกเพื่ออัปโหลด (สูงสุด 2MB)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </label>
          )}

          {imageUrl && (
            <div className="mt-3 relative inline-block">
              <img src={imageUrl} alt="ตัวอย่าง" className="h-24 w-auto rounded-xl object-cover border border-gray-200" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* ข้อมูลติดต่อ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">ข้อมูลติดต่อ (ไม่บังคับ)</label>
          <input
            type="text"
            value={contactInfo}
            onChange={e => setContactInfo(e.target.value)}
            placeholder="อีเมล เบอร์โทร หรือช่องทางติดต่ออื่น ๆ"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 transition-all"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !title.trim() || !description.trim()}
            className="flex-1 py-3 bg-[#1E293B] text-white rounded-xl font-medium hover:bg-[#0F172A] transition-colors disabled:opacity-50"
          >
            {submitting ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'สร้างโพสต์'}
          </button>
          <button
            type="button"
            onClick={() => navigate(isEdit && postId ? { name: 'post-detail', postId } : { name: 'home' })}
            className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
