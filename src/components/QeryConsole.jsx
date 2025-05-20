import { useState, useEffect } from "react";
import { usePGlite } from "../context/PGliteContext";

export default function QueryConsole() {
  const { pglite } = usePGlite();
  const [query, setQuery] = useState("SELECT * FROM patients LIMIT 10");
  const [queryParams, setQueryParams] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load query history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("queryHistory");
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch (err) {
        console.error("Error loading query history:", err);
      }
    }
  }, []);

  // Save query history to localStorage
  useEffect(() => {
    if (queryHistory.length > 0) {
      localStorage.setItem("queryHistory", JSON.stringify(queryHistory));
    }
  }, [queryHistory]);

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
      const parsed = JSON.parse(paramsString);
      // Ensure the result is an array
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // If not valid JSON, split by comma and try to convert to appropriate types
      return paramsString.split(",").map((param) => {
        const trimmed = param.trim();

        // Try to convert to number
        if (!isNaN(trimmed) && trimmed !== "") {
          return Number(trimmed);
        }

        // Handle boolean values
        if (trimmed.toLowerCase() === "true") return true;
        if (trimmed.toLowerCase() === "false") return false;
        if (trimmed.toLowerCase() === "null") return null;

        // Default to string
        return trimmed;
      });
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const params = parseParams(queryParams);
      console.log("Executing query with params:", params); // Debug log
      const result = await pglite.query(query, params);
      setResults(result);

      // Add to history if not already the last item
      if (queryHistory.length === 0 || queryHistory[0].query !== query) {
        const newHistory = [
          { query, params: queryParams },
          ...queryHistory.slice(0, 9), // Limit to 10 entries
        ];
        setQueryHistory(newHistory);
      }

      setHistoryIndex(-1);
    } catch (err) {
      console.error("Error executing query:", err);
      setError(err.message || "An error occurred while executing the query");
    } finally {
      setLoading(false);
    }
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  const selectHistoryItem = (index) => {
    const item = queryHistory[index];
    setQuery(item.query);
    setQueryParams(item.params || "");
    setHistoryIndex(index);
  };

  const renderResultTable = () => {
    if (!results || !results.rows || !results.rows.length) {
      return (
        <div className="p-4 text-center text-gray-500">
          {results
            ? `Query executed successfully. ${results.rowCount} rows affected.`
            : "No results to display"}
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
              {columns.map((column) => (
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
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
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
    if (value === null || value === undefined) return "—";

    if (typeof value === "object") {
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      return JSON.stringify(value);
    }

    if (typeof value === "boolean") return value ? "true" : "false";

    return String(value);
  };

  // Sample queries for quick insertion
  const sampleQueries = [
    { name: "All Patients", query: "SELECT * FROM patients" },
    { name: "Patient Count", query: "SELECT COUNT(*) FROM patients" },
    {
      name: "Patient by Gender",
      query: "SELECT gender, COUNT(*) FROM patients GROUP BY gender",
    },
    {
      name: "Recent Patients",
      query: "SELECT * FROM patients ORDER BY created_at DESC LIMIT 5",
    },
    {
      name: "Patient by ID",
      query: "SELECT * FROM patients WHERE id = $1",
      params: "1",
    },
  ];

  const insertSampleQuery = (sample) => {
    setQuery(sample.query);
    setQueryParams(sample.params || "");
  };

  const handleKeyDown = (e) => {
    // Execute query with Ctrl+Enter
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      executeQuery();
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">SQL Query Console</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleHelp}
              className="text-lime-600 hover:text-lime-800 text-sm cursor-pointer"
            >
              {showHelp ? "Hide Help" : "Show Help"}
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="mb-4 p-3 bg-lime-50 rounded-md text-sm">
            <h3 className="font-medium text-blue-800 mb-2">
              Query Console Help:
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-900">
              <li>Enter your SQL query in the text area</li>
              <li>
                For parameterized queries, use $1, $2, etc. as placeholders
              </li>
              <li>
                Enter parameters as comma-separated values or a JSON array
              </li>
              <li>
                Press{" "}
                <kbd className="bg-gray-200 px-1 py-0.5 rounded">
                  Ctrl+Enter
                </kbd>{" "}
                or{" "}
                <kbd className="bg-gray-200 px-1 py-0.5 rounded">⌘+Enter</kbd>{" "}
                to execute the query
              </li>
              <li>
                Example:{" "}
                <code className="bg-lime-100 px-1">
                  SELECT * FROM patients WHERE id = $1
                </code>{" "}
                with parameter <code className="bg-lime-100 px-1">1</code>
              </li>
              <li>Your query history is saved for future use</li>
            </ul>
          </div>
        )}

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Sample Queries:
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sample, index) => (
              <button
                key={index}
                onClick={() => insertSampleQuery(sample)}
                className="px-2 py-1 text-xs text-lime-700 bg-lime-50 rounded border border-lime-200 hover:bg-lime-100"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SQL Query
                <span className="text-gray-500 text-xs ml-2">
                  (Ctrl+Enter to execute)
                </span>
              </label>
              <textarea
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                rows="4"
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
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  loading || !query.trim()
                    ? "bg-lime-400 cursor-not-allowed"
                    : "bg-lime-600 hover:bg-lime-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Executing...
                  </span>
                ) : (
                  "Execute Query"
                )}
              </button>
            </div>
          </div>

          {queryHistory.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recent Queries
              </label>
              <div className="border border-gray-300 rounded-md max-h-[192px] overflow-y-auto">
                {queryHistory.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => selectHistoryItem(index)}
                    className={`p-2 text-xs cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0 truncate ${
                      index === historyIndex ? "bg-lime-50" : ""
                    }`}
                  >
                    <div className="font-mono truncate">{item.query}</div>
                    {item.params && (
                      <div className="text-gray-500 truncate">
                        Params: {item.params}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 border-t border-red-200">
          <h3 className="font-medium mb-1">Error:</h3>
          <pre className="text-sm overflow-x-auto p-2 bg-red-100 rounded">
            {error}
          </pre>
        </div>
      ) : (
        <div className="border-t border-gray-200">
          <div className="p-4 bg-gray-50 text-gray-700 text-sm font-medium flex justify-between items-center">
            <span>
              Query Results{" "}
              {results?.rowCount !== undefined && `(${results.rowCount} rows)`}
            </span>
            {results && results.rowCount > 0 && (
              <button
                onClick={() => {
                  const csvContent = createCSV(results);
                  const blob = new Blob([csvContent], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", "query_results.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="text-lime-600 hover:text-lime-800 text-xs"
              >
                Export as CSV
              </button>
            )}
          </div>
          {renderResultTable()}
        </div>
      )}
    </div>
  );
}

// Helper function to create CSV content from query results
function createCSV(results) {
  if (!results || !results.rows || !results.rows.length) return "";

  const columns = Object.keys(results.rows[0]);
  const header = columns.join(",");

  const rows = results.rows.map((row) => {
    return columns
      .map((col) => {
        const value = row[col];
        if (value === null || value === undefined) return "";
        if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
        if (typeof value === "object")
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return value;
      })
      .join(",");
  });

  return [header, ...rows].join("\n");
}
