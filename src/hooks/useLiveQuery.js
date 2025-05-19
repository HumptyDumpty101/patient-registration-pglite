import { useState, useEffect } from 'react';
import { usePGlite } from '../context/PGliteContext';

/**
 * Custom hook for PGlite live queries
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} - Query results, loading state, and error
 */
export function useLiveQuery(query, params = []) {
  const { pglite, loading, error } = usePGlite();
  const [data, setData] = useState([]);
  const [queryLoading, setQueryLoading] = useState(true);
  const [queryError, setQueryError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;

    const setupLiveQuery = async () => {
      if (!pglite) return;
      
      try {
        // Set up the live query
        const subscription = pglite.live.query(query, params, (result) => {
          setData(result.rows);
          setQueryLoading(false);
        });
        
        unsubscribe = subscription.unsubscribe;
      } catch (err) {
        console.error('Error setting up live query:', err);
        setQueryError(err);
        setQueryLoading(false);
      }
    };

    setupLiveQuery();

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [pglite, query, JSON.stringify(params)]);

  return {
    data,
    loading: loading || queryLoading,
    error: error || queryError,
    refetch: async () => {
      try {
        if (!pglite) return;
        const result = await pglite.query(query, params);
        setData(result.rows);
        return result.rows;
      } catch (err) {
        console.error('Error refetching data:', err);
        setQueryError(err);
        throw err;
      }
    }
  };
}