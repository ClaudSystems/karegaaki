import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Lock, Mail, Shield, AlertCircle, LogIn } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('admin@dimali.co.mz');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const login = useAuthStore((s) => s.login);
    const isLoading = useAuthStore((s) => s.isLoading);
    const error = useAuthStore((s) => s.error);
    const clearError = useAuthStore((s) => s.clearError);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        const success = await login(email, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-950/50 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-indigo-950/30 to-transparent pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-600/30">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white">KaregaAki</h1>
                    <p className="text-sm text-slate-400 mt-1">Painel Administrativo</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 space-y-4 border border-slate-700 shadow-2xl">
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/50 border border-red-900/50 p-3 rounded-xl animate-shake">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    clearError();
                                }}
                                placeholder="admin@dimali.co.mz"
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    clearError();
                                }}
                                placeholder="••••••••"
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 pl-10 pr-12 text-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                            >
                                {showPassword ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition text-sm shadow-lg shadow-indigo-600/30 disabled:shadow-none"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Autenticando...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" />
                                Entrar no Painel
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-500 mt-6">
                    Acesso restrito à equipe KaregaAki
                </p>
            </div>
        </div>
    );
}