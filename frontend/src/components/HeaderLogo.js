
const HeaderLogo = ({ onClick, className = '' }) => {
  const AppIconPNG = () => (
    <img 
      src="/logo.png"
      alt="EcoFinds Logo"
      width="64" 
      height="64" 
      className="flex-shrink-0"
      style={{ objectFit: 'contain' }}
    />
  );

  const logoContent = (
    <div className={`flex items-center space-x-4 ${className}`}>
      <AppIconPNG />
      <div className="flex flex-col">
        <span className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
          EcoFinds
        </span>
        <span className="text-sm text-gray-500 font-medium -mt-1">
          Sustainable Marketplace
        </span>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className="transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-lg p-2"
      >
        {logoContent}
      </button>
    );
  }

  return logoContent;
};

export default HeaderLogo;
