import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'orange' | 'dark' | 'white';
  logoUrl?: string;
}

export default function Logo({ className = '', size = 42, variant = 'orange', logoUrl }: LogoProps) {
  // Determine CSS filter based on variant
  // Since the logo is dark/black, inverting it makes it white for dark footers.
  const filterStyle = variant === 'white' ? { filter: 'brightness(0) invert(1)' } : undefined;

  const currentLogo = logoUrl || "https://res.cloudinary.com/djjhol6dg/image/upload/v1783518180/20260708_194111_pcs7uw.png";

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={currentLogo}
        alt="Meca Learning"
        style={{ height: size, width: 'auto', ...filterStyle }}
        className="object-contain select-none max-w-full text-xs font-bold text-neutral-400"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
