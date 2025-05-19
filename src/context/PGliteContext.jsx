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
            contact_number TEXT UNIQUE,
            email TEXT UNIQUE,
            address TEXT,
            medical_history TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Create unique indexes for email and contact number
        // These will allow for NULL values while ensuring uniqueness for non-NULL values
        await db.exec(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_email ON patients (email) 
          WHERE email IS NOT NULL;
        `);

        await db.exec(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_contact_number ON patients (contact_number) 
          WHERE contact_number IS NOT NULL;
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
      // Nothing to clean up for now
    };
  }, []);

  // Helper function to check if a patient already exists
  const checkPatientExists = async (field, value) => {
    if (!value || !pglite) return false;
    
    try {
      const query = `SELECT COUNT(*) as count FROM patients WHERE ${field} = $1`;
      const result = await pglite.query(query, [value]);
      return result.rows[0].count > 0;
    } catch (err) {
      console.error(`Error checking existing ${field}:`, err);
      throw err;
    }
  };

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
        // Check if it's a uniqueness constraint violation
        if (err.message.includes('UNIQUE constraint failed')) {
          if (err.message.includes('idx_patients_email')) {
            throw new Error('A patient with this email already exists');
          } else if (err.message.includes('idx_patients_contact_number')) {
            throw new Error('A patient with this contact number already exists');
          }
        }
        throw err;
      }
    },
    checkEmailExists: async (email) => {
      return checkPatientExists('email', email);
    },
    checkContactExists: async (contactNumber) => {
      return checkPatientExists('contact_number', contactNumber);
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