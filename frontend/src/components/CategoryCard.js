
const CategoryCard = ({ 
  category, 
  isSelected = false, 
  onClick, 
  showProductCount = true,
  size = 'medium',
  className = ''
}) => {
  const sizeConfig = {
    small: {
      container: 'p-3',
      icon: 'w-8 h-8 text-lg',
      title: 'text-sm font-medium',
      count: 'text-xs',
      minHeight: 'min-h-[80px]'
    },
    medium: {
      container: 'p-4',
      icon: 'w-12 h-12 text-xl',
      title: 'text-base font-semibold',
      count: 'text-sm',
      minHeight: 'min-h-[100px]'
    },
    large: {
      container: 'p-6',
      icon: 'w-16 h-16 text-2xl',
      title: 'text-lg font-bold',
      count: 'text-base',
      minHeight: 'min-h-[120px]'
    }
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  const handleClick = () => {
    if (onClick) {
      onClick(category);
    }
  };

  const getIconStyle = () => {
    const baseOpacity = isSelected ? '100' : '20';
    const iconColor = category.color || '#10b981';
    
    return {
      backgroundColor: `${iconColor}${baseOpacity}`,
      color: isSelected ? '#ffffff' : iconColor,
      borderColor: iconColor
    };
  };

  const getBorderStyle = () => {
    if (isSelected) {
      return {
        borderColor: category.color || '#10b981',
        borderWidth: '2px',
        boxShadow: `0 0 0 3px ${category.color || '#10b981'}20`
      };
    }
    return {};
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative bg-white rounded-xl border-2 border-gray-200 
        ${currentSize.container} ${currentSize.minHeight}
        cursor-pointer transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-105 hover:-translate-y-1
        ${isSelected ? 'shadow-lg scale-105' : 'hover:border-gray-300'}
        ${className}
      `}
      style={getBorderStyle()}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div 
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: category.color || '#10b981' }}
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Category Content */}
      <div className="flex flex-col items-center text-center space-y-2">
        {/* Icon */}
        <div 
          className={`
            ${currentSize.icon} rounded-full border-2 
            flex items-center justify-center
            transition-all duration-300
          `}
          style={getIconStyle()}
        >
          <span className="font-semibold">
            {category.icon || '🏷️'}
          </span>
        </div>

        {/* Title */}
        <h3 className={`${currentSize.title} text-gray-900 leading-tight`}>
          {category.name}
        </h3>

        {/* Product Count */}
        {showProductCount && (
          <p className={`${currentSize.count} text-gray-500`}>
            {category.productCount || 0} {category.productCount === 1 ? 'item' : 'items'}
          </p>
        )}

        {/* Description for larger sizes */}
        {size === 'large' && category.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mt-1">
            {category.description}
          </p>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-gray-50 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default CategoryCard;
