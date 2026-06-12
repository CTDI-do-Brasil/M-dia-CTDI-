import React, { useState } from 'react';
import { Lock, User as UserIcon, AlertCircle, Mail } from 'lucide-react';
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
        {/* Card do Formulário */}
        <div className="glass border border-slate-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Luz Decorativa */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Logo / Título integrado dentro do Card */}
          <div className="flex flex-col items-center mb-6">
            <img 
              src="/ctdi-logo-50.png" 
              alt="Logo CTDI 50 Anos" 
              className="h-28 w-auto object-contain mb-3 drop-shadow-sm"
            />
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
              Mídias
            </h1>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-650 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-650 block">
                E-mail Corporativo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail corporativo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-650 block">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
                />
              </div>
              <div className="flex justify-end pt-0.5">
                <button type="button" className="text-[10px] text-slate-400 hover:text-indigo-600 transition-colors font-medium">
                  Esqueceu a senha?
                </button>
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

          {/* Rodapé Interno do Card */}
          <div className="mt-4 text-center">
            <span className="text-[10px] text-slate-400">
              Não tem uma conta? <button type="button" className="underline text-slate-500 hover:text-indigo-650 transition-all font-medium">Solicite acesso</button>
            </span>
          </div>

          {/* Dica de Acesso */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <span className="text-[9px] text-slate-400 leading-relaxed block">
              Acesso administrativo padrão:<br />
              <strong className="text-slate-500">admin@ctdibrasil.com.br</strong> / senha: <strong className="text-slate-500">qwe!@#123</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
