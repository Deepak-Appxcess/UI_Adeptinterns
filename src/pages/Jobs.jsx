import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  X,
  CheckCircle,
  Users,
  Star,
  Building
} from 'lucide-react';
import api from '../services/api';

function Jobs() {
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    opportunity_type: 'JOB',
    skills_required: '',
    job_type: '',
    minimum_experience_years: '',
    fixed_pay: '',
    max_fixed_pay: '',
    work_schedule: '',
    has_five_day_week: false,
    has_health_insurance: false,
    has_life_insurance: false,
    allow_women_returning: false
  });
  
  // Expanded job details
  const [expandedJobId, setExpandedJobId] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9);

  // Fetch jobs on initial load and when filters change
  useEffect(() => {
    fetchJobs();
  }, [currentPage, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Prepare filter parameters
      const params = { opportunity_type: 'JOB' };
      
      // Add non-empty filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== false && key !== 'opportunity_type') {
          params[key] = value;
        }
      });
      
      // Add search query if present
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      const response = await api.get('/jobs/filtered/', { params });
      
      setJobs(response.data.results || []);
      setTotalPages(Math.ceil((response.data.count || 0) / itemsPerPage));
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setFilters({
      opportunity_type: 'JOB',
      skills_required: '',
      job_type: '',
      minimum_experience_years: '',
      fixed_pay: '',
      max_fixed_pay: '',
      work_schedule: '',
      has_five_day_week: false,
      has_health_insurance: false,
      has_life_insurance: false,
      allow_women_returning: false
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleJobDetails = (jobId) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `₹${parseFloat(min).toLocaleString()} - ₹${parseFloat(max).toLocaleString()}/year`;
    if (min) return `₹${parseFloat(min).toLocaleString()}+/year`;
    return `Up to ₹${parseFloat(max).toLocaleString()}/year`;
  };

  const getWorkType = (jobType, workSchedule) => {
    const type = jobType === 'IN_OFFICE' ? 'In Office' : 
                jobType === 'HYBRID' ? 'Hybrid' : 'Remote';
    
    const schedule = workSchedule === 'FULL_TIME' ? 'Full-time' : 'Part-time';
    
    return `${type} • ${schedule}`;
  };

  // Filter sections for sidebar
  const filterSections = [
    {
      title: 'Job Type',
      name: 'job_type',
      options: [
        { value: 'IN_OFFICE', label: 'In Office' },
        { value: 'HYBRID', label: 'Hybrid' },
        { value: 'REMOTE', label: 'Remote' }
      ]
    },
    {
      title: 'Work Schedule',
      name: 'work_schedule',
      options: [
        { value: 'FULL_TIME', label: 'Full Time' },
        { value: 'PART_TIME', label: 'Part Time' }
      ]
    },
    {
      title: 'Experience',
      name: 'minimum_experience_years',
      options: [
        { value: '0', label: 'Fresher (0 years)' },
        { value: '1', label: '1+ years' },
        { value: '2', label: '2+ years' },
        { value: '3', label: '3+ years' },
        { value: '5', label: '5+ years' }
      ]
    }
  ];

  // Benefits options
  const benefitsOptions = [
    { name: 'has_five_day_week', label: '5 Day Work Week' },
    { name: 'has_health_insurance', label: 'Health Insurance' },
    { name: 'has_life_insurance', label: 'Life Insurance' },
    { name: 'allow_women_returning', label: 'Women Returning to Work' }
  ];

  // Salary ranges
  const salaryRanges = [
    { min: '', max: '500000', label: 'Below ₹5L' },
    { min: '500000', max: '1000000', label: '₹5L - ₹10L' },
    { min: '1000000', max: '1500000', label: '₹10L - ₹15L' },
    { min: '1500000', max: '2000000', label: '₹15L - ₹20L' },
    { min: '2000000', max: '', label: 'Above ₹20L' }
  ];

  // Common skills for quick selection
  const commonSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'AWS', 
    'SQL', 'Data Science', 'Product Management', 'UI/UX', 'Marketing'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Jobs</h1>
          <p className="text-gray-600">Find your perfect career opportunity</p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/4"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-24">
              {/* Filter Header */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Filter Body */}
              <div className="p-5 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Search */}
                <div>
                  <form onSubmit={handleSearchSubmit}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Jobs
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Job title, skills, company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      />
                    </div>
                  </form>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="skills_required"
                      value={filters.skills_required}
                      onChange={handleFilterChange}
                      placeholder="e.g., React, Python, AWS"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {commonSkills.slice(0, 6).map((skill) => (
                      <button
                        key={skill}
                        onClick={() => setFilters(prev => ({
                          ...prev,
                          skills_required: skill
                        }))}
                        className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs hover:bg-indigo-100 transition-colors"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <div className="space-y-2">
                    {salaryRanges.map((range) => (
                      <label key={range.label} className="flex items-center">
                        <input
                          type="radio"
                          name="salary_range"
                          checked={filters.fixed_pay === range.min && filters.max_fixed_pay === range.max}
                          onChange={() => setFilters(prev => ({
                            ...prev,
                            fixed_pay: range.min,
                            max_fixed_pay: range.max
                          }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filter Sections */}
                {filterSections.map((section) => (
                  <div key={section.title}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {section.title}
                    </label>
                    <div className="space-y-2">
                      {section.options.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name={section.name}
                            value={option.value}
                            checked={filters[section.name] === option.value}
                            onChange={handleFilterChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  <div className="space-y-2">
                    {benefitsOptions.map((option) => (
                      <label key={option.name} className="flex items-center">
                        <input
                          type="checkbox"
                          name={option.name}
                          checked={filters[option.name]}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button (Mobile) */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Jobs List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:w-3/4"
          >
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full py-2 px-4 bg-white border border-gray-200 rounded-xl font-medium flex items-center justify-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Results Info */}
            <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {loading ? 'Loading jobs...' : `${jobs.length} Jobs Found`}
                  </h2>
                  {Object.values(filters).some(value => value !== '' && value !== false) && (
                    <p className="text-sm text-gray-600 mt-1">Filtered results</p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500"
                    onChange={(e) => {
                      // Sort logic would go here
                    }}
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="recent">Most Recent</option>
                    <option value="salary_high">Highest Salary</option>
                    <option value="salary_low">Lowest Salary</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-6 w-1/3"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Jobs</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchJobs}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters to see more results.</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                          {job.employer_organization?.is_freelancer ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Building className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Actively Hiring
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.job_title}</h3>
                      
                      <p className="text-gray-600 mb-2">
                        {job.employer_organization?.organization_name || 'Company Name'}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {getWorkType(job.job_type, job.work_schedule)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                          {formatSalary(job.fixed_pay_min, job.fixed_pay_max)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {job.minimum_experience_years || 0} years experience
                        </div>
                      </div>
                      
                      {job.skills_required && job.skills_required.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {job.skills_required.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs">
                                {skill}
                              </span>
                            ))}
                            {job.skills_required.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                +{job.skills_required.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleJobDetails(job.id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                        >
                          {expandedJobId === job.id ? (
                            <>Less details <ChevronUp className="w-4 h-4 ml-1" /></>
                          ) : (
                            <>More details <ChevronDown className="w-4 h-4 ml-1" /></>
                          )}
                        </button>
                        
                        <Link
                          to={`/job/${job.id}`}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Apply Now
                        </Link>
                      </div>
                      
                      <AnimatePresence>
                        {expandedJobId === job.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-gray-100"
                          >
                            <div className="space-y-4">
                              {job.job_description && job.job_description.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Job Description</h4>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    {job.job_description.map((desc, idx) => (
                                      <p key={idx} className="flex items-start">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                        {desc}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Benefits</h4>
                                <div className="flex flex-wrap gap-2">
                                  {job.has_five_day_week && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">5 Day Week</span>
                                  )}
                                  {job.has_health_insurance && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">Health Insurance</span>
                                  )}
                                  {job.has_life_insurance && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs">Life Insurance</span>
                                  )}
                                  {!job.has_five_day_week && !job.has_health_insurance && !job.has_life_insurance && (
                                    <span className="text-sm text-gray-600">No specific benefits mentioned</span>
                                  )}
                                </div>
                              </div>
                              
                              {job.candidate_preferences && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Candidate Preferences</h4>
                                  <p className="text-sm text-gray-600">{job.candidate_preferences}</p>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && jobs.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Jobs;