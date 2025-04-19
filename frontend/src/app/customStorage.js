// Custom storage implementation for redux-persist
const createCustomStorage = () => {
    return {
      getItem: (key) => {
        const value = localStorage.getItem(key);
        return Promise.resolve(value);
      },
      setItem: (key, value) => {
        localStorage.setItem(key, value);
        return Promise.resolve(true);
      },
      removeItem: (key) => {
        localStorage.removeItem(key);
        return Promise.resolve();
      }
    };
  };
  
  const customStorage = createCustomStorage();
  
  export default customStorage;
  
  
