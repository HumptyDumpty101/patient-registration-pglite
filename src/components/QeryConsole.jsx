import { useState } from 'react';
import { usePGlite } from '../context/PGliteContext';

export default function QueryConsole() {
  const { pglite } = usePGlite();
  const [query, setQuery] = useState('SELECT * FROM patients');
  const [queryParams, setQueryParams] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
  };

  const handleParamsChange = (e) => {
    setQueryParams(e.target.value);
  };

  const parseParams = (paramsString) => {
    if (!paramsString.trim()) return [];
    
    try {
      // Try to parse as JSON array
      return JSON.parse(paramsString);
    } catch (e) {
      // If not valid JSON, split by comma and try to convert to appropriate types
      return paramsString.split(',').map(param => {
        const trimmed = param.trim();
        
        // Try to convert to number
        if (!isNaN(trimmed) && trimmed !== '') {
          return Number(trimmed);
        }
        
        // Handle boolean values
        if (trimmed.toLowerCase() === 'true') return true;
        if (trimmed.toLowerCase() === 'false') return false;
        if (trimmed.toLowerCase() === 'null') return null;
        
        // Default to string
        return trimmed;
      });
    }
  };

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = parseParams(queryParams);
      const result = await pglite.query(query, params);
      setResults(result);
    } catch (err) {
      console.error('Error executing query:', err);
      setError(err.message || 'An error occurred while executing the query');
    } finally {
      setLoading(false);
    }
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  const renderResultTable = () => {
    if (!results || !results.rows || !results.rows.length) {
      return (
        <div className="p-4 text-center text-gray-500">
          {results ? `Query executed successfully. ${results.rowCount} rows affected.` : 'No results to display'}
        </div>
      );
    }

    // Get column names from the first row
    const columns = Object.keys(results.rows[0]);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th 
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map(column => (
                  <td 
                    key={`${rowIndex}-${column}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {renderCellValue(row[column])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCellValue = (value) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">SQL Query Console</h2>
          <button
            onClick={toggleHelp}
            className="ml-2 text-lime-600 hover:text-lime-800 text-sm cursor-pointer"
          >
            {showHelp ? 'Hide Help' : 'Show Help'}
          </button>
        </div>
        
        {showHelp && (
          <div className="mb-4 p-3 bg-lime-50 rounded-md text-sm">
            <h3 className="font-medium text-blue-800 mb-2">Query Console Help:</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-900">
              <li>Enter your SQL query in the text area</li>
              <li>For parameterized queries, use $1, $2, etc. as placeholders</li>
              <li>Enter parameters as comma-separated values or a JSON array</li>
              <li>Example: <code className="bg-lime-100 px-1">SELECT * FROM patients WHERE id = $1</code> with parameter <code className="bg-lime-100 px-1">1</code></li>
              <li>Example queries:</li>
              <li className="pl-2"><code className="bg-lime-100 px-1">SELECT * FROM patients</code></li>
              <li className="pl-2"><code className="bg-lime-100 px-1">SELECT * FROM patients WHERE gender = $1</code> with parameter <code className="bg-lime-100 px-1">Female</code></li>
              <li className="pl-2"><code className="bg-lime-100 px-1">SELECT COUNT(*) FROM patients</code></li>
            </ul>
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SQL Query
            </label>
            <textarea
              value={query}
              onChange={handleQueryChange}
              rows="3"
              placeholder="Enter SQL query"
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Query Parameters (comma-separated or JSON array)
            </label>
            <input
              type="text"
              value={queryParams}
              onChange={handleParamsChange}
              placeholder="e.g., 1, 'test', true or [1, 'test', true]"
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
            />
          </div>
          
          <div>
            <button
              onClick={executeQuery}
              disabled={loading || !query.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md cursor-pointer ${
                loading || !query.trim()
                  ? 'bg-lime-400 cursor-not-allowed'
                  : 'bg-lime-600 hover:bg-lime-700'
              }`}
            >
              {loading ? 'Executing...' : 'Execute Query'}
            </button>
          </div>
        </div>
      </div>
      
      {error ? (
        <div className="p-4 bg-red-50 text-red-600 border-t border-red-200">
          <h3 className="font-medium mb-1">Error:</h3>
          <pre className="text-sm overflow-x-auto">{error}</pre>
        </div>
      ) : (
        <div className="border-t border-gray-200">
          <div className="p-4 bg-gray-50 text-gray-700 text-sm font-medium">
            Query Results {results?.rowCount !== undefined && `(${results.rowCount} rows)`}
          </div>
          {renderResultTable()}
        </div>
      )}
    </div>
  );
}