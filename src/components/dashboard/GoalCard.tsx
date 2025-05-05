import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type GoalCardProps = {
  id: number;
  name: string;
  currentAmount: number;
  targetAmount: number;
  monthlyAmount: number;
};

export const GoalCard = ({ id, name, currentAmount, targetAmount, monthlyAmount }: GoalCardProps) => {
  const progress = (currentAmount / targetAmount) * 100;

  return (
    <div className="glass-card p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{name}</h3>
        <span className="text-xs font-semibold bg-white/40 px-2 py-1 rounded-full">
          {progress.toFixed(0)}%
        </span>
      </div>
      
      <div className="progress-bar mb-3">
        <div 
          className="progress-value" 
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-500">Economizado</p>
          <p className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentAmount)}</p>
        </div>
        <div>
          <p className="text-gray-500">Meta</p>
          <p className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(targetAmount)}</p>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-white/30">
        <div className="flex justify-between items-center">
          <p className="text-xs">
            <span className="text-gray-500">Mensal: </span>
            <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyAmount)}</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            asChild
          >
            <Link to={`/goals/${id}/contributions`}>
              <Plus size={16} className="mr-1" />
              Lançamentos
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
