import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight, ArrowDownLeft, Loader2, Check, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';

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
  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [showPaid, setShowPaid] = useState(false);
  const TRANSACTIONS_PER_PAGE = 10;

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const getMonthRange = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0],
    };
  };

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);

    const { from, to } = getMonthRange(currentMonth);

    // Base query for count
    let countQuery = supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('date', from)
      .lte('date', to);

    if (!showPaid) {
      countQuery = countQuery.eq('is_paid', false);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error fetching transactions count:', countError);
      toast({ title: 'Erro ao buscar contagem de transações', description: countError.message, variant: 'destructive' });
    } else {
      setTransactionsCount(count || 0);
    }

    // Fetch paginated transactions
    let query = supabase
      .from('transactions')
      .select('*, categories(name)')
      .eq('user_id', user.id)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: false });

    if (!showPaid) {
      query = query.eq('is_paid', false);
    }

    if (!isMobile) {
      query = query.range((currentPage - 1) * TRANSACTIONS_PER_PAGE, currentPage * TRANSACTIONS_PER_PAGE - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      toast({ title: 'Erro ao buscar transações', description: error.message, variant: 'destructive' });
      setTransactions([]);
    } else {
      const transactionsWithCategory = data.map(t => ({
        ...t,
        category_name: t.categories?.name || 'Sem categoria',
        transaction_type: t.transaction_type as 'income' | 'expense',
        is_paid: t.is_paid || false,
      }));
      setTransactions(transactionsWithCategory);
    }

    setLoading(false);
  };

  const fetchTotals = async () => {
    if (!user) return;

    const { from, to } = getMonthRange(currentMonth);

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, transaction_type')
      .eq('user_id', user.id)
      .gte('date', from)
      .lte('date', to);

    if (error) {
      console.error('Error fetching totals:', error);
      return;
    }

    const income = data.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = data.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    setTotalIncome(income);
    setTotalExpenses(expenses);
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchTotals();
    }
  }, [user, currentMonth, currentPage, showPaid, toast]);

  const handleMonthChange = (increment: number) => {
    setCurrentPage(1);
    setCurrentMonth(prev => {
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() + increment, 1);
      return newMonth;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
  };

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

      fetchTransactions();
      fetchTotals();
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

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleTransactionUpdate = (updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
  };

  const filteredTransactions = transactions;

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
          <h1 className="text-2xl font-bold text-white">Finanças 💰</h1>
          <p className="text-white">Suas receitas e despesas</p>
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
            onClick={() => handleMonthChange(-1)}
            className="hover:bg-slate-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg text-white">
              {currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleMonthChange(1)}
            className="hover:bg-slate-800"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-white mb-1">Receitas</p>
            <p className="text-sm font-semibold text-green-500">R$ {formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-white mb-1">Despesas</p>
            <p className="text-sm font-semibold text-red-500">R$ {formatCurrency(totalExpenses)}</p>
          </div>
          <div>
            <p className="text-xs text-white mb-1">Saldo</p>
            <p className={`text-sm font-semibold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              R$ {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-medium text-white">Transações do mês</h2>
          <Button
            variant="ghost"
            size={isMobile ? "icon" : "default"}
            onClick={() => setShowPaid(prev => !prev)}
            className="text-white hover:bg-slate-800"
          >
            {isMobile ? (
              showPaid ? <EyeOff size={20} /> : <Eye size={20} />
            ) : (
              showPaid ? 'Ocultar Pagas' : 'Mostrar Pagas'
            )}
          </Button>
        </div>
        
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-white mb-4">
                {showPaid ? "Nenhuma transação paga encontrada." : "Nenhuma transação pendente encontrada."}
              </p>
            </div>
          ) : (
            filteredTransactions.map(transaction => (
              <div 
                key={transaction.id} 
                className="glass-card p-4 cursor-pointer hover:bg-slate-900/70 transition-colors"
                onClick={() => handleTransactionClick(transaction)}
              >
                <div className="flex items-center justify-between">
                  {/* Left side */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.transaction_type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {transaction.transaction_type === 'income' ? (
                        <ArrowUpRight className="text-green-500" size={20} />
                      ) : (
                        <ArrowDownLeft className="text-red-500" size={20} />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-white block">{transaction.category_name}</span>
                      <span className="text-xs text-white/70">{formatDate(transaction.date)}</span>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`font-semibold block ${transaction.transaction_type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}
                        R$ {formatCurrency(transaction.amount)}
                      </span>
                      {transaction.description && (
                        <span className="text-xs text-white/70">{transaction.description}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 rounded-full ${
                        transaction.is_paid
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePayment(transaction.id, transaction.is_paid);
                      }}
                      disabled={updatingPayment === transaction.id}
                    >
                      {updatingPayment === transaction.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {filteredTransactions.length > 0 && !isMobile && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            className="text-white"
          >
            Anterior
          </Button>
          <span className="text-white">
            Página {currentPage} de {Math.ceil(transactionsCount / TRANSACTIONS_PER_PAGE)}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage * TRANSACTIONS_PER_PAGE >= transactionsCount}
            variant="outline"
            className="text-white"
          >
            Próxima
          </Button>
        </div>
      )}

      <EditTransactionModal
        transaction={selectedTransaction}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        onUpdate={handleTransactionUpdate}
      />
    </AppLayout>
  );
};

export default TransactionsPage;
