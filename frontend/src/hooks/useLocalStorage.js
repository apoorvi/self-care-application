import { useState } from 'react';

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStored = (newValue) => {
    try {
      const toStore = typeof newValue === 'function' ? newValue(value) : newValue;
      setValue(toStore);
      localStorage.setItem(key, JSON.stringify(toStore));
    } catch {
      setValue(newValue);
    }
  };

  return [value, setStored];
}
