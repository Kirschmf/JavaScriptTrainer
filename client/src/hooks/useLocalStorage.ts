import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get stored value from localStorage or use initial value
  const readValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Dispatch a custom event so other instances can update
      window.dispatchEvent(new Event("local-storage-change"));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to localStorage to keep all instances in sync
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // Handle the event
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage-change", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage-change", handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
}
