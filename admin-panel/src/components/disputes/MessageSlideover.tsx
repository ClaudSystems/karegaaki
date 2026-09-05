import { useEffect, useState, useRef } from 'react';
import { X, Send, RefreshCw } from 'lucide-react';
import apiClient from '../../api/client';
import { toast } from 'react-hot-toast';

interface Message {
    id: string;
    sender_type: 'client' | 'admin';
    sender_id: string | null;
    message: string;
    created_at: string;
}

interface MessageSlideoverProps {
    dispute: any;
    onClose: () => void;
}

export default function MessageSlideover({ dispute, onClose }: MessageSlideoverProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();
    }, [dispute.id]);

    useEffect(() => {
        // Scroll to bottom when messages change
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/disputes/admin/${dispute.id}/messages`);
            setMessages(res.data.items || []);
        } catch {
            toast.error('Erro ao carregar mensagens');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        setSending(true);
        try {
            await apiClient.post(`/disputes/admin/${dispute.id}/messages`, {
                message: newMessage.trim(),
            });
            setNewMessage('');
            await loadMessages();
        } catch {
            toast.error('Erro ao enviar mensagem');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-PT') + ' às ' + date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            <div className="fixed right-0 top-0 h-full w-[450px] bg-slate-800 border-l border-slate-700 z-50 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Conversa</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{dispute.reference}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadMessages} className="text-slate-400 hover:text-white p-1" title="Atualizar">
                            <RefreshCw size={16} />
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-sm">
                            Nenhuma mensagem ainda.
                            <br />
                            Envie a primeira mensagem abaixo.
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                        msg.sender_type === 'admin'
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-slate-700 text-slate-200 rounded-bl-sm'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                    <p className={`text-[10px] mt-1 ${msg.sender_type === 'admin' ? 'text-blue-200' : 'text-slate-400'}`}>
                                        {formatMessageTime(msg.created_at)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-700">
                    <div className="flex gap-2">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            rows={2}
                            placeholder="Escreva uma mensagem..."
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={sending || !newMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white p-3 rounded-lg transition-colors"
                            title="Enviar"
                        >
                            {sending ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Pressione Enter para enviar</p>
                </div>
            </div>
        </>
    );
}