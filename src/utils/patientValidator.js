/**
 * Validates patient data input for form handling
 * @param {Object} patient - Patient data object
 * @returns {Object} Validation result with isValid flag and errors
 */
export function validatePatient(patient) {
  const errors = {};
  
  // Required fields
  if (!patient.first_name?.trim()) {
    errors.first_name = 'First name is required';
  } else if (patient.first_name.length > 50) {
    errors.first_name = 'First name cannot exceed 50 characters';
  } else if (!/^[a-zA-Z\s\-'.]+$/.test(patient.first_name)) {
    errors.first_name = 'First name contains invalid characters';
  }
  
  if (!patient.last_name?.trim()) {
    errors.last_name = 'Last name is required';
  } else if (patient.last_name.length > 50) {
    errors.last_name = 'Last name cannot exceed 50 characters';
  } else if (!/^[a-zA-Z\s\-'.]+$/.test(patient.last_name)) {
    errors.last_name = 'Last name contains invalid characters';
  }
  
  if (!patient.date_of_birth) {
    errors.date_of_birth = 'Date of birth is required';
  } else {
    const dob = new Date(patient.date_of_birth);
    const now = new Date();
    
    if (isNaN(dob.getTime())) {
      errors.date_of_birth = 'Invalid date format';
    } else if (dob > now) {
      errors.date_of_birth = 'Date of birth cannot be in the future';
    } else if (dob < new Date('1900-01-01')) {
      errors.date_of_birth = 'Date of birth is too far in the past';
    }
    
    // Calculate age
    const ageDate = new Date(now - dob);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    // Check if age is reasonable (e.g., less than 150 years)
    if (age > 150) {
      errors.date_of_birth = 'Please enter a reasonable date of birth';
    }
  }
  
  if (!patient.gender) {
    errors.gender = 'Gender is required';
  } else if (!['Male', 'Female', 'Other', 'Prefer not to say'].includes(patient.gender)) {
    errors.gender = 'Please select a valid gender option';
  }
  
  // Optional fields with format validation
  if (patient.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
      errors.email = 'Invalid email format';
    } else if (patient.email.length > 100) {
      errors.email = 'Email cannot exceed 100 characters';
    }
  }
  
  if (patient.contact_number) {
    // Basic phone number validation with optional country code
    // Allows formats like: +919876543210, 9876543210, +91 98765 43210
    if (!/^\+?[\d\s-]{8,15}$/.test(patient.contact_number)) {
      errors.contact_number = 'Invalid contact number format';
    }
  }
  
  // Address and medical history length validation
  if (patient.address && patient.address.length > 500) {
    errors.address = 'Address cannot exceed 500 characters';
  }
  
  if (patient.medical_history && patient.medical_history.length > 1000) {
    errors.medical_history = 'Medical history cannot exceed 1000 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}