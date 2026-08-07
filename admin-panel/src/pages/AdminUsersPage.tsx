import { useEffect, useState } from 'react';
import { Users, Plus, Shield, Edit, Trash2, History } from 'lucide-react';
import apiClient from '../api/client';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'admin' });

    const fetchUsers = () => {
        apiClient.get('/admin/users').then(res => setUsers(res.data.items));
    };

    const fetchAudit = () => {
        apiClient.get('/admin/users/audit').then(res => setAuditLogs(res.data.items));
    };

    useEffect(() => {
        activeTab === 'users' ? fetchUsers() : fetchAudit();
    }, [activeTab]);

    const handleSave = async () => {
        try {
            if (editingUser) {
                await apiClient.put(`/admin/users/${editingUser.id}`, form);
                toast.success('Utilizador atualizado!');
            } else {
                await apiClient.post('/admin/users', form);
                toast.success('Utilizador criado!');
            }
            setShowModal(false);
            setEditingUser(null);
            setForm({ email: '', password: '', full_name: '', role: 'admin' });
            fetchUsers();
        } catch {
            toast.error('Erro ao salvar');
        }
    };

    return (
        <div>
            <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Administração</h2>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Users size={16} className="inline mr-1" /> Utilizadores
                    </button>
                    <button onClick={() => setActiveTab('audit')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'audit' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <History size={16} className="inline mr-1" /> Auditoria
                    </button>
                </div>
            </div>

            {activeTab === 'users' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => { setEditingUser(null); setForm({ email: '', password: '', full_name: '', role: 'admin' }); setShowModal(true); }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                            <Plus size={16} /> Novo Admin
                        </button>
                    </div>
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left p-4 text-sm text-slate-400">Nome</th>
                                <th className="text-left p-4 text-sm text-slate-400">Email</th>
                                <th className="text-left p-4 text-sm text-slate-400">Cargo</th>
                                <th className="text-left p-4 text-sm text-slate-400">Status</th>
                                <th className="text-left p-4 text-sm text-slate-400">Último Login</th>
                                <th className="text-left p-4 text-sm text-slate-400">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                    <td className="p-4 text-white text-sm">{u.full_name}</td>
                                    <td className="p-4 text-slate-400 text-sm">{u.email}</td>
                                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        <Shield size={12} className="inline mr-1" />{u.role}
                      </span>
                                    </td>
                                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-xs">{u.last_login_at ? new Date(u.last_login_at).toLocaleString('pt-MZ') : 'Nunca'}</td>
                                    <td className="p-4">
                                        <button onClick={() => { setEditingUser(u); setForm({ email: u.email, password: '', full_name: u.full_name, role: u.role }); setShowModal(true); }}
                                                className="text-slate-400 hover:text-white"><Edit size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'audit' && (
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-700">
                            <th className="text-left p-4 text-sm text-slate-400">Data</th>
                            <th className="text-left p-4 text-sm text-slate-400">Admin</th>
                            <th className="text-left p-4 text-sm text-slate-400">Ação</th>
                            <th className="text-left p-4 text-sm text-slate-400">Detalhes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {auditLogs.map(log => (
                            <tr key={log.id} className="border-b border-slate-700/50">
                                <td className="p-4 text-slate-400 text-xs">{new Date(log.created_at).toLocaleString('pt-MZ')}</td>
                                <td className="p-4 text-white text-sm">{log.admin_email || 'Sistema'}</td>
                                <td className="p-4 text-white text-sm">{log.action}</td>
                                <td className="p-4 text-slate-400 text-xs">{log.details}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 p-6 rounded-xl border border-slate-700 z-50 w-96">
                        <h3 className="text-lg font-bold text-white mb-4">{editingUser ? 'Editar Admin' : 'Novo Admin'}</h3>
                        <div className="space-y-3">
                            <input placeholder="Nome completo" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                                   className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                   className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                            <input type="password" placeholder="Senha (deixar em branco para manter)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                   className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                            <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                                {editingUser ? 'Atualizar' : 'Criar'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}