
/**
 * Validates patient data input for form handling
 */
export function validatePatient(patient) {
  const errors = {};
  
  // Required fields
  if (!patient.first_name?.trim()) {
    errors.first_name = 'First name is required';
  }
  
  if (!patient.last_name?.trim()) {
    errors.last_name = 'Last name is required';
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
  }
  
  if (!patient.gender) {
    errors.gender = 'Gender is required';
  }
  
  // Optional fields with format validation
  if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (patient.contact_number && !/^\+?[\d\s-]{8,15}$/.test(patient.contact_number)) {
    errors.contact_number = 'Invalid contact number format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}