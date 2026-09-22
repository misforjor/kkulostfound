import { useState, useMemo } from 'react';
import { getPosts } from '../data';
import { useApp } from '../context';
import PostCard from './PostCard';
import type { PostType, PostStatus } from '../types';
import { LOCATIONS } from '../types';

const ALL_STATUSES: PostStatus[] = ['กำลังตามหาสิ่งของ', 'พบของแล้ว', 'กำลังตามหาเจ้าของ', 'ส่งคืนแล้ว'];
const ALL_TYPES: PostType[] = ['ตามหา', 'พบของหาย'];

export default function HomePage() {
  const { navigate, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<PostType[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<PostStatus[]>([]);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const posts = getPosts();

  const filtered = useMemo(() => {
    let result = posts;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (selectedTypes.length) result = result.filter(p => selectedTypes.includes(p.type));
    if (selectedLocations.length) result = result.filter(p => selectedLocations.includes(p.location));
    if (selectedStatuses.length) result = result.filter(p => selectedStatuses.includes(p.status));

    if (sort === 'oldest') result = [...result].reverse();

    return result;
  }, [posts.length, search, selectedTypes, selectedLocations, selectedStatuses, sort]);

  function toggleFilter<T>(arr: T[], setArr: (v: T[]) => void, val: T) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  }

  const activeFilterCount = selectedTypes.length + selectedLocations.length + selectedStatuses.length;

  const TYPE_DOT: Record<string, string> = {
    'ตามหา': 'bg-amber-500',
    'พบของหาย': 'bg-teal-600',
  };

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ประเภท</p>
        <div className="space-y-2">
          {ALL_TYPES.map(t => (
            <label key={t} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(t)}
                onChange={() => toggleFilter(selectedTypes, setSelectedTypes, t)}
                className="w-4 h-4 rounded accent-[#1E293B]"
              />
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <span className={`w-2 h-2 rounded-full ${TYPE_DOT[t]}`} />
                {t}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">สถานะ</p>
        <div className="space-y-2">
          {ALL_STATUSES.map(s => (
            <label key={s} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(s)}
                onChange={() => toggleFilter(selectedStatuses, setSelectedStatuses, s)}
                className="w-4 h-4 rounded accent-[#1E293B]"
              />
              <span className="text-sm text-gray-700">{s}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">สถานที่</p>
        <div className="space-y-2">
          {LOCATIONS.map(loc => (
            <label key={loc} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLocations.includes(loc)}
                onChange={() => toggleFilter(selectedLocations, setSelectedLocations, loc)}
                className="w-4 h-4 rounded accent-[#1E293B]"
              />
              <span className="text-sm text-gray-700">{loc}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={() => { setSelectedTypes([]); setSelectedLocations([]); setSelectedStatuses([]); }}
          className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          ล้างตัวกรองทั้งหมด
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#1E293B', lineHeight: 1.1 }} className="mb-2">
          KKU Lost &amp; Found
        </h1>
        <p className="text-gray-500 text-lg">find what you've lost, return what you've found</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาจากชื่อหรือรายละเอียด..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 focus:border-[#1E293B] transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              ×
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            ตัวกรอง
            {activeFilterCount > 0 && (
              <span className="bg-[#1E293B] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={sort}
            onChange={e => setSort(e.target.value as 'newest' | 'oldest')}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1E293B]/20 cursor-pointer"
          >
            <option value="newest">ใหม่ล่าสุด</option>
            <option value="oldest">เก่าสุด</option>
          </select>

          {currentUser && (
            <button
              onClick={() => navigate({ name: 'create-post' })}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#1E293B] text-white rounded-xl text-sm font-medium hover:bg-[#0F172A] transition-colors"
            >
              + โพสต์ใหม่
            </button>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="lg:hidden bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <FiltersPanel />
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <h2 className="font-semibold text-[#1E293B] mb-4">ตัวกรอง</h2>
            <FiltersPanel />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-semibold text-gray-700 mb-2">ไม่พบโพสต์</p>
              <p className="text-gray-500 text-sm mb-6">ลองปรับคำค้นหาหรือตัวกรองดูใหม่</p>
              {currentUser && (
                <button
                  onClick={() => navigate({ name: 'create-post' })}
                  className="px-6 py-2.5 bg-[#1E293B] text-white rounded-full text-sm font-medium hover:bg-[#0F172A] transition-colors"
                >
                  สร้างโพสต์ใหม่
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                พบ {filtered.length} โพสต์
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {currentUser && (
        <button
          onClick={() => navigate({ name: 'create-post' })}
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#1E293B] text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-[#0F172A] transition-colors z-40"
        >
          +
        </button>
      )}
    </div>
  );
}
