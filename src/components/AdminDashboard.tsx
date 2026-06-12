import React, { useState } from 'react';
import { 
  Users, Video, Image as ImageIcon, Plus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown, Layers, Film
} from 'lucide-react';
import { User, MediaItem } from '../types';

interface AdminDashboardProps {
  users: User[];
  mediaItems: MediaItem[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<boolean>;
  onDeleteUser: (id: string) => void;
  onUpdateUser: (user: User) => void;
  onDeleteMedia: (id: string) => void;
  onReorderMedia: (currentIndex: number, direction: 'up' | 'down') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  mediaItems,
  onAddUser,
  onDeleteUser,
  onUpdateUser,
  onDeleteMedia,
  onReorderMedia
}) => {
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'dept' | 'viewer'>('dept');
  const [department, setDepartment] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Editing states for users
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'dept' | 'viewer'>('dept');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPassword, setEditPassword] = useState('');

  // Calculate metrics
  const totalUsers = users.length;
  const totalMedia = mediaItems.length;
  const totalVideos = mediaItems.filter(m => m.type === 'video').length;
  const totalImages = mediaItems.filter(m => m.type === 'image').length;

  // Unique departments for autocomplete datalist
  const existingDepartments = Array.from(
    new Set(
      users
        .filter(u => u.role === 'dept' && u.department)
        .map(u => u.department as string)
        .concat(mediaItems.map(m => m.department))
    )
  ).filter(Boolean);

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!name.trim() || !email.trim()) {
      setFormError('Preencha o nome completo e o e-mail.');
      return;
    }

    if (role === 'dept' && !department.trim()) {
      setFormError('Por favor, informe ou selecione o departamento.');
      return;
    }

    const newUserPayload: Omit<User, 'id'> = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      password: password.trim() || undefined,
      department: role === 'dept' ? department.trim() : undefined
    };

    const success = await onAddUser(newUserPayload);
    if (success) {
      setFormSuccess('Usuário cadastrado com sucesso!');
      setName('');
      setEmail('');
      setPassword('');
      setDepartment('');
    } else {
      setFormError('Este e-mail já está cadastrado.');
    }
  };

  const startEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDepartment(user.department || '');
    setEditPassword(user.password || '');
  };

  const saveUser = (id: string) => {
    if (!editName.trim() || !editEmail.trim()) {
      alert('Nome e E-mail são obrigatórios.');
      return;
    }
    onUpdateUser({
      id,
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      role: editRole,
      department: editRole === 'dept' ? editDepartment.trim() : undefined,
      password: editPassword.trim() || undefined,
      username: editEmail.trim().split('@')[0]
    });
    setEditingUserId(null);
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8">
      {/* 1. Mapeamento de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Total Usuários */}
        <div className="glass border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden bento-card">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Usuários Ativos</span>
            <h4 className="text-2xl font-bold text-slate-100">{totalUsers}</h4>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Total Mídias */}
        <div className="glass border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden bento-card">
          <div className="p-3 bg-[#002c5f]/10 text-[#002c5f] rounded-xl border border-[#002c5f]/20">
            <Film size={22} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Total de Mídias</span>
            <h4 className="text-2xl font-bold text-slate-100">{totalMedia}</h4>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#002c5f]/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Total Vídeos */}
        <div className="glass border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden bento-card">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <Video size={22} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Vídeos</span>
            <h4 className="text-2xl font-bold text-slate-100">{totalVideos}</h4>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Total Imagens */}
        <div className="glass border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden bento-card">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ImageIcon size={22} />
          </div>
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Imagens</span>
            <h4 className="text-2xl font-bold text-slate-100">{totalImages}</h4>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Formulário Cadastrar Usuário */}
        <div className="glass border border-slate-800/80 rounded-2xl p-6 h-fit space-y-5 bento-card">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Plus size={18} className="text-[#002c5f]" />
            Cadastrar Novo Usuário
          </h3>

          {formError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmitUser} className="space-y-4">
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f]/20 text-xs"
              />
            </div>

            {/* E-mail Corporativo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">E-mail Corporativo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: carlos@ctdibrasil.com.br"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f]/20 text-xs"
              />
            </div>

            {/* Tipo de Perfil */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tipo de Perfil</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 focus:outline-none focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f]/20 text-xs"
              >
                <option value="dept">Usuário por Departamento</option>
                <option value="viewer">Somente Visualização (Playlist)</option>
                <option value="admin">Admin Master</option>
              </select>
            </div>

            {/* Departamento com Datalist Autocomplete */}
            {role === 'dept' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Departamento / Setor</label>
                <input
                  list="departments"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Selecione ou digite um novo departamento"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f]/20 text-xs"
                />
                <datalist id="departments">
                  {existingDepartments.map((dept) => (
                    <option key={dept} value={dept} />
                  ))}
                </datalist>
              </div>
            )}

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Senha de Acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Defina uma senha"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#002c5f] focus:ring-1 focus:ring-[#002c5f]/20 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#002c5f] hover:bg-[#162758] text-white font-semibold text-xs shadow-md shadow-[#002c5f]/10 transition-colors"
            >
              Criar Conta
            </button>
          </form>
        </div>

        {/* 3. Lista de Usuários Cadastrados */}
        <div className="glass border border-slate-800/80 rounded-2xl p-6 lg:col-span-2 space-y-5">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Users size={18} className="text-blue-400" />
            Usuários Cadastrados
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate-550 font-medium">
                  <th className="py-3 px-3">Nome</th>
                  <th className="py-3 px-3">E-mail</th>
                  <th className="py-3 px-3">Cargo/Setor</th>
                  <th className="py-3 px-3">Senha de Acesso</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isEditing = editingUserId === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Nome */}
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-[#002c5f]"
                          />
                        ) : (
                          user.name
                        )}
                      </td>

                      {/* E-mail */}
                      <td className="py-3 px-3 text-[#002c5f] font-mono">
                        {isEditing ? (
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-[#002c5f]"
                          />
                        ) : (
                          user.email
                        )}
                      </td>

                      {/* Cargo/Setor */}
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <div className="flex flex-col gap-1 w-32">
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value as any)}
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-850 focus:outline-none focus:border-[#002c5f]"
                            >
                              <option value="admin">Admin Master</option>
                              <option value="dept">Depto</option>
                              <option value="viewer">Visualização</option>
                            </select>
                            {editRole === 'dept' && (
                              <input
                                type="text"
                                list="departments"
                                value={editDepartment}
                                onChange={(e) => setEditDepartment(e.target.value)}
                                placeholder="Setor"
                                className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-[#002c5f]"
                              />
                            )}
                          </div>
                        ) : (
                          <>
                            {user.role === 'admin' && (
                              <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-655 border border-red-205 text-[10px] font-semibold">
                                Admin Master
                              </span>
                            )}
                            {user.role === 'viewer' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-655 border border-emerald-205 text-[10px] font-semibold">
                                Visualização
                              </span>
                            )}
                            {user.role === 'dept' && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#002c5f] border border-[#002c5f]/20 text-[10px] font-semibold">
                                Depto: {user.department}
                              </span>
                            )}
                          </>
                        )}
                      </td>

                      {/* Senha */}
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-[#002c5f]"
                          />
                        ) : (
                          <span className="font-mono text-slate-550">
                            {user.password || <em className="text-slate-400 text-[10px]">Sem senha</em>}
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => saveUser(user.id)}
                              className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                              title="Confirmar alterações"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={cancelEditUser}
                              className="p-1.5 bg-red-55/10 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                              title="Cancelar"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {user.email !== 'admin@ctdibrasil.com.br' ? (
                              <>
                                <button
                                  onClick={() => startEditUser(user)}
                                  className="p-1.5 text-slate-500 hover:text-[#002c5f] hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-all"
                                  title="Editar Usuário / Resetar Senha"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => onDeleteUser(user.id)}
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all"
                                  title="Excluir Usuário"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic px-2">Protegido</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Controle Geral de Arquivos */}
      <div className="glass border border-slate-800/80 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Layers size={18} className="text-[#002c5f]" />
            Controle Geral de Arquivos & Ordem de Playlist
          </h3>
          <span className="text-xs text-slate-400">
            {mediaItems.length} arquivo(s) cadastrado(s)
          </span>
        </div>

        {mediaItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Nenhum arquivo de mídia enviado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-850/80 text-slate-400 font-medium">
                  <th className="py-3 px-3 w-16 text-center">Ordem</th>
                  <th className="py-3 px-3">Título da Mídia</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Departamento</th>
                  <th className="py-3 px-3">Tamanho</th>
                  <th className="py-3 px-3">Enviado Por</th>
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50">
                {mediaItems.map((media, idx) => (
                  <tr key={media.id} className="hover:bg-white/5 transition-colors">
                    {/* Reordenador Up/Down */}
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => onReorderMedia(idx, 'up')}
                          className={`p-1 rounded transition-colors ${
                            idx === 0 
                              ? 'text-slate-750 cursor-not-allowed' 
                              : 'text-slate-400 hover:text-[#002c5f] hover:bg-blue-50/50'
                          }`}
                          title="Mover para Cima"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          disabled={idx === mediaItems.length - 1}
                          onClick={() => onReorderMedia(idx, 'down')}
                          className={`p-1 rounded transition-colors ${
                            idx === mediaItems.length - 1 
                              ? 'text-slate-750 cursor-not-allowed' 
                              : 'text-slate-400 hover:text-[#002c5f] hover:bg-blue-50/50'
                          }`}
                          title="Mover para Baixo"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-100 truncate max-w-[200px]">
                      {media.title}
                    </td>
                    <td className="py-3 px-3">
                      {media.type === 'video' ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-medium uppercase">
                          Vídeo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium uppercase">
                          Imagem
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                        {media.department}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{media.size}</td>
                    <td className="py-3 px-3 text-slate-400">{media.uploadedBy}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(media.uploadedAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDeleteMedia(media.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 bg-red-500/0 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all"
                        title="Remover Mídia da Playlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
