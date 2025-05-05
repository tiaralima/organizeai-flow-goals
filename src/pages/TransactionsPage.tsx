import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight, ArrowDownLeft, Loader2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Transaction = {
  id: number;
  transaction_type: 'income' | 'expense';
  amount: number;
  category_id: number | null;
  date: string;
  is_recurring: boolean | null;
  description: string | null;
  category_name?: string;
  is_paid: boolean;
};

type Category = {
  id: number;
  name: string;
  type: 'income' | 'expense';
};

const TransactionsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);
        
        if (categoriesError) throw categoriesError;
        
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        if (transactionsError) throw transactionsError;
        
        // Ensure categories have the correct type
        const typedCategories = (categoriesData || []).map(cat => ({
          ...cat,
          type: cat.type as 'income' | 'expense'
        }));
        
        setCategories(typedCategories);
        
        // Combine transactions with category names and ensure correct types
        const transactionsWithCategories = (transactionsData || []).map((transaction) => {
          const category = typedCategories.find(c => c.id === transaction.category_id);
          return {
            ...transaction,
            transaction_type: transaction.transaction_type as 'income' | 'expense',
            is_paid: transaction.is_paid || false,
            category_name: category?.name || 'Sem categoria'
          };
        });
        
        setTransactions(transactionsWithCategories);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Erro ao buscar dados',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  };

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth.getMonth() &&
      transactionDate.getFullYear() === currentMonth.getFullYear()
    );
  });

  const totalIncome = filteredTransactions
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const handleTogglePayment = async (transactionId: number, currentStatus: boolean) => {
    if (!user) return;
    
    setUpdatingPayment(transactionId);
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ is_paid: !currentStatus })
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setTransactions(prev => prev.map(t => 
        t.id === transactionId ? { ...t, is_paid: !currentStatus } : t
      ));

      toast({
        title: "Status atualizado",
        description: `Transação marcada como ${!currentStatus ? 'paga' : 'não paga'}`
      });
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdatingPayment(null);
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

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Finanças 💰</h1>
          <p className="text-muted-foreground">Suas receitas e despesas</p>
        </div>
        
        <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Link to="/transactions/new">
            <Plus size={16} className="mr-1" /> Novo
          </Link>
        </Button>
      </div>
      
      <div className="glass-card p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMonthChange(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            className="hover:bg-purple-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg">
              {currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMonthChange(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            className="hover:bg-purple-100"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Receitas</p>
            <p className="text-sm font-semibold text-green-600">R$ {formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Despesas</p>
            <p className="text-sm font-semibold text-red-500">R$ {formatCurrency(totalExpenses)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Saldo</p>
            <p className={`text-sm font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              R$ {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="font-medium mb-3">Transações do mês</h2>
        
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma transação registrada neste mês</p>
              <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-500">
                <Link to="/transactions/new">Registrar nova transação</Link>
              </Button>
            </div>
          ) : (
            filteredTransactions.map(transaction => (
              <div key={transaction.id} className="glass-card p-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    transaction.transaction_type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.transaction_type === 'income' ? (
                      <ArrowUpRight className="text-green-600" size={20} />
                    ) : (
                      <ArrowDownLeft className="text-red-500" size={20} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{transaction.category_name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${
                          transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {transaction.transaction_type === 'income' ? '+' : '-'} 
                          R$ {formatCurrency(transaction.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 rounded-full ${
                            transaction.is_paid 
                              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                          onClick={() => handleTogglePayment(transaction.id, transaction.is_paid)}
                          disabled={updatingPayment === transaction.id}
                        >
                          {updatingPayment === transaction.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatDate(transaction.date)}</span>
                      {transaction.description && (
                        <span>{transaction.description}</span>
                      )}
                      {transaction.is_recurring && (
                        <span>Recorrente</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default TransactionsPage;
