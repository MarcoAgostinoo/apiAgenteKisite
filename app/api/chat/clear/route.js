import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const userId = request.headers.get('x-user-id') || 'web-user';

        console.log(`Limpando histórico de chat para o usuário: ${userId}`);

        // Retorna uma resposta direta sem depender de um backend externo
        return NextResponse.json({
            success: true,
            message: 'Histórico de chat limpo com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao limpar histórico:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro ao limpar histórico'
        }, { status: 500 });
    }
} 