import { useState } from 'react';
import { getPostsByUserId, deletePost, updatePost } from '../data';
import { useApp } from '../context';
import type { PostType, PostStatus } from '../types';
import { STATUS_BY_TYPE } from '../types';

const TYPE_STYLE: Record<string, string> = {
  'ตามหา': 'bg-amber-500 text-white',
  'พบของหาย': 'bg-teal-600 text-white',
};

const STATUS_STYLE: Record<string, string> = {
  'กำลังตามหาสิ่งของ': 'bg-blue-50 text-blue-700 border border-blue-200',
  'พบของแล้ว': 'bg-green-50 text-green-700 border border-green-200',
  'กำลังตามหาเจ้าของ': 'bg-amber-50 text-amber-700 border border-amber-200',
  'ส่งคืนแล้ว': 'bg-gray-100 text-gray-500 border border-gray-200',
};

function isResolved(status: PostStatus) {
  return status === 'พบของแล้ว' || status === 'ส่งคืนแล้ว';
}

export default function MyPosts() {
  const { currentUser, navigate, refresh } = useApp();
  const [filterType, setFilterType] = useState<PostType | 'ทั้งหมด'>('ทั้งหมด');
  const [filterStatus, setFilterStatus] = useState<'กำลังดำเนินการ' | 'เสร็จสิ้น' | 'ทั้งหมด'>('ทั้งหมด');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold text-gray-700 mb-4">กรุณาเข้าสู่ระบบเพื่อดูโพสต์ของคุณ</p>
        <button onClick={() => navigate({ name: 'auth', authMode: 'login' })} className="px-6 py-2.5 bg-[#1E293B] text-white rounded-full font-medium hover:bg-[#0F172A] transition-colors">
          เข้าสู่ระบบ
        </button>
      </div>
    );
  }

  const allPosts = getPostsByUserId(currentUser.id);

  const filtered = allPosts.filter(p => {
    if (filterType !== 'ทั้งหมด' && p.type !== filterType) return false;
    if (filterStatus === 'กำลังดำเนินการ' && isResolved(p.status)) return false;
    if (filterStatus === 'เสร็จสิ้น' && !isResolved(p.status)) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    deletePost(id);
    setDeletingId(null);
    refresh();
  };

  const handleStatusToggle = (id: string, type: PostType, currentStatus: PostStatus) => {
    const statuses = STATUS_BY_TYPE[type];
    const nextStatus = statuses[statuses.indexOf(currentStatus) === 0 ? 1 : 0];
    updatePost(id, { status: nextStatus });
    refresh();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '2rem', color: '#1E293B' }}>
          โพสต์ของฉัน
        </h1>
        <button
          onClick={() => navigate({ name: 'create-post' })}
          className="px-4 py-2 bg-[#1E293B] text-white rounded-full text-sm font-medium hover:bg-[#0F172A] transition-colors"
        >
          + โพสต์ใหม่
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {(['ทั้งหมด', 'ตามหา', 'พบของหาย'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === t ? 'bg-[#1E293B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 bg-white border border-gray-200 rounded-xl p-1">
          {(['ทั้งหมด', 'กำลังดำเนินการ', 'เสร็จสิ้น'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === s ? 'bg-[#1E293B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            {allPosts.length === 0 ? 'คุณยังไม่มีโพสต์' : 'ไม่พบโพสต์ที่ตรงกับตัวกรอง'}
          </p>
          {allPosts.length === 0 && (
            <button
              onClick={() => navigate({ name: 'create-post' })}
              className="mt-4 px-6 py-2.5 bg-[#1E293B] text-white rounded-full text-sm font-medium hover:bg-[#0F172A] transition-colors"
            >
              สร้างโพสต์แรกของคุณ
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <div key={post.id} className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all ${isResolved(post.status) ? 'opacity-75' : ''}`}>
              <div className="flex gap-0">
                <div className="w-24 sm:w-32 flex-shrink-0 bg-gray-100">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" style={{ minHeight: '5rem' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300 p-4">
                      📦
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLE[post.type]}`}>
                      {post.type}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[post.status]}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="font-semibold text-[#1E293B] text-sm truncate mb-0.5">{post.title}</p>
                  <p className="text-xs text-gray-500">📍 {post.location}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(post.createdAt).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex flex-col gap-1 p-3 border-l border-gray-100">
                  <button
                    onClick={() => navigate({ name: 'post-detail', postId: post.id })}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ดู
                  </button>
                  <button
                    onClick={() => navigate({ name: 'edit-post', postId: post.id })}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => handleStatusToggle(post.id, post.type, post.status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      isResolved(post.status)
                        ? 'border border-blue-200 text-blue-600 hover:bg-blue-50'
                        : 'border border-green-200 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {isResolved(post.status) ? 'เปิดใหม่' : 'ปิด'}
                  </button>
                  {deletingId === post.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(post.id)} className="flex-1 px-2 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors">
                        ✓
                      </button>
                      <button onClick={() => setDeletingId(null)} className="flex-1 px-2 py-1.5 border border-gray-200 text-xs rounded-lg hover:bg-gray-50 transition-colors">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(post.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      ลบ
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-6">
        ทั้งหมด {allPosts.length} โพสต์ · กำลังดำเนินการ {allPosts.filter(p => !isResolved(p.status)).length} โพสต์
      </p>
    </div>
  );
}
