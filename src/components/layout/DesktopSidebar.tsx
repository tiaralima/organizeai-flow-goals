import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Wallet, Target, User, BrainCircuit } from 'lucide-react';

export const DesktopSidebar = () => {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-purple-500/20 bg-slate-900/60 backdrop-blur-xl md:fixed md:h-screen z-20">
      <div className="h-20 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-white" />
          <span className="font-semibold text-white">OrganizeAI</span>
        </div>
      </div>

      <nav className="px-3 py-4 space-y-1">
        <SidebarLink to="/" icon={<Home size={18} />} label="Home" />
        <SidebarLink to="/transactions" icon={<Wallet size={18} />} label="Finanças" />
        <SidebarLink to="/goals" icon={<Target size={18} />} label="Metas" />
        <SidebarLink to="/profile" icon={<User size={18} />} label="Perfil" />
      </nav>

      <div className="mt-auto p-4 text-xs text-white">
        <div className="glass-card p-3 border-purple-500/20">
          <p className="leading-relaxed">Tenha controle total das suas finanças com um design elegante e sofisticado.</p>
        </div>
      </div>
    </aside>
  );
};

type SidebarLinkProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
};

const SidebarLink = ({ to, icon, label }: SidebarLinkProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
        isActive
          ? 'bg-gradient-to-r from-purple-600/20 to-purple-400/20 text-white border border-purple-500/30'
          : 'hover:bg-slate-800/50 text-white/80'
      }`
    }
  >
    <span className="text-white">{icon}</span>
    <span className="font-medium text-white">{label}</span>
  </NavLink>
);

export default DesktopSidebar;