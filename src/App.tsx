import React, { useState, useEffect } from 'react';
import { User, MediaItem } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { DepartmentDashboard } from './components/DepartmentDashboard';
import { VisualizerPage } from './components/VisualizerPage';

// Default mock users
const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'admin@ctdibrasil.com.br',
    username: 'admin',
    name: 'Administrador Master',
    role: 'admin',
    password: 'qwe!@#123'
  },
  {
    id: 'user-mkt',
    email: 'marketing@ctdibrasil.com.br',
    username: 'marketing',
    name: 'Depto Marketing',
    role: 'dept',
    department: 'Marketing',
    password: '123'
  },
  {
    id: 'user-eng',
    email: 'engenharia@ctdibrasil.com.br',
    username: 'engenharia',
    name: 'Depto Engenharia',
    role: 'dept',
    department: 'Engenharia',
    password: '123'
  },
  {
    id: 'user-viewer',
    email: 'visualizador@ctdibrasil.com.br',
    username: 'visualizador',
    name: 'Visualizador Geral',
    role: 'viewer',
    password: '123'
  }
];

// Default mock media items
const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'media-1',
    title: 'Métricas de Engenharia CTDI',
    type: 'image',
    url: '/slide1.png',
    size: '3.2 MB',
    department: 'Engenharia',
    uploadedBy: 'Depto Engenharia',
    uploadedAt: new Date(Date.now() - 3600000 * 3).toISOString() // 3 hours ago
  },
  {
    id: 'media-2',
    title: 'Campanha de Marketing CTDI',
    type: 'image',
    url: '/slide2.png',
    size: '2.8 MB',
    department: 'Marketing',
    uploadedBy: 'Depto Marketing',
    uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'media-3',
    title: 'Vídeo Institucional CTDI',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    size: '15.4 MB',
    department: 'Marketing',
    uploadedBy: 'Depto Marketing',
    uploadedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  }
];

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('midiahub_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('midiahub_media');
    return saved ? JSON.parse(saved) : DEFAULT_MEDIA;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('midiahub_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync to localStorage/sessionStorage
  useEffect(() => {
    localStorage.setItem('midiahub_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('midiahub_media', JSON.stringify(mediaItems));
  }, [mediaItems]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('midiahub_session', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('midiahub_session');
    }
  }, [currentUser]);

  const handleLogin = (identifier: string, password?: string): boolean => {
    const user = users.find(u => 
      (u.username && u.username.toLowerCase() === identifier.toLowerCase()) || 
      u.email.toLowerCase() === identifier.toLowerCase()
    );
    if (user && user.password === password) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSwitchUser = (identifier: string) => {
    const user = users.find(u => u.username === identifier || u.email === identifier);
    if (user) {
      setCurrentUser(user);
    }
  };

  // Admin actions
  const handleAddUser = (newUserPayload: Omit<User, 'id'>): boolean => {
    const exists = users.some(u => u.email.toLowerCase() === newUserPayload.email.toLowerCase());
    if (exists) return false;

    // Derive username from email prefix for display compatibility
    const username = newUserPayload.email.split('@')[0];

    const newUser: User = {
      ...newUserPayload,
      username,
      id: `user-${Date.now()}`
    };

    setUsers(prev => [...prev, newUser]);
    return true;
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If the edited user is the current user, update session state
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleReorderMedia = (currentIndex: number, direction: 'up' | 'down') => {
    if (currentIndex < 0 || currentIndex >= mediaItems.length) return;
    
    const newMedia = [...mediaItems];
    if (direction === 'up' && currentIndex > 0) {
      // Swap with item above
      const temp = newMedia[currentIndex];
      newMedia[currentIndex] = newMedia[currentIndex - 1];
      newMedia[currentIndex - 1] = temp;
    } else if (direction === 'down' && currentIndex < mediaItems.length - 1) {
      // Swap with item below
      const temp = newMedia[currentIndex];
      newMedia[currentIndex] = newMedia[currentIndex + 1];
      newMedia[currentIndex + 1] = temp;
    }
    setMediaItems(newMedia);
  };

  // Media actions
  const handleUploadMedia = (media: Omit<MediaItem, 'id' | 'uploadedBy' | 'uploadedAt'>) => {
    const newMedia: MediaItem = {
      ...media,
      id: `media-${Date.now()}`,
      uploadedBy: currentUser ? currentUser.name : 'Desconhecido',
      uploadedAt: new Date().toISOString()
    };
    setMediaItems(prev => [...prev, newMedia]);
  };

  const handleDeleteMedia = (id: string) => {
    setMediaItems(prev => prev.filter(m => m.id !== id));
  };

  // Screen routing
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 pb-12">
      {/* Top Navigation Bar */}
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        users={users} 
        onSwitchUser={handleSwitchUser} 
      />

      {/* Main Container Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-0">
        {currentUser.role === 'admin' && (
          <div className="space-y-6">
            {/* Admin Header Submenu to quickly toggle views */}
            <div className="max-w-7xl mx-auto px-4 pt-6 flex gap-3 justify-end">
              <span className="text-xs text-slate-500 self-center font-medium mr-2">Visualizar Painel Como:</span>
              <button 
                onClick={() => handleSwitchUser('admin')}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold shadow-sm hover:bg-indigo-100/50 transition-all"
              >
                Admin Master
              </button>
              <button 
                onClick={() => handleSwitchUser('visualizador')}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm transition-all"
              >
                Fila/Visualizador
              </button>
            </div>
            <AdminDashboard 
              users={users}
              mediaItems={mediaItems}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onUpdateUser={handleUpdateUser}
              onDeleteMedia={handleDeleteMedia}
              onReorderMedia={handleReorderMedia}
            />
          </div>
        )}

        {currentUser.role === 'dept' && (
          <DepartmentDashboard
            currentUser={currentUser}
            mediaItems={mediaItems}
            onUploadMedia={handleUploadMedia}
            onDeleteMedia={handleDeleteMedia}
          />
        )}

        {currentUser.role === 'viewer' && (
          <VisualizerPage
            currentUser={currentUser}
            mediaItems={mediaItems}
            onReorderMedia={handleReorderMedia}
          />
        )}
      </main>

      {/* Modern Glass Footer */}
      <footer className="mt-auto pt-8 px-6 text-center text-xs text-slate-500">
        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          <span>&copy; {new Date().getFullYear()} Mídias - CTDI do Brasil. Todos os direitos reservados.</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span>Sistema online (Banco de dados local sincronizado)</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
