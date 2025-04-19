import React from 'react';

// A simple wrapper component that mimics PersistGate functionality
const CustomPersistGate = ({ loading, persistor, children }) => {
  const [bootstrapped, setBootstrapped] = React.useState(false);
  
  React.useEffect(() => {
    // Subscribe to the persistor's bootstrapped state
    const unsubscribe = persistor.subscribe(() => {
      // Get the current state of the persistor
      const { bootstrapped } = persistor.getState();
      if (bootstrapped) {
        setBootstrapped(true);
        unsubscribe();
      }
    });
    
    // Check if already bootstrapped
    const { bootstrapped: initialBootstrapped } = persistor.getState();
    if (initialBootstrapped) {
      setBootstrapped(true);
      unsubscribe();
    }
    
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [persistor]);
  
  if (loading && !bootstrapped) {
    return loading;
  }
  
  return children;
};

export { CustomPersistGate };
