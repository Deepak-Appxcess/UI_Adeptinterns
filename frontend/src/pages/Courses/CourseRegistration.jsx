import { useState } from 'react';
import { motion } from 'framer-motion';

function CourseRegistration({ courseTitle }) {
  const [formData, setFormData] = useState({
    Email: '',
    Name_First: '',
    Name_Last: '',
    PhoneNumber_countrycodeval: '',
    PhoneNumber_countrycode: '',
    SingleLine1: courseTitle || '',
    Dropdown: '-Select-',
    SingleLine: '',
    Dropdown3: 'Upskill effectively in one day'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission to Zoho
    const form = e.target;
    form.action = 'https://forms.zohopublic.in/adeptinterns1/form/Course1/formperma/fdpRV6mlOy608PUcH9MTZk0dh1iA6aiNI12ol-WqP7I/htmlRecords/submit';
    form.submit();
  };  

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-6 text-gray-900">Register for {courseTitle}</h3>
      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        name="form" 
        id="form" 
        method="POST" 
        acceptCharset="UTF-8" 
        encType="multipart/form-data"
      >
        <input type="hidden" name="zf_referrer_name" value="" />
        <input type="hidden" name="zf_redirect_url" value="" />
        <input type="hidden" name="zc_gad" value="" />

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="Email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            value={formData.Email}
            onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
          />
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Name_First"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              value={formData.Name_First}
              onChange={(e) => setFormData({ ...formData, Name_First: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="Name_Last"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              value={formData.Name_Last}
              onChange={(e) => setFormData({ ...formData, Name_Last: e.target.value })}
            />
          </div>
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <input
              type="text"
              name="PhoneNumber_countrycodeval"
              className="w-20 px-4 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="Code"
              value={formData.PhoneNumber_countrycodeval}
              onChange={(e) => setFormData({ ...formData, PhoneNumber_countrycodeval: e.target.value })}
            />
            <input
              type="text"
              name="PhoneNumber_countrycode"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="Number"
              value={formData.PhoneNumber_countrycode}
              onChange={(e) => setFormData({ ...formData, PhoneNumber_countrycode: e.target.value })}
            />
          </div>
        </div>

        {/* Course (hidden if courseTitle is provided) */}
        {!courseTitle && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course
            </label>
            <input
              type="text"
              name="SingleLine1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              value={formData.SingleLine1}
              onChange={(e) => setFormData({ ...formData, SingleLine1: e.target.value })}
            />
          </div>
        )}

        {/* Objective Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            My objective for learning Zapier is to <span className="text-red-500">*</span>
          </label>
          <select
            name="Dropdown"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            value={formData.Dropdown}
            onChange={(e) => setFormData({ ...formData, Dropdown: e.target.value })}
          >
            <option value="-Select-">Choose your Objective</option>
            <option value="Learn new skills">Learn new skills</option>
            <option value="Create my own projects">Create my own projects</option>
            <option value="Get a job or internship">Get a job or internship</option>
            <option value="Earn a certificate">Earn a certificate</option>
            <option value="Fulfill academic or institutional requirements">
              Fulfill academic or institutional requirements
            </option>
          </select>
        </div>

        {/* Choose batch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Choose batch
          </label>
          <input
            type="text"
            name="SingleLine"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            value={formData.SingleLine}
            onChange={(e) => setFormData({ ...formData, SingleLine: e.target.value })}
          />
        </div>

        {/* Learning Approach Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Your Preferred Learning Approach for Zapier <span className="text-red-500">*</span>
          </label>
          <select
            name="Dropdown3"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            value={formData.Dropdown3}
            onChange={(e) => setFormData({ ...formData, Dropdown3: e.target.value })}
          >
            <option value="Upskill effectively in one day">
              Upskill effectively in one day
            </option>
          </select>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition duration-200"
        >
          Submit
        </motion.button>
      </form>
    </div>
  );
}

export default CourseRegistration;