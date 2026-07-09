import React from 'react';
import mecaLogo from '../assets/images/meca_learning_logo.png';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'orange' | 'dark' | 'white';
  logoUrl?: string;
}

export default function Logo({ className = '', size = 42, variant = 'orange', logoUrl }: LogoProps) {
  // If there's a custom logoUrl uploaded by the user that is not a placeholder/local fallback,
  // we can render it. Otherwise, we render the imported local logo.
  const hasCustomLogo = logoUrl && 
                        logoUrl !== '' && 
                        logoUrl !== '/meca_learning_logo.png' && 
                        !logoUrl.includes('cloudinary.com');

  const currentLogo = hasCustomLogo ? logoUrl : mecaLogo;

  // Since the logo is dark/black, inverting it makes it white for dark footers.
  const filterStyle = variant === 'white' ? { filter: 'brightness(0) invert(1)' } : undefined;

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={currentLogo}
        alt="Meca Learning"
        style={{ height: size, width: 'auto', ...filterStyle }}
        className="object-contain select-none max-w-full text-xs font-bold text-neutral-400"
        referrerPolicy="no-referrer"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== mecaLogo) {
            target.src = mecaLogo;
          }
        }}
      />
    </div>
  );
}
