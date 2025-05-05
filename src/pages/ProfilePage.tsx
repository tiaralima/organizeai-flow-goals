
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateProfile, signOut } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    // Buscar dados do perfil
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        setProfileData(data);
        setName(data.name || user.user_metadata.name || '');
        setEmail(user.email || '');
        setPhoto(data.photo_url || null);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile({
        name,
        email: email !== user?.email ? email : undefined,
        photo_url: photo
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create data URL for preview
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user || loadingProfile) return (
    <AppLayout>
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Perfil 👤</h1>
        <p className="text-muted-foreground">Atualize suas informações</p>
      </div>
      
      <div className="glass-card p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              {photo ? (
                <img 
                  src={photo} 
                  alt={name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                  <User className="text-white" size={36} />
                </div>
              )}
              
              <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full cursor-pointer text-white hover:bg-purple-600 transition-colors">
                <Camera size={16} />
                <input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input 
                className="glass-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input 
                className="glass-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Senha (deixe em branco para não alterar)</label>
              <Input 
                className="glass-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-opacity"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : 'Salvar alterações'}
          </Button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/30">
          <Button 
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            Sair da conta
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
