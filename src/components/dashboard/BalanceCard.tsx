import React from 'react';

type BalanceCardProps = {
  balance: number;
  income: number;
  expenses: number;
};

export const BalanceCard = ({ balance, income, expenses }: BalanceCardProps) => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-600">Saldo atual</h2>
        <p className="text-3xl font-bold">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="text-center">
          <span className="text-sm text-gray-500">Receitas</span>
          <p className="font-semibold text-green-600">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(income)}
          </p>
        </div>
        
        <div className="text-center">
          <span className="text-sm text-gray-500">Despesas</span>
          <p className="font-semibold text-red-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expenses)}
          </p>
        </div>
      </div>
    </div>
  );
};
