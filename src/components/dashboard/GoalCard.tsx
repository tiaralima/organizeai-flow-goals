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
    <Link to={`/goals/${id}/contributions`}>
      <div className="glass-card p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-white">{name}</h3>
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
            <p className="text-white">Economizado</p>
            <p className="font-medium text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentAmount)}</p>
          </div>
          <div>
            <p className="text-white">Meta</p>
            <p className="font-medium text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(targetAmount)}</p>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-white/30">
            <p className="text-xs">
              <span className="text-white">Mensal: </span>
              <span className="font-medium text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyAmount)}</span>
            </p>
        </div>
      </div>
    </Link>
  );
};
