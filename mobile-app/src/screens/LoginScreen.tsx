// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { LogIn, UserPlus, Phone, Lock, User, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
    onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
    const [isRegister, setIsRegister] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [pin, setPin] = useState('');

    const { login, register, isLoading, error } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = isRegister
            ? await register({ phone_number: phoneNumber, full_name: fullName, pin })
            : await login(phoneNumber, pin);

        if (success) {
            onLogin();
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-white">K</span>
                    </div>
                    <h1 className="text-xl font-bold text-white">KaregaAki</h1>
                    <p className="text-sm text-slate-400 mt-1">Marketplace Digital</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="+258 84 123 4567"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-10 pr-3 text-white text-sm focus:border-indigo-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    {isRegister && (
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome completo"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-10 pr-3 text-white text-sm focus:border-indigo-500 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-slate-400 mb-1">PIN (4 dígitos)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="1234"
                                maxLength={4}
                                pattern="[0-9]{4}"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-10 pr-3 text-white text-sm focus:border-indigo-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/50 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isRegister ? (
                            <>
                                <UserPlus className="w-4 h-4" />
                                Registar
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" />
                                Entrar
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-500">
                        {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                useAuthStore.setState({ error: null });
                            }}
                            className="text-indigo-400 hover:text-indigo-300"
                        >
                            {isRegister ? 'Entrar' : 'Registar'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}