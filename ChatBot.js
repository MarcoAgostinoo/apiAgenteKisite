'use client';

import { useState, useEffect, useRef } from 'react';

export default function ChatBot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatContainerRef = useRef(null);
    const userId = useRef(`web-user-${Math.random().toString(36).substring(2, 9)}`);

    // Rola automaticamente para a última mensagem
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Função para enviar mensagem para a API
    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');

        // Adiciona a mensagem do usuário na lista
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId.current
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Adiciona a resposta da IA na lista
                setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
            } else {
                throw new Error(data.error || 'Erro ao processar mensagem');
            }
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
            setError('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // Função para limpar o histórico
    const clearChat = async () => {
        try {
            const response = await fetch('/api/chat/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': userId.current
                }
            });

            if (response.ok) {
                setMessages([]);
            } else {
                throw new Error('Erro ao limpar histórico');
            }
        } catch (err) {
            console.error('Erro ao limpar chat:', err);
            setError('Não foi possível limpar o histórico. Por favor, tente novamente.');
        }
    };

    // Manipula o envio do formulário
    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
            {/* Cabeçalho */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Assistente Virtual KiSite</h2>
                <button
                    onClick={clearChat}
                    className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
                >
                    Limpar Conversa
                </button>
            </div>

            {/* Área das mensagens */}
            <div
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto"
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Olá! Como posso ajudar você hoje?</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                                    <div className="flex space-x-2">
                                        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                {error}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Campo de entrada */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-300">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Enviar
                    </button>
                </div>
            </form>
        </div>
    );
} 