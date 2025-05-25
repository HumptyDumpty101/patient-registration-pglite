import { useState } from 'react';
import { usePGlite } from '../context/PGliteContext';

export default function PatientDetails({ patient, onClose }) {
  const { pglite } = usePGlite();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({...patient});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({...patient});
    setIsDeleting(false);
    setErrors({});
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation for required fields
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // Phone number validation
    if (formData.contact_number && !/^\+?[\d\s-]{8,15}$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Invalid contact number format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await pglite.query(`
        UPDATE patients SET
          first_name = $1,
          last_name = $2,
          date_of_birth = $3,
          gender = $4,
          contact_number = $5,
          email = $6,
          address = $7,
          medical_history = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
      `, [
        formData.first_name,
        formData.last_name,
        formData.date_of_birth,
        formData.gender,
        formData.contact_number || null,
        formData.email || null,
        formData.address || null,
        formData.medical_history || null,
        patient.id
      ]);
      
      setSuccess('Patient updated successfully');
      setTimeout(() => {
        setIsEditing(false);
        setSuccess(null);
      }, 1500);
    } catch (error) {
      console.error('Error updating patient:', error);
      setErrors({ general: 'Failed to update patient. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }
    
    setLoading(true);
    try {
      await pglite.query('DELETE FROM patients WHERE id = $1', [patient.id]);
      setSuccess('Patient deleted successfully');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error deleting patient:', error);
      setErrors({ general: 'Failed to delete patient. Please try again.' });
      setIsDeleting(false);
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
  ];

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="mb-4 text-green-600">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">{success}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              {isEditing ? 'Edit Patient' : 'Patient Details'}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 -m-2"
              type="button"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 rounded-md border border-red-200 text-red-600 text-sm">
              {errors.general}
            </div>
          )}
          
          <div className="space-y-4">
            {isEditing ? (
              <>
                {/* Personal Information */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          errors.first_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.first_name && (
                        <p className="mt-1 text-red-500 text-xs">{errors.first_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          errors.last_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.last_name && (
                        <p className="mt-1 text-red-500 text-xs">{errors.last_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        max={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          errors.date_of_birth ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.date_of_birth && (
                        <p className="mt-1 text-red-500 text-xs">{errors.date_of_birth}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        {genderOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-red-500 text-xs">{errors.gender}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contact_number"
                        value={formData.contact_number || ''}
                        onChange={handleChange}
                        placeholder="e.g., +91 9876543210"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          errors.contact_number ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.contact_number && (
                        <p className="mt-1 text-red-500 text-xs">{errors.contact_number}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        placeholder="e.g., patient@example.com"
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-red-500 text-xs">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Patient's residential address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    ></textarea>
                  </div>
                </div>
                
                {/* Medical Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Medical Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medical History
                    </label>
                    <textarea
                      name="medical_history"
                      value={formData.medical_history || ''}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Relevant medical history, allergies, or ongoing treatments"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    ></textarea>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                {/* Personal Information Display */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium text-sm sm:text-base">{patient.first_name} {patient.last_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-medium text-sm sm:text-base">{formatDate(patient.date_of_birth)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Gender</p>
                      <p className="font-medium text-sm sm:text-base">{patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Patient ID</p>
                      <p className="font-medium text-sm sm:text-base">{patient.id}</p>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information Display */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium text-sm sm:text-base break-all">{patient.contact_number || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="font-medium text-sm sm:text-base break-all">{patient.email || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium whitespace-pre-line text-sm sm:text-base">{patient.address || '—'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Medical History Display */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Medical History</h3>
                  <p className="whitespace-pre-line text-sm sm:text-base">{patient.medical_history || 'No medical history recorded.'}</p>
                </div>
                
                {/* Registration Information Display */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Registration Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Registered On</p>
                      <p className="font-medium">{formatDate(patient.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="font-medium">{formatDate(patient.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="w-full sm:w-auto cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={loading}
                type="button"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSave}
                className={`w-full sm:w-auto cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-md ${
                  loading 
                    ? 'bg-lime-400 cursor-not-allowed' 
                    : 'bg-lime-600 hover:bg-lime-700'
                }`}
                disabled={loading}
                type="button"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleDelete}
                  className={`w-full sm:w-auto cursor-pointer px-4 py-2 text-sm font-medium text-white rounded-md ${
                    loading 
                      ? 'bg-red-400 cursor-not-allowed' 
                      : isDeleting
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-red-500 hover:bg-red-600'
                  }`}
                  disabled={loading}
                  type="button"
                >
                  {loading 
                    ? 'Processing...' 
                    : isDeleting
                      ? 'Confirm Delete'
                      : 'Delete'
                  }
                </button>
                {isDeleting && (
                  <button
                    onClick={handleCancel}
                    className="w-full sm:w-auto cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={loading}
                    type="button"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              <button
                onClick={handleEdit}
                className="w-full sm:w-auto cursor-pointer px-4 py-2 text-sm font-medium text-white bg-lime-600 rounded-md hover:bg-lime-700"
                type="button"
              >
                Edit Patient
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}