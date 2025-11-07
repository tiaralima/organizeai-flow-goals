import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles, TrendingUp, Target, Zap, Rocket } from 'lucide-react';

const LoginPage = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <AppLayout hideNavigation>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center">
                OrganizeAI <Rocket className='ml-2' />
              </h1>
            <p className="text-white">Organize seus objetivos financeiros</p>
            </div>
            
            <div className="glass-card p-6">
              <LoginForm />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideNavigation>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Branding & Features */}
        <div className="px-4 lg:px-0">
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-300 flex items-center">
              OrganizeAI <Rocket className='ml-4' />
            </h1>
            <p className="text-2xl text-purple-200/70">Organize seus objetivos financeiros com inteligência</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <Target className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-100 mb-1">Metas Inteligentes</h3>
                <p className="text-purple-200/70">Defina e acompanhe seus objetivos financeiros</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <TrendingUp className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-100 mb-1">Análise em Tempo Real</h3>
                <p className="text-purple-200/70">Visualize seu progresso instantaneamente</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-100 mb-1">Automatização Poderosa</h3>
                <p className="text-purple-200/70">Deixe a IA trabalhar por você</p>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-3 text-purple-200/70">
            <Sparkles className="w-5 h-5" />
            <p className="text-sm">Transforme sua vida financeira hoje</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md glass-card p-8 rounded-3xl border-purple-500/20">
            <LoginForm />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LoginPage;
