import React, { useState } from 'react';
import { Lock, AlertCircle, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (username: string, password?: string) => Promise<boolean>;
  users: User[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usernameOrEmail.trim()) {
      setError('Por favor, digite o seu usuário ou e-mail.');
      return;
    }

    try {
      setIsLoading(true);
      const success = await onLogin(usernameOrEmail.trim().toLowerCase(), password);
      if (!success) {
        setError('Usuário, e-mail ou senha inválidos.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50/40 via-slate-50/50 to-slate-100/40">
      {/* Container Principal */}
      <div className="w-full max-w-sm">
        {/* Card do Formulário */}
        <div className="glass border border-white/80 rounded-3xl p-7 shadow-xl relative overflow-hidden">
          {/* Banner de cabeçalho integrado para acomodar o logo sem parecer "colado" */}
          <div className="bg-[#002c5f] py-6 -mx-7 -mt-7 mb-6 flex flex-col items-center border-b border-[#003d82]">
            <img 
              src="/ctdi-logo-horizontal.png" 
              alt="Logo CTDI" 
              className="h-14 w-auto object-contain drop-shadow-md"
            />
            <h1 className="text-2xl font-bold tracking-wide text-white mt-2">
              Mídias
            </h1>
            <span className="text-[9px] text-slate-300 font-semibold tracking-widest uppercase mt-0.5">
              Portal Corporativo - CTDI
            </span>
          </div>

          {/* Luz Decorativa */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-[#002c5f]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/3 rounded-full blur-3xl pointer-events-none"></div>

          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-red-50/80 border border-red-100 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle size={13} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Input Usuário ou E-mail */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block">
                Nome de Usuário / E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <UserIcon size={15} />
                </span>
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="Digite seu usuário ou e-mail"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50/50 border border-slate-200/80 text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f]/20 text-xs transition-all disabled:opacity-50"
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
                  disabled={isLoading}
                  placeholder="Digite sua senha"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50/50 border border-slate-200/80 text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f]/20 text-xs transition-all disabled:opacity-50"
                />
              </div>
              <div className="flex justify-end pt-0.5">
                <button type="button" disabled={isLoading} className="text-[10px] text-slate-400 hover:text-[#002c5f] transition-colors font-medium disabled:opacity-50">
                  Esqueceu a senha?
                </button>
              </div>
            </div>

            {/* Botão Acessar */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 mt-5 rounded-xl bg-[#002c5f] hover:bg-[#003d82] text-white font-semibold text-xs transition-all duration-200 shadow-md shadow-[#002c5f]/10 focus:outline-none disabled:opacity-50"
            >
              {isLoading ? 'Acessando...' : 'Entrar no Sistema'}
            </button>
          </form>

          {/* Rodapé Interno do Card */}
          <div className="mt-4 text-center">
            <span className="text-[10px] text-slate-400">
              Não tem uma conta? <button type="button" className="underline text-slate-500 hover:text-[#002c5f] transition-all font-medium">Solicite acesso</button>
            </span>
          </div>

          {/* Dica de Acesso */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <span className="text-[9px] text-slate-400 leading-relaxed block">
              Acesso administrativo padrão:<br />
              <strong className="text-slate-500">admin</strong> ou <strong className="text-slate-500">admin@ctdibrasil.com.br</strong><br />
              senha: <strong className="text-slate-500">qwe!@#123</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
