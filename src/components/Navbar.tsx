import React from 'react';
import Logo from './Logo';
import { BookOpen, Trophy, Compass, User, Flame } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  streak: number;
  totalHours: number;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  logoUrl?: string;
  isAdmin?: boolean;
}

export default function Navbar({ 
  currentView, 
  onNavigate, 
  streak, 
  totalHours,
  user,
  onSignIn,
  onSignOut,
  logoUrl,
  isAdmin = false
}: NavbarProps) {
  const navItems = [
    { id: 'explore', label: 'Explore Courses', icon: Compass },
    { id: 'my-learning', label: 'My Learning', icon: BookOpen },
    { id: 'dashboard', label: 'Dashboard', icon: Trophy },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-orange-100/20 bg-white/30 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div 
          onClick={() => onNavigate('explore')} 
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Logo size={40} variant="orange" logoUrl={logoUrl} />
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'my-learning' && currentView === 'classroom');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/50 backdrop-blur-xl border border-orange-200/30 text-orange-700'
                    : 'text-neutral-600 hover:text-orange-600 hover:bg-white/30 hover:backdrop-blur-xl'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Side - Study Stats & Profile */}
        <div className="flex items-center gap-4">
          {/* Study Hours Badge */}
          <div 
            title="Total Active Study Hours"
            className="hidden sm:flex items-center gap-1 bg-white/40 backdrop-blur-xl text-orange-700 px-3 py-1 rounded-full text-xs font-semibold border border-orange-100/30"
          >
            <Trophy className="w-4 h-4 text-orange-500" />
            <span>{totalHours.toFixed(1)} hrs</span>
          </div>

          {user ? (
            <div className="flex items-center">
              <button 
                onClick={() => onNavigate('dashboard')}
                title="Go to Dashboard"
                className="flex items-center justify-center hover:scale-105 transition-transform"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    className="w-9 h-9 rounded-full border-2 border-neutral-900 object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100 text-orange-700 border-2 border-neutral-900 font-bold text-sm shadow-sm">
                    {(user.displayName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-4.5 py-1.5 rounded-xl bg-neutral-900/80 text-white text-xs font-bold hover:bg-neutral-900 transition-all shadow-xs cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-orange-100/20 bg-white/30 backdrop-blur-2xl">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'my-learning' && currentView === 'classroom');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 text-xs font-medium transition-all rounded-lg ${
                  isActive 
                    ? 'text-orange-700 bg-white/50 backdrop-blur-xl' 
                    : 'text-neutral-500 hover:text-orange-600 hover:bg-white/30 hover:backdrop-blur-xl'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
