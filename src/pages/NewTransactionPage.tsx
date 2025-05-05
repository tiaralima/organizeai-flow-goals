import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft, Calendar } from 'lucide-react';
import { CategoryManager } from '@/components/transactions/CategoryManager';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { NumericFormat } from 'react-number-format';

type Category = {
  id: number;
  name: string;
  type: 'income' | 'expense';
};

export function NewTransactionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringMonths, setRecurringMonths] = useState('1');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setCategories((data || []).map(cat => ({
        ...cat,
        type: cat.type as 'income' | 'expense'
      })));
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Erro ao carregar categorias',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user, toast]);

  // Reset category selection when transaction type changes
  useEffect(() => {
    setCategoryId(null);
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para registrar uma transação",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    setLoading(true);

    try {
      const amountValue = parseFloat(amount.replace(',', '.'));
      if (isNaN(amountValue)) {
        throw new Error('Valor inválido');
      }

      const baseTransaction = {
        user_id: user.id,
        amount: amountValue,
        transaction_type: type,
        category_id: categoryId,
        date,
        description: description || null,
        is_recurring: isRecurring,
        recurring_months: isRecurring ? parseInt(recurringMonths) : null
      };

      // Create the first transaction
      const { data: firstTransaction, error: firstError } = await supabase
        .from('transactions')
        .insert(baseTransaction)
        .select();

      if (firstError) throw firstError;

      // If recurring, create future transactions
      if (isRecurring && firstTransaction) {
        const months = parseInt(recurringMonths);
        const futureTransactions = [];

        for (let i = 1; i < months; i++) {
          const futureDate = new Date(date);
          futureDate.setMonth(futureDate.getMonth() + i);
          
          futureTransactions.push({
            ...baseTransaction,
            date: futureDate.toISOString().split('T')[0],
            is_recurring: false // Only the first transaction is marked as recurring
          });
        }

        if (futureTransactions.length > 0) {
          const { error: futureError } = await supabase
            .from('transactions')
            .insert(futureTransactions);

          if (futureError) throw futureError;
        }
      }

      toast({
        title: "Transação criada",
        description: isRecurring 
          ? `Transação criada e agendada para os próximos ${recurringMonths} meses.`
          : "Transação criada com sucesso."
      });
      
      // Limpar o formulário
      setAmount('');
      setDescription('');
      setCategoryId(null);
      setIsRecurring(false);
      setRecurringMonths('1');
      setDate(new Date().toISOString().split('T')[0]);
      
      // Remova a navegação para evitar recarregamento
      // navigate('/transactions');
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Erro ao criar transação',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto px-3 py-4">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/transactions')}
            className="hover:bg-purple-100"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Nova Transação</h1>
            <p className="text-sm text-muted-foreground">Registre uma nova transação</p>
          </div>
        </div>

        <div className="glass-card p-4 mb-4">
          <Button
            variant="outline"
            className="w-full mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
            onClick={() => setIsCategoryManagerOpen(true)}
          >
            Gerenciar Categorias
          </Button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor</Label>
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
                  disabled={loading}
                  customInput={Input}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={type}
                  onValueChange={(value: 'income' | 'expense') => setType(value)}
                  disabled={loading}
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={categoryId?.toString() || ''}
                onValueChange={(value) => setCategoryId(Number(value))}
                disabled={loading}
              >
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(cat => cat.type === type)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                className="glass-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                className="glass-input min-h-[80px]"
                placeholder="Adicione uma descrição (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Transação Recorrente</Label>
                  <p className="text-sm text-muted-foreground">
                    Marque se esta transação se repete mensalmente
                  </p>
                </div>
                <Switch
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                  disabled={loading}
                />
              </div>

              {isRecurring && (
                <div className="space-y-2">
                  <Label>Quantidade de Meses</Label>
                  <Input
                    type="number"
                    min="2"
                    max="12"
                    className="glass-input"
                    placeholder="Número de meses"
                    value={recurringMonths}
                    onChange={(e) => setRecurringMonths(e.target.value)}
                    required={isRecurring}
                    disabled={loading}
                  />
                  <p className="text-sm text-muted-foreground">
                    A transação será criada automaticamente para os próximos meses
                  </p>
                </div>
              )}
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar transação'
              )}
            </Button>
          </form>
        </div>

        <CategoryManager
          open={isCategoryManagerOpen}
          onOpenChange={setIsCategoryManagerOpen}
          onCategoriesChange={fetchCategories}
        />
      </div>
    </AppLayout>
  );
}

export default NewTransactionPage;
