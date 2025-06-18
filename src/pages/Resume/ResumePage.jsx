import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getCandidateResume,
  createOrUpdateCandidateResume,
} from '../../services/api';
import ResumeParser from './ResumeParser';

const ResumePage = () => {
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    career_objective: '',
    education: [],
    work_experiences: [],
    extra_curricular_activities: [],
    trainings_courses: [],
    academic_projects: [],
    skills: [],
    portfolio_work_samples: [],
    accomplishments: [],
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const checkResumeExists = async () => {
      try {
        setIsLoading(true);
        const response = await getCandidateResume();
        
        if (response.data && !response.data.detail) {
          setResumeData(response.data);
          setFormData(response.data);
          setEditMode(false);
          setShowImportPopup(false);
        } else {
          setShowImportPopup(true);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setShowImportPopup(true);
        } else {
          toast.error('Failed to fetch resume data');
          console.error('Error fetching resume:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkResumeExists();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleArrayChange = (field, index, key, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index][key] = value;
    setFormData({
      ...formData,
      [field]: updatedArray,
    });
  };

  const addArrayItem = (field, template) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], template],
    });
  };

  const removeArrayItem = (field, index) => {
    const updatedArray = [...formData[field]];
    updatedArray.splice(index, 1);
    setFormData({
      ...formData,
      [field]: updatedArray,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await createOrUpdateCandidateResume(formData);
      const response = await getCandidateResume();
      setResumeData(response.data);
      setEditMode(false);
      toast.success('Resume saved successfully');
    } catch (error) {
      toast.error('Failed to save resume');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading resume data...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {showImportPopup && (
        <ImportResumePopup 
          onClose={() => setShowImportPopup(false)}
          onManualCreate={() => {
            setShowImportPopup(false);
            setEditMode(true);
          }}
          onParsedData={(parsedData) => {
            setFormData(prev => ({
              ...prev,
              career_objective: parsedData.career_objective || '',
              education: parsedData.education || [],
              work_experiences: parsedData.work_experiences || [],
              skills: parsedData.skills || [],
              academic_projects: parsedData.academic_projects || [],
              profile_details: parsedData.profile_details || {}
            }));
            setShowImportPopup(false);
            setEditMode(true);
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Resume</h1>
          {!editMode && resumeData && (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Edit Resume
            </button>
          )}
        </div>

        {editMode ? (
          <ResumeForm
            formData={formData}
            onInputChange={handleInputChange}
            onArrayChange={handleArrayChange}
            onAddItem={addArrayItem}
            onRemoveItem={removeArrayItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              if (resumeData) {
                setFormData(resumeData);
                setEditMode(false);
              } else {
                setShowImportPopup(true);
              }
            }}
            isLoading={isLoading}
          />
        ) : (
          <ResumeView data={resumeData} />
        )}
      </div>
    </div>
  );
};

const ImportResumePopup = ({ onClose, onManualCreate, onParsedData }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Create Your Resume</h2>
        <p className="mb-4">Choose an option below</p>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Import your resume (Recommended)</h3>
          <p className="text-sm text-gray-600 mb-2">
            We will scan your resume and pre-fill sections to help you save time
          </p>
          <ResumeParser onParsedData={onParsedData} />
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-2">Create resume manually</h3>
          <p className="text-sm text-gray-600 mb-2">
            Fill information in each section to create your resume
          </p>
          <button
            onClick={onManualCreate}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded"
          >
            Create manually
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const ResumeForm = ({
  formData,
  onInputChange,
  onArrayChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  onCancel,
  isLoading
}) => {
  return (
    <form onSubmit={onSubmit}>
      {/* Career Objective */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Career Objective</label>
        <textarea
          name="career_objective"
          value={formData.career_objective}
          onChange={(e) => onInputChange(e)}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      {/* Education */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-lg font-medium">Education</label>
          <button
            type="button"
            onClick={() => onAddItem('education', {
              college_or_school_name: '',
              start_year: '',
              end_year: '',
              degree: '',
              stream: '',
              performance_score: '',
              performance_type: 'CGPA'
            })}
            className="text-blue-500"
          >
            + Add Education
          </button>
        </div>
        {formData.education.map((edu, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium">Institution</label>
                <input
                  type="text"
                  value={edu.college_or_school_name}
                  onChange={(e) => onArrayChange('education', index, 'college_or_school_name', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => onArrayChange('education', index, 'degree', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium">Field of Study</label>
                <input
                  type="text"
                  value={edu.stream}
                  onChange={(e) => onArrayChange('education', index, 'stream', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Performance Type</label>
                <select
                  value={edu.performance_type}
                  onChange={(e) => onArrayChange('education', index, 'performance_type', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="CGPA">CGPA</option>
                  <option value="Percentage">Percentage</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium">Start Year</label>
                <input
                  type="number"
                  value={edu.start_year}
                  onChange={(e) => onArrayChange('education', index, 'start_year', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Year</label>
                <input
                  type="number"
                  value={edu.end_year}
                  onChange={(e) => onArrayChange('education', index, 'end_year', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Score</label>
                <input
                  type="text"
                  value={edu.performance_score}
                  onChange={(e) => onArrayChange('education', index, 'performance_score', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemoveItem('education', index)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Skills</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.skills.map((skill, index) => (
            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
              <span>{skill.name || skill}</span>
              <button
                type="button"
                onClick={() => onRemoveItem('skills', index)}
                className="ml-2 text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            placeholder="Add skill"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                onAddItem('skills', { name: e.target.value.trim() });
                e.target.value = '';
              }
            }}
            className="flex-1 p-2 border rounded-l"
          />
          <button
            type="button"
            onClick={() => {
              const input = document.querySelector('input[placeholder="Add skill"]');
              if (input.value.trim()) {
                onAddItem('skills', { name: input.value.trim() });
                input.value = '';
              }
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
          >
            Add
          </button>
        </div>
      </div>

      {/* Work Experience */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-lg font-medium">Work Experience</label>
          <button
            type="button"
            onClick={() => onAddItem('work_experiences', {
              type: 'INTERNSHIP',
              designation: '',
              profile: '',
              organization: '',
              location: '',
              location_type: 'ON_SITE',
              start_date: '',
              end_date: '',
              currently_working: false,
              description: ''
            })}
            className="text-blue-500"
          >
            + Add Work Experience
          </button>
        </div>
        {formData.work_experiences.map((exp, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium">Type</label>
                <select
                  value={exp.type}
                  onChange={(e) => onArrayChange('work_experiences', index, 'type', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="INTERNSHIP">Internship</option>
                  <option value="JOB">Job</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Designation</label>
                <input
                  type="text"
                  value={exp.designation}
                  onChange={(e) => onArrayChange('work_experiences', index, 'designation', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium">Organization</label>
                <input
                  type="text"
                  value={exp.organization}
                  onChange={(e) => onArrayChange('work_experiences', index, 'organization', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Location Type</label>
                <select
                  value={exp.location_type}
                  onChange={(e) => onArrayChange('work_experiences', index, 'location_type', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="ON_SITE">On Site</option>
                  <option value="REMOTE">Remote</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  value={exp.start_date}
                  onChange={(e) => onArrayChange('work_experiences', index, 'start_date', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Date</label>
                <input
                  type="date"
                  value={exp.end_date}
                  onChange={(e) => onArrayChange('work_experiences', index, 'end_date', e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={exp.currently_working}
                />
              </div>
            </div>
            <div className="mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exp.currently_working}
                  onChange={(e) => onArrayChange('work_experiences', index, 'currently_working', e.target.checked)}
                  className="mr-2"
                />
                Currently working here
              </label>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={exp.description}
                onChange={(e) => onArrayChange('work_experiences', index, 'description', e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemoveItem('work_experiences', index)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-lg font-medium">Projects</label>
          <button
            type="button"
            onClick={() => onAddItem('academic_projects', {
              title: '',
              description: '',
              start_date: '',
              end_date: '',
              project_link: '',
              currently_ongoing: false
            })}
            className="text-blue-500"
          >
            + Add Project
          </button>
        </div>
        {formData.academic_projects.map((project, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <div className="mb-2">
              <label className="block text-sm font-medium">Title</label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => onArrayChange('academic_projects', index, 'title', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  value={project.start_date}
                  onChange={(e) => onArrayChange('academic_projects', index, 'start_date', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Date</label>
                <input
                  type="date"
                  value={project.end_date}
                  onChange={(e) => onArrayChange('academic_projects', index, 'end_date', e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={project.currently_ongoing}
                />
              </div>
            </div>
            <div className="mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={project.currently_ongoing}
                  onChange={(e) => onArrayChange('academic_projects', index, 'currently_ongoing', e.target.checked)}
                  className="mr-2"
                />
                Currently ongoing
              </label>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium">Project Link</label>
              <input
                type="url"
                value={project.project_link}
                onChange={(e) => onArrayChange('academic_projects', index, 'project_link', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={project.description}
                onChange={(e) => onArrayChange('academic_projects', index, 'description', e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemoveItem('academic_projects', index)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-800 px-6 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Resume'}
        </button>
      </div>
    </form>
  );
};

const ResumeView = ({ data }) => {
  if (!data) {
    return <p>No resume data available</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Career Objective</h2>
        <p>{data.career_objective || 'Not specified'}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Education</h2>
        {data.education.length > 0 ? (
          data.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-semibold">{edu.degree} in {edu.stream}</h3>
              <p>{edu.college_or_school_name}</p>
              <p>{edu.start_year} - {edu.end_year}</p>
              <p>{edu.performance_type}: {edu.performance_score}</p>
            </div>
          ))
        ) : (
          <p>No education information added</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.length > 0 ? (
            data.skills.map((skill, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 rounded-full">
                {skill.name || skill}
              </span>
            ))
          ) : (
            <p>No skills added</p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Work Experience</h2>
        {data.work_experiences.length > 0 ? (
          data.work_experiences.map((exp, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-semibold">{exp.designation} at {exp.organization}</h3>
              <p>
                {new Date(exp.start_date).toLocaleDateString()} -{' '}
                {exp.currently_working ? 'Present' : new Date(exp.end_date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">{exp.location} ({exp.location_type})</p>
              <p className="mt-2">{exp.description}</p>
            </div>
          ))
        ) : (
          <p>No work experience added</p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Projects</h2>
        {data.academic_projects.length > 0 ? (
          data.academic_projects.map((project, index) => (
            <div key={index} className="mb-4">
              <h3 className="font-semibold">{project.title}</h3>
              <p>
                {project.start_date && new Date(project.start_date).toLocaleDateString()} -{' '}
                {project.currently_ongoing ? 'Ongoing' : 
                 (project.end_date ? new Date(project.end_date).toLocaleDateString() : '')}
              </p>
              {project.project_link && (
                <a href={project.project_link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  View Project
                </a>
              )}
              <p className="mt-2">{project.description}</p>
            </div>
          ))
        ) : (
          <p>No projects added</p>
        )}
      </div>
    </div>
  );
};

export default ResumePage;