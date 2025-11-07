import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { GoalCard } from '@/components/dashboard/GoalCard';
import { Plus, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type Goal = {
  id: number;
  name: string;
  current_amount: number;
  target_amount: number;
  monthly_amount: number;
};

const GoalsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          throw error;
        }
        
        setGoals(data || []);
      } catch (error: any) {
        console.error('Error fetching goals:', error);
        toast({
          title: 'Erro ao buscar metas',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGoals();
  }, [user, toast]);

  if (loading) {
    return isMobile ? (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </AppLayout>
    ) : (
      <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <AppLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Metas 🎯</h1>
            <p className="text-muted-foreground">Acompanhe seu progresso</p>
          </div>
          
          <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500">
            <Link to="/goals/new">
              <Plus size={16} className="mr-1" /> Nova
            </Link>
          </Button>
        </div>
        
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground mb-4">Você ainda não tem metas cadastradas</p>
              <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500">
                <Link to="/goals/new">Criar primeira meta</Link>
              </Button>
            </div>
          ) : (
            goals.map(goal => (
              <GoalCard
                key={goal.id}
                id={goal.id}
                name={goal.name}
                currentAmount={goal.current_amount || 0}
                targetAmount={goal.target_amount}
                monthlyAmount={goal.monthly_amount}
              />
            ))
          )}
        </div>
      </AppLayout>
    );
  }

  // Desktop Version
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const totalGoals = goals.length;
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0);

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
                Suas Metas
              </h1>
              <p className="text-purple-200/60 text-lg">
                Acompanhe e gerencie seus objetivos financeiros
              </p>
            </div>
            
            <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 px-8 py-6 text-lg">
              <Link to="/goals/new">
                <Plus className="mr-2 h-5 w-5" />
                Nova Meta
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                  <Target className="w-6 h-6 text-purple-300" />
                </div>
                <p className="text-sm text-purple-300/60">Total de Metas</p>
              </div>
              <p className="text-4xl font-bold text-purple-100">{totalGoals}</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                  <TrendingUp className="w-6 h-6 text-blue-300" />
                </div>
                <p className="text-sm text-purple-300/60">Total Economizado</p>
              </div>
              <p className="text-4xl font-bold text-blue-100">{formatCurrency(totalSaved)}</p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                  <Target className="w-6 h-6 text-green-300" />
                </div>
                <p className="text-sm text-purple-300/60">Objetivo Total</p>
              </div>
              <p className="text-4xl font-bold text-green-100">{formatCurrency(totalTarget)}</p>
            </div>
          </div>

          {/* Goals Grid */}
          {goals.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <Target className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-purple-100 mb-3">Nenhuma meta cadastrada</h3>
              <p className="text-purple-200/60 mb-8 max-w-md mx-auto">
                Comece a organizar suas finanças definindo metas inteligentes
              </p>
              <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-6 text-lg">
                <Link to="/goals/new">Criar primeira meta</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {goals.map(goal => {
                const progress = ((goal.current_amount || 0) / goal.target_amount) * 100;
                return (
                  <Link 
                    key={goal.id}
                    to={`/goals/${goal.id}/contributions`}
                    className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 hover:border-purple-500/40 hover:bg-slate-800/70 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="text-2xl font-bold text-purple-100 group-hover:text-purple-200">{goal.name}</h3>
                      <div className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30">
                        <span className="text-sm font-semibold text-purple-200">{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="h-4 rounded-full bg-slate-700/50 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-purple-300/60 mb-1">Economizado</p>
                        <p className="text-xl font-bold text-purple-100">{formatCurrency(goal.current_amount || 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-purple-300/60 mb-1">Objetivo</p>
                        <p className="text-xl font-bold text-purple-100">{formatCurrency(goal.target_amount)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-purple-500/20">
                      <p className="text-sm text-purple-300/60">Mensal sugerido: <span className="font-semibold text-purple-200">{formatCurrency(goal.monthly_amount)}</span></p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;