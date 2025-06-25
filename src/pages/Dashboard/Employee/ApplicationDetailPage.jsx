import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApplicationDetails, updateApplicationStatus } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Edit2,
  CheckCircle2,
  X,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Link2,
  BookOpen,
  Trophy,
  User,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const statusOptions = [
  { value: 'APPLIED', label: 'Applied', color: 'bg-gray-400' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-blue-500' },
  { value: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-purple-500' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-500' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'bg-green-500' }
];

const ApplicationDetailPage = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchApplicationDetails(appId);
        setApplication(response.data || null);
        setStatus(response.data?.status || '');
      } catch (err) {
        console.error('Failed to fetch application details:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to fetch application details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appId]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleSaveStatus = async () => {
    try {
      setLoading(true);
      await updateApplicationStatus(appId, { status });
      setApplication(prev => ({ ...prev, status }));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDialog = () => {
    setOpenDialog(false);
    handleSaveStatus();
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-400';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const renderCandidateName = () => {
    const firstName = application?.candidate_profile?.first_name || '';
    const lastName = application?.candidate_profile?.last_name || '';
    if (!firstName && !lastName) return 'N/A';
    return `${firstName} ${lastName}`.trim();
  };

  const renderOnlineProfiles = () => {
    if (!application?.online_profiles) return null;
    
    const profiles = [];
    const profileFields = [
      { key: 'leetcode_url', label: 'LeetCode', icon: Code2 },
      { key: 'hackerrank_url', label: 'HackerRank', icon: Code2 },
      { key: 'codeforces_url', label: 'Codeforces', icon: Code2 },
      { key: 'codechef_url', label: 'CodeChef', icon: Code2 },
      { key: 'linkedin_url', label: 'LinkedIn', icon: Link2 },
      { key: 'github_url', label: 'GitHub', icon: Code2 }
    ];

    profileFields.forEach(({ key, label, icon: Icon }) => {
      if (application.online_profiles[key]) {
        profiles.push({
          platform: label,
          url: application.online_profiles[key],
          Icon
        });
      }
    });

    if (profiles.length === 0) return null;

    return (
      <>
        <div className="border-t border-gray-200 my-6" />
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Link2 className="w-5 h-5 mr-2 text-[#18005F]" />
          Online Profiles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -2 }}
              className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
            >
              <div className={`w-10 h-10 ${getStatusColor()} rounded-lg flex items-center justify-center mr-3`}>
                <profile.Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{profile.platform}</p>
                <a 
                  href={profile.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#18005F] text-sm hover:underline"
                >
                  {profile.url.length > 30 ? `${profile.url.substring(0, 30)}...` : profile.url}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </>
    );
  };

  const renderEducation = () => {
    if (!application?.resume?.education?.length) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-[#18005F]" />
          Education
        </h3>
        <div className="space-y-4">
          {application.resume.education.map((edu, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <h4 className="font-medium text-gray-900">
                {`${edu.degree || ''}${edu.stream ? ` in ${edu.stream}` : ''}`.trim() || 'Education'}
              </h4>
              <p className="text-gray-600 text-sm mt-1">{edu.college_or_school_name || 'N/A'}</p>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Calendar className="w-4 h-4 mr-1" />
                <span>
                  {edu.start_year ? `${edu.start_year} - ${edu.end_year || 'Present'}` : 'N/A'}
                </span>
                {edu.performance_type && (
                  <span className="ml-4">
                    {edu.performance_type}: {edu.performance_score || 'N/A'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderWorkExperience = () => {
    if (!application?.resume?.work_experiences?.length) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-[#18005F]" />
          Work Experience
        </h3>
        <div className="space-y-4">
          {application.resume.work_experiences.map((exp, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <h4 className="font-medium text-gray-900">
                {`${exp.designation || 'Role'} at ${exp.organization || 'Company'}`}
              </h4>
              {exp.profile && (
                <p className="text-gray-600 text-sm mt-1">{exp.profile}</p>
              )}
              <div className="flex items-center text-sm text-gray-500 mt-2">
                <Calendar className="w-4 h-4 mr-1" />
                <span>
                  {formatDate(exp.start_date)} - {exp.currently_working ? 'Present' : formatDate(exp.end_date) || 'N/A'}
                </span>
                {exp.location && (
                  <span className="ml-4 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {exp.location_type === 'ON_SITE' ? 'On Site' : 'Remote'} | {exp.location}
                  </span>
                )}
              </div>
              {exp.description && (
                <p className="mt-2 text-gray-600 text-sm">{exp.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!application?.resume?.skills?.length) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Code2 className="w-5 h-5 mr-2 text-[#18005F]" />
          Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {application.resume.skills.map((skill, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#18005F]/10 text-[#18005F]"
            >
              {skill.name || 'Skill'}
            </motion.span>
          ))}
        </div>
      </div>
    );
  };

  const renderAcademicProjects = () => {
    if (!application?.resume?.academic_projects?.length) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-[#18005F]" />
          Academic Projects
        </h3>
        <div className="space-y-4">
          {application.resume.academic_projects.map((project, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <h4 className="font-medium text-gray-900">
                {project.title || 'Untitled Project'}
              </h4>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span>
                  {formatDate(project.start_date)} - {project.currently_ongoing ? 'Ongoing' : formatDate(project.end_date) || 'N/A'}
                </span>
              </div>
              {project.description && (
                <p className="mt-2 text-gray-600 text-sm">{project.description}</p>
              )}
              {project.project_link && (
                <a 
                  href={project.project_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#18005F] text-sm mt-2 hover:underline"
                >
                  <Link2 className="w-4 h-4 mr-1" />
                  View Project
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderScreeningAnswers = () => {
    if (!application?.screening_answers?.length) return null;
    
    return (
      <>
        <div className="border-t border-gray-200 my-6" />
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-[#18005F]" />
          Screening Questions
        </h3>
        <div className="space-y-4">
          {application.screening_answers.map((answer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-start">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#18005F]/10 text-[#18005F] font-medium mr-3 flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-800">{answer || 'No answer provided'}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </>
    );
  };

  const renderStatusChart = () => {
    if (!application?.status) return null;

    const currentStatus = statusOptions.find(opt => opt.value === application.status);
    const data = {
      labels: [currentStatus?.label || 'Status', 'Other'],
      datasets: [{
        data: [1, 0.1], // Small slice for visualization
        backgroundColor: [currentStatus?.color || '#18005F', '#E5E7EB'],
        borderWidth: 0,
        cutout: '70%'
      }]
    };

    return (
      <div className="relative w-24 h-24">
        <Pie 
          data={data} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false }
            }
          }} 
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-10 h-10 ${getStatusColor(application.status)} rounded-full flex items-center justify-center`}>
            {currentStatus && (
              <span className="text-xs font-bold text-white">
                {currentStatus.label.charAt(0)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-[#18005F] border-t-transparent" />
          <span className="text-gray-600">Loading application details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">
            {error.includes('Only employers') ? 
              'Only employers can view application details. Please switch to an employer account.' : 
              error}
          </p>
          <div className="flex justify-center space-x-3">
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            {error.includes('Only employers') && (
              <button 
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
              >
                Go to Profile
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Not Found</h3>
          <p className="text-gray-600 mb-4">The requested application could not be found.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="flex items-center mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#18005F]" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Application Details</h1>
                <p className="text-gray-600 text-sm">Review candidate information</p>
              </div>
            </div>
            
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 border border-[#18005F] text-[#18005F] rounded-lg hover:bg-[#18005F]/10 transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Status
              </motion.button>
            ) : (
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsEditing(false);
                    setStatus(application.status);
                  }}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenDialog(true)}
                  className="flex items-center px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Changes
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* Candidate Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                <div className="relative">
                  <img
                    src={application.candidate_profile?.profile_picture_url || ''}
                    alt={renderCandidateName()}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#18005F]/20"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.className = 'w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-400 border-2 border-[#18005F]/20';
                      e.target.textContent = renderCandidateName().charAt(0) || '?';
                    }}
                  />
                  {renderStatusChart()}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">{renderCandidateName()}</h2>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <Mail className="w-4 h-4 mr-1" />
                    <span>{application.candidate_email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{application.candidate_profile?.current_city || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-sm">Position</p>
                  <p className="font-medium">
                    {application.job_title || application.internship_title || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-sm">Candidate Type</p>
                  <p className="font-medium">
                    {application.candidate_profile?.candidate_type || 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-500 text-sm">Applied On</p>
                  <p className="font-medium">
                    {formatDate(application.applied_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Selector (Editing) */}
          {isEditing && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={handleStatusChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#18005F] focus:border-[#18005F] rounded-lg"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Current status: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)} text-white`}>
                    {application.status}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Content Sections */}
          <div className="p-6">
            {application.resume?.career_objective && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Objective</h3>
                <p className="text-gray-700">{application.resume.career_objective}</p>
              </div>
            )}

            {renderEducation()}
            {renderWorkExperience()}
            {renderSkills()}
            {renderAcademicProjects()}

            {application.resume?.extra_curricular_activities?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-[#18005F]" />
                  Extra Curricular Activities
                </h3>
                <div className="space-y-2">
                  {application.resume.extra_curricular_activities.map((activity, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">{activity.description || 'Activity'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {application.resume?.trainings_courses?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-[#18005F]" />
                  Trainings & Courses
                </h3>
                <div className="space-y-4">
                  {application.resume.trainings_courses.map((course, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900">
                        {course.training_program || 'Training Program'}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {course.organization && `Organization: ${course.organization}`}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          {formatDate(course.start_date)} - {course.currently_ongoing ? 'Ongoing' : formatDate(course.end_date) || 'N/A'}
                        </span>
                      </div>
                      {course.description && (
                        <p className="mt-2 text-gray-600 text-sm">{course.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {application.resume?.portfolio_work_samples?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Link2 className="w-5 h-5 mr-2 text-[#18005F]" />
                  Portfolio Work Samples
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {application.resume.portfolio_work_samples.map((sample, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900">
                        {sample.name || 'Work Sample'}
                      </h4>
                      <a 
                        href={sample.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[#18005F] text-sm mt-2 hover:underline"
                      >
                        <Link2 className="w-4 h-4 mr-1" />
                        {sample.url.length > 30 ? `${sample.url.substring(0, 30)}...` : sample.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {application.resume?.accomplishments?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-[#18005F]" />
                  Accomplishments
                </h3>
                <div className="space-y-2">
                  {application.resume.accomplishments.map((accomplishment, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">{accomplishment.additional_details || 'Accomplishment'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {renderScreeningAnswers()}
            {renderOnlineProfiles()}
          </div>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {openDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg max-w-md w-full"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Status Change</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to change the application status from{' '}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)} text-white`}>
                    {application.status}
                  </span>{' '}
                  to{' '}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)} text-white`}>
                    {status}
                  </span>?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setOpenDialog(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDialog}
                    className="px-4 py-2 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApplicationDetailPage;