import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { GoalCard } from '@/components/dashboard/GoalCard';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
};

export default GoalsPage;
