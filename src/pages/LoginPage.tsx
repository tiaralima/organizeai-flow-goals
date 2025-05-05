
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppLayout } from '@/components/layout/AppLayout';

const LoginPage = () => {
  return (
    <AppLayout hideNavigation>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              OrganizeAI
            </h1>
            <p className="text-muted-foreground">Organize seus objetivos financeiros</p>
          </div>
          
          <div className="glass-card p-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LoginPage;
