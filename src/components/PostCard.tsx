import type { Post } from '../types';
import { getUserById } from '../data';
import { useApp } from '../context';

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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'เมื่อกี้';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return new Date(iso).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
}

export default function PostCard({ post }: { post: Post }) {
  const { navigate } = useApp();
  const poster = getUserById(post.userId);

  return (
    <button
      onClick={() => navigate({ name: 'post-detail', postId: post.id })}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left w-full group"
    >
      <div className="relative h-44 bg-gray-100">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
            <span className="text-4xl opacity-30">📦</span>
            <span className="text-xs text-gray-400 font-medium">ไม่มีรูปภาพ</span>
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_STYLE[post.type]}`}>
          {post.type}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[#1E293B] text-base leading-tight mb-2 line-clamp-2">
          {post.title}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
          <span>📍</span>
          <span className="truncate">{post.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <span>🕐</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[post.status]}`}>
            {post.status}
          </span>
          <span className="text-xs text-gray-400 truncate">
            {poster?.displayName || 'ไม่ทราบ'}
          </span>
        </div>
      </div>
    </button>
  );
}
