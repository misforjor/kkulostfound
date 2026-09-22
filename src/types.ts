export type PostType = 'ตามหา' | 'พบของหาย';
export type PostStatus = 'กำลังตามหาสิ่งของ' | 'พบของแล้ว' | 'กำลังตามหาเจ้าของ' | 'ส่งคืนแล้ว';

export interface User {
  id: string;
  displayName: string;
  email: string;
  password: string;
  profileImage?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  title: string;
  description: string;
  location: string;
  imageUrl?: string;
  status: PostStatus;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewName = 'home' | 'post-detail' | 'create-post' | 'edit-post' | 'auth' | 'profile' | 'my-posts';

export interface AppView {
  name: ViewName;
  postId?: string;
  authMode?: 'login' | 'register';
}

export const LOCATIONS = [
  'ในมหาลัย',
  'หลังมอ',
  'กังสดาล',
  'โคลัมโบ',
  'อื่น ๆ',
] as const;

export const STATUS_BY_TYPE: Record<PostType, PostStatus[]> = {
  'ตามหา': ['กำลังตามหาสิ่งของ', 'พบของแล้ว'],
  'พบของหาย': ['กำลังตามหาเจ้าของ', 'ส่งคืนแล้ว'],
};
