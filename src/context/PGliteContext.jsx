import { createContext, useContext, useEffect, useState } from 'react';
import { PGliteWorker } from '@electric-sql/pglite/worker';
import { live } from '@electric-sql/pglite/live';

const PGliteContext = createContext(null);

// Provider component
export function PGliteProvider({ children }) {
  const [pglite, setPGlite] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize PGlite
  useEffect(() => {
    const initPGlite = async () => {
      try {
        // Create PGlite worker
        const db = await PGliteWorker.create(
          new Worker(new URL('../worker/pglite-worker.js', import.meta.url), { 
            type: 'module' 
          }),
          {
            extensions: { live }
          }
        );

        // Setup schema for patients
        await db.exec(`
          CREATE TABLE IF NOT EXISTS patients (
            id SERIAL PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            date_of_birth DATE NOT NULL,
            gender TEXT NOT NULL,
            contact_number TEXT,
            email TEXT,
            address TEXT,
            medical_history TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Set initial leader status for multitab setup
        setIsLeader(db.isLeader);

        // Listen for leader changes
        db.onLeaderChange(() => {
          setIsLeader(db.isLeader);
        });

        setPGlite(db);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing PGlite:', err);
        setError(err);
        setLoading(false);
      }
    };

    initPGlite();

    // Cleanup function
    return () => {
     
    };
  }, []);

  // Context value
  const value = {
    pglite,
    isLeader,
    loading,
    error,
    executeQuery: async (query, params = []) => {
      if (!pglite) throw new Error('Database not initialized');
      try {
        return await pglite.query(query, params);
      } catch (err) {
        console.error('Error executing query:', err);
        throw err;
      }
    }
  };

  return (
    <PGliteContext.Provider value={value}>
      {children}
    </PGliteContext.Provider>
  );
}

// Hook for using PGlite in components
export function usePGlite() {
  const context = useContext(PGliteContext);
  if (!context) {
    throw new Error('usePGlite must be used within a PGliteProvider');
  }
  return context;
}