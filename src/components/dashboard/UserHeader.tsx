import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

type UserHeaderProps = {
  userName: string;
  photoURL?: string;
};

export const UserHeader = ({ userName, photoURL }: UserHeaderProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {userName} 👋</h1>
        <p className="text-muted-foreground">Bem-vindo de volta!</p>
      </div>
      
      <Link to="/profile" className="block">
        {photoURL ? (
          <img 
            src={photoURL} 
            alt={userName} 
            className="h-12 w-12 rounded-full object-cover ring-2 ring-purple-500"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center ring-2 ring-white/50">
            <span className="text-white font-medium text-lg">
              {getInitials(userName)}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
};
