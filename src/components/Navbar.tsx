import React, { useState } from 'react';
import { LogOut, User as UserIcon, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  users: User[];
  onSwitchUser: (username: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, users, onSwitchUser }) => {
  const [showSimulateMenu, setShowSimulateMenu] = useState(false);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-650 border border-red-200';
      case 'dept':
        return 'bg-blue-50 text-[#0b1736] border border-blue-200';
      case 'viewer':
        return 'bg-emerald-50 text-emerald-650 border border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const getRoleLabel = (user: User) => {
    if (user.role === 'admin') return 'Admin Master';
    if (user.role === 'dept') return `Depto: ${user.department}`;
    return 'Somente Visualização';
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <img 
          src="/ctdi-logo-horizontal.png" 
          alt="Logo CTDI" 
          className="h-8 w-auto object-contain mr-1 drop-shadow-sm" 
        />
        <h2 className="text-xl font-bold tracking-tight text-[#0b1736] font-medium">
          Mídias
        </h2>
      </div>

      {/* User Info & Controls */}
      <div className="flex items-center gap-4">
        {/* Simulator Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setShowSimulateMenu(!showSimulateMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 hover:text-[#0b1736] shadow-sm transition-all"
            title="Simular outro acesso rapidamente"
          >
            <RefreshCw size={13} className="text-slate-505" />
            <span>Trocar Acesso</span>
          </button>

          {showSimulateMenu && (
            <div className="absolute right-0 mt-2 w-64 glass border border-slate-200 rounded-xl p-2 shadow-2xl animate-in fade-in duration-200 z-50">
              <div className="px-2.5 py-1.5 text-slate-500 text-[10px] font-semibold tracking-wider uppercase border-b border-slate-100 mb-1">
                Trocar Perfil Rapidamente
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSwitchUser(user.username || user.email.split('@')[0]);
                      setShowSimulateMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col gap-0.5 hover:bg-slate-50 transition-colors ${
                      currentUser.username === user.username ? 'bg-blue-50 border border-blue-200 text-[#0b1736]' : ''
                    }`}
                  >
                    <span className="font-semibold text-slate-700">{user.name}</span>
                    <span className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>@{user.username}</span>
                      <span className="scale-90 opacity-80">{getRoleLabel(user)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-700">{currentUser.name}</span>
            <span className="text-[10px] text-slate-500">@{currentUser.username}</span>
          </div>
          <div className="bg-slate-50 p-1.5 rounded-lg text-slate-600 border border-slate-200">
            <UserIcon size={16} />
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getRoleBadgeColor(currentUser.role)}`}>
            {getRoleLabel(currentUser)}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all"
          title="Sair da Conta"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};
