import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePGlite } from '../context/PGliteContext';
import { validatePatient } from '../utils/patientValidator';

export default function PatientForm() {
  const { executeQuery, checkEmailExists, checkContactExists } = usePGlite();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    contact_number: '',
    email: '',
    address: '',
    medical_history: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // For checking fields with debounce
  const [debouncedEmail, setDebouncedEmail] = useState('');
  const [debouncedContact, setDebouncedContact] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && formData.email !== debouncedEmail) {
        setDebouncedEmail(formData.email);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.contact_number && formData.contact_number !== debouncedContact) {
        setDebouncedContact(formData.contact_number);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.contact_number]);

  // Check if email already exists
  useEffect(() => {
    const checkEmail = async () => {
      if (!debouncedEmail) return;
      
      try {
        setIsValidating(true);
        const exists = await checkEmailExists(debouncedEmail);
        if (exists) {
          setErrors(prev => ({
            ...prev,
            email: 'This email is already registered with another patient'
          }));
        }
      } catch (err) {
        console.error('Error checking email:', err);
      } finally {
        setIsValidating(false);
      }
    };
    
    checkEmail();
  }, [debouncedEmail, checkEmailExists]);

  // Check if contact number already exists
  useEffect(() => {
    const checkContact = async () => {
      if (!debouncedContact) return;
      
      try {
        setIsValidating(true);
        const exists = await checkContactExists(debouncedContact);
        if (exists) {
          setErrors(prev => ({
            ...prev,
            contact_number: 'This contact number is already registered with another patient'
          }));
        }
      } catch (err) {
        console.error('Error checking contact number:', err);
      } finally {
        setIsValidating(false);
      }
    };
    
    checkContact();
  }, [debouncedContact, checkContactExists]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validatePatient(formData);
    
    if (!isValid) {
      setErrors(validationErrors);
      // Scroll to the first error
      const firstErrorField = document.querySelector(`.error-field`);
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Check for uniqueness errors
    if (errors.email || errors.contact_number) {
      return;
    }

    setLoading(true);
    try {
      await executeQuery(
        `INSERT INTO patients 
          (first_name, last_name, date_of_birth, gender, contact_number, email, address, medical_history)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          formData.first_name,
          formData.last_name,
          formData.date_of_birth,
          formData.gender,
          formData.contact_number || null,
          formData.email || null,
          formData.address || null,
          formData.medical_history || null,
        ]
      );
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Error adding patient:', err);
      
      // Handle uniqueness violation errors
      if (err.message.includes('email already exists')) {
        setErrors(prev => ({
          ...prev,
          email: 'This email is already registered with another patient'
        }));
      } else if (err.message.includes('contact number already exists')) {
        setErrors(prev => ({
          ...prev,
          contact_number: 'This contact number is already registered with another patient'
        }));
      } else {
        setErrors({ form: 'Failed to register patient. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: '', label: 'Select gender' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
  ];

  if (success) {
    return (
      <div className="bg-white p-6 rounded shadow-md text-center">
        <div className="mb-4 text-green-600">
          <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Patient Registered Successfully!</h2>
        <p className="text-gray-600 mb-4">Redirecting to patient list...</p>
      </div>
    );
  }

  return (
    <form className="bg-white p-6 rounded shadow-md space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">Register New Patient</h2>
      
      {errors.form && (
        <div className="bg-red-50 p-4 rounded-md mb-4">
          <p className="text-red-600">{errors.form}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${errors.first_name ? 'error-field' : ''}`}>
          <label className="block font-medium text-sm">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${
              errors.first_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
          )}
        </div>

        <div className={`${errors.last_name ? 'error-field' : ''}`}>
          <label className="block font-medium text-sm">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${
              errors.last_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
          )}
        </div>
        
        <div className={`${errors.date_of_birth ? 'error-field' : ''}`}>
          <label className="block font-medium text-sm">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-3 py-2 border rounded ${
              errors.date_of_birth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date_of_birth && (
            <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
          )}
        </div>
        
        <div className={`${errors.gender ? 'error-field' : ''}`}>
          <label className="block font-medium text-sm">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded ${
              errors.gender ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
          )}
        </div>
        
        <div className={`${errors.contact_number ? 'error-field' : ''}`}>
          <label className="block font-medium text-sm">Contact Number</label>
          <div className="relative">
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="e.g., +91 9876543210"
              className={`w-full px-3 py-2 border rounded ${
                errors.contact_number ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {isValidating && formData.contact_number && (
              <div className="absolute right-3 top-3">
                <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {errors.contact_number && (
            <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>
          )}
        </div>
        
        <div className={`${errors.email ? 'error-field' : ''}`}>
          <label className="block font-medium text-sm">Email</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g., patient@example.com"
              className={`w-full px-3 py-2 border rounded ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {isValidating && formData.email && (
              <div className="absolute right-3 top-3">
                <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block font-medium text-sm">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded"
          rows="2"
          placeholder="Patient's residential address"
        ></textarea>
      </div>

      <div>
        <label className="block font-medium text-sm">Medical History</label>
        <textarea
          name="medical_history"
          value={formData.medical_history}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded"
          rows="3"
          placeholder="Relevant medical history, allergies, or ongoing treatments"
        ></textarea>
      </div>

      <div className="flex justify-end space-x-4 pt-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={loading || isValidating}
          className={`px-6 py-2 text-white rounded-md ${
            loading || isValidating ? 'bg-lime-400 cursor-not-allowed' : 'bg-lime-600 hover:bg-lime-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : isValidating ? (
            "Validating..."
          ) : (
            'Register Patient'
          )}
        </button>
      </div>
    </form>
  );
}