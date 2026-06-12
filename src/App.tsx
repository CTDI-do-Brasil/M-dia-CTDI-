import React, { useState, useEffect } from 'react';
import { User, MediaItem } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { DepartmentDashboard } from './components/DepartmentDashboard';
import { VisualizerPage } from './components/VisualizerPage';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('midiahub_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Fetch initial data on mount/auth state changes
  useEffect(() => {
    if (currentUser) {
      // Fetch media list
      fetch('/api/media')
        .then(res => res.json())
        .then(data => setMediaItems(data))
        .catch(err => console.error('Erro ao buscar mídias:', err));

      // Fetch users list only for admin dashboard
      if (currentUser.role === 'admin') {
        fetch('/api/users')
          .then(res => res.json())
          .then(data => setUsers(data))
          .catch(err => console.error('Erro ao buscar usuários:', err));
      }
    }
  }, [currentUser]);

  // Keep session storage synced
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('midiahub_session', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('midiahub_session');
    }
  }, [currentUser]);

  const handleLogin = async (identifier: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      if (!res.ok) return false;
      const user = await res.json();
      setCurrentUser(user);
      return true;
    } catch (err) {
      console.error('Erro na autenticação:', err);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleSwitchUser = async (identifier: string) => {
    const user = users.find(u => u.username === identifier || u.email === identifier);
    if (user) {
      setCurrentUser(user);
    } else {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const allUsers: User[] = await res.json();
          setUsers(allUsers);
          const found = allUsers.find(u => u.username === identifier || u.email === identifier);
          if (found) {
            setCurrentUser(found);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Admin actions
  const handleAddUser = async (newUserPayload: Omit<User, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserPayload)
      });
      if (!res.ok) return false;
      const createdUser = await res.json();
      setUsers(prev => [...prev, createdUser]);
      return true;
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err);
      return false;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const res = await fetch(`/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      if (res.ok) {
        const savedUser = await res.json();
        setUsers(prev => prev.map(u => u.id === savedUser.id ? savedUser : u));
        if (currentUser && currentUser.id === savedUser.id) {
          setCurrentUser(savedUser);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
    }
  };

  const handleReorderMedia = async (currentIndex: number, direction: 'up' | 'down') => {
    if (currentIndex < 0 || currentIndex >= mediaItems.length) return;
    
    const newMedia = [...mediaItems];
    let targetIndex = currentIndex;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < mediaItems.length - 1) {
      targetIndex = currentIndex + 1;
    }
    
    if (targetIndex !== currentIndex) {
      const temp = newMedia[currentIndex];
      newMedia[currentIndex] = newMedia[targetIndex];
      newMedia[targetIndex] = temp;
      
      // Update local state immediately for visual responsiveness
      setMediaItems(newMedia);
      
      try {
        const mediaIds = newMedia.map(m => m.id);
        await fetch('/api/media/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaIds })
        });
      } catch (err) {
        console.error('Erro ao salvar reordenação:', err);
      }
    }
  };

  // Media actions
  const handleUploadMedia = async (media: Omit<MediaItem, 'id' | 'uploadedBy' | 'uploadedAt'>) => {
    try {
      const payload = {
        ...media,
        uploadedBy: currentUser ? currentUser.name : 'Desconhecido'
      };
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const mediaRes = await fetch('/api/media');
        const mediaData = await mediaRes.json();
        setMediaItems(mediaData);
      }
    } catch (err) {
      console.error('Erro ao cadastrar mídia:', err);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMediaItems(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Erro ao deletar mídia:', err);
    }
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
