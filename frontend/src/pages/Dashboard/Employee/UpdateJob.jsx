import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateJobPosting, fetchJobDetails } from '../../../services/api';
import { toast } from 'react-toastify';

const UpdateJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    job_title: '',
    minimum_experience_years: 0,
    skills_required: [],
    job_type: 'IN_OFFICE',
    work_schedule: 'FULL_TIME',
    number_of_openings: 1,
    job_description: [''],
    fixed_pay_min: '',
    fixed_pay_max: '',
    incentives_min: '',
    incentives_max: '',
    has_five_day_week: false,
    has_health_insurance: false,
    has_life_insurance: false,
    screening_questions: [''],
    alternate_phone_number: '',
    candidate_preferences: ''
  });

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const { data } = await fetchJobDetails(id);
        setFormData({
          job_title: data.job_title,
          minimum_experience_years: data.minimum_experience_years,
          skills_required: data.skills_required,
          job_type: data.job_type,
          work_schedule: data.work_schedule,
          number_of_openings: data.number_of_openings,
          job_description: data.job_description,
          fixed_pay_min: data.fixed_pay_min,
          fixed_pay_max: data.fixed_pay_max,
          incentives_min: data.incentives_min || '',
          incentives_max: data.incentives_max || '',
          has_five_day_week: data.has_five_day_week,
          has_health_insurance: data.has_health_insurance,
          has_life_insurance: data.has_life_insurance,
          screening_questions: data.screening_questions,
          alternate_phone_number: data.alternate_phone_number || '',
          candidate_preferences: data.candidate_preferences
        });
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('Failed to load job details');
        navigate('/dashboard/employer');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form data
    if (parseFloat(formData.fixed_pay_min) > parseFloat(formData.fixed_pay_max)) {
      toast.error('Minimum salary cannot exceed maximum salary');
      setIsLoading(false);
      return;
    }

    if (formData.skills_required.length === 0) {
      toast.error('Please select at least one required skill');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        minimum_experience_years: parseInt(formData.minimum_experience_years),
        number_of_openings: parseInt(formData.number_of_openings),
        fixed_pay_min: parseFloat(formData.fixed_pay_min),
        fixed_pay_max: parseFloat(formData.fixed_pay_max),
        incentives_min: formData.incentives_min ? parseFloat(formData.incentives_min) : null,
        incentives_max: formData.incentives_max ? parseFloat(formData.incentives_max) : null,
        job_description: formData.job_description.filter(desc => desc.trim() !== ''),
        screening_questions: formData.screening_questions.filter(q => q.trim() !== '')
      };

      await updateJobPosting(id, payload);
      toast.success('Job updated successfully!');
      navigate('/dashboard/employer');
    } catch (error) {
      console.error('Error updating job:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update job posting';
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Update Job Posting</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="job_title" className="block text-sm font-medium text-gray-700">
                Job Title*
              </label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="minimum_experience_years" className="block text-sm font-medium text-gray-700">
                Minimum Experience (Years)*
              </label>
              <input
                type="number"
                id="minimum_experience_years"
                name="minimum_experience_years"
                min="0"
                value={formData.minimum_experience_years}
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

            {/* Job Type and Work Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="job_type" className="block text-sm font-medium text-gray-700">
                  Job Type*
                </label>
                <select
                  id="job_type"
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="IN_OFFICE">In Office</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
              <div>
                <label htmlFor="work_schedule" className="block text-sm font-medium text-gray-700">
                  Work Schedule*
                </label>
                <select
                  id="work_schedule"
                  name="work_schedule"
                  value={formData.work_schedule}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
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

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Job Description*
              </label>
              {formData.job_description.map((desc, index) => (
                <div key={index} className="flex items-center mt-2">
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => handleArrayChange('job_description', index, e.target.value)}
                    className="flex-1 block border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  {formData.job_description.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('job_description', index)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('job_description')}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Description Point
              </button>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fixed_pay_min" className="block text-sm font-medium text-gray-700">
                  Minimum Salary (₹)*
                </label>
                <input
                  type="number"
                  id="fixed_pay_min"
                  name="fixed_pay_min"
                  min="0"
                  step="0.01"
                  value={formData.fixed_pay_min}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="fixed_pay_max" className="block text-sm font-medium text-gray-700">
                  Maximum Salary (₹)*
                </label>
                <input
                  type="number"
                  id="fixed_pay_max"
                  name="fixed_pay_max"
                  min="0"
                  step="0.01"
                  value={formData.fixed_pay_max}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Incentives (Optional) */}
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
                  step="0.01"
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
                  step="0.01"
                  value={formData.incentives_max}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_five_day_week"
                  name="has_five_day_week"
                  checked={formData.has_five_day_week}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="has_five_day_week" className="ml-2 block text-sm text-gray-700">
                  5-day work week
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_health_insurance"
                  name="has_health_insurance"
                  checked={formData.has_health_insurance}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="has_health_insurance" className="ml-2 block text-sm text-gray-700">
                  Health Insurance
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_life_insurance"
                  name="has_life_insurance"
                  checked={formData.has_life_insurance}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="has_life_insurance" className="ml-2 block text-sm text-gray-700">
                  Life Insurance
                </label>
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
              <label htmlFor="alternate_phone_number" className="block text-sm font-medium text-gray-700">
                Alternate Contact Number
              </label>
              <input
                type="tel"
                id="alternate_phone_number"
                name="alternate_phone_number"
                value={formData.alternate_phone_number}
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
                ) : 'Update Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateJob;