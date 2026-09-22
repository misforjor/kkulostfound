import { useState } from 'react';
import { initData, getCurrentUser } from './data';
import { AppContext } from './context';
import type { User, AppView } from './types';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import PostDetail from './components/PostDetail';
import CreateEditPost from './components/CreateEditPost';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import MyPosts from './components/MyPosts';

initData();

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser);
  const [view, setView] = useState<AppView>({ name: 'home' });
  const [tick, setTick] = useState(0);

  const navigate = (v: AppView) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const refresh = () => setTick(t => t + 1);

  return (
    <AppContext.Provider value={{ currentUser, setCurrentUser, navigate, view, refresh }}>
      <div className="min-h-screen" style={{ backgroundColor: '#F7F6F3' }}>
        <Navbar />
        <div key={tick}>
          {view.name === 'home' && <HomePage />}
          {view.name === 'post-detail' && view.postId && <PostDetail postId={view.postId} />}
          {view.name === 'create-post' && <CreateEditPost />}
          {view.name === 'edit-post' && view.postId && <CreateEditPost postId={view.postId} />}
          {view.name === 'auth' && <AuthPage key={view.authMode} mode={view.authMode || 'login'} />}
          {view.name === 'profile' && <ProfilePage />}
          {view.name === 'my-posts' && <MyPosts />}
        </div>
      </div>
    </AppContext.Provider>
  );
}
