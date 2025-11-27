import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to trigger a callback when the route changes
 * Useful for auto-closing modals, resetting component state, etc.
 * 
 * @param callback - Function to call when route changes
 * @param dependencies - Optional dependencies array (similar to useEffect)
 */
export const useRouteChangeEffect = (
  callback: () => void,
  dependencies: any[] = []
): void => {
  const location = useLocation();

  useEffect(() => {
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, ...dependencies]);
};

export default useRouteChangeEffect;