import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateInternship, fetchInternshipDetails } from '../../../services/api';
import { toast } from 'react-toastify';

const InternshipUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    internship_profile_title: '',
    skills_required: [],
    internship_type: 'HYBRID',
    is_part_time: false,
    start_date_option: 'IMMEDIATE',
    start_date: '',
    end_date: '',
    duration: 3,
    duration_unit: 'MONTHS',
    responsibilities: [''],
    allow_women_returning: false,
    is_paid: false,
    stipend_type: 'MONTHLY',
    fixed_stipend_min: '',
    fixed_stipend_max: '',
    incentives_min: '',
    incentives_max: '',
    has_ppo: false,
    perks: '',
    screening_questions: [''],
    alternate_mobile_number: '',
    candidate_preferences: '',
    number_of_openings: 1
  });

  useEffect(() => {
    const fetchInternshipData = async () => {
      try {
        const { data } = await fetchInternshipDetails(id);
        setFormData({
          internship_profile_title: data.internship_profile_title,
          skills_required: data.skills_required,
          internship_type: data.internship_type,
          is_part_time: data.is_part_time,
          start_date_option: data.start_date_option,
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          duration: data.duration,
          duration_unit: data.duration_unit,
          responsibilities: data.responsibilities,
          allow_women_returning: data.allow_women_returning,
          is_paid: data.is_paid,
          stipend_type: data.stipend_type,
          fixed_stipend_min: data.fixed_stipend_min || '',
          fixed_stipend_max: data.fixed_stipend_max || '',
          incentives_min: data.incentives_min || '',
          incentives_max: data.incentives_max || '',
          has_ppo: data.has_ppo,
          perks: data.perks || '',
          screening_questions: data.screening_questions,
          alternate_mobile_number: data.alternate_mobile_number || '',
          candidate_preferences: data.candidate_preferences,
          number_of_openings: data.number_of_openings
        });
      } catch (error) {
        console.error('Error fetching internship details:', error);
        toast.error('Failed to load internship details');
        navigate('/dashboard/employer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternshipData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const handleSkillsChange = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      skills_required: options
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      start_date_option: name === 'start_date' && value ? 'CUSTOM' : prev.start_date_option
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form data
    if (formData.skills_required.length === 0) {
      toast.error('Please select at least one required skill');
      setIsLoading(false);
      return;
    }

    if (formData.is_paid && parseFloat(formData.fixed_stipend_min) > parseFloat(formData.fixed_stipend_max)) {
      toast.error('Minimum stipend cannot exceed maximum stipend');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        duration: parseInt(formData.duration),
        number_of_openings: parseInt(formData.number_of_openings),
        fixed_stipend_min: formData.is_paid ? parseFloat(formData.fixed_stipend_min) : null,
        fixed_stipend_max: formData.is_paid ? parseFloat(formData.fixed_stipend_max) : null,
        incentives_min: formData.incentives_min ? parseFloat(formData.incentives_min) : null,
        incentives_max: formData.incentives_max ? parseFloat(formData.incentives_max) : null,
        responsibilities: formData.responsibilities.filter(resp => resp.trim() !== ''),
        screening_questions: formData.screening_questions.filter(q => q.trim() !== ''),
        start_date: formData.start_date_option === 'IMMEDIATE' ? null : formData.start_date,
        end_date: formData.start_date_option === 'IMMEDIATE' ? null : formData.end_date
      };

      await updateInternship(id, payload);
      toast.success('Internship updated successfully!');
      navigate('/dashboard/employer');
    } catch (error) {
      console.error('Error updating internship:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update internship';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Update Internship</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Internship Profile Title */}
            <div>
              <label htmlFor="internship_profile_title" className="block text-sm font-medium text-gray-700">
                Internship Profile Title*
              </label>
              <input
                type="text"
                id="internship_profile_title"
                name="internship_profile_title"
                value={formData.internship_profile_title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Skills Required */}
            <div>
              <label htmlFor="skills_required" className="block text-sm font-medium text-gray-700">
                Required Skills* (Select multiple)
              </label>
              <select
                multiple
                id="skills_required"
                name="skills_required"
                value={formData.skills_required}
                onChange={handleSkillsChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="Python">Python</option>
                <option value="Django">Django</option>
                <option value="JavaScript">JavaScript</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
                <option value="AWS">AWS</option>
                <option value="SQL">SQL</option>
                <option value="Git">Git</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple skills</p>
            </div>

            {/* Internship Type and Part Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="internship_type" className="block text-sm font-medium text-gray-700">
                  Internship Type*
                </label>
                <select
                  id="internship_type"
                  name="internship_type"
                  value={formData.internship_type}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="HYBRID">Hybrid</option>
                  <option value="IN_OFFICE">In Office</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="is_part_time"
                  name="is_part_time"
                  checked={formData.is_part_time}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_part_time" className="ml-2 block text-sm text-gray-700">
                  Part Time Internship
                </label>
              </div>
            </div>

            {/* Start Date Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date Option*
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="immediate_start"
                    name="start_date_option"
                    value="IMMEDIATE"
                    checked={formData.start_date_option === 'IMMEDIATE'}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="immediate_start" className="ml-2 block text-sm text-gray-700">
                    Immediate Start
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="custom_start"
                    name="start_date_option"
                    value="CUSTOM"
                    checked={formData.start_date_option === 'CUSTOM'}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="custom_start" className="ml-2 block text-sm text-gray-700">
                    Custom Start Date
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Date Fields */}
            {formData.start_date_option === 'CUSTOM' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Start Date*
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleDateChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    End Date*
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleDateChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration*
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="duration_unit" className="block text-sm font-medium text-gray-700">
                  Duration Unit*
                </label>
                <select
                  id="duration_unit"
                  name="duration_unit"
                  value={formData.duration_unit}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="MONTHS">Months</option>
                  <option value="WEEKS">Weeks</option>
                </select>
              </div>
            </div>

            {/* Number of Openings */}
            <div>
              <label htmlFor="number_of_openings" className="block text-sm font-medium text-gray-700">
                Number of Openings*
              </label>
              <input
                type="number"
                id="number_of_openings"
                name="number_of_openings"
                min="1"
                value={formData.number_of_openings}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Responsibilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Responsibilities*
              </label>
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="flex items-center mt-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                    className="flex-1 block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  {formData.responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('responsibilities', index)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('responsibilities')}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Responsibility
              </button>
            </div>

            {/* Allow Women Returning */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allow_women_returning"
                name="allow_women_returning"
                checked={formData.allow_women_returning}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="allow_women_returning" className="ml-2 block text-sm text-gray-700">
                Allow women returning to workforce
              </label>
            </div>

            {/* Stipend Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_paid"
                  name="is_paid"
                  checked={formData.is_paid}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_paid" className="ml-2 block text-sm text-gray-700">
                  Paid Internship
                </label>
              </div>

              {formData.is_paid && (
                <>
                  <div>
                    <label htmlFor="stipend_type" className="block text-sm font-medium text-gray-700">
                      Stipend Type*
                    </label>
                    <select
                      id="stipend_type"
                      name="stipend_type"
                      value={formData.stipend_type}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="ONE_TIME">One Time</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fixed_stipend_min" className="block text-sm font-medium text-gray-700">
                        Minimum Stipend (₹)*
                      </label>
                      <input
                        type="number"
                        id="fixed_stipend_min"
                        name="fixed_stipend_min"
                        min="0"
                        value={formData.fixed_stipend_min}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required={formData.is_paid}
                      />
                    </div>
                    <div>
                      <label htmlFor="fixed_stipend_max" className="block text-sm font-medium text-gray-700">
                        Maximum Stipend (₹)*
                      </label>
                      <input
                        type="number"
                        id="fixed_stipend_max"
                        name="fixed_stipend_max"
                        min="0"
                        value={formData.fixed_stipend_max}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required={formData.is_paid}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="incentives_min" className="block text-sm font-medium text-gray-700">
                        Minimum Incentives (₹)
                      </label>
                      <input
                        type="number"
                        id="incentives_min"
                        name="incentives_min"
                        min="0"
                        value={formData.incentives_min}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="incentives_max" className="block text-sm font-medium text-gray-700">
                        Maximum Incentives (₹)
                      </label>
                      <input
                        type="number"
                        id="incentives_max"
                        name="incentives_max"
                        min="0"
                        value={formData.incentives_max}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* PPO and Perks */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_ppo"
                  name="has_ppo"
                  checked={formData.has_ppo}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="has_ppo" className="ml-2 block text-sm text-gray-700">
                  PPO (Pre-Placement Offer) Opportunity
                </label>
              </div>

              <div>
                <label htmlFor="perks" className="block text-sm font-medium text-gray-700">
                  Perks
                </label>
                <textarea
                  id="perks"
                  name="perks"
                  rows={3}
                  value={formData.perks}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Free snacks, Flexible hours, etc."
                />
              </div>
            </div>

            {/* Screening Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Screening Questions*
              </label>
              {formData.screening_questions.map((question, index) => (
                <div key={index} className="flex items-center mt-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => handleArrayChange('screening_questions', index, e.target.value)}
                    className="flex-1 block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  {formData.screening_questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('screening_questions', index)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('screening_questions')}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Question
              </button>
            </div>

            {/* Contact Info */}
            <div>
              <label htmlFor="alternate_mobile_number" className="block text-sm font-medium text-gray-700">
                Alternate Contact Number
              </label>
              <input
                type="tel"
                id="alternate_mobile_number"
                name="alternate_mobile_number"
                value={formData.alternate_mobile_number}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+919876543210"
              />
            </div>

            {/* Candidate Preferences */}
            <div>
              <label htmlFor="candidate_preferences" className="block text-sm font-medium text-gray-700">
                Candidate Preferences*
              </label>
              <textarea
                id="candidate_preferences"
                name="candidate_preferences"
                rows={3}
                value={formData.candidate_preferences}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/employer')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Internship'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InternshipUpdate;