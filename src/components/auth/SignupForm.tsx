
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const SignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, name);
      if (!error) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-foreground dark:text-purple-100">Cadastro 📝</h1>
        <p className="text-white">Crie sua conta para começar</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Input
            className="glass-input"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Input
            className="glass-input" 
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Input
            className="glass-input"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <div className="space-y-2">
          <Input
            className="glass-input"
            type="password"
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-opacity"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : 'Cadastrar'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-white">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-purple-600 dark:text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};
