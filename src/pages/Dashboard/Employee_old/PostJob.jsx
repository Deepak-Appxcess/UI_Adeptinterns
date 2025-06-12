import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../../services/api';

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', // Changed from jobTitle to title
    description: '', // Changed from jobDescription to description
    minExperience: '0',
    skills: [], // Changed from skillsRequired to skills (array)
    jobType: 'In office',
    workType: 'Full-time',
    openings: '',
    qualifications: ['', '', ''], // New required field
    responsibilities: ['', '', ''],
    preferences: ['', '', ''],
    fixedPayMin: '',
    fixedPayMax: '',
    variablePayMin: '',
    variablePayMax: '',
    perks: [],
    screeningQuestions: [],
    applicationDeadline: '' // New required field
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the data before sending
      const formattedData = {
        ...formData,
        // Convert empty strings to undefined in arrays
        responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
        preferences: formData.preferences.filter(p => p.trim() !== ''),
        qualifications: formData.qualifications.filter(q => q.trim() !== ''),
        // Convert skills string to array if needed
        skills: Array.isArray(formData.skills) 
          ? formData.skills 
          : formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      };
      
      await createJob(formattedData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error posting job:', error);
      // You might want to add error handling (e.g., show a toast notification)
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Post Job</h1>
      <form onSubmit={handleSubmit}>
        {/* Job Details Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Job Details</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Job title*</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Software Engineer Trainee"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Minimum experience required</label>
            <div className="flex gap-4">
              {['0', '1', '2'].map(exp => (
                <label key={exp} className="flex items-center">
                  <input
                    type="radio"
                    name="minExperience"
                    checked={formData.minExperience === exp}
                    onChange={() => setFormData({...formData, minExperience: exp})}
                    className="mr-2"
                  />
                  {exp} year{exp !== '1' ? 's' : ''}
                </label>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Skills required*</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              placeholder="e.g. Java, React, Node.js (comma separated)"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Please separate skills with commas</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Application deadline*</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.applicationDeadline}
              onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Job type</label>
              <div className="space-y-2">
                {['In office', 'Hybrid', 'Remote'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="jobType"
                      checked={formData.jobType === type}
                      onChange={() => setFormData({...formData, jobType: type})}
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Part-time/Full-time</label>
              <div className="space-y-2">
                {['Part-time', 'Full-time'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="workType"
                      checked={formData.workType === type}
                      onChange={() => setFormData({...formData, workType: type})}
                      className="mr-2"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Number of openings*</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={formData.openings}
              onChange={(e) => setFormData({...formData, openings: e.target.value})}
              placeholder="e.g. 4"
              required
              min="1"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Job description*</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="4"
              required
              placeholder="Detailed description of the job role and expectations"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Qualifications* (at least one required)</label>
            {formData.qualifications.map((qual, index) => (
              <input
                key={index}
                type="text"
                className="w-full p-2 border rounded mb-2"
                value={qual}
                onChange={(e) => {
                  const newQualifications = [...formData.qualifications];
                  newQualifications[index] = e.target.value;
                  setFormData({...formData, qualifications: newQualifications});
                }}
                placeholder={`Qualification ${index + 1}`}
                required={index === 0}
              />
            ))}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Key responsibilities</label>
            {formData.responsibilities.map((resp, index) => (
              <input
                key={index}
                type="text"
                className="w-full p-2 border rounded mb-2"
                value={resp}
                onChange={(e) => {
                  const newResponsibilities = [...formData.responsibilities];
                  newResponsibilities[index] = e.target.value;
                  setFormData({...formData, responsibilities: newResponsibilities});
                }}
                placeholder={`Responsibility ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Additional candidate preferences</label>
            {formData.preferences.map((pref, index) => (
              <input
                key={index}
                type="text"
                className="w-full p-2 border rounded mb-2"
                value={pref}
                onChange={(e) => {
                  const newPreferences = [...formData.preferences];
                  newPreferences[index] = e.target.value;
                  setFormData({...formData, preferences: newPreferences});
                }}
                placeholder={`Preference ${index + 1}`}
              />
            ))}
          </div>
        </section>
        
        {/* Salary & Perks Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Salary & Perks</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Fixed pay (per year)</label>
            <div className="flex gap-4">
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.fixedPayMin}
                onChange={(e) => setFormData({...formData, fixedPayMin: e.target.value})}
                placeholder="Min"
                min="0"
              />
              <span className="flex items-center">to</span>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.fixedPayMax}
                onChange={(e) => setFormData({...formData, fixedPayMax: e.target.value})}
                placeholder="Max"
                min="0"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Variable pay/Incentives (per year)</label>
            <div className="flex gap-4">
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.variablePayMin}
                onChange={(e) => setFormData({...formData, variablePayMin: e.target.value})}
                placeholder="Min"
                min="0"
              />
              <span className="flex items-center">to</span>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.variablePayMax}
                onChange={(e) => setFormData({...formData, variablePayMax: e.target.value})}
                placeholder="Max"
                min="0"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Perks (Select all that apply)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['5 days a week', 'Health Insurance', 'Life Insurance'].map(perk => (
                <label key={perk} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.perks.includes(perk)}
                    onChange={(e) => {
                      const newPerks = e.target.checked
                        ? [...formData.perks, perk]
                        : formData.perks.filter(p => p !== perk);
                      setFormData({...formData, perks: newPerks});
                    }}
                    className="mr-2"
                  />
                  {perk}
                </label>
              ))}
            </div>
          </div>
        </section>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            disabled={!formData.title || !formData.description || formData.qualifications.every(q => !q.trim())}
          >
            Post Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;