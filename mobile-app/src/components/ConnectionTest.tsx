// src/components/ConnectionTest.tsx
import React, { useState } from 'react';
import { api } from '../services/api';

export default function ConnectionTest() {
    const [status, setStatus] = useState<string>('Clique para testar');
    const [details, setDetails] = useState<string>('');

    const testConnection = async () => {
        setStatus('🔄 Testando conexão...');
        setDetails('');

        try {
            // Teste 1: Categorias
            const categories: any = await api.products.getCategories();

            // Teste 2: Produtos
            const products: any = await api.products.list();

            setStatus('✅ Backend conectado com sucesso!');
            setDetails(`
        📦 Categorias: ${categories?.length || 0}
        🎮 Produtos: ${products?.length || 0}
        🔗 URL: ${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}
      `);
        } catch (err: any) {
            setStatus('❌ Erro de conexão');
            setDetails(`
        Erro: ${err.message}
        Verifique se:
        - Backend está rodando em http://localhost:8000
        - PostgreSQL está ativo
        - Tabelas foram criadas
      `);
        }
    };

    return (
        <div style={{
            padding: '20px',
            margin: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            color: 'white',
            fontFamily: 'monospace'
        }}>
            <h3 style={{ margin: '0 0 10px 0' }}>🔌 Teste de Conexão Backend</h3>

            <button
                onClick={testConnection}
                style={{
                    padding: '10px 20px',
                    backgroundColor: 'white',
                    color: '#667eea',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}
            >
                Testar Conexão
            </button>

            <div style={{ marginTop: '15px' }}>
                <p style={{ fontSize: '16px', fontWeight: 'bold' }}>{status}</p>
                {details && (
                    <pre style={{
                        fontSize: '12px',
                        whiteSpace: 'pre-line',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        padding: '10px',
                        borderRadius: '8px'
                    }}>
            {details}
          </pre>
                )}
            </div>
        </div>
    );
}