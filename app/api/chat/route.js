import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { message } = await request.json();
        const userId = request.headers.get('x-user-id') || 'web-user';

        console.log(`Recebida mensagem de ${userId}: ${message}`);

        // Retorna uma resposta direta sem depender de um backend externo
        return NextResponse.json({
            success: true,
            message: `Você enviou: "${message}". Esta é uma resposta temporária do servidor.`
        });
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        return NextResponse.json({
            success: false,
            error: 'Erro ao processar mensagem'
        }, { status: 500 });
    }
} 