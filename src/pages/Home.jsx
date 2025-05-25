import { Link } from 'react-router-dom';
import PatientList from '../components/PatientList';
import { useLiveQuery } from '../hooks/useLiveQuery';

export default function Home() {
  // Get count of patients for the dashboard
  // Using the most basic SQL that should be supported by any SQL engine
  const { data: patientStats } = useLiveQuery(`
    SELECT 
      COUNT(*) as total_patients,
      COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_patients,
      COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_patients,
      COUNT(CASE WHEN gender NOT IN ('Male', 'Female') THEN 1 END) as other_patients,
      COUNT(*) as new_today
    FROM patients
  `);

  const stats = patientStats?.[0] || {
    total_patients: 0,
    male_patients: 0,
    female_patients: 0,
    other_patients: 0,
    new_today: 0
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0 w-full">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight break-words">
            Patient Management Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
            Manage your patients with our easy to use registration system
          </p>
        </div>
        
        <Link 
          to="/register" 
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 !text-white bg-lime-600 rounded-md hover:bg-lime-700 shadow-sm text-sm font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Register New Patient
        </Link>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-lime-600">{stats.total_patients}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Patients</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.male_patients}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Male</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-pink-600">{stats.female_patients}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Female</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.other_patients}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Other</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 text-center col-span-2 sm:col-span-1">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.new_today}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Registered</div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
          <Link 
            to="/register" 
            className="flex items-center p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="bg-lime-100 p-3 rounded-full mr-3 group-hover:bg-lime-200 transition-colors">
              <svg className="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 text-sm sm:text-base">Add New Patient</h3>
              <p className="text-gray-600 text-xs sm:text-sm truncate">Register a new patient in the system</p>
            </div>
          </Link>
          
          <Link 
            to="/query" 
            className="flex items-center p-4 hover:bg-gray-50 transition-colors group"
          >
            <div className="bg-blue-100 p-3 rounded-full mr-3 group-hover:bg-blue-200 transition-colors">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 text-sm sm:text-base">Run SQL Queries</h3>
              <p className="text-gray-600 text-xs sm:text-sm truncate">Execute custom queries on patient data</p>
            </div>
          </Link>
          
          <div 
            className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer group sm:col-span-2 lg:col-span-1" 
            onClick={() => window.location.reload()}
          >
            <div className="bg-purple-100 p-3 rounded-full mr-3 group-hover:bg-purple-200 transition-colors">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-800 text-sm sm:text-base">Refresh Data</h3>
              <p className="text-gray-600 text-xs sm:text-sm truncate">Update data from all browser tabs</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Patient List */}
      <PatientList />
      
      {/* Help Card */}
      <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-lime-800 mb-3">About This App</h3>
        <p className="text-lime-700 mb-4 text-sm sm:text-base">
          This application uses PGlite as a frontend-only SQL database that persists data across page refreshes and synchronizes between browser tabs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="bg-white px-3 py-2 rounded-md border border-lime-200">
            <span className="font-medium block sm:inline">Multi-tab Support:</span>
            <span className="block sm:inline sm:ml-1">Data syncs across all open tabs</span>
          </div>
          <div className="bg-white px-3 py-2 rounded-md border border-lime-200">
            <span className="font-medium block sm:inline">SQL Console:</span>
            <span className="block sm:inline sm:ml-1">Run custom queries on your data</span>
          </div>
          <div className="bg-white px-3 py-2 rounded-md border border-lime-200 sm:col-span-2 lg:col-span-1">
            <span className="font-medium block sm:inline">Data Persistence:</span>
            <span className="block sm:inline sm:ml-1">Stored locally in your browser</span>
          </div>
        </div>
      </div>
    </div>
  );
}