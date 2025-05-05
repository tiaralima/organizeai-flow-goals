import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MonthFilterProps = {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
};

export const MonthFilter = ({ currentMonth, onMonthChange }: MonthFilterProps) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-lg p-2 mb-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePreviousMonth}
        className="hover:bg-purple-600/20"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <div className="text-center">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNextMonth}
        className="hover:bg-blue-600/20"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}; 