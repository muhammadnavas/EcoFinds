
const HeaderLogo = ({ onClick, className = '' }) => {
  const AppIconSVG = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Green leaf */}
      <path d="M20 50 Q50 20 80 50 Q50 30 20 50" fill="#22c55e" />
      {/* Purple leaf overlay */}
      <path d="M40 50 Q70 20 80 50 Q65 30 40 50" fill="#8b5cf6" />
      {/* Base arch - green */}
      <path d="M10 60 Q30 40 50 60 Q70 40 90 60 Q70 70 50 60 Q30 70 10 60" fill="#16a34a" />
      {/* Base arch - purple */}
      <path d="M20 70 Q40 50 60 70 Q80 50 90 70 Q80 80 60 70 Q40 80 20 70" fill="#7c3aed" />
    </svg>
  );

  const logoContent = (
    <div className={`flex items-center space-x-4 ${className}`}>
      <AppIconSVG />
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
