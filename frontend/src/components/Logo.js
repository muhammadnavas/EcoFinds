const Logo = ({ 
  size = 'medium', 
  variant = 'full', 
  className = '',
  onClick 
}) => {
  const sizeConfig = {
    xs: { width: 24, height: 24, fontSize: 'text-sm', spacing: 'space-x-1' },
    small: { width: 32, height: 32, fontSize: 'text-base', spacing: 'space-x-2' },
    medium: { width: 40, height: 40, fontSize: 'text-lg', spacing: 'space-x-2' },
    large: { width: 48, height: 48, fontSize: 'text-xl', spacing: 'space-x-3' },
    xl: { width: 56, height: 56, fontSize: 'text-2xl', spacing: 'space-x-3' },
    '2xl': { width: 64, height: 64, fontSize: 'text-3xl', spacing: 'space-x-4' },
    '3xl': { width: 72, height: 72, fontSize: 'text-4xl', spacing: 'space-x-4' },
    header: { width: 48, height: 48, fontSize: 'text-xl', spacing: 'space-x-3' }
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  // EcoFinds Logo using PNG file
  const LogoIcon = ({ width, height, className: iconClassName = '' }) => (
    <img 
      src="/logo.png"
      alt="EcoFinds Logo"
      width={width} 
      height={height} 
      className={`flex-shrink-0 hover:scale-105 transition-transform ${iconClassName}`}
      style={{ objectFit: 'contain' }}
    />
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

// App Icon - Using PNG file
export const AppIcon = ({ size = 32, className = '' }) => (
  <img 
    src="/logo.png"
    alt="EcoFinds Icon"
    width={size} 
    height={size} 
    className={`flex-shrink-0 ${className}`}
    style={{ objectFit: 'contain' }}
  />
);

// Alternative simplified logo for small spaces
export const SimpleLogo = ({ size = 24, className = '' }) => (
  <img 
    src="/logo.png"
    alt="EcoFinds Logo"
    width={size} 
    height={size} 
    className={`flex-shrink-0 ${className}`}
    style={{ objectFit: 'contain' }}
  />
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
      <div className="bg-white rounded-lg p-1">
        <img 
          src="/logo.png"
          alt="EcoFinds Logo"
          width={currentSize.icon} 
          height={currentSize.icon} 
          className="flex-shrink-0"
          style={{ objectFit: 'contain' }}
        />
      </div>
      {variant === 'full' && (
        <span className={`font-bold text-white ${currentSize.text}`}>
          EcoFinds
        </span>
      )}
    </div>
  );
};

export default Logo;
