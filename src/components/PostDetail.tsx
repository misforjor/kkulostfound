import { useState, useEffect } from 'react';
import {
  getPostById,
  getUserById,
  getCommentsByPostId,
  updatePost,
  deletePost,
  addComment,
  updateComment,
  deleteComment,
} from '../data';
import { useApp } from '../context';
import type { Post, User, Comment, PostStatus } from '../types';
import { STATUS_BY_TYPE } from '../types';

const TYPE_STYLE: Record<string, string> = {
  'ตามหา': 'bg-amber-500 text-white',
  'พบของหาย': 'bg-teal-600 text-white',
};

const STATUS_STYLE: Record<string, string> = {
  'กำลังตามหาสิ่งของ':
    'bg-blue-50 text-blue-700 border border-blue-200',
  'พบของแล้ว':
    'bg-green-50 text-green-700 border border-green-200',
  'กำลังตามหาเจ้าของ':
    'bg-amber-50 text-amber-700 border border-amber-200',
  'ส่งคืนแล้ว':
    'bg-gray-100 text-gray-500 border border-gray-200',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'เมื่อกี้';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;

  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

export default function PostDetail({
  postId,
}: {
  postId: string;
}) {
  const { currentUser, navigate, refresh } = useApp();

  const [post, setPost] = useState<Post | null>(null);
  const [poster, setPoster] = useState<User | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] =
    useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      setLoading(true);

      const foundPost = await getPostById(postId);

      if (cancelled) return;

      if (!foundPost) {
        setPost(null);
        setLoading(false);
        return;
      }

      setPost(foundPost);

      const [foundPoster, foundComments] =
        await Promise.all([
          getUserById(foundPost.userId),
          getCommentsByPostId(postId),
        ]);

      if (cancelled) return;

      setPoster(foundPoster);
      setComments(foundComments);
      setLoading(false);
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">กำลังโหลดโพสต์...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>

        <p className="text-xl font-semibold text-gray-700">
          ไม่พบโพสต์นี้
        </p>

        <button
          onClick={() => navigate({ name: 'home' })}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const isOwner = currentUser?.id === post.userId;
  const availableStatuses = STATUS_BY_TYPE[post.type];

  const handleDeletePost = async () => {
    try {
      await deletePost(postId);
      refresh();
      navigate({ name: 'home' });
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถลบโพสต์ได้');
    }
  };

  const handleStatusChange = async (
    status: PostStatus
  ) => {
    try {
      await updatePost(postId, { status });

      setPost(prev =>
        prev ? { ...prev, status } : prev
      );

      setShowStatusMenu(false);
      refresh();
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const handleAddComment = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!commentText.trim() || !currentUser) return;

    try {
      const newComment = await addComment(
        postId,
        currentUser.id,
        commentText.trim()
      );

      setComments(prev => [...prev, newComment]);
      setCommentText('');
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถเพิ่มความคิดเห็นได้');
    }
  };

  const handleEditComment = async (id: string) => {
    if (!editingText.trim()) return;

    try {
      await updateComment(id, editingText.trim());

      setComments(prev =>
        prev.map(comment =>
          comment.id === id
            ? {
                ...comment,
                content: editingText.trim(),
                updatedAt: new Date().toISOString(),
              }
            : comment
        )
      );

      setEditingCommentId(null);
      setEditingText('');
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถแก้ไขความคิดเห็นได้');
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await deleteComment(id);

      setComments(prev =>
        prev.filter(comment => comment.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถลบความคิดเห็นได้');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate({ name: 'home' })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        กลับไปยังโพสต์ทั้งหมด
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {post.imageUrl && (
          <div className="h-72 sm:h-96 bg-gray-100">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${TYPE_STYLE[post.type]}`}
            >
              {post.type}
            </span>

            <div className="relative">
              <button
                onClick={() =>
                  isOwner &&
                  setShowStatusMenu(o => !o)
                }
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  STATUS_STYLE[post.status]
                } ${
                  isOwner
                    ? 'cursor-pointer hover:opacity-80'
                    : 'cursor-default'
                }`}
              >
                {post.status} {isOwner && '▾'}
              </button>

              {showStatusMenu && isOwner && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10 min-w-max">
                  {availableStatuses.map(s => (
                    <button
                      key={s}
                      onClick={() =>
                        handleStatusChange(s)
                      }
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        s === post.status
                          ? 'font-semibold'
                          : ''
                      }`}
                    >
                      {s}{' '}
                      {s === post.status && '✓'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <h1
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: '#1E293B',
              lineHeight: 1.2,
            }}
            className="mb-4"
          >
            {post.title}
          </h1>

          <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">
                สถานที่
              </p>
              <p className="text-sm font-medium text-gray-700">
                📍 {post.location}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-0.5">
                วันที่โพสต์
              </p>
              <p className="text-sm font-medium text-gray-700">
                {formatDate(post.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-0.5">
                โพสต์โดย
              </p>

              <p className="text-sm font-medium text-gray-700">
                {poster ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-xs">
                      {poster.displayName?.[0]?.toUpperCase() ||
                        '?'}
                    </span>
                    {poster.displayName}
                  </span>
                ) : (
                  'ไม่ทราบ'
                )}
              </p>
            </div>

            {post.contactInfo && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  ติดต่อ
                </p>
                <p className="text-sm font-medium text-gray-700 break-all">
                  {post.contactInfo}
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              รายละเอียด
            </p>

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.description}
            </p>
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={() =>
                  navigate({
                    name: 'edit-post',
                    postId: post.id,
                  })
                }
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                แก้ไขโพสต์
              </button>

              {!showDeleteConfirm ? (
                <button
                  onClick={() =>
                    setShowDeleteConfirm(true)
                  }
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-all"
                >
                  ลบโพสต์
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-red-600 font-medium">
                    แน่ใจหรือไม่?
                  </p>

                  <button
                    onClick={handleDeletePost}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium"
                  >
                    ลบ
                  </button>

                  <button
                    onClick={() =>
                      setShowDeleteConfirm(false)
                    }
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '1.5rem',
            color: '#1E293B',
          }}
          className="mb-4"
        >
          ความคิดเห็น ({comments.length})
        </h2>

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">
              ยังไม่มีความคิดเห็น มาเป็นคนแรกกัน!
            </p>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUser?.id}
              editingCommentId={editingCommentId}
              editingText={editingText}
              setEditingCommentId={setEditingCommentId}
              setEditingText={setEditingText}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>

        {currentUser ? (
          <form
            onSubmit={handleAddComment}
            className="bg-white rounded-xl border border-gray-100 p-4"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                {currentUser.displayName?.[0]?.toUpperCase() ||
                  '?'}
              </div>

              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={e =>
                    setCommentText(e.target.value)
                  }
                  placeholder="เพิ่มความคิดเห็น..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] resize-none transition-all"
                />

                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-4 py-1.5 bg-[#1E293B] text-white rounded-lg text-sm font-medium hover:bg-[#0F172A] transition-colors disabled:opacity-40"
                  >
                    ส่งความคิดเห็น
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              เข้าสู่ระบบเพื่อแสดงความคิดเห็น
            </p>

            <button
              onClick={() =>
                navigate({
                  name: 'auth',
                  authMode: 'login',
                })
              }
              className="px-4 py-2 bg-[#1E293B] text-white rounded-xl text-sm font-medium hover:bg-[#0F172A] transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  editingCommentId,
  editingText,
  setEditingCommentId,
  setEditingText,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  currentUserId?: string;
  editingCommentId: string | null;
  editingText: string;
  setEditingCommentId: (
    value: string | null
  ) => void;
  setEditingText: (value: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [commenter, setCommenter] =
    useState<User | undefined>(undefined);

  useEffect(() => {
    getUserById(comment.userId).then(setCommenter);
  }, [comment.userId]);

  const isOwnComment =
    currentUserId === comment.userId;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
          {commenter?.displayName?.[0]?.toUpperCase() ||
            '?'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-800">
              {commenter?.displayName || 'กำลังโหลด...'}
            </span>

            <span className="text-xs text-gray-400">
              {timeAgo(comment.createdAt)}
            </span>

            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-gray-400">
                (แก้ไขแล้ว)
              </span>
            )}
          </div>

          {editingCommentId === comment.id ? (
            <div className="space-y-2">
              <textarea
                value={editingText}
                onChange={e =>
                  setEditingText(e.target.value)
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 resize-none"
                rows={2}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(comment.id)}
                  className="px-3 py-1 bg-[#1E293B] text-white rounded-lg text-xs font-medium"
                >
                  บันทึก
                </button>

                <button
                  onClick={() =>
                    setEditingCommentId(null)
                  }
                  className="px-3 py-1 border border-gray-200 rounded-lg text-xs"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700">
              {comment.content}
            </p>
          )}
        </div>

        {isOwnComment &&
          editingCommentId !== comment.id && (
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditingText(comment.content);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all"
                title="แก้ไข"
              >
                ✎
              </button>

              <button
                onClick={() => onDelete(comment.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                title="ลบ"
              >
                ×
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
