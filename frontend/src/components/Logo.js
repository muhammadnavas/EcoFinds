const Logo = ({ 
  size = 'medium', 
  variant = 'full', 
  className = '',
  onClick 
}) => {
  const sizeConfig = {
    xs: { width: 24, height: 24, fontSize: 'text-sm', iconSize: 20, spacing: 'space-x-1' },
    small: { width: 32, height: 32, fontSize: 'text-base', iconSize: 24, spacing: 'space-x-2' },
    medium: { width: 40, height: 40, fontSize: 'text-lg', iconSize: 28, spacing: 'space-x-2' },
    large: { width: 48, height: 48, fontSize: 'text-xl', iconSize: 32, spacing: 'space-x-3' },
    xl: { width: 56, height: 56, fontSize: 'text-2xl', iconSize: 36, spacing: 'space-x-3' },
    '2xl': { width: 64, height: 64, fontSize: 'text-3xl', iconSize: 40, spacing: 'space-x-4' },
    '3xl': { width: 72, height: 72, fontSize: 'text-4xl', iconSize: 44, spacing: 'space-x-4' },
    header: { width: 48, height: 48, fontSize: 'text-xl', iconSize: 32, spacing: 'space-x-3' }
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  // EcoFinds Logo Icon - New Design with Green and Purple Leaves
  const LogoIcon = ({ width, height, className: iconClassName = '' }) => (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${iconClassName}`}
    >
      {/* Green leaf */}
      <path d="M9.6 24 Q24 9.6 38.4 24 Q24 14.4 9.6 24" fill="#22c55e" />
      {/* Purple leaf overlay */}
      <path d="M19.2 24 Q33.6 9.6 38.4 24 Q31.2 14.4 19.2 24" fill="#8b5cf6" />
      {/* Base arch - green */}
      <path d="M4.8 28.8 Q14.4 19.2 24 28.8 Q33.6 19.2 43.2 28.8 Q33.6 33.6 24 28.8 Q14.4 33.6 4.8 28.8" fill="#16a34a" />
      {/* Base arch - purple */}
      <path d="M9.6 33.6 Q19.2 24 28.8 33.6 Q38.4 24 43.2 33.6 Q38.4 38.4 28.8 33.6 Q19.2 38.4 9.6 33.6" fill="#7c3aed" />
    </svg>
  );

  // Logo variants with improved structure
  const renderLogo = () => {
    const baseClasses = `flex items-center transition-all duration-200 ${className}`;
    
    switch (variant) {
      case 'icon':
        return (
          <div className={baseClasses}>
            <LogoIcon 
              width={currentSize.width} 
              height={currentSize.height}
              className="hover:scale-105 transition-transform"
            />
          </div>
        );
        
      case 'text':
        return (
          <div className={baseClasses}>
            <span className={`font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent ${currentSize.fontSize} tracking-tight`}>
              EcoFinds
            </span>
          </div>
        );
        
      case 'full':
      default:
        return (
          <div className={`${baseClasses} ${currentSize.spacing}`}>
            <LogoIcon 
              width={currentSize.width} 
              height={currentSize.height}
              className="hover:scale-105 transition-transform"
            />
            <span className={`font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent ${currentSize.fontSize} tracking-tight`}>
              EcoFinds
            </span>
          </div>
        );
    }
  };

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className="transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-lg"
      >
        {renderLogo()}
      </button>
    );
  }

  return renderLogo();
};

// App Icon - A simplified version for favicons and small displays
export const AppIcon = ({ size = 32, className = '' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`flex-shrink-0 ${className}`}
  >
    {/* Green leaf */}
    <path d="M8 20 Q20 8 32 20 Q20 12 8 20" fill="#22c55e" />
    {/* Purple leaf overlay */}
    <path d="M16 20 Q28 8 32 20 Q26 12 16 20" fill="#8b5cf6" />
    {/* Base arch - green */}
    <path d="M4 24 Q12 16 20 24 Q28 16 36 24 Q28 28 20 24 Q12 28 4 24" fill="#16a34a" />
    {/* Base arch - purple */}
    <path d="M8 28 Q16 20 24 28 Q32 20 36 28 Q32 32 24 28 Q16 32 8 28" fill="#7c3aed" />
  </svg>
);

// Alternative simplified logo for small spaces
export const SimpleLogo = ({ size = 24, className = '' }) => (
  <div className={`flex items-center ${className}`}>
    <div className={`w-${size/4} h-${size/4} bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center`}>
      <span className="text-white font-bold text-xs">E</span>
    </div>
  </div>
);

// Logo for dark backgrounds
export const LogoDark = ({ size = 'medium', variant = 'full', className = '' }) => {
  const sizes = {
    small: { width: 80, height: 24, icon: 20, text: 'text-lg' },
    medium: { width: 120, height: 36, icon: 28, text: 'text-xl' },
    large: { width: 160, height: 48, icon: 36, text: 'text-2xl' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <svg 
        width={currentSize.icon} 
        height={currentSize.icon} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="18" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
        <path
          d="M12 20C12 16 15 12 20 12C25 12 28 16 28 20C28 24 25 28 20 28C18 28 16 26 15 24L20 20L12 20Z"
          fill="#10b981"
        />
        <g transform="translate(20, 20)">
          {[0, 120, 240].map((rotation, index) => (
            <path
              key={index}
              d="M-6 -8L-3 -5L-6 -2M-6 -5H3"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform={`rotate(${rotation})`}
            />
          ))}
        </g>
      </svg>
      {variant === 'full' && (
        <span className={`font-bold text-white ${currentSize.text}`}>
          EcoFinds
        </span>
      )}
    </div>
  );
};

export default Logo;
