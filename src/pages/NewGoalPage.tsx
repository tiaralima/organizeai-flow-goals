import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { NumericFormat } from 'react-number-format';

const NewGoalPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [months, setMonths] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Calculate monthly amount
    if (targetAmount && months) {
      const target = parseFloat(targetAmount.replace(',', '.'));
      const monthsNum = parseInt(months);
      if (!isNaN(target) && !isNaN(monthsNum) && monthsNum > 0) {
        setMonthlyAmount(target / monthsNum);
      } else {
        setMonthlyAmount(null);
      }
    } else {
      setMonthlyAmount(null);
    }
  }, [targetAmount, months]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar uma meta",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    setLoading(true);

    try {
      const target = parseFloat(targetAmount.replace(',', '.'));
      const monthsNum = parseInt(months);

      // Insert into Supabase
      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          name,
          target_amount: target,
          months_to_complete: monthsNum,
          current_amount: 0
        });

      if (error) throw error;

      toast({
        title: "Meta criada",
        description: `A meta "${name}" foi criada com sucesso!`
      });
      
      // Limpar o formulário
      setName('');
      setTargetAmount('');
      setMonths('');
      
      // Remova a navegação para evitar recarregamento
      // navigate('/goals');
    } catch (error: any) {
      console.error('Error creating goal:', error);
      toast({
        title: "Erro ao criar meta",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nova Meta 🎯</h1>
        <p className="text-muted-foreground">Defina um objetivo financeiro</p>
      </div>
      
      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Nome da meta</label>
            <Input
              className="glass-input"
              placeholder="Ex: Carro novo, Viagem, Faculdade..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Valor total (R$)</label>
            <NumericFormat
              className="glass-input"
              placeholder="R$ 0,00"
              value={targetAmount}
              onValueChange={(values) => setTargetAmount(values.value)}
              thousandSeparator="."
              decimalSeparator="," 
              prefix="R$ "
              required
              allowNegative={false}
              customInput={Input}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Prazo (meses)</label>
            <Input
              className="glass-input"
              type="number"
              min="1"
              placeholder="12"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              required
            />
          </div>
          
          {monthlyAmount !== null && (
            <div className="glass-card p-4 text-center bg-white/40">
              <p className="text-sm text-muted-foreground">Valor mensal necessário</p>
              <p className="text-2xl font-bold text-purple-700">
                R$ {formatCurrency(monthlyAmount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Para atingir sua meta em {months} meses
              </p>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-opacity mt-4"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : 'Salvar meta'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default NewGoalPage;
