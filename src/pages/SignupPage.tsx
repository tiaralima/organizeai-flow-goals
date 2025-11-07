import React from 'react';
import { SignupForm } from '@/components/auth/SignupForm';
import { AppLayout } from '@/components/layout/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sparkles, Shield, Rocket, Star } from 'lucide-react';

const SignupPage = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <AppLayout hideNavigation>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                OrganizeAI
              </h1>
              <p className="text-white">Organize seus objetivos financeiros</p>
            </div>
            
            <div className="glass-card p-6">
              <SignupForm />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <div className="dark min-h-screen w-full bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Signup Form */}
        <div className="w-[600px] flex items-center justify-center p-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent backdrop-blur-sm" />
          
          <div className="relative w-full max-w-md">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-10 shadow-2xl shadow-purple-500/10">
              <div className="absolute -top-1 -left-1 -right-1 -bottom-1 bg-gradient-to-r from-purple-500/20 via-primary/20 to-blue-500/20 rounded-3xl -z-10 blur-xl" />
              
              <SignupForm />
            </div>

            {/* Floating decorative elements */}
            <div className="absolute -z-10 top-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -z-10 bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-500" />
          </div>
        </div>

        {/* Right side - Benefits */}
        <div className="flex-1 flex flex-col justify-center px-16 py-12">
          <div className="max-w-xl">
            <div className="mb-12">
              <h1 className="text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-primary to-blue-400 animate-fade-in">
                Bem-vindo
              </h1>
              <p className="text-2xl text-purple-200/80 font-light">
                Junte-se a milhares de usuários que já transformaram suas finanças
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors">
                  <Rocket className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-100 mb-1">Comece Gratuitamente</h3>
                  <p className="text-purple-200/60">Sem cartão de crédito, sem compromisso</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30 group-hover:bg-blue-500/30 transition-colors">
                  <Shield className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-100 mb-1">100% Seguro</h3>
                  <p className="text-purple-200/60">Seus dados protegidos com criptografia de ponta</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform duration-300">
                <div className="p-3 rounded-xl bg-primary/20 border border-primary/30 group-hover:bg-primary/30 transition-colors">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-100 mb-1">Suporte Premium</h3>
                  <p className="text-purple-200/60">Equipe dedicada para ajudá-lo sempre</p>
                </div>
              </div>
            </div>

            <div className="mt-16 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3 text-purple-200 mb-2">
                <Sparkles className="w-5 h-5" />
                <p className="font-semibold">Oferta Especial</p>
              </div>
              <p className="text-sm text-purple-300/80">
                Primeiros 1000 usuários ganham recursos premium por 3 meses!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
