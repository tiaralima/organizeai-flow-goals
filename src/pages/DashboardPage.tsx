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
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </AppLayout>
    );
  }

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
        <h2 className="text-xl font-bold mb-3">Suas metas 🎯</h2>
        {goals.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-muted-foreground mb-4">Você ainda não tem metas cadastradas</p>
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
};

export default DashboardPage;
