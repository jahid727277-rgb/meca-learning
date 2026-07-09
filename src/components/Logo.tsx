import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'orange' | 'dark' | 'white';
  logoUrl?: string;
}

export default function Logo({ className = '', size = 42, variant = 'orange', logoUrl }: LogoProps) {
  // If there's a custom logoUrl uploaded by the user that is not a placeholder/local fallback,
  // we can render it. Otherwise, we render the high-fidelity SVG of the new logo.
  const hasCustomLogo = logoUrl && 
                        logoUrl !== '' && 
                        logoUrl !== '/meca_learning_logo.png' && 
                        !logoUrl.includes('cloudinary.com');

  // Set colors based on variant
  const textColor = variant === 'white' ? 'text-white' : 'text-neutral-900';
  const iconColor = variant === 'white' ? 'text-white' : 'text-neutral-900';

  if (hasCustomLogo) {
    const filterStyle = variant === 'white' ? { filter: 'brightness(0) invert(1)' } : undefined;
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={logoUrl}
          alt="Meca Learning"
          style={{ height: size, width: 'auto', ...filterStyle }}
          className="object-contain select-none max-w-full text-xs font-bold text-neutral-400"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Render the beautiful high-fidelity SVG of the new logo
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* SVG Icon Mark */}
      <svg
        viewBox="0 0 120 120"
        style={{ height: size, width: size }}
        className={`${iconColor} flex-shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bubbles on bottom-left */}
        <circle cx="28" cy="85" r="5" fill="currentColor" />
        <circle cx="18" cy="74" r="4.5" fill="currentColor" />
        <circle cx="23" cy="98" r="3.5" fill="currentColor" />
        <circle cx="34" cy="106" r="3" fill="currentColor" />
        <circle cx="12" cy="88" r="2.5" fill="currentColor" />

        {/* Main circular blob */}
        <path
          d="M 65 35 C 84.33 35 100 50.67 100 70 C 100 89.33 84.33 105 65 105 C 45.67 105 32 91 32 70 C 32 49 45.67 35 65 35 Z"
          fill="currentColor"
        />

        {/* Rounded bold "ml" white path inside circle */}
        {/* "m" path */}
        <path
          d="M 44 78 L 44 62 C 44 56.5 47.5 53 52 53 C 56.5 53 60 56.5 60 62 L 60 78 M 60 62 C 60 56.5 64.5 53 69 53 C 73.5 53 77 56.5 77 62 L 77 78"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* "l" path */}
        <path
          d="M 87 46 L 87 78"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* Graduation cap top */}
        <path
          d="M 65 8 L 115 23 L 65 38 L 15 23 Z"
          fill="currentColor"
        />

        {/* Cap band */}
        <path
          d="M 42 27 L 42 34 Q 65 44 88 34 L 88 27 Z"
          fill="currentColor"
        />

        {/* Tassel line */}
        <path
          d="M 65 23 L 100 28 L 100 46"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Tassel dot */}
        <circle cx="100" cy="49" r="2.5" fill="currentColor" />
      </svg>

      {/* Text "Meca Learning" */}
      <span 
        style={{ fontSize: size * 0.52 }}
        className={`font-sans font-extrabold tracking-tight select-none whitespace-nowrap ${textColor}`}
      >
        Meca Learning
      </span>
    </div>
  );
}
