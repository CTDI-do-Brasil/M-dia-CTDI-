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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50/40 via-slate-50/50 to-blue-50/40">
      {/* Container Principal */}
      <div className="w-full max-w-sm">
        {/* Card do Formulário */}
        <div className="glass border border-white/80 rounded-3xl p-7 shadow-xl relative overflow-hidden">
          {/* Banner de cabeçalho integrado para acomodar o logo sem parecer "colado" */}
          <div className="bg-[#0b1736] py-6 -mx-7 -mt-7 mb-6 flex flex-col items-center border-b border-[#162758]">
            <img 
              src="/ctdi-logo-50.png" 
              alt="Logo CTDI 50 Anos" 
              className="h-20 w-auto object-contain drop-shadow-md"
            />
            <h1 className="text-2xl font-bold tracking-wide text-white mt-2">
              Mídias
            </h1>
            <span className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">
              Portal Corporativo - CTDI
            </span>
          </div>

          {/* Luz Decorativa */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/3 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/3 rounded-full blur-3xl pointer-events-none"></div>

          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-red-50/80 border border-red-100 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle size={13} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Input E-mail */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block">
                E-mail Corporativo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail corporativo"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50/50 border border-slate-200/80 text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 text-xs transition-all"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block">
                Senha de Acesso
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock size={15} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50/50 border border-slate-200/80 text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 text-xs transition-all"
                />
              </div>
              <div className="flex justify-end pt-0.5">
                <button type="button" className="text-[10px] text-slate-400 hover:text-indigo-650 transition-colors font-medium">
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            {/* Botão Acessar */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 mt-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all duration-200 shadow-md shadow-indigo-600/10 focus:outline-none"
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
