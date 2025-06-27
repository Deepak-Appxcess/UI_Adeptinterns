import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateCandidateBio } from '../../../services/api';

const StudentBio = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    current_city: '',
    gender: '',
    languages_known: '',
    candidate_type: '',
    course: '',
    college_name: '',
    stream: '',
    start_year: '',
    end_year: '',
    profile_picture: null,
    current_company: '',
    current_designation: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      profile_picture: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Prepare form data for submission
    const data = new FormData();
    data.append('current_city', formData.current_city);
    data.append('gender', formData.gender);
    data.append('languages_known', formData.languages_known);
    data.append('candidate_type', formData.candidate_type);
    data.append('course', formData.course);
    data.append('college_name', formData.college_name);
    if (formData.stream) data.append('stream', formData.stream);
    data.append('start_year', formData.start_year);
    data.append('end_year', formData.end_year);
    if (formData.profile_picture) {
      data.append('profile_picture', formData.profile_picture);
    }
    
    // Only append these fields if candidate is a working professional
    if (formData.candidate_type === 'Working professional') {
      data.append('current_company', formData.current_company);
      data.append('current_designation', formData.current_designation);
    }

    try {
      const response = await updateCandidateBio(data);
      console.log('Bio updated successfully:', response.data);
      navigate('/student/preferences');
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        console.error('Error updating bio:', error);
        setErrors({ general: 'An error occurred while updating your bio. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Candidate Bio Information</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current City */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Current City*</label>
            <input
              type="text"
              name="current_city"
              value={formData.current_city}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {errors.current_city && <p className="mt-1 text-sm text-red-600">{errors.current_city}</p>}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender*</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
          </div>

          {/* Languages Known */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Languages Known* (comma-separated)</label>
            <input
              type="text"
              name="languages_known"
              value={formData.languages_known}
              onChange={handleChange}
              placeholder="e.g., English,Spanish,Hindi"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {errors.languages_known && <p className="mt-1 text-sm text-red-600">{errors.languages_known}</p>}
          </div>

          {/* Candidate Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Candidate Type*</label>
            <select
              name="candidate_type"
              value={formData.candidate_type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              
              <option value="Fresher">Fresher</option>
              <option value="Experienced">Working professional</option>
              
            </select>
            {errors.candidate_type && <p className="mt-1 text-sm text-red-600">{errors.candidate_type}</p>}
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Course*</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Course</option>
              <option value="B.Tech">B.Tech</option>
              <option value="BE">BE</option>
              <option value="B.Com">B.Com</option>
              <option value="MBA">MBA</option>
              <option value="B.A">B.A</option>
            </select>
            {errors.course && <p className="mt-1 text-sm text-red-600">{errors.course}</p>}
          </div>

          {/* College Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">College Name*</label>
            <input
              type="text"
              name="college_name"
              value={formData.college_name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {errors.college_name && <p className="mt-1 text-sm text-red-600">{errors.college_name}</p>}
          </div>

          {/* Stream */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Stream (Optional)</label>
            <input
              type="text"
              name="stream"
              value={formData.stream}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.stream && <p className="mt-1 text-sm text-red-600">{errors.stream}</p>}
          </div>

          {/* Start Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Year*</label>
            <input
              type="number"
              name="start_year"
              value={formData.start_year}
              onChange={handleChange}
              min="2000"
              max="2099"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {errors.start_year && <p className="mt-1 text-sm text-red-600">{errors.start_year}</p>}
          </div>

          {/* End Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700">End Year*</label>
            <input
              type="number"
              name="end_year"
              value={formData.end_year}
              onChange={handleChange}
              min="2000"
              max="2099"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {errors.end_year && <p className="mt-1 text-sm text-red-600">{errors.end_year}</p>}
          </div>

          {/* Current Company (only for Working professionals) */}
          {formData.candidate_type === 'Working professional' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Current Company*</label>
              <input
                type="text"
                name="current_company"
                value={formData.current_company}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required={formData.candidate_type === 'Working professional'}
              />
              {errors.current_company && <p className="mt-1 text-sm text-red-600">{errors.current_company}</p>}
            </div>
          )}

          {/* Current Designation (only for Working professionals) */}
          {formData.candidate_type === 'Experienced' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Current Designation*</label>
              <input
                type="text"
                name="current_designation"
                value={formData.current_designation}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required={formData.candidate_type === 'Working professional'}
              />
              {errors.current_designation && <p className="mt-1 text-sm text-red-600">{errors.current_designation}</p>}
            </div>
          )}

          {/* Profile Picture */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Profile Picture (Optional)</label>
            <input
              type="file"
              name="profile_picture"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
            {errors.profile_picture && <p className="mt-1 text-sm text-red-600">{errors.profile_picture}</p>}
          </div>
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
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentBio;