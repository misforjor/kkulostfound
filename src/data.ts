import type { User, Post, Comment, PostType, PostStatus } from './types';

const K = {
  users: 'lf_users',
  posts: 'lf_posts',
  comments: 'lf_comments',
  session: 'lf_session',
  seeded: 'lf_seeded_v7',
};

function uid() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function ago(days: number): string {
  return new Date(Date.now() - days * 864e5).toISOString();
}

export function initData() {
  if (localStorage.getItem(K.seeded)) return;

  const users: User[] = [
    { id: 'u1', displayName: 'Alice Chen', email: 'alice@kku.ac.th', password: 'demo123', createdAt: ago(30) },
    { id: 'u2', displayName: 'Bob Martinez', email: 'bob@kku.ac.th', password: 'demo123', createdAt: ago(20) },
    { id: 'u3', displayName: 'Carol Johnson', email: 'carol@kku.ac.th', password: 'demo123', createdAt: ago(10) },
  ];

  const posts: Post[] = [
    {
      id: 'p1', userId: 'u1', type: 'ตามหา' as PostType, title: 'Black Leather Wallet',
      description: 'Lost my black leather wallet near the main library entrance on the evening of July 14th. Contains student ID, two credit cards, and about $40 in cash. The wallet has a small red stripe on the inside cover.',
      location: 'ในมหาลัย',
      imageUrl: 'https://images.unsplash.com/photo-1627783983977-9dde726c6b7e?w=600&h=400&fit=crop&auto=format',
      status: 'กำลังตามหาสิ่งของ' as PostStatus, contactInfo: 'alice@kku.ac.th', createdAt: ago(2), updatedAt: ago(2),
    },
    {
      id: 'p2', userId: 'u2', type: 'พบของหาย' as PostType, title: 'Blue Nike Backpack',
      description: 'Found a blue Nike backpack near the canteen behind the university during lunch. Contains textbooks and a laptop charger. Please describe the contents to claim it.',
      location: 'หลังมอ',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop&auto=format',
      status: 'กำลังตามหาเจ้าของ' as PostStatus, contactInfo: 'bob@kku.ac.th', createdAt: ago(1), updatedAt: ago(1),
    },
    {
      id: 'p3', userId: 'u3', type: 'ตามหา' as PostType, title: 'AirPods Pro (White)',
      description: 'Lost AirPods Pro with charging case somewhere in the Kangsadan area, likely near the convenience store. The case has a small scratch on the left side.',
      location: 'กังสดาล',
      imageUrl: 'https://images.unsplash.com/photo-1588423771073-b8903fead85c?w=600&h=400&fit=crop&auto=format',
      status: 'กำลังตามหาสิ่งของ' as PostStatus, contactInfo: 'carol@kku.ac.th', createdAt: ago(3), updatedAt: ago(3),
    },
    {
      id: 'p4', userId: 'u1', type: 'พบของหาย' as PostType, title: 'KKU Student ID Card',
      description: 'Found a KKU student ID card on the ground near the Colombo area. The name on the card starts with the letter M. Please describe the card clearly to claim it.',
      location: 'โคลัมโบ',
      imageUrl: undefined,
      status: 'ส่งคืนแล้ว' as PostStatus, createdAt: ago(5), updatedAt: ago(1),
    },
    {
      id: 'p5', userId: 'u2', type: 'ตามหา' as PostType, title: 'MacBook Pro Charger (USB-C)',
      description: 'Left my 96W USB-C MacBook charger at a study spot on campus. It has a small piece of red tape near the plug end.',
      location: 'ในมหาลัย',
      imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=400&fit=crop&auto=format',
      status: 'กำลังตามหาสิ่งของ' as PostStatus, createdAt: ago(4), updatedAt: ago(4),
    },
    {
      id: 'p6', userId: 'u3', type: 'พบของหาย' as PostType, title: 'Set of Keys (3 keys + keychain)',
      description: 'Found a set of 3 keys with a blue carabiner clip keychain near the dormitory entrance behind the university. Keys include a room key and a bike lock key.',
      location: 'หลังมอ',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format',
      status: 'กำลังตามหาเจ้าของ' as PostStatus, createdAt: ago(1), updatedAt: ago(1),
    },
    {
      id: 'p7', userId: 'u1', type: 'ตามหา' as PostType, title: 'Hydro Flask Water Bottle (Navy Blue)',
      description: 'Lost my navy blue water bottle near the Kangsadan convenience store. It has a KKU sticker on the side.',
      location: 'กังสดาล',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=400&fit=crop&auto=format',
      status: 'พบของแล้ว' as PostStatus, createdAt: ago(6), updatedAt: ago(2),
    },
    {
      id: 'p8', userId: 'u2', type: 'พบของหาย' as PostType, title: 'Prescription Glasses (Black Frames)',
      description: 'Found a pair of black-framed prescription glasses in a soft gray case near the Colombo building. Contact me if these are yours.',
      location: 'โคลัมโบ',
      imageUrl: undefined,
      status: 'กำลังตามหาเจ้าของ' as PostStatus, contactInfo: 'bob@kku.ac.th', createdAt: ago(0.5), updatedAt: ago(0.5),
    },
  ];

  const comments: Comment[] = [
    { id: 'c1', postId: 'p1', userId: 'u2', content: 'I think I saw this near Building 8 yesterday evening. Definitely worth checking with security!', createdAt: ago(1.5), updatedAt: ago(1.5) },
    { id: 'c2', postId: 'p1', userId: 'u3', content: 'The security office on the 2nd floor of the main building holds lost items for up to 30 days.', createdAt: ago(1), updatedAt: ago(1) },
    { id: 'c3', postId: 'p3', userId: 'u1', content: 'I saw a pair of AirPods in room 202 this morning after the lecture. Might be yours!', createdAt: ago(2.5), updatedAt: ago(2.5) },
    { id: 'c4', postId: 'p5', userId: 'u3', content: 'There was a charger at the lost and found box near the library checkout desk.', createdAt: ago(3), updatedAt: ago(3) },
    { id: 'c5', postId: 'p6', userId: 'u1', content: 'I lost my keys last week! Can you describe the keychain more? Mine has a blue carabiner too.', createdAt: ago(0.8), updatedAt: ago(0.8) },
    { id: 'c6', postId: 'p6', userId: 'u3', content: "The carabiner has a small 'REI' logo on it. Does that match yours?", createdAt: ago(0.5), updatedAt: ago(0.5) },
  ];

  localStorage.setItem(K.users, JSON.stringify(users));
  localStorage.setItem(K.posts, JSON.stringify(posts));
  localStorage.setItem(K.comments, JSON.stringify(comments));
  localStorage.setItem(K.seeded, '1');
}

export function getUsers(): User[] { return JSON.parse(localStorage.getItem(K.users) || '[]'); }
export function saveUsers(users: User[]) { localStorage.setItem(K.users, JSON.stringify(users)); }
export function getUserById(id: string): User | undefined { return getUsers().find(u => u.id === id); }

export function getCurrentUser(): User | null {
  const id = localStorage.getItem(K.session);
  if (!id) return null;
  return getUserById(id) || null;
}

export function login(email: string, password: string): User | null {
  const user = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) localStorage.setItem(K.session, user.id);
  return user || null;
}

export function register(displayName: string, email: string, password: string): User | null {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return null;
  const user: User = { id: uid(), displayName, email, password, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(K.session, user.id);
  return user;
}

export function logout() { localStorage.removeItem(K.session); }

export function updateUser(id: string, updates: Partial<User>): User {
  const users = getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
  saveUsers(users);
  return users.find(u => u.id === id)!;
}

export function getPosts(): Post[] { return JSON.parse(localStorage.getItem(K.posts) || '[]'); }
export function savePosts(posts: Post[]) { localStorage.setItem(K.posts, JSON.stringify(posts)); }
export function getPostById(id: string): Post | undefined { return getPosts().find(p => p.id === id); }
export function getPostsByUserId(userId: string): Post[] { return getPosts().filter(p => p.userId === userId); }

export function createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post {
  const posts = getPosts();
  const now = new Date().toISOString();
  const post: Post = { ...data, id: uid(), createdAt: now, updatedAt: now };
  posts.unshift(post);
  savePosts(posts);
  return post;
}

export function updatePost(id: string, updates: Partial<Post>): Post {
  const posts = getPosts();
  const idx = posts.findIndex(p => p.id === id);
  posts[idx] = { ...posts[idx], ...updates, updatedAt: new Date().toISOString() };
  savePosts(posts);
  return posts[idx];
}

export function deletePost(id: string) {
  savePosts(getPosts().filter(p => p.id !== id));
  saveComments(getComments().filter(c => c.postId !== id));
}

export function getComments(): Comment[] { return JSON.parse(localStorage.getItem(K.comments) || '[]'); }
export function saveComments(comments: Comment[]) { localStorage.setItem(K.comments, JSON.stringify(comments)); }
export function getCommentsByPostId(postId: string): Comment[] {
  return getComments().filter(c => c.postId === postId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addComment(postId: string, userId: string, content: string): Comment {
  const comments = getComments();
  const now = new Date().toISOString();
  const comment: Comment = { id: uid(), postId, userId, content, createdAt: now, updatedAt: now };
  comments.push(comment);
  saveComments(comments);
  return comment;
}

export function updateComment(id: string, content: string) {
  saveComments(getComments().map(c => c.id === id ? { ...c, content, updatedAt: new Date().toISOString() } : c));
}

export function deleteComment(id: string) {
  saveComments(getComments().filter(c => c.id !== id));
}
