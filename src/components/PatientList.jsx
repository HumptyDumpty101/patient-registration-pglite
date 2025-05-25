import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { usePGlite } from '../context/PGliteContext';
import PatientDetails from './PatientDetails';

export default function PatientList() {
  const { isLeader } = usePGlite();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  // Get all patients without filtering in the SQL query
  const { 
    data: patients, 
    loading: patientsLoading,
    error: patientsError,
  } = useLiveQuery(`SELECT * FROM patients ORDER BY ${sortConfig.key} ${sortConfig.direction === 'asc' ? 'ASC' : 'DESC'}`);

  // Filter patients in JavaScript instead of SQL
  useEffect(() => {
    if (!patients) {
      setFilteredPatients([]);
      return;
    }

    if (!searchTerm) {
      setFilteredPatients(patients);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = patients.filter(patient => {
      return (
        patient.first_name.toLowerCase().includes(searchTermLower) ||
        patient.last_name.toLowerCase().includes(searchTermLower) ||
        (patient.email && patient.email.toLowerCase().includes(searchTermLower)) ||
        (patient.contact_number && patient.contact_number.includes(searchTerm))
      );
    });
    
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  const handleCloseDetails = () => {
    setSelectedPatient(null);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    );
  };

  // Card view for mobile
  const renderCardView = () => (
    <div className="grid gap-4">
      {filteredPatients.map((patient) => (
        <div 
          key={patient.id}
          onClick={() => handlePatientClick(patient)}
          className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              ID: {patient.id}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>DOB:</span>
              <span>{formatDate(patient.date_of_birth)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gender:</span>
              <span>{patient.gender}</span>
            </div>
            {patient.contact_number && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="truncate ml-2">{patient.contact_number}</span>
              </div>
            )}
            {patient.email && (
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="truncate ml-2">{patient.email}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-gray-100">
              <span>Registered:</span>
              <span>{formatDate(patient.created_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Table view for desktop
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              onClick={() => handleSort('last_name')}
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              <span className="flex items-center">
                Name {getSortIcon('last_name')}
              </span>
            </th>
            <th 
              onClick={() => handleSort('date_of_birth')}
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
            >
              <span className="flex items-center">
                DOB {getSortIcon('date_of_birth')}
              </span>
            </th>
            <th 
              onClick={() => handleSort('gender')}
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden md:table-cell"
            >
              <span className="flex items-center">
                Gender {getSortIcon('gender')}
              </span>
            </th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
              Contact
            </th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
              Email
            </th>
            <th 
              onClick={() => handleSort('created_at')}
              className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
            >
              <span className="flex items-center">
                Registered {getSortIcon('created_at')}
              </span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredPatients.map((patient) => (
            <tr 
              key={patient.id} 
              onClick={() => handlePatientClick(patient)}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                  {patient.first_name} {patient.last_name}
                </div>
                {/* Show additional info on mobile */}
                <div className="sm:hidden text-xs text-gray-500 mt-1">
                  {patient.gender} • {formatDate(patient.date_of_birth)}
                </div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                {formatDate(patient.date_of_birth)}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                {patient.gender}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                <div className="truncate max-w-[120px]">
                  {patient.contact_number || '—'}
                </div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                <div className="truncate max-w-[150px]">
                  {patient.email || '—'}
                </div>
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                {formatDate(patient.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (patientsError) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">Error loading patients: {patientsError.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden max-w-full">
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold">Patient Records</h2>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {isLeader ? 
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded whitespace-nowrap">Leader Tab</span> : 
                  <span className="bg-lime-100 text-black text-xs px-2 py-1 rounded whitespace-nowrap">Follower Tab</span>
                }
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded whitespace-nowrap">
                  {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
                </span>
              </div>
              
              <Link 
                to="/register" 
                className="inline-flex items-center px-3 py-1.5 text-sm !text-white bg-lime-600 rounded-md hover:bg-lime-700 whitespace-nowrap"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Patient
              </Link>
            </div>
          </div>
          
          {/* Search and View Toggle Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search patients by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
              />
              <svg 
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
            
            {/* View Mode Toggle - Only show on medium screens and up */}
            <div className="hidden md:flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'table'
                    ? 'bg-lime-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-l-md border-r border-gray-300`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'card'
                    ? 'bg-lime-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } rounded-r-md`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {patientsLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-lime-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Loading patients...</p>
        </div>
      ) : !filteredPatients || filteredPatients.length === 0 ? (
        <div className="p-8 text-center">
          <svg className="h-16 w-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p className="mt-2 text-gray-500">
            {searchTerm ? 'No patients matching your search' : 'No patients registered yet'}
          </p>
          {!searchTerm && (
            <Link 
              to="/register" 
              className="mt-4 inline-flex items-center px-4 py-2 text-sm !text-white bg-lime-600 rounded-md hover:bg-lime-700"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Register Your First Patient
            </Link>
          )}
        </div>
      ) : (
        <div className="max-w-full">
          {/* Always show card view on mobile, allow toggle on desktop */}
          {(viewMode === 'card' || window.innerWidth < 768) ? renderCardView() : renderTableView()}
        </div>
      )}

      {selectedPatient && (
        <PatientDetails 
          patient={selectedPatient} 
          onClose={handleCloseDetails} 
        />
      )}
    </div>
  );
}