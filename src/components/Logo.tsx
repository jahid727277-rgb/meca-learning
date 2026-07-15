import React from 'react';

const mecaLearningLogo = 'https://res.cloudinary.com/djjhol6dg/image/upload/v1784080493/meca_learning_logo_a3yqec.png';

interface LogoProps {
  className?: string;
  imgClassName?: string;
  size?: number;
  variant?: 'orange' | 'dark' | 'white';
  logoUrl?: string;
}

export default function Logo({ className = '', imgClassName = '', size = 42, variant = 'orange', logoUrl }: LogoProps) {
  // If there's a custom logoUrl uploaded by the user that is not a placeholder/local fallback,
  // we can render it. Otherwise, we render the imported logo asset.
  const hasCustomLogo = logoUrl && 
                        logoUrl !== '' && 
                        logoUrl !== 'meca_learning_logo.png' && 
                        logoUrl !== '/meca_learning_logo.png' &&
                        logoUrl !== './meca_learning_logo.png' &&
                        !logoUrl.includes('meca_learning_logo');

  const currentLogo = hasCustomLogo ? logoUrl : mecaLearningLogo;

  // On a dark background (variant === 'white'), the logo is naturally fully visible and needs no filter.
  const filterStyle = undefined;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={currentLogo}
        alt="Meca Learning"
        style={{ height: size, width: 'auto', ...filterStyle }}
        className={`object-contain select-none max-w-full ${imgClassName}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== mecaLearningLogo) {
            target.src = mecaLearningLogo;
          }
        }}
      />
    </div>
  );
}
