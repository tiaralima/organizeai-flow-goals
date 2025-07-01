
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
      
      toast({
        title: 'Transação atualizada',
        description: 'A transação foi atualizada com sucesso.'
      });
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transaction_type">Tipo</Label>
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
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Adicione uma descrição..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
              className="h-4 w-4"
            />
            <Label htmlFor="is_recurring" className="text-sm">
              Transação recorrente
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_paid"
              checked={formData.is_paid}
              onChange={(e) => setFormData(prev => ({ ...prev, is_paid: e.target.checked }))}
              className="h-4 w-4"
            />
            <Label htmlFor="is_paid" className="text-sm">
              Pago
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
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
