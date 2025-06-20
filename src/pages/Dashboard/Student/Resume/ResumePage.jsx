import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getCandidateResume,
  createOrUpdateCandidateResume,
} from '../../../../services/api';
import ResumeParser from './ResumeParser';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Star,
  Calendar,
  MapPin,
  Building,
  Link as LinkIcon,
  Loader2,
  X
} from 'lucide-react';

const ResumePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    profile_details: {}
  });
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState('all');

  useEffect(() => {
    const checkResumeExists = async () => {
      try {
        setIsLoading(true);
        const response = await getCandidateResume();
        
        // Check if we're coming from a job application
        const locationState = location.state;
        const fromJobApplication = locationState?.from;
        
        if (response.data && response.data.detail === "Resume not found.") {
          setResumeData(null);
          setShowImportPopup(true);
        } else if (response.data) {
          // Resume exists, set the data
          setResumeData({
            ...response.data,
            education: Array.isArray(response.data.education) ? response.data.education : [],
            work_experiences: Array.isArray(response.data.work_experiences) ? response.data.work_experiences : [],
            skills: Array.isArray(response.data.skills) ? response.data.skills : [],
          });
          setFormData({
            ...response.data,
            education: Array.isArray(response.data.education) ? response.data.education : [],
            work_experiences: Array.isArray(response.data.work_experiences) ? response.data.work_experiences : [],
            skills: Array.isArray(response.data.skills) ? response.data.skills : [],
          });
          setEditMode(false);
          setShowImportPopup(false);
          
          // If we came here from a job application and just created the resume, redirect back
          if (fromJobApplication && locationState?.newlyCreated) {
            navigate(fromJobApplication);
          }
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
        toast.error('Failed to load resume data');
        setShowImportPopup(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkResumeExists();
  }, [location.state, navigate]);

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
      
      // Check if we came from a job application
      const fromJobApplication = location.state?.from;
      if (fromJobApplication) {
        // Redirect back to the job with state indicating we just created the resume
        navigate(fromJobApplication, { 
          state: { newlyCreated: true },
          replace: true
        });
      }
    } catch (error) {
      toast.error('Failed to save resume');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for input fields
  };

  const displayDate = (dateString) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  if (isLoading && !resumeData && !showImportPopup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#18005F] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Resume</h1>
            <p className="text-gray-600">Build and manage your professional resume</p>
          </div>
          {!editMode && resumeData && (
            <div className="flex space-x-4">
              <button
                onClick={() => setEditMode(true)}
                className="inline-flex items-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors shadow-md"
              >
                <FileText className="w-4 h-4 mr-2" />
                Edit Resume
              </button>
            </div>
          )}
        </div>

        {/* Import Resume Popup */}
        {showImportPopup && (
          <ImportResumePopup 
            onClose={() => {
              // Only allow closing if resume exists
              if (resumeData) {
                setShowImportPopup(false);
              }
            }}
            onManualCreate={() => {
              setShowImportPopup(false);
              setEditMode(true);
              // Initialize empty form if creating manually
              setFormData({
                career_objective: '',
                education: [],
                work_experiences: [],
                skills: [],
                academic_projects: [],
                profile_details: {}
              });
            }}
            onParsedData={(parsedData) => {
              setFormData(prev => ({
                ...prev,
                ...parsedData,
                education: Array.isArray(parsedData.education) ? parsedData.education : [],
                work_experiences: Array.isArray(parsedData.work_experiences) ? parsedData.work_experiences : [],
                skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
              }));
              setShowImportPopup(false);
              setEditMode(true);
            }}
          />
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
              formatDate={formatDate}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          ) : (
            <ResumeView 
              data={resumeData} 
              displayDate={displayDate}
              onEdit={() => setEditMode(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ImportResumePopup = ({ onClose, onManualCreate, onParsedData }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#18005F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[#18005F]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Resume</h2>
          <p className="text-gray-600">Choose how you want to build your resume</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Import your resume (Recommended)</h3>
            <p className="text-sm text-gray-600 mb-4">
              We'll scan your resume and pre-fill sections to help you save time
            </p>
            <ResumeParser onParsedData={onParsedData} />
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Create resume manually</h3>
            <p className="text-sm text-gray-600 mb-4">
              Fill information in each section to create your resume
            </p>
            <button
              onClick={onManualCreate}
              className="w-full bg-white border border-gray-300 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Create manually
            </button>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-6 text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Close
          </button>
        )}
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
  isLoading,
  formatDate,
  activeSection,
  setActiveSection
}) => {
  const sections = [
    { id: 'all', label: 'All Sections', icon: FileText },
    { id: 'objective', label: 'Career Objective', icon: Star },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Award }
  ];

  const showSection = (sectionId) => {
    return activeSection === 'all' || activeSection === sectionId;
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onCancel}
            className="inline-flex items-center text-gray-600 hover:text-[#18005F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back</span>
          </button>
        </div>
        
        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                  activeSection === section.id
                    ? 'bg-[#18005F] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Career Objective */}
          {showSection('objective') && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-[#18005F]" />
                Career Objective
              </h2>
              <textarea
                name="career_objective"
                value={formData.career_objective}
                onChange={onInputChange}
                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                rows={4}
                placeholder="Write a brief summary of your career goals and what you're looking for..."
              />
            </div>
          )}

          {/* Education */}
          {showSection('education') && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-[#18005F]" />
                  Education
                </h2>
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
                  className="inline-flex items-center px-3 py-2 bg-[#18005F]/10 text-[#18005F] rounded-lg hover:bg-[#18005F]/20 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </button>
              </div>
              
              {formData.education.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No education details added yet</p>
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
                    className="inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Education #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem('education', index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Institution/School Name*
                          </label>
                          <input
                            type="text"
                            value={edu.college_or_school_name}
                            onChange={(e) => onArrayChange('education', index, 'college_or_school_name', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            placeholder="e.g., Harvard University"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Degree*
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => onArrayChange('education', index, 'degree', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            placeholder="e.g., Bachelor of Science"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field of Study/Major
                          </label>
                          <input
                            type="text"
                            value={edu.stream}
                            onChange={(e) => onArrayChange('education', index, 'stream', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Performance Type
                          </label>
                          <select
                            value={edu.performance_type}
                            onChange={(e) => onArrayChange('education', index, 'performance_type', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                          >
                            <option value="CGPA">CGPA</option>
                            <option value="Percentage">Percentage</option>
                            <option value="GPA">GPA</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Year*
                          </label>
                          <input
                            type="number"
                            value={edu.start_year}
                            onChange={(e) => onArrayChange('education', index, 'start_year', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            placeholder="e.g., 2018"
                            min="1900"
                            max="2099"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Year*
                          </label>
                          <input
                            type="number"
                            value={edu.end_year}
                            onChange={(e) => onArrayChange('education', index, 'end_year', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            placeholder="e.g., 2022"
                            min="1900"
                            max="2099"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Score ({edu.performance_type})
                          </label>
                          <input
                            type="text"
                            value={edu.performance_score}
                            onChange={(e) => onArrayChange('education', index, 'performance_score', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            placeholder={edu.performance_type === 'CGPA' ? 'e.g., 3.8' : 'e.g., 85%'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Work Experience */}
          {showSection('experience') && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-[#18005F]" />
                  Work Experience
                </h2>
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
                  className="inline-flex items-center px-3 py-2 bg-[#18005F]/10 text-[#18005F] rounded-lg hover:bg-[#18005F]/20 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </button>
              </div>
              
              {formData.work_experiences.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No work experience added yet</p>
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
                    className="inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.work_experiences.map((exp, index) => (
                    <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Experience #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem('work_experiences', index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Experience Type*
                          </label>
                          <select
                            value={exp.type}
                            onChange={(e) => onArrayChange('work_experiences', index, 'type', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            required
                          >
                            <option value="INTERNSHIP">Internship</option>
                            <option value="JOB">Full-time Job</option>
                            <option value="PART_TIME">Part-time Job</option>
                            <option value="FREELANCE">Freelance</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title/Designation*
                          </label>
                          <input
                            type="text"
                            value={exp.designation}
                            onChange={(e) => onArrayChange('work_experiences', index, 'designation', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            placeholder="e.g., Software Engineer"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company/Organization*
                          </label>
                          <input
                            type="text"
                            value={exp.organization}
                            onChange={(e) => onArrayChange('work_experiences', index, 'organization', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            placeholder="e.g., Google"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location Type
                          </label>
                          <select
                            value={exp.location_type}
                            onChange={(e) => onArrayChange('work_experiences', index, 'location_type', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                          >
                            <option value="ON_SITE">On Site</option>
                            <option value="REMOTE">Remote</option>
                            <option value="HYBRID">Hybrid</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => onArrayChange('work_experiences', index, 'location', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                          placeholder="e.g., San Francisco, CA"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date*
                          </label>
                          <input
                            type="date"
                            value={formatDate(exp.start_date)}
                            onChange={(e) => onArrayChange('work_experiences', index, 'start_date', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={formatDate(exp.end_date)}
                            onChange={(e) => onArrayChange('work_experiences', index, 'end_date', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            disabled={exp.currently_working}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={exp.currently_working}
                            onChange={(e) => onArrayChange('work_experiences', index, 'currently_working', e.target.checked)}
                            className="h-4 w-4 text-[#18005F] focus:ring-[#18005F] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">I currently work here</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => onArrayChange('work_experiences', index, 'description', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                          rows={3}
                          placeholder="Describe your responsibilities, achievements, and the skills you used or developed..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {showSection('skills') && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2 text-[#18005F]" />
                Skills
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add your technical and professional skills
                </label>
                <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
                  {formData.skills.length === 0 ? (
                    <div className="w-full text-center text-gray-500">
                      No skills added yet. Add skills to showcase your expertise.
                    </div>
                  ) : (
                    formData.skills.map((skill, index) => (
                      <div 
                        key={index} 
                        className="bg-[#18005F]/10 text-[#18005F] px-3 py-1.5 rounded-lg flex items-center"
                      >
                        <span className="font-medium">{skill.name || skill}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveItem('skills', index)}
                          className="ml-2 text-[#18005F]/70 hover:text-[#18005F] p-1 rounded-full hover:bg-[#18005F]/20 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex">
                  <input
                    type="text"
                    id="skill-input"
                    placeholder="Type a skill and press Enter (e.g., JavaScript, Project Management)"
                    className="flex-1 p-3 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        onAddItem('skills', { name: e.target.value.trim() });
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('skill-input');
                      if (input.value.trim()) {
                        onAddItem('skills', { name: input.value.trim() });
                        input.value = '';
                      }
                    }}
                    className="px-4 py-3 bg-[#18005F] text-white rounded-r-lg hover:bg-[#18005F]/90 transition-colors shadow-sm"
                  >
                    Add
                  </button>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Popular skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {['JavaScript', 'Python', 'React', 'SQL', 'Project Management', 'Communication', 'Leadership'].map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          // Check if skill already exists
                          const exists = formData.skills.some(s => 
                            (s.name || s).toLowerCase() === skill.toLowerCase()
                          );
                          if (!exists) {
                            onAddItem('skills', { name: skill });
                          }
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects */}
          {showSection('projects') && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-[#18005F]" />
                  Projects
                </h2>
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
                  className="inline-flex items-center px-3 py-2 bg-[#18005F]/10 text-[#18005F] rounded-lg hover:bg-[#18005F]/20 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </button>
              </div>
              
              {formData.academic_projects.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No projects added yet</p>
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
                    className="inline-flex items-center px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.academic_projects.map((project, index) => (
                    <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Project #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => onRemoveItem('academic_projects', index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project Title*
                        </label>
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => onArrayChange('academic_projects', index, 'title', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                          placeholder="e.g., E-commerce Website"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={formatDate(project.start_date)}
                            onChange={(e) => onArrayChange('academic_projects', index, 'start_date', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={formatDate(project.end_date)}
                            onChange={(e) => onArrayChange('academic_projects', index, 'end_date', e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                            disabled={project.currently_ongoing}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={project.currently_ongoing}
                            onChange={(e) => onArrayChange('academic_projects', index, 'currently_ongoing', e.target.checked)}
                            className="h-4 w-4 text-[#18005F] focus:ring-[#18005F] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">This project is ongoing</span>
                        </label>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project Link
                        </label>
                        <input
                          type="url"
                          value={project.project_link}
                          onChange={(e) => onArrayChange('academic_projects', index, 'project_link', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                          placeholder="e.g., https://github.com/yourusername/project"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description*
                        </label>
                        <textarea
                          value={project.description}
                          onChange={(e) => onArrayChange('academic_projects', index, 'description', e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#18005F]/20 focus:border-[#18005F] transition-colors shadow-sm"
                          rows={3}
                          placeholder="Describe the project, technologies used, your role, and achievements..."
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8 sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-b-xl shadow-lg">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Resume
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResumeView = ({ data, displayDate, onEdit }) => {
  if (!data) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Resume Found</h3>
        <p className="text-gray-600 mb-6">You haven't created a resume yet.</p>
        <button
          onClick={onEdit}
          className="inline-flex items-center px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors shadow-md"
        >
          <FileText className="w-5 h-5 mr-2" />
          Create Resume
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header with Career Objective */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Professional Summary</h2>
          <button
            onClick={onEdit}
            className="inline-flex items-center px-4 py-2 bg-[#18005F]/10 text-[#18005F] rounded-lg hover:bg-[#18005F]/20 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Edit Resume
          </button>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          {data.career_objective ? (
            <p className="text-gray-700 leading-relaxed">{data.career_objective}</p>
          ) : (
            <p className="text-gray-500 italic">No career objective provided</p>
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <GraduationCap className="w-6 h-6 mr-2 text-[#18005F]" />
          Education
        </h2>
        
        {data.education && data.education.length > 0 ? (
          <div className="space-y-6">
            {data.education.map((edu, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{edu.degree || 'Degree'}{edu.stream ? ` in ${edu.stream}` : ''}</h3>
                    <p className="text-lg text-gray-700 mb-2">{edu.college_or_school_name || 'Institution'}</p>
                    
                    {edu.performance_score && (
                      <div className="inline-flex items-center px-3 py-1 bg-[#18005F]/10 text-[#18005F] rounded-lg text-sm font-medium">
                        <Star className="w-4 h-4 mr-2" />
                        {edu.performance_type}: {edu.performance_score}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{edu.start_year || 'Start'} - {edu.end_year || 'Present'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No education information added</p>
          </div>
        )}
      </div>

      {/* Work Experience Section */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Briefcase className="w-6 h-6 mr-2 text-[#18005F]" />
          Work Experience
        </h2>
        
        {data.work_experiences && data.work_experiences.length > 0 ? (
          <div className="space-y-6">
            {data.work_experiences.map((exp, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                        exp.type === 'INTERNSHIP' 
                          ? 'bg-green-50 text-green-700 border border-green-100' 
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {exp.type === 'INTERNSHIP' ? 'Internship' : 'Job'}
                      </span>
                      
                      {exp.currently_working && (
                        <span className="ml-2 inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900">{exp.designation || 'Position'}</h3>
                    <p className="text-lg text-gray-700 mb-2">{exp.organization || 'Company'}</p>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      {exp.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {exp.location}
                        </div>
                      )}
                      
                      {exp.location_type && (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {exp.location_type === 'ON_SITE' ? 'On-site' : 
                           exp.location_type === 'REMOTE' ? 'Remote' : 'Hybrid'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {displayDate(exp.start_date)} - {exp.currently_working ? 'Present' : displayDate(exp.end_date)}
                    </span>
                  </div>
                </div>
                
                {exp.description && (
                  <div className="mt-4 text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
                    <p className="whitespace-pre-line">{exp.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No work experience added</p>
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="mb-8 pb-8 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Code className="w-6 h-6 mr-2 text-[#18005F]" />
          Skills
        </h2>
        
        {data.skills && data.skills.length > 0 ? (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex flex-wrap gap-3">
              {data.skills.map((skill, index) => (
                <div key={index} className="px-4 py-2 bg-[#18005F]/10 text-[#18005F] rounded-lg font-medium">
                  {skill.name || skill}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No skills added</p>
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Award className="w-6 h-6 mr-2 text-[#18005F]" />
          Projects
        </h2>
        
        {data.academic_projects && data.academic_projects.length > 0 ? (
          <div className="space-y-6">
            {data.academic_projects.map((project, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{project.title || 'Project Title'}</h3>
                    
                    {project.currently_ongoing && (
                      <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-100 mt-2">
                        <Clock className="w-3 h-3 mr-1" />
                        Ongoing
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {displayDate(project.start_date)} - {project.currently_ongoing ? 'Present' : displayDate(project.end_date)}
                    </span>
                  </div>
                </div>
                
                {project.description && (
                  <div className="mt-2 text-gray-700 bg-white p-4 rounded-lg border border-gray-200 mb-4">
                    <p className="whitespace-pre-line">{project.description}</p>
                  </div>
                )}
                
                {project.project_link && (
                  <a 
                    href={project.project_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center text-[#18005F] hover:text-[#18005F]/80 font-medium"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    View Project
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No projects added</p>
          </div>
        )}
      </div>

      {/* Resume Actions */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center text-gray-600">
          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
        
        <button
          onClick={onEdit}
          className="inline-flex items-center px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors shadow-md"
        >
          <FileText className="w-5 h-5 mr-2" />
          Edit Resume
        </button>
      </div>
    </div>
  );
};

export default ResumePage;