import { Link } from 'react-router-dom';
import PatientList from '../components/PatientList';
import { useLiveQuery } from '../hooks/useLiveQuery';

export default function Home() {
  // Get count of patients for the dashboard
  const { data: patientStats } = useLiveQuery(`
    SELECT 
      COUNT(*) as total_patients,
      COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_patients,
      COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_patients,
      COUNT(CASE WHEN gender NOT IN ('Male', 'Female') THEN 1 END) as other_patients,
      COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as new_today
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage your patients with our easy to use registration system
          </p>
        </div>
        
        <Link 
          to="/register" 
          className="inline-flex items-center px-4 py-2 !text-white bg-lime-600 rounded-md hover:bg-lime-700 shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Register New Patient
        </Link>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-lime-600">{stats.total_patients}</div>
          <div className="text-sm text-gray-600 mt-1">Total Patients</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.male_patients}</div>
          <div className="text-sm text-gray-600 mt-1">Male Patients</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-pink-600">{stats.female_patients}</div>
          <div className="text-sm text-gray-600 mt-1">Female Patients</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.other_patients}</div>
          <div className="text-sm text-gray-600 mt-1">Other/Prefer Not to Say</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.new_today}</div>
          <div className="text-sm text-gray-600 mt-1">New Today</div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
          <Link 
            to="/register" 
            className="flex items-center p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="bg-lime-100 p-3 rounded-full mr-3">
              <svg className="w-5 h-5 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Add New Patient</h3>
              <p className="text-gray-600 text-sm">Register a new patient in the system</p>
            </div>
          </Link>
          
          <Link 
            to="/query" 
            className="flex items-center p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="bg-blue-100 p-3 rounded-full mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Run SQL Queries</h3>
              <p className="text-gray-600 text-sm">Execute custom queries on patient data</p>
            </div>
          </Link>
          
          <div className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-purple-100 p-3 rounded-full mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Refresh Data</h3>
              <p className="text-gray-600 text-sm">Update data from all browser tabs</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Patient List */}
      <PatientList />
      
      {/* Help Card */}
      <div className="bg-lime-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-lime-800 mb-2">About This App</h3>
        <p className="text-lime-700 mb-3">
          This application uses PGlite as a frontend-only SQL database that persists data across page refreshes and synchronizes between browser tabs.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-white px-3 py-2 rounded-md border border-blue-200">
            <span className="font-medium">Multi-tab Support:</span> Data is synchronized across all open tabs
          </div>
          <div className="bg-white px-3 py-2 rounded-md border border-blue-200">
            <span className="font-medium">SQL Console:</span> Run custom queries on your patient data
          </div>
          <div className="bg-white px-3 py-2 rounded-md border border-blue-200">
            <span className="font-medium">Data Persistence:</span> Your data is stored locally in your browser
          </div>
        </div>
      </div>
    </div>
  );
}