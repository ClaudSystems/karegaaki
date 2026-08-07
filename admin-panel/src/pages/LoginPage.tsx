import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
    const [phone, setPhone] = useState('+258841234567');
    const [pin, setPin] = useState('1234');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((s) => s.login);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(phone, pin);
            navigate('/');
        } catch {
            setError('Telefone ou PIN inválido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-96">
                <h1 className="text-2xl font-bold text-white mb-2">KaregaAki</h1>
                <p className="text-slate-400 text-sm mb-6">Painel Administrativo</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm text-slate-400 block mb-1">Telefone</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+25884..."
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400 block mb-1">PIN</label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            maxLength={4}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="****"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}