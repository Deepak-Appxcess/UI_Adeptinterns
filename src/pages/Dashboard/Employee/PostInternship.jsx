import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInternship } from '../../../services/api';

const PostInternship = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    
    applicationDeadline: '',
    profile: '',
    skillsRequired: '',
    internshipType: 'In office',
    workType: 'Full-time',
    openings: '',
    startImmediately: true,
    startDate: '',
    duration: '3',
    responsibilities: ['', '', ''],
    preferences: ['', '', ''],
    isPaid: false,
    fixedStipendMin: '',
    fixedStipendMax: '',
    incentivesMin: '',
    incentivesMax: '',
    hasPPO: false,
    perks: [],
    screeningQuestions: [],
    allowWomenReturnship: false,
    alternateMobile: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInternship(formData);
      navigate('/dashboard/employee');
    } catch (error) {
      console.error('Error posting internship:', error);
      // You might want to add error handling here (e.g., show a toast notification)
    }
  };

  const addScreeningQuestion = () => {
    setFormData({
      ...formData,
      screeningQuestions: [...formData.screeningQuestions, '']
    });
  };

  const updateScreeningQuestion = (index, value) => {
    const newQuestions = [...formData.screeningQuestions];
    newQuestions[index] = value;
    setFormData({ ...formData, screeningQuestions: newQuestions });
  };

  const togglePerk = (perk) => {
    if (formData.perks.includes(perk)) {
      setFormData({
        ...formData,
        perks: formData.perks.filter(p => p !== perk)
      });
    } else {
      setFormData({
        ...formData,
        perks: [...formData.perks, perk]
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Post Internship</h1>
      <form onSubmit={handleSubmit}>
        {/* Company Information Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Company Information</h2>
          
       
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Application Deadline *</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.applicationDeadline}
              onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
              required
            />
          </div>
        </section>

        {/* Opportunity Type Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Opportunity type</h2>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="opportunityType"
                className="mr-2"
                checked={false}
                onChange={() => navigate('/post-job')}
              />
              Job
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="opportunityType"
                className="mr-2"
                checked={true}
                readOnly
              />
              Internship
            </label>
          </div>
        </section>

        {/* Internship Details Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Internship details</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Internship profile *</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.profile}
              onChange={(e) => setFormData({...formData, profile: e.target.value})}
              placeholder="e.g. Android App Development"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Skills required *</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.skillsRequired}
              onChange={(e) => setFormData({...formData, skillsRequired: e.target.value})}
              placeholder="e.g. Java, React"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Internship type</label>
              <div className="space-y-2">
                {['In office', 'Hybrid', 'Remote'].map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="internshipType"
                      checked={formData.internshipType === type}
                      onChange={() => setFormData({...formData, internshipType: type})}
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
            <label className="block text-gray-700 mb-2">Number of openings *</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={formData.openings}
              onChange={(e) => setFormData({...formData, openings: e.target.value})}
              placeholder="e.g. 4"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Internship start date</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="startDate"
                  checked={formData.startImmediately}
                  onChange={() => setFormData({...formData, startImmediately: true})}
                  className="mr-2"
                />
                Immediately (within next 30 days)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="startDate"
                  checked={!formData.startImmediately}
                  onChange={() => setFormData({...formData, startImmediately: false})}
                  className="mr-2"
                />
                Later
              </label>
            </div>
            {!formData.startImmediately && (
              <input
                type="date"
                className="w-full p-2 border rounded mt-2"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Internship duration</label>
            <div className="flex items-center gap-2">
              <select
                className="p-2 border rounded"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              >
                {['1', '2', '3', '4', '5', '6'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <span>months</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Intern's responsibilities *</label>
            <p className="text-sm text-gray-500 mb-2">Selected intern's day-to-day responsibilities include:</p>
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
                required={index === 0} // At least first responsibility is required
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

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allowWomenReturnship}
                onChange={(e) => setFormData({...formData, allowWomenReturnship: e.target.checked})}
                className="mr-2"
              />
              Allow applications from women also who are willing to start/restart their career.
              <a href="#" className="text-blue-600 ml-1">Know more</a>
            </label>
          </div>
        </section>
        
        {/* Stipend & Perks Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Stipend & perks</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Stipend</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={() => setFormData({...formData, isPaid: true})}
                  className="mr-2"
                />
                Paid
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isPaid"
                  checked={!formData.isPaid}
                  onChange={() => setFormData({...formData, isPaid: false})}
                  className="mr-2"
                />
                Unpaid
              </label>
            </div>
          </div>
          
          {formData.isPaid && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Fixed stipend</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-24 p-2 border rounded"
                    value={formData.fixedStipendMin}
                    onChange={(e) => setFormData({...formData, fixedStipendMin: e.target.value})}
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    className="w-24 p-2 border rounded"
                    value={formData.fixedStipendMax}
                    onChange={(e) => setFormData({...formData, fixedStipendMax: e.target.value})}
                    placeholder="Max"
                  />
                  <span>/month</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Incentives</label>
                <p className="text-sm text-gray-500 mb-2">
                  If the role includes incentives/variable pay, we recommend mentioning it to attract better talent.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-24 p-2 border rounded"
                    value={formData.incentivesMin}
                    onChange={(e) => setFormData({...formData, incentivesMin: e.target.value})}
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    className="w-24 p-2 border rounded"
                    value={formData.incentivesMax}
                    onChange={(e) => setFormData({...formData, incentivesMax: e.target.value})}
                    placeholder="Max"
                  />
                  <span>/month</span>
                </div>
              </div>
            </>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Does this internship come with a pre-placement offer (PPO)?</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasPPO"
                  checked={formData.hasPPO}
                  onChange={() => setFormData({...formData, hasPPO: true})}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasPPO"
                  checked={!formData.hasPPO}
                  onChange={() => setFormData({...formData, hasPPO: false})}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Perks (Select all that apply)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'Certificate',
                'Letter of recommendation',
                'Flexible work hours',
                '5 days a week',
                'Informal dress code',
                'Free snacks & beverages'
              ].map(perk => (
                <label key={perk} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.perks.includes(perk)}
                    onChange={() => togglePerk(perk)}
                    className="mr-2"
                  />
                  {perk}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Screening Questions Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Screening Questions</h2>
          <p className="text-sm text-gray-500 mb-4">
            You can use these questions to filter relevant applications
          </p>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Availability (Default)</label>
            <p className="text-sm text-gray-500 mb-2">
              Please confirm your availability for this internship. If not available immediately, how early would you be able to join?
            </p>
          </div>
          
          {formData.screeningQuestions.map((question, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={question}
                onChange={(e) => updateScreeningQuestion(index, e.target.value)}
                placeholder={`Question ${index + 1}`}
              />
            </div>
          ))}
          
          <button
            type="button"
            onClick={addScreeningQuestion}
            className="text-blue-600 flex items-center gap-1"
          >
            <span>+</span> Add more questions (Optional)
          </button>
        </section>

        {/* Alternate Mobile Number Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Alternate mobile number for this listing</h2>
          <p className="text-sm text-gray-500 mb-4">
            Our team will call you on this number in case of any query regarding this listing only. Primary account number will not be updated.
          </p>
          
          <div className="flex items-center gap-2">
            <span className="p-2 border rounded">+91</span>
            <input
              type="tel"
              className="w-full p-2 border rounded"
              value={formData.alternateMobile}
              onChange={(e) => setFormData({...formData, alternateMobile: e.target.value})}
              placeholder="9952800477"
              maxLength="10"
            />
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded"
          >
            Save draft
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Post internship
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Need assistance? Please visit <a href="#" className="text-blue-600">Help Center</a>
        </div>
      </form>
    </div>
  );
};

export default PostInternship;