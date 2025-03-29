import ChatBot from '../ChatBot';

export default function Home() {
    return (
        <main className="min-h-screen p-4 md:p-8 bg-gray-100">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
                    Assistente Virtual KiSite
                </h1>
                <p className="text-gray-700 text-center mb-8">
                    Converse com nosso assistente virtual para saber mais sobre nossos serviços
                    de criação de websites e soluções de IA.
                </p>

                <ChatBot />

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} KiSite - Todos os direitos reservados</p>
                </div>
            </div>
        </main>
    );
} 