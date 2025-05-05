import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NumericFormat } from 'react-number-format';

type Goal = {
  id: number;
  name: string;
  current_amount: number;
  target_amount: number;
  monthly_amount: number;
};

type Contribution = {
  id: number;
  amount: number;
  date: string;
  goal_id: number;
};

export function GoalContributionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (id) {
      fetchGoalAndContributions();
    }
  }, [id]);

  const fetchGoalAndContributions = async () => {
    if (!user || !id) return;
    
    try {
      // Fetch goal
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('*')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();
      
      if (goalError) throw goalError;
      setGoal(goalData);

      // Fetch contributions
      const { data: contributionsData, error: contributionsError } = await supabase
        .from('goal_contributions')
        .select('*')
        .eq('goal_id', parseInt(id))
        .order('date', { ascending: false });
      
      if (contributionsError) throw contributionsError;
      setContributions(contributionsData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    
    setSaving(true);
    
    try {
      const amountValue = parseFloat(amount.replace(',', '.'));
      if (isNaN(amountValue)) {
        throw new Error('Valor inválido');
      }

      const contributionData = {
        goal_id: parseInt(id),
        amount: amountValue,
        date
      };

      if (editingContribution) {
        // Update existing contribution
        const { error } = await supabase
          .from('goal_contributions')
          .update(contributionData)
          .eq('id', editingContribution.id);

        if (error) throw error;

        // Update local state
        setContributions(contributions.map(cont => 
          cont.id === editingContribution.id 
            ? { ...cont, ...contributionData }
            : cont
        ));

        // Update goal's current amount
        const newTotal = contributions.reduce((sum, cont) => 
          sum + (cont.id === editingContribution.id ? amountValue : cont.amount), 0
        );

        const { error: updateError } = await supabase
          .from('goals')
          .update({ current_amount: newTotal })
          .eq('id', parseInt(id));

        if (updateError) throw updateError;

        // Update local goal state
        setGoal(prev => prev ? { ...prev, current_amount: newTotal } : null);

        toast({
          title: "Lançamento atualizado",
          description: "Lançamento atualizado com sucesso."
        });
      } else {
        // Create new contribution
        const { error } = await supabase
          .from('goal_contributions')
          .insert(contributionData);

        if (error) throw error;

        // Update goal's current amount
        const newTotal = contributions.reduce((sum, cont) => sum + cont.amount, 0) + amountValue;

        const { error: updateError } = await supabase
          .from('goals')
          .update({ current_amount: newTotal })
          .eq('id', parseInt(id));

        if (updateError) throw updateError;

        // Update local goal state
        setGoal(prev => prev ? { ...prev, current_amount: newTotal } : null);

        toast({
          title: "Lançamento adicionado",
          description: "Novo lançamento adicionado com sucesso."
        });
      }

      // Reset form and close dialog
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setEditingContribution(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving contribution:', error);
      toast({
        title: 'Erro ao salvar lançamento',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (contribution: Contribution) => {
    setEditingContribution(contribution);
    setAmount(contribution.amount.toString());
    setDate(contribution.date);
    setIsDialogOpen(true);
  };

  const handleDelete = async (contributionId: number) => {
    try {
      const contribution = contributions.find(cont => cont.id === contributionId);
      if (!contribution) return;

      const { error } = await supabase
        .from('goal_contributions')
        .delete()
        .eq('id', contributionId);
      
      if (error) throw error;
      
      // Update goal's current amount
      const newTotal = contributions.reduce((sum, cont) => 
        sum + (cont.id === contributionId ? 0 : cont.amount), 0
      );

      const { error: updateError } = await supabase
        .from('goals')
        .update({ current_amount: newTotal })
        .eq('id', parseInt(id));

      if (updateError) throw updateError;

      // Update local states
      setContributions(contributions.filter(cont => cont.id !== contributionId));
      setGoal(prev => prev ? { ...prev, current_amount: newTotal } : null);
      
      toast({
        title: "Lançamento removido",
        description: "Lançamento removido com sucesso."
      });
    } catch (error: any) {
      console.error('Error deleting contribution:', error);
      toast({
        title: 'Erro ao remover lançamento',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </AppLayout>
    );
  }

  if (!goal) {
    return (
      <AppLayout>
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground mb-4">Meta não encontrada</p>
          <Button onClick={() => navigate('/goals')}>
            Voltar para Metas
          </Button>
        </div>
      </AppLayout>
    );
  }

  const totalContributions = contributions.reduce((sum, cont) => sum + cont.amount, 0);
  const progress = (totalContributions / goal.target_amount) * 100;

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-3 py-4">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/goals')}
            className="hover:bg-purple-100"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{goal.name}</h1>
            <p className="text-sm text-muted-foreground">Gerenciar lançamentos</p>
          </div>
        </div>

        <div className="glass-card p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Progresso</h3>
            <span className="text-xs font-semibold bg-white/40 px-2 py-1 rounded-full">
              {progress.toFixed(0)}%
            </span>
          </div>
          
          <div className="progress-bar mb-3">
            <div className="progress-value" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500">Economizado</p>
              <p className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalContributions)}</p>
            </div>
            <div>
              <p className="text-gray-500">Meta</p>
              <p className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(goal.target_amount)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Lançamentos</h3>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-blue-500"
              onClick={() => {
                setEditingContribution(null);
                setAmount('');
                setDate(new Date().toISOString().split('T')[0]);
                setIsDialogOpen(true);
              }}
            >
              <Plus size={16} className="mr-1" /> Novo
            </Button>
          </div>

          {contributions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum lançamento encontrado
            </p>
          ) : (
            <div className="space-y-2">
              {contributions.map(contribution => (
                <div 
                  key={contribution.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contribution.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contribution.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => handleEdit(contribution)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(contribution.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] p-0 gap-0">
            <DialogHeader className="px-4 pt-4">
              <DialogTitle className="text-xl">
                {editingContribution ? 'Editar Lançamento' : 'Novo Lançamento'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Valor</label>
                <NumericFormat
                  className="glass-input"
                  placeholder="R$ 0,00"
                  value={amount}
                  onValueChange={(values) => setAmount(values.value)}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  required
                  allowNegative={false}
                  disabled={saving}
                  customInput={Input}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Data</label>
                <Input
                  type="date"
                  className="glass-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  editingContribution ? 'Salvar alterações' : 'Adicionar lançamento'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

export default GoalContributionsPage; 