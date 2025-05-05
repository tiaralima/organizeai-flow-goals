import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Plus, Trash2, Loader2, Pencil, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { NumericFormat } from 'react-number-format';

type ShoppingItem = {
  id: number;
  name: string;
  price: number | null;
  quantity: number;
  is_checked: boolean;
  category: string | null;
  list_id: number;
};

type ShoppingList = {
  id: number;
  name: string;
  user_id: string;
};

const ShoppingListPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentListId, setCurrentListId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingItem, setSavingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch shopping lists
        const { data: listsData, error: listsError } = await supabase
          .from('shopping_lists')
          .select('*')
          .eq('user_id', user.id);
        
        if (listsError) throw listsError;
        
        setLists(listsData || []);
        
        // Set default list if available
        if (listsData && listsData.length > 0) {
          const defaultList = listsData[0];
          setCurrentListId(defaultList.id);
          
          // Fetch items for default list
          const { data: itemsData, error: itemsError } = await supabase
            .from('shopping_list_items')
            .select('*')
            .eq('list_id', defaultList.id);
          
          if (itemsError) throw itemsError;
          
          // Garantir que os itens têm a estrutura correta
          const typedItems = (itemsData || []).map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1, // Garantir que quantity existe
            is_checked: item.is_checked,
            category: item.category,
            list_id: item.list_id
          })) as ShoppingItem[];
          
          setItems(typedItems);
        }
      } catch (error: any) {
        console.error('Error fetching shopping data:', error);
        toast({
          title: 'Erro ao carregar lista de compras',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim() || !currentListId) return;
    
    setSavingItem(true);
    
    try {
      let price = null;
      if (newPrice.trim()) {
        price = parseFloat(newPrice.replace(',', '.'));
        if (isNaN(price)) price = null;
      }

      const quantity = parseInt(newQuantity) || 1;
      
      const newItemData = {
        list_id: currentListId,
        name: newItem,
        price,
        quantity,
        category: newCategory || null,
        is_checked: false
      };
      
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert(newItemData)
        .select();
      
      if (error) throw error;
      
      // Adicionar o novo item diretamente, sem usar a resposta da API
      // Isso evita problemas de tipagem e garante que o novo item seja adicionado
      const createdItem: ShoppingItem = {
        ...newItemData,
        id: data?.[0]?.id || Math.random(), // Usar o ID retornado ou um temporário
        list_id: currentListId
      };
      
      setItems([...items, createdItem]);
      
      setNewItem('');
      setNewPrice('');
      setNewQuantity('1');
      setNewCategory('');
      
      toast({
        title: "Item adicionado",
        description: `${newItem} foi adicionado à lista de compras.`
      });
    } catch (error: any) {
      console.error('Error adding item:', error);
      toast({
        title: 'Erro ao adicionar item',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSavingItem(false);
    }
  };
  
  const toggleItem = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ is_checked: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setItems(items.map(item => 
        item.id === id ? { ...item, is_checked: !currentStatus } : item
      ));
    } catch (error: any) {
      console.error('Error toggling item:', error);
      toast({
        title: 'Erro ao atualizar item',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  const removeItem = async (id: number) => {
    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setItems(items.filter(item => item.id !== id));
      
      toast({
        title: "Item removido",
        description: "Item removido da lista de compras."
      });
    } catch (error: any) {
      console.error('Error removing item:', error);
      toast({
        title: 'Erro ao remover item',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  const handleEditItem = (item: ShoppingItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditPrice(item.price?.toString() || '');
    setEditQuantity(item.quantity.toString());
    setEditCategory(item.category || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setSavingEdit(true);
    
    try {
      let price = null;
      if (editPrice.trim()) {
        price = parseFloat(editPrice.replace(',', '.'));
        if (isNaN(price)) price = null;
      }

      const quantity = parseInt(editQuantity) || 1;
      
      const updatedItem = {
        name: editName,
        price,
        quantity,
        category: editCategory || null
      };
      
      const { error } = await supabase
        .from('shopping_list_items')
        .update(updatedItem)
        .eq('id', editingItem.id);
      
      if (error) throw error;
      
      // Update local state
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...updatedItem }
          : item
      ));
      
      setEditingItem(null);
      
      toast({
        title: "Item atualizado",
        description: `${editName} foi atualizado com sucesso.`
      });
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast({
        title: 'Erro ao atualizar item',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditPrice('');
    setEditQuantity('');
    setEditCategory('');
  };
  
  const pendingItems = items.filter(item => !item.is_checked);
  const completedItems = items.filter(item => item.is_checked);
    
  const pendingTotal = pendingItems
    .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    
  const completedTotal = completedItems
    .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Lista de Compras 🛒</h1>
        <p className="text-muted-foreground">Organize suas compras</p>
      </div>
      
      {lists.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground mb-4">Você ainda não tem listas de compras</p>
        </div>
      ) : (
        <>
          <div className="glass-card p-4 mb-6">
            <form onSubmit={handleAddItem} className="space-y-3">
              <Input
                className="glass-input"
                placeholder="Nome do item"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                required
                disabled={savingItem}
              />
              
              <div className="grid grid-cols-3 gap-3">
                <NumericFormat
                  className="glass-input"
                  placeholder="Preço (R$)"
                  value={newPrice}
                  onValueChange={(values) => setNewPrice(values.value)}
                  thousandSeparator="."
                  decimalSeparator="," 
                  prefix="R$ "
                  allowNegative={false}
                  customInput={Input}
                  disabled={savingItem}
                />
                
                <Input
                  type="number"
                  min="1"
                  className="glass-input"
                  placeholder="Quantidade"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  disabled={savingItem}
                />
                
                <Input
                  className="glass-input"
                  placeholder="Categoria"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  disabled={savingItem}
                />
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                type="submit"
                disabled={savingItem}
              >
                {savingItem ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-1" /> Adicionar Item
                  </>
                )}
              </Button>
            </form>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Itens Pendentes</h2>
              <span className="text-sm font-medium">
                Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingTotal)}
              </span>
            </div>
            
            {pendingItems.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-6">
                Não há itens pendentes na lista
              </p>
            )}
            
            {pendingItems.map(item => (
              <div key={item.id} className="glass-card p-4">
                {editingItem?.id === item.id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <Input
                      className="glass-input"
                      placeholder="Nome do item"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      disabled={savingEdit}
                    />
                    
                    <div className="grid grid-cols-3 gap-3">
                      <NumericFormat
                        className="glass-input"
                        placeholder="Preço (R$)"
                        value={editPrice}
                        onValueChange={(values) => setEditPrice(values.value)}
                        thousandSeparator="."
                        decimalSeparator="," 
                        prefix="R$ "
                        allowNegative={false}
                        customInput={Input}
                        disabled={savingEdit}
                      />
                      
                      <Input
                        type="number"
                        min="1"
                        className="glass-input"
                        placeholder="Quantidade"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        disabled={savingEdit}
                      />
                      
                      <Input
                        className="glass-input"
                        placeholder="Categoria"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        disabled={savingEdit}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
                        disabled={savingEdit}
                      >
                        {savingEdit ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          'Salvar'
                        )}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={savingEdit}
                      >
                        <X size={16} className="mr-1" /> Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            (x{item.quantity})
                          </span>
                        </div>
                        {item.price && (
                          <span className="text-sm font-semibold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                          </span>
                        )}
                      </div>
                      {item.category && (
                        <span className="text-xs text-muted-foreground">
                          {item.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center ml-4 space-x-2">
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="h-8 w-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      >
                        <Pencil size={16} className="text-blue-600" />
                      </button>
                      <button 
                        onClick={() => toggleItem(item.id, item.is_checked)} 
                        className="h-8 w-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-green-100 transition-colors"
                      >
                        <Check size={16} className="text-green-600" />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {completedItems.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Itens Comprados</h2>
                <span className="text-sm font-medium">
                  Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(completedTotal)}
                </span>
              </div>
              
              <div className="space-y-2">
                {completedItems.map(item => (
                  <div 
                    key={item.id} 
                    className="glass-card p-4 flex items-center justify-between opacity-70"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium line-through">{item.name}</span>
                          <span className="text-sm text-muted-foreground line-through">
                            (x{item.quantity})
                          </span>
                        </div>
                        {item.price && (
                          <span className="text-sm font-medium line-through">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                          </span>
                        )}
                      </div>
                      {item.category && (
                        <span className="text-xs text-muted-foreground">
                          {item.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center ml-4 space-x-2">
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="h-8 w-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-blue-100 transition-colors"
                      >
                        <Pencil size={16} className="text-blue-600" />
                      </button>
                      <button 
                        onClick={() => toggleItem(item.id, item.is_checked)}
                        className="h-8 w-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Check size={16} className="text-green-600 animate-bounce-check" />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 rounded-full bg-white/70 flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default ShoppingListPage;
