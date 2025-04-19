const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
    const sizeMap = {
      sm: 'w-4 h-4',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
    };
    
    const colorMap = {
      primary: 'text-primary-600',
      white: 'text-white',
      gray: 'text-gray-600',
    };
    
    const spinnerSize = sizeMap[size];
    const spinnerColor = colorMap[color] || colorMap.primary;
    
    return (
      <div className={`${spinnerSize} ${spinnerColor} inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]`} role="status">
        <span className="sr-only">Loading...</span>
      </div>
    );
  };
  
  export default LoadingSpinner;
  