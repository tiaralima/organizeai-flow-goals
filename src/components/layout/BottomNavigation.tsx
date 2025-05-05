
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Target, ShoppingCart, User } from 'lucide-react';

export const BottomNavigation = () => {
  return (
    <nav className="glass-card fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-4 flex justify-around items-center w-[90%] max-w-md mx-auto z-10">
      <NavLink to="/" className={({ isActive }) => 
        `flex flex-col items-center ${isActive ? 'text-purple-600' : 'text-gray-500'}`
      }>
        <Home size={20} />
        <span className="text-xs mt-1">Home</span>
      </NavLink>
      
      <NavLink to="/transactions" className={({ isActive }) => 
        `flex flex-col items-center ${isActive ? 'text-purple-600' : 'text-gray-500'}`
      }>
        <Wallet size={20} />
        <span className="text-xs mt-1">Finanças</span>
      </NavLink>
      
      <NavLink to="/goals" className={({ isActive }) => 
        `flex flex-col items-center ${isActive ? 'text-purple-600' : 'text-gray-500'}`
      }>
        <Target size={20} />
        <span className="text-xs mt-1">Metas</span>
      </NavLink>
      
      <NavLink to="/shopping" className={({ isActive }) => 
        `flex flex-col items-center ${isActive ? 'text-purple-600' : 'text-gray-500'}`
      }>
        <ShoppingCart size={20} />
        <span className="text-xs mt-1">Compras</span>
      </NavLink>
      
      <NavLink to="/profile" className={({ isActive }) => 
        `flex flex-col items-center ${isActive ? 'text-purple-600' : 'text-gray-500'}`
      }>
        <User size={20} />
        <span className="text-xs mt-1">Perfil</span>
      </NavLink>
    </nav>
  );
};
