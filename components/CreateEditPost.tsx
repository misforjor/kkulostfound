import { useEffect, useState } from 'react';
import {
  getPostById,
  createPost,
  updatePost,
} from '../data';
import { useApp } from '../context';
import type {
  Post,
  PostType,
  PostStatus,
  PostCategory,
} from '../types';
import {
  LOCATIONS,
  STATUS_BY_TYPE,
  CATEGORIES,
} from '../types';

export default function CreateEditPost({
  postId,
}: {
  postId?: string;
}) {
  const {
    currentUser,
    navigate,
    refresh,
  } = useApp();

  const isEdit = !!postId;

  const [existing, setExisting] =
    useState<Post | null>(null);

  const [loadingPost, setLoadingPost] =
    useState(isEdit);

  const [type, setType] =
    useState<PostType>('ตามหา');

  // ประเภทสิ่งของ
  // ค่าเริ่มต้นเป็น "อื่น ๆ"
  const [category, setCategory] =
    useState<PostCategory>('อื่น ๆ');

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [location, setLocation] =
    useState<string>(LOCATIONS[0]);

  const [imageUrl, setImageUrl] =
    useState('');

  const [contactInfo, setContactInfo] =
    useState('');

  const [status, setStatus] =
    useState<PostStatus>(
      'กำลังตามหาสิ่งของ'
    );

  const [submitting, setSubmitting] =
    useState(false);

  const [imageMode, setImageMode] =
    useState<'url' | 'file'>('url');

  const [error, setError] =
    useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      if (!postId) {
        setLoadingPost(false);
        return;
      }

      setLoadingPost(true);
      setError('');

      try {
        const post =
          await getPostById(postId);

        if (cancelled) return;

        if (!post) {
          setExisting(null);
          setError(
            'ไม่พบโพสต์ที่ต้องการแก้ไข'
          );
          setLoadingPost(false);
          return;
        }

        setExisting(post);

        setType(post.type);

        // โพสต์เก่าที่อาจยังไม่มี category
        // ให้ใช้ "อื่น ๆ"
        setCategory(post.category || 'อื่น ๆ');

        setTitle(post.title);
        setDescription(post.description);
        setLocation(post.location);
        setImageUrl(post.imageUrl || '');

        setContactInfo(
          post.contactInfo || ''
        );

        setStatus(post.status);
      } catch (err) {
        console.error(
          'โหลดโพสต์ไม่สำเร็จ:',
          err
        );

        if (!cancelled) {
          setError(
            'ไม่สามารถโหลดข้อมูลโพสต์ได้'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPost(false);
        }
      }
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold text-gray-700 mb-4">
          กรุณาเข้าสู่ระบบเพื่อสร้างโพสต์
        </p>

        <button
          onClick={() =>
            navigate({
              name: 'auth',
              authMode: 'login',
            })
          }
          className="px-6 py-2.5 bg-[#1E293B] text-white rounded-full font-medium hover:bg-[#0F172A] transition-colors"
        >
          เข้าสู่ระบบ
        </button>
      </div>
    );
  }

  if (loadingPost) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">
          กำลังโหลดข้อมูลโพสต์...
        </p>
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">
          😕
        </p>

        <p className="text-xl font-semibold text-gray-700 mb-4">
          ไม่พบโพสต์นี้
        </p>

        <button
          onClick={() =>
            navigate({
              name: 'my-posts',
            })
          }
          className="px-6 py-2.5 bg-[#1E293B] text-white rounded-full font-medium"
        >
          กลับไปโพสต์ของฉัน
        </button>
      </div>
    );
  }

  const handleImageFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError(
        'รูปภาพต้องมีขนาดไม่เกิน 2MB'
      );
      return;
    }

    setError('');

    const reader = new FileReader();

    reader.onload = () => {
      setImageUrl(
        reader.result as string
      );
    };

    reader.readAsDataURL(file);
  };

  const handleTypeChange = (
    newType: PostType
  ) => {
    setType(newType);

    const statuses =
      STATUS_BY_TYPE[newType];

    if (!statuses.includes(status)) {
      setStatus(statuses[0]);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');

    if (!title.trim()) {
      setError('กรุณากรอกหัวเรื่อง');
      return;
    }

    if (!description.trim()) {
      setError('กรุณากรอกรายละเอียด');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit && existing) {
        const updated =
          await updatePost(
            existing.id,
            {
              type,
              category,
              title: title.trim(),
              description:
                description.trim(),
              location,
              imageUrl:
                imageUrl || undefined,
              contactInfo:
                contactInfo.trim() ||
                undefined,
              status:
                STATUS_BY_TYPE[type].includes(
                  status
                )
                  ? status
                  : STATUS_BY_TYPE[type][0],
            }
          );

        refresh();

        navigate({
          name: 'post-detail',
          postId: updated.id,
        });
      } else {
        const newPost =
          await createPost({
            userId: currentUser.id,
            type,
            category,
            title: title.trim(),
            description:
              description.trim(),
            location,
            imageUrl:
              imageUrl || undefined,
            contactInfo:
              contactInfo.trim() ||
              undefined,
            status:
              type === 'ตามหา'
                ? 'กำลังตามหาสิ่งของ'
                : 'กำลังตามหาเจ้าของ',
          });

        refresh();

        navigate({
          name: 'post-detail',
          postId: newPost.id,
        });
      }
    } catch (err) {
      console.error(
        'บันทึกโพสต์ไม่สำเร็จ:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'ไม่สามารถบันทึกโพสต์ได้ กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const availableStatuses =
    STATUS_BY_TYPE[type];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

      <button
        onClick={() =>
          navigate(
            isEdit && postId
              ? {
                  name: 'post-detail',
                  postId,
                }
              : {
                  name: 'home',
                }
          )
        }
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

        {isEdit
          ? 'กลับไปยังโพสต์'
          : 'กลับไปยังโพสต์ทั้งหมด'}
      </button>

      <h1
        style={{
          fontFamily:
            "'DM Serif Display', serif",
          fontSize: '2rem',
          color: '#1E293B',
        }}
        className="mb-6"
      >
        {isEdit
          ? 'แก้ไขโพสต์'
          : 'สร้างโพสต์ใหม่'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6"
      >

        {/* ประเภทโพสต์ */}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            ประเภทโพสต์ *
          </label>

          <div className="grid grid-cols-2 gap-3">
            {(
              ['ตามหา', 'พบของหาย'] as PostType[]
            ).map(postType => (
              <button
                key={postType}
                type="button"
                onClick={() =>
                  handleTypeChange(
                    postType
                  )
                }
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                  type === postType
                    ? postType === 'ตามหา'
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {postType === 'ตามหา'
                  ? '🔴 ตามหาของหาย'
                  : '🟢 พบของหาย'}
              </button>
            ))}
          </div>
        </div>

        {/* ประเภทสิ่งของ */}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            ประเภทสิ่งของ *
          </label>

          <select
            value={category}
            onChange={e =>
              setCategory(
                e.target.value as PostCategory
              )
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all cursor-pointer"
          >
            {CATEGORIES.map(item => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* หัวเรื่อง */}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            หัวเรื่อง *
          </label>

          <input
            type="text"
            value={title}
            onChange={e =>
              setTitle(e.target.value)
            }
            required
            placeholder="เช่น กระเป๋าสตางค์สีดำ"
            maxLength={100}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all"
          />
        </div>

        {/* รายละเอียด */}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            รายละเอียด *
          </label>

          <textarea
            value={description}
            onChange={e =>
              setDescription(
                e.target.value
              )
            }
            required
            placeholder="อธิบายของที่หายหรือที่พบ สี ขนาด ยี่ห้อ หรือลักษณะพิเศษ..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all resize-none"
          />
        </div>

        {/* สถานที่ */}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            สถานที่ *
          </label>

          <select
            value={location}
            onChange={e =>
              setLocation(
                e.target.value
              )
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 cursor-pointer"
          >
            {LOCATIONS.map(loc => (
              <option
                key={loc}
                value={loc}
              >
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* สถานะ */}

        {isEdit && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              สถานะ
            </label>

            <select
              value={status}
              onChange={e =>
                setStatus(
                  e.target.value as PostStatus
                )
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 cursor-pointer"
            >
              {availableStatuses.map(
                availableStatus => (
                  <option
                    key={availableStatus}
                    value={availableStatus}
                  >
                    {availableStatus}
                  </option>
                )
              )}
            </select>
          </div>
        )}

        {/* รูปภาพ */}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            รูปภาพ (ไม่บังคับ)
          </label>

          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() =>
                setImageMode('url')
              }
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                imageMode === 'url'
                  ? 'bg-[#1E293B] text-white'
                  : 'border border-gray-200 text-gray-600'
              }`}
            >
              URL
            </button>

            <button
              type="button"
              onClick={() =>
                setImageMode('file')
              }
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                imageMode === 'file'
                  ? 'bg-[#1E293B] text-white'
                  : 'border border-gray-200 text-gray-600'
              }`}
            >
              อัปโหลดไฟล์
            </button>
          </div>

          {imageMode === 'url' ? (
            <input
              type="url"
              value={imageUrl}
              onChange={e =>
                setImageUrl(
                  e.target.value
                )
              }
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 transition-all"
            />
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors bg-gray-50">

              <svg
                className="w-8 h-8 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>

              <span className="text-sm text-gray-500">
                คลิกเพื่ออัปโหลด (สูงสุด 2MB)
              </span>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFile}
              />
            </label>
          )}

          {imageUrl && (
            <div className="mt-3 relative inline-block">
              <img
                src={imageUrl}
                alt="ตัวอย่าง"
                className="h-24 w-auto rounded-xl object-cover border border-gray-200"
              />

              <button
                type="button"
                onClick={() =>
                  setImageUrl('')
                }
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* ข้อมูลติดต่อ */}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            ข้อมูลติดต่อ (ไม่บังคับ)
          </label>

          <input
            type="text"
            value={contactInfo}
            onChange={e =>
              setContactInfo(
                e.target.value
              )
            }
            placeholder="อีเมล เบอร์โทร หรือช่องทางติดต่ออื่น ๆ"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all"
          />
        </div>

        {/* ปุ่ม */}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={
              submitting ||
              !title.trim() ||
              !description.trim()
            }
            className="flex-1 py-3 bg-[#1E293B] text-white rounded-xl font-medium hover:bg-[#0F172A] transition-colors disabled:opacity-50"
          >
            {submitting
              ? 'กำลังบันทึก...'
              : isEdit
                ? 'บันทึกการแก้ไข'
                : 'สร้างโพสต์'}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                isEdit && postId
                  ? {
                      name: 'post-detail',
                      postId,
                    }
                  : {
                      name: 'home',
                    }
              )
            }
            className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            ยกเลิก
          </button>
        </div>

      </form>
    </div>
  );
}
