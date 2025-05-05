
import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, ShoppingCart } from 'lucide-react';

export const QuickActions = () => {
  return (
    <div className="grid grid-cols-3 gap-3 my-6">
      <Link to="/transactions/new" className="glass-card p-4 flex flex-col items-center justify-center text-center">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center mb-2">
          <Plus size={20} className="text-white" />
        </div>
        <span className="text-xs font-medium">Lançar Finança</span>
      </Link>
      
      <Link to="/goals/new" className="glass-card p-4 flex flex-col items-center justify-center text-center">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center mb-2">
          <Target size={20} className="text-white" />
        </div>
        <span className="text-xs font-medium">Nova Meta</span>
      </Link>
      
      <Link to="/shopping" className="glass-card p-4 flex flex-col items-center justify-center text-center">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center mb-2">
          <ShoppingCart size={20} className="text-white" />
        </div>
        <span className="text-xs font-medium">Lista Compras</span>
      </Link>
    </div>
  );
};
