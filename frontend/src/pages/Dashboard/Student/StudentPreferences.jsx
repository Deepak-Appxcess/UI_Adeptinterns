import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateCandidatePreferences } from '../../../services/api';

const StudentPreference = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    areas_of_interest: '',
    currently_looking_for: '',
    work_mode_looking_for: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Optional: Fetch existing preferences when component mounts
  useEffect(() => {
    // You could add a fetch function here if you want to pre-populate the form
    // with existing preferences
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await updateCandidatePreferences(formData);
      console.log('Preferences updated successfully:', response.data);
      navigate('/dashboard/student/');
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        console.error('Error updating preferences:', error);
        setErrors({ general: 'An error occurred while updating your preferences. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Job Preferences</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Areas of Interest */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Areas of Interest* (comma-separated)
          </label>
          <input
            type="text"
            name="areas_of_interest"
            value={formData.areas_of_interest}
            onChange={handleChange}
            placeholder="e.g., Software Development, Data Science"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          {errors.areas_of_interest && (
            <p className="mt-1 text-sm text-red-600">{errors.areas_of_interest}</p>
          )}
        </div>

        {/* Currently Looking For */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Currently Looking For*
          </label>
          <select
            name="currently_looking_for"
            value={formData.currently_looking_for}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select an option</option>
            <option value="Jobs">Jobs</option>
            <option value="Internships">Internships</option>
          </select>
          {errors.currently_looking_for && (
            <p className="mt-1 text-sm text-red-600">{errors.currently_looking_for}</p>
          )}
        </div>

        {/* Work Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Work Mode*
          </label>
          <select
            name="work_mode_looking_for"
            value={formData.work_mode_looking_for}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select an option</option>
            <option value="In-office">In-office</option>
            <option value="Work from home">Work from home</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          {errors.work_mode_looking_for && (
            <p className="mt-1 text-sm text-red-600">{errors.work_mode_looking_for}</p>
          )}
        </div>

        {errors.general && (
          <div className="text-red-600 text-sm mt-2">
            {errors.general}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentPreference;