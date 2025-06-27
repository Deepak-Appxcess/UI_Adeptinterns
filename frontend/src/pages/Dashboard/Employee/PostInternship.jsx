import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createInternship, fetchEmployerProfile } from '../../../services/api';
import { toast } from 'react-toastify';

const PostInternship = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [showDateFields, setShowDateFields] = useState(false);
  const [showStipendFields, setShowStipendFields] = useState(false);
  
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
    const checkProfileCompletion = async () => {
      try {
        const { data } = await fetchEmployerProfile();
        if (!data.has_completed_organization && !data.is_freelancer) {
          setProfileComplete(false);
          toast.error('Please complete your organization profile before posting internships');
          navigate('/profile');
        } else if (data.is_freelancer && !data.has_completed_freelancer_details) {
          setProfileComplete(false);
          toast.error('Please complete your freelancer profile before posting internships');
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        toast.error('Failed to verify profile completion');
      }
    };

    checkProfileCompletion();
  }, [navigate]);

  useEffect(() => {
    setShowDateFields(formData.start_date_option === 'SPECIFIC');
  }, [formData.start_date_option]);

  useEffect(() => {
    setShowStipendFields(formData.is_paid);
  }, [formData.is_paid]);

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
  if (formData.is_paid && parseFloat(formData.fixed_stipend_min) > parseFloat(formData.fixed_stipend_max)) {
    toast.error('Minimum stipend cannot exceed maximum stipend');
    setIsLoading(false);
    return;
  }

  if (formData.skills_required.length === 0) {
    toast.error('Please select at least one required skill');
    setIsLoading(false);
    return;
  }

  if (formData.alternate_mobile_number && formData.alternate_mobile_number.length > 15) {
    toast.error('Alternate mobile number must be 15 characters or less');
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
      start_date: formData.start_date_option === 'SPECIFIC' ? formData.start_date : null,
      end_date: formData.start_date_option === 'SPECIFIC' ? formData.end_date : null
    };

    const { data } = await createInternship(payload);
    toast.success('Internship posted successfully!');
    navigate('/dashboard/employer');
  } catch (error) {
    console.error('Error creating internship:', error);
    const errorMessage = error.response?.data?.message || 'Failed to create internship posting';
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  if (!profileComplete) {
    return null; // Already redirected to profile
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white shadow-xl rounded-2xl p-6 md:p-8 backdrop-blur-sm bg-opacity-90"
        >
          <motion.h1 
            className="text-3xl font-bold text-gray-800 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Post a New Internship
          </motion.h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Internship Title */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label htmlFor="internship_profile_title" className="block text-sm font-medium text-gray-700">
                Internship Title*
              </label>
              <input
                type="text"
                id="internship_profile_title"
                name="internship_profile_title"
                value={formData.internship_profile_title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                required
              />
            </motion.div>

            {/* Skills Required */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label htmlFor="skills_required" className="block text-sm font-medium text-gray-700">
                Required Skills* (Select multiple)
              </label>
              <select
                multiple
                id="skills_required"
                name="skills_required"
                value={formData.skills_required}
                onChange={handleSkillsChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                required
              >
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
                <option value="SEO">SEO</option>
                <option value="Content Writing">Content Writing</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Marketing">Marketing</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple skills</p>
            </motion.div>

            {/* Internship Type and Part-time */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div>
                <label htmlFor="internship_type" className="block text-sm font-medium text-gray-700">
                  Internship Type*
                </label>
                <select
                  id="internship_type"
                  name="internship_type"
                  value={formData.internship_type}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  required
                >
                  <option value="IN_OFFICE">In Office</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="REMOTE">Remote</option>
                </select>
              </div>
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="is_part_time"
                  name="is_part_time"
                  checked={formData.is_part_time}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_part_time" className="ml-2 block text-sm text-gray-700">
                  Part-time Internship
                </label>
              </div>
            </motion.div>

            {/* Start Date Options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <label htmlFor="start_date_option" className="block text-sm font-medium text-gray-700">
                Start Date Option*
              </label>
              <select
                id="start_date_option"
                name="start_date_option"
                value={formData.start_date_option}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                required
              >
                <option value="IMMEDIATE">Immediate Start</option>
                <option value="SPECIFIC">Specific Start Date</option>
              </select>
            </motion.div>

            {/* Specific Date Fields */}
            <AnimatePresence>
              {showDateFields && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                      Start Date*
                    </label>
                    <input
  type="date"
  id="start_date"
  name="start_date"
  value={formData.start_date}
  onChange={handleChange}
  min={new Date().toISOString().split('T')[0]} // Ensures YYYY-MM-DD format
  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
  required={showDateFields}
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
  onChange={handleChange}
  min={formData.start_date || new Date().toISOString().split('T')[0]} // Ensures YYYY-MM-DD format
  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
  required={showDateFields}
/>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Duration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  required
                >
                  <option value="WEEKS">Weeks</option>
                  <option value="MONTHS">Months</option>
                </select>
              </div>
            </motion.div>

            {/* Responsibilities */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <label className="block text-sm font-medium text-gray-700">
                Responsibilities*
              </label>
              {formData.responsibilities.map((resp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center mt-2"
                >
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                    className="flex-1 block border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    required
                  />
                  {formData.responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('responsibilities', index)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 transition duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </motion.div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('responsibilities')}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
              >
                Add Responsibility
              </button>
            </motion.div>

            {/* Number of Openings */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
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
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                required
              />
            </motion.div>

            {/* Paid Internship */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="space-y-4"
            >
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

              <AnimatePresence>
                {showStipendFields && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="stipend_type" className="block text-sm font-medium text-gray-700">
                        Stipend Type*
                      </label>
                      <select
                        id="stipend_type"
                        name="stipend_type"
                        value={formData.stipend_type}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                        required={showStipendFields}
                      >
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="LUMP_SUM">Lump Sum</option>
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
                          step="0.01"
                          value={formData.fixed_stipend_min}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                          required={showStipendFields}
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
                          step="0.01"
                          value={formData.fixed_stipend_max}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                          required={showStipendFields}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Incentives */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                />
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="space-y-4"
            >
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
                  Open to women returning to work
                </label>
              </div>
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
                  Pre-placement offer (PPO) opportunity
                </label>
              </div>
            </motion.div>

            {/* Perks */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <label htmlFor="perks" className="block text-sm font-medium text-gray-700">
                Perks
              </label>
              <textarea
                id="perks"
                name="perks"
                rows={2}
                value={formData.perks}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                placeholder="Flexible hours, mentorship, free lunch, etc."
              />
            </motion.div>

            {/* Screening Questions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
            >
              <label className="block text-sm font-medium text-gray-700">
                Screening Questions*
              </label>
              {formData.screening_questions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center mt-2"
                >
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => handleArrayChange('screening_questions', index, e.target.value)}
                    className="flex-1 block border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    required
                  />
                  {formData.screening_questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('screening_questions', index)}
                      className="ml-2 p-1 text-red-500 hover:text-red-700 transition duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </motion.div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('screening_questions')}
                className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
              >
                Add Question
              </button>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <label htmlFor="alternate_mobile_number" className="block text-sm font-medium text-gray-700">
                Alternate Contact Number
              </label>
<input
  type="tel"
  id="alternate_mobile_number"
  name="alternate_mobile_number"
  value={formData.alternate_mobile_number}
  onChange={(e) => {
    // Limit to 15 characters
    const value = e.target.value.slice(0, 15);
    setFormData(prev => ({ ...prev, alternate_mobile_number: value }));
  }}
  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
  placeholder="+919876543210"
/>
            </motion.div>

            {/* Candidate Preferences */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95 }}
            >
              <label htmlFor="candidate_preferences" className="block text-sm font-medium text-gray-700">
                Candidate Preferences*
              </label>
              <textarea
                id="candidate_preferences"
                name="candidate_preferences"
                rows={3}
                value={formData.candidate_preferences}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                required
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 transform hover:-translate-y-1"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting Internship...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Post Internship
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PostInternship;