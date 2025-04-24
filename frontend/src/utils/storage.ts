/**
 *
 * @param key - The key to retrieve from localStorage.
 * @returns The value associated with the key, or undefined if not found.
 */
export const getLocalStorageValue = (key: string): string | undefined => {
  try {
    const item = localStorage.getItem(key);
    return item ? item : undefined;
  } catch (error) {
    console.error("Error accessing localStorage:", error);
    return undefined;
  }
};

/**
 *
 * @param key - The key to store in localStorage.
 * @param value - The value to associate with the key.
 */
export const setLocalStorageValue = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("Error setting localStorage value:", error);
  }
};
