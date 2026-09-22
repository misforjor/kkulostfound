import type { User, Post, Comment } from './types';
import { supabase } from './supabase';

/* =========================
   USERS / AUTH
========================= */

function mapProfile(row: any): User {
  return {
    id: row.id,
    displayName: row.display_name || '',
    email: row.email || '',
    password: '',
    profileImage: row.profile_image || undefined,
    createdAt: row.created_at,
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) return null;

  return mapProfile(profile);
}

export async function login(
  email: string,
  password: string
): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!profile) return null;

  return mapProfile(profile);
}

export async function register(
  displayName: string,
  email: string,
  password: string
): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      display_name: displayName,
      email,
    })
    .select()
    .single();

  if (profileError || !profile) return null;

  return mapProfile(profile);
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<User> {
  const dataToUpdate: Record<string, any> = {};

  if (updates.displayName !== undefined) {
    dataToUpdate.display_name = updates.displayName;
  }

  if (updates.profileImage !== undefined) {
    dataToUpdate.profile_image = updates.profileImage || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้');
  }

  return mapProfile(data);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;

  return mapProfile(data);
}

/* =========================
   POSTS
========================= */

function mapPost(row: any): Post {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    category: row.category || 'อื่น ๆ',
    title: row.title,
    description: row.description,
    location: row.location,
    imageUrl: row.image_url || undefined,
    status: row.status,
    contactInfo: row.contact_info || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map(mapPost);
}

export async function getPostById(
  id: string
): Promise<Post | undefined> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return undefined;

  return mapPost(data);
}

export async function getPostsByUserId(
  userId: string
): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map(mapPost);
}

export async function createPost(
  post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: post.userId,
      type: post.type,
      category: post.category,
      title: post.title,
      description: post.description,
      location: post.location,
      image_url: post.imageUrl || null,
      status: post.status,
      contact_info: post.contactInfo || null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'ไม่สามารถสร้างโพสต์ได้');
  }

  return mapPost(data);
}

export async function updatePost(
  id: string,
  updates: Partial<Post>
): Promise<Post> {
  const dataToUpdate: Record<string, any> = {};

  if (updates.type !== undefined) {
    dataToUpdate.type = updates.type;
  }

  if (updates.category !== undefined) {
    dataToUpdate.category = updates.category;
  }

  if (updates.title !== undefined) {
    dataToUpdate.title = updates.title;
  }

  if (updates.description !== undefined) {
    dataToUpdate.description = updates.description;
  }

  if (updates.location !== undefined) {
    dataToUpdate.location = updates.location;
  }

  if (updates.imageUrl !== undefined) {
    dataToUpdate.image_url = updates.imageUrl || null;
  }

  if (updates.status !== undefined) {
    dataToUpdate.status = updates.status;
  }

  if (updates.contactInfo !== undefined) {
    dataToUpdate.contact_info = updates.contactInfo || null;
  }

  const { data, error } = await supabase
    .from('posts')
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'ไม่สามารถแก้ไขโพสต์ได้');
  }

  return mapPost(data);
}

export async function deletePost(id: string) {
  await supabase
    .from('comments')
    .delete()
    .eq('post_id', id);

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/* =========================
   COMMENTS
========================= */

function mapComment(row: any): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCommentsByPostId(
  postId: string
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map(mapComment);
}

export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: userId,
      content,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'ไม่สามารถเพิ่มคอมเมนต์ได้');
  }

  return mapComment(data);
}

export async function updateComment(
  id: string,
  content: string
) {
  const { error } = await supabase
    .from('comments')
    .update({ content })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteComment(id: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

/* =========================
   INIT
========================= */

export function initData() {
  // ไม่ต้อง seed localStorage แล้ว
}
