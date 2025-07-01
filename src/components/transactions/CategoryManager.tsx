
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus, Trash2 } from 'lucide-react';

type Category = {
  id: number;
  name: string;
  type: 'income' | 'expense';
};

type CategoryManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChange: () => void;
};

export function CategoryManager({ open, onOpenChange, onCategoriesChange }: CategoryManagerProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setCategories((data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
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
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || !user) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategory,
          type: categoryType,
          user_id: user.id
        });
      
      if (error) throw error;
      
      setNewCategory('');
      fetchCategories();
      onCategoriesChange();
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: 'Erro ao adicionar categoria',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(categories.filter(cat => cat.id !== id));
      onCategoriesChange();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Erro ao remover categoria',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === filter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-xl">Gerenciar Categorias</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="glass-card p-4 space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <RadioGroup
                value={categoryType}
                onValueChange={(value: 'income' | 'expense') => {
                  setCategoryType(value);
                  setFilter(value);
                }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">Receita</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">Despesa</Label>
                </div>
              </RadioGroup>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div className="space-y-2">
                <Label>Nova Categoria</Label>
                <div className="flex gap-2">
                  <Input
                    className="glass-input flex-1"
                    placeholder="Nome da categoria"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                    disabled={saving}
                  />
                  <Button 
                    type="submit"
                    size="icon"
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          <div className="glass-card p-4 space-y-4">
            <h3 className="font-medium">Categorias Existentes</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma categoria encontrada
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {filteredCategories.map(category => (
                  <div 
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
