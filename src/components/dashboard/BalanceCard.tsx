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
        <h2 className="text-lg font-medium text-white">Saldo atual</h2>
        <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="text-center">
          <span className="text-sm text-green-500">Receitas</span>
          <p className="font-semibold text-green-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(income)}
          </p>
        </div>
        
        <div className="text-center">
          <span className="text-sm text-red-500">Despesas</span>
          <p className="font-semibold text-red-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(expenses)}
          </p>
        </div>
      </div>
    </div>
  );
};
