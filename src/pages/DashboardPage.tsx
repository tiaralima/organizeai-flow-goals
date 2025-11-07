import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { UserHeader } from '@/components/dashboard/UserHeader';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { GoalCard } from '@/components/dashboard/GoalCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { MonthFilter } from '@/components/dashboard/MonthFilter';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, Target, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

type Goal = {
  id: number;
  name: string;
  current_amount: number;
  target_amount: number;
  monthly_amount: number;
};

type Transaction = {
  transaction_type: 'income' | 'expense';
  amount: number;
  date: string;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [profile, setProfile] = useState<{name?: string, photo_url?: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Load profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, photo_url')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }
        
        setProfile(profileData);

        // Load goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .limit(2);
        
        if (goalsError) throw goalsError;
        
        setGoals(goalsData || []);

        // Load transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('transaction_type, amount, date')
          .eq('user_id', user.id);
        
        if (transactionsError) throw transactionsError;

        // Filter transactions by selected month
        const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
        
        const filteredTransactions = transactionsData.filter((t: Transaction) => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
        });

        // Calculate financial summary
        const totalIncome = filteredTransactions
          .filter((t: Transaction) => t.transaction_type === 'income')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        const totalExpenses = filteredTransactions
          .filter((t: Transaction) => t.transaction_type === 'expense')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        setIncome(totalIncome);
        setExpenses(totalExpenses);
        setBalance(totalIncome - totalExpenses);
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, navigate, toast, selectedMonth]);

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
        <UserHeader 
          userName={profile?.name || 'Usuário'} 
          photoURL={profile?.photo_url}
        />
        
        <MonthFilter 
          currentMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
        
        <BalanceCard 
          balance={balance} 
          income={income} 
          expenses={expenses} 
        />
        
        <QuickActions />
        
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-3 text-white">Suas metas 🎯</h2>
          {goals.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-white mb-4">Você ainda não tem metas cadastradas</p>
              <Button 
                asChild 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-opacity"
              >
                <Link to="/goals/new">Criar primeira meta</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map(goal => (
                <GoalCard
                  key={goal.id}
                  id={goal.id}
                  name={goal.name}
                  currentAmount={goal.current_amount || 0}
                  targetAmount={goal.target_amount}
                  monthlyAmount={goal.monthly_amount}
                />
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Desktop Version
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-300 mb-2">
            Dashboard
          </h1>
          <p className="text-purple-200/70 text-lg">
            Bem-vindo(a), {profile?.name || 'Usuário'}
          </p>
        </div>

        <div className="flex gap-4">
          <Button asChild className="glass-card border-purple-500/20 hover:bg-slate-900/70 text-purple-100">
            <Link to="/transactions/new">
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Nova Transação
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white">
            <Link to="/goals/new">
              <Target className="mr-2 h-4 w-4" />
              Nova Meta
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <Wallet className="w-6 h-6 text-purple-700" />
              </div>
              <p className="text-sm text-purple-200/70">Saldo do Mês</p>
            </div>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(balance)}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                <ArrowUpRight className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm text-purple-200/70">Receitas</p>
            </div>
            <p className="text-3xl font-bold text-green-500">{formatCurrency(income)}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                <ArrowDownLeft className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-purple-200/70">Despesas</p>
            </div>
            <p className="text-3xl font-bold text-red-500">{formatCurrency(expenses)}</p>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Target className="w-6 h-6 text-purple-300" />
              </div>
              <div>
              <h2 className="text-2xl font-bold text-purple-100">Suas Metas</h2>
              <p className="text-purple-200/70">Acompanhe seu progresso</p>
              </div>
            </div>

            {goals.length > 0 && (
            <Button asChild className="glass-card border-purple-500/20 text-purple-100">
              <Link to="/goals">Ver todas</Link>
            </Button>
            )}
          </div>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
              <Target className="w-10 h-10 text-purple-600" />
            </div>
            <p className="text-purple-200/70 mb-6">Você ainda não tem metas cadastradas</p>
            <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
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
                  className="glass-card rounded-2xl p-6 hover:bg-slate-900/70 transition-all group border-purple-500/20"
                >
                  <h3 className="text-lg font-semibold text-purple-100 mb-4 group-hover:text-purple-200">{goal.name}</h3>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-purple-100">{formatCurrency(goal.current_amount || 0)}</span>
                      <span className="text-purple-200/70">{formatCurrency(goal.target_amount)}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-value"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-200/70">Progresso</span>
                    <span className="font-semibold text-purple-100">{progress.toFixed(0)}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
