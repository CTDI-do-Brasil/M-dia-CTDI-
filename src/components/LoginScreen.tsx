import React, { useState } from 'react';
import { MonitorPlay, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (username: string, password?: string) => boolean;
  users: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor, digite o seu e-mail.');
      return;
    }

    const success = onLogin(email.trim().toLowerCase(), password);
    if (!success) {
      setError('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-blue-50/60">
      {/* Container Principal */}
      <div className="w-full max-w-md">
        {/* Logo / Título */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/ctdi-logo-50.png" 
            alt="Logo CTDI 50 Anos" 
            className="h-28 w-auto object-contain mb-4 drop-shadow-md rounded-2xl"
          />
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
            Mídias
          </h1>
          <p className="text-[10px] text-slate-500 mt-1 font-semibold tracking-widest uppercase">
            PORTAL CORPORATIVO DE MÍDIA
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="glass border border-slate-200 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Luz Decorativa */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
            Acessar Conta
          </h3>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-650 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input E-mail */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 block">
                E-mail Corporativo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <UserIcon size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: admin@ctdibrasil.com.br"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 block">
                Senha de Acesso
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>
            </div>

            {/* Botão Acessar */}
            <button
              type="submit"
              className="w-full py-3 px-4 mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-650/10 focus:outline-none"
            >
              Entrar no Sistema
            </button>
          </form>

          {/* Dica de Acesso */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-500">
              Admin padrão: <strong className="text-slate-650">admin@ctdibrasil.com.br</strong> / senha: <strong className="text-slate-650">qwe!@#123</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
