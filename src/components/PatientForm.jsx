import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePGlite } from '../context/PGliteContext';
import { validatePatient } from '../utils/patientValidator';

export default function PatientForm() {
  const { executeQuery } = usePGlite();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validatePatient(formData);
    if (!isValid) return setErrors(errors);

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
      navigate('/');
    } catch (err) {
      console.error('Error adding patient:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="bg-white p-6 rounded shadow-md space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold">Register New Patient</h2>
      {['first_name','last_name','date_of_birth','gender'].map((field) => (
        <div key={field}>
          <label className="block font-medium text-sm capitalize">{field.replace('_',' ')}</label>
          <input
            type={field === 'date_of_birth' ? 'date' : 'text'}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
          {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
        </div>
      ))}

      <div>
        <label className="block font-medium text-sm">Contact Number</label>
        <input
          type="tel"
          name="contact_number"
          value={formData.contact_number}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium text-sm">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block font-medium text-sm">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          rows="2"
        ></textarea>
      </div>

      <div>
        <label className="block font-medium text-sm">Medical History</label>
        <textarea
          name="medical_history"
          value={formData.medical_history}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          rows="3"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`px-4 py-2 text-white rounded ${loading ? 'bg-lime-200' : 'bg-lime-600 hover:bg-lime-700'}`}
      >
        {loading ? 'Submitting...' : 'Register Patient'}
      </button>
    </form>
  );
}
