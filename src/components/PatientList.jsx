import { useState } from 'react';
import { useLiveQuery } from '../hooks/useLiveQuery';
import { usePGlite } from '../context/PGliteContext';
import PatientDetails from './PatientDetails';

export default function PatientList() {
  const { isLeader } = usePGlite();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Use live query to get patients with optional search filter
  const query = searchTerm 
    ? `SELECT * FROM patients 
       WHERE first_name ILIKE $1 
       OR last_name ILIKE $1 
       OR email ILIKE $1 
       ORDER BY created_at DESC`
    : 'SELECT * FROM patients ORDER BY created_at DESC';

  const params = searchTerm ? [`%${searchTerm}%`] : [];
  
  const { 
    data: patients, 
    loading: patientsLoading,
    error: patientsError,
  } = useLiveQuery(query, params);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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

  if (patientsError) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">Error loading patients: {patientsError.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Patient Records</h2>
          <div className="flex items-center space-x-2">
            {isLeader ? 
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Leader Tab</span> : 
              <span className="bg-lime-100 text-black text-xs px-2 py-1 rounded">Follower Tab</span>
            }
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              {patients.length} {patients.length === 1 ? 'patient' : 'patients'}
            </span>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
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
        </div>
      </div>

      {patientsLoading ? (
        <div className="p-4 text-center">
          <p className="text-gray-500">Loading patients...</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">
            {searchTerm ? 'No patients matching your search' : 'No patients registered yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr 
                  key={patient.id} 
                  onClick={() => handlePatientClick(patient)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(patient.date_of_birth)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.contact_number || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {patient.email || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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