import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTransaction: Transaction) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    date: '',
    description: '',
    transaction_type: 'expense' as 'income' | 'expense',
    is_recurring: false,
    is_paid: false
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount.toString(),
        category_id: transaction.category_id?.toString() || '',
        date: transaction.date,
        description: transaction.description || '',
        transaction_type: transaction.transaction_type,
        is_recurring: transaction.is_recurring || false,
        is_paid: transaction.is_paid
      });
    }
  }, [transaction]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
        
        if (error) throw error;
        
        const typedCategories = (data || []).map(cat => ({
          ...cat,
          type: cat.type as 'income' | 'expense'
        }));
        
        setCategories(typedCategories);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Erro ao buscar categorias',
          description: error.message,
          variant: 'destructive'
        });
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [user, isOpen, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !transaction) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          amount: parseFloat(formData.amount),
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          date: formData.date,
          description: formData.description || null,
          transaction_type: formData.transaction_type,
          is_recurring: formData.is_recurring,
          is_paid: formData.is_paid
        })
        .eq('id', transaction.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Get category name for the updated transaction
      const category = categories.find(c => c.id === parseInt(formData.category_id));
      const updatedTransaction = {
        ...data,
        transaction_type: data.transaction_type as 'income' | 'expense',
        category_name: category?.name || 'Sem categoria'
      };

      onUpdate(updatedTransaction);
      onClose();
      
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast({
        title: 'Erro ao atualizar transação',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    category => category.type === formData.transaction_type
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl text-purple-100">
        <DialogHeader className="p-6 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/20">
              {formData.transaction_type === 'income' ? (
                <ArrowUpRight className="text-purple-700" size={20} />
              ) : (
                <ArrowDownLeft className="text-purple-700" size={20} />
              )}
            </div>
            <div>
              <DialogTitle className="text-white">Editar Transação</DialogTitle>
              <p className="text-xs text-purple-300">
                {formData.transaction_type === 'income' ? 'Receita' : 'Despesa'}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-0">
          <div className="space-y-2">
            <Label htmlFor="transaction_type" className="text-purple-200">Tipo</Label>
            <Select
              value={formData.transaction_type}
              onValueChange={(value: 'income' | 'expense') => {
                setFormData(prev => ({
                  ...prev,
                  transaction_type: value,
                  category_id: '' // Reset category when type changes
                }));
              }}
            >
              <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-purple-100 placeholder:text-purple-300/30 focus:border-purple-500 h-12 rounded-lg px-4">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-purple-200">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              required
              className="bg-slate-800/50 border-purple-500/30 text-purple-100 placeholder:text-purple-300/30 focus:border-purple-500 h-12 rounded-lg px-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-purple-200">Categoria</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger className="bg-slate-800/50 border-purple-500/30 text-purple-100 placeholder:text-purple-300/30 focus:border-purple-500 h-12 rounded-lg px-4">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {filteredCategories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-purple-200">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
              className="bg-slate-800/50 border-purple-500/30 text-purple-100 placeholder:text-purple-300/30 focus:border-purple-500 h-12 rounded-lg px-4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-purple-200">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Adicione uma descrição..."
              rows={3}
              className="bg-slate-800/50 border-purple-500/30 text-purple-100 placeholder:text-purple-300/30 focus:border-purple-500 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="is_recurring" className="text-sm text-purple-200">Transação recorrente</Label>
            </div>
            <Switch
              className="data-[state=checked]:bg-purple-600"
              id="is_recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
            />
          </div>

          <div className="flex items-center justify-between bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="is_paid" className="text-sm text-purple-200">Pago</Label>
            </div>
            <Switch
              className="data-[state=checked]:bg-purple-600"
              id="is_paid"
              checked={formData.is_paid}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_paid: checked }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
