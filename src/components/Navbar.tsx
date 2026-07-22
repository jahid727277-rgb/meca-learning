import React from 'react';
import Logo from './Logo';
import ImageWithSkeleton from './ImageWithSkeleton';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

const HouseDoorIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
  </svg>
);

const EaselIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M8 0a.5.5 0 0 1 .473.337L9.046 2H14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1.85l1.323 3.837a.5.5 0 1 1-.946.326L11.092 11H8.5v3a.5.5 0 0 1-1 0v-3H4.908l-1.435 4.163a.5.5 0 1 1-.946-.326L3.85 11H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h4.954L7.527.337A.5.5 0 0 1 8 0M2 3v7h12V3z"/>
  </svg>
);

const PersonSquareIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className={className}>
    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
    <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
  </svg>
);

interface NavbarProps {
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  logoUrl?: string;
  isAdmin?: boolean;
}

export default function Navbar({ 
  user,
  onSignIn,
  onSignOut,
  logoUrl,
  isAdmin = false
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: '', label: 'Explore Courses', icon: HouseDoorIcon },
    { id: 'my-learning', label: 'My Learning', icon: EaselIcon },
    { id: 'dashboard', label: 'Dashboard', icon: PersonSquareIcon },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-orange-100/20 bg-white/30 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div 
          onClick={() => handleNavClick('/')} 
          className="cursor-pointer hover:opacity-90 transition-opacity flex items-center"
        >
          <Logo size={44} variant="orange" logoUrl={logoUrl} />
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const path = `/${item.id}`;
            const isActive = location.pathname === path || (item.id === 'my-learning' && location.pathname.startsWith('/classroom/'));
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(path)}
                title={item.label}
                aria-label={item.label}
                className={`flex items-center justify-center p-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-white/50 backdrop-blur-xl border border-orange-200/30 text-orange-700'
                    : 'text-neutral-600 hover:text-orange-600 hover:bg-white/30 hover:backdrop-blur-xl'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </nav>

        {/* Right Side - Profile */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard')}
                title="Go to Dashboard"
                className="flex items-center justify-center hover:scale-105 transition-transform"
              >
                {user.photoURL ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-neutral-900 shadow-sm shrink-0">
                    <ImageWithSkeleton 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      containerClassName="w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 border-2 border-neutral-900 font-bold text-xs shadow-sm">
                    {(user.displayName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-neutral-900/80 text-white text-xs font-bold hover:bg-neutral-900 transition-all shadow-xs cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-orange-100/20 bg-white/30 backdrop-blur-2xl">
        <div className="flex justify-around py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const path = `/${item.id}`;
            const isActive = location.pathname === path || (item.id === 'my-learning' && location.pathname.startsWith('/classroom/'));
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(path)}
                title={item.label}
                aria-label={item.label}
                className={`flex items-center justify-center p-2 transition-all rounded-lg ${
                  isActive 
                    ? 'text-orange-700 bg-white/50 backdrop-blur-xl' 
                    : 'text-neutral-500 hover:text-orange-600 hover:bg-white/30 hover:backdrop-blur-xl'
                }`}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
