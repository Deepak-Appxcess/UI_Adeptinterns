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
  Building,
  User,
  Calendar,
  ArrowUpRight
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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);

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

  const getCompanyLogo = (logoUrl, companyName) => {
    if (logoUrl) {
      return logoUrl;
    }
    // Default logo based on company name initial
    const initial = companyName?.charAt(0)?.toUpperCase() || 'C';
    return `https://ui-avatars.com/api/?name=${initial}&background=18005F&color=fff&size=48&rounded=true`;
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
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Job</h1>
              <p className="text-gray-600">Discover opportunities that match your skills and career goals</p>
            </div>
            
            {/* Search Bar */}
            <div className="lg:w-96">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs, skills, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18005F] focus:border-transparent"
                />
              </form>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Filters Sidebar - Sticky */}
          <div className="w-80 bg-gray-50 border-r border-gray-100 sticky top-0 h-screen overflow-y-auto">
            <div className="p-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-[#18005F] mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                </div>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-[#18005F] hover:text-[#18005F]/80 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Quick Skills */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Popular Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonSkills.slice(0, 6).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        skills_required: skill
                      }))}
                      className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded text-sm hover:border-[#18005F] hover:text-[#18005F] transition-colors"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Input */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Skills Required
                </label>
                <input
                  type="text"
                  name="skills_required"
                  value={filters.skills_required}
                  onChange={handleFilterChange}
                  placeholder="e.g., React, Python, AWS"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#18005F] focus:border-transparent text-sm"
                />
              </div>

              {/* Salary Range */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Salary Range
                </label>
                <div className="space-y-3">
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
                        className="h-4 w-4 text-[#18005F] focus:ring-[#18005F] border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Sections */}
              {filterSections.map((section) => (
                <div key={section.title} className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {section.title}
                  </label>
                  <div className="space-y-3">
                    {section.options.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name={section.name}
                          value={option.value}
                          checked={filters[section.name] === option.value}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-[#18005F] focus:ring-[#18005F] border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Benefits */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Benefits
                </label>
                <div className="space-y-3">
                  {benefitsOptions.map((option) => (
                    <label key={option.name} className="flex items-center">
                      <input
                        type="checkbox"
                        name={option.name}
                        checked={filters[option.name]}
                        onChange={handleFilterChange}
                        className="h-4 w-4 text-[#18005F] focus:ring-[#18005F] border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Loading jobs...' : `${jobs.length} Jobs Found`}
                </h2>
                {Object.values(filters).some(value => value !== '' && value !== false) && (
                  <p className="text-sm text-gray-600 mt-1">Filtered results</p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#18005F] focus:border-transparent"
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

            {/* Jobs Grid */}
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Jobs</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchJobs}
                  className="px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters to see more results.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-[#18005F] text-white rounded-lg hover:bg-[#18005F]/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#18005F] hover:shadow-lg transition-all duration-200 group"
                  >
                    {/* Company Logo and Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <img
                          src={getCompanyLogo(job.company_logo_url, job.employer_organization?.organization_name)}
                          alt="Company Logo"
                          className="w-12 h-12 rounded-lg mr-4 border border-gray-100"
                          onError={(e) => {
                            e.target.src = getCompanyLogo(null, job.employer_organization?.organization_name);
                          }}
                        />
                        <div>
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Actively Hiring
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-[#18005F] transition-colors" />
                    </div>
                    
                    {/* Job Title and Company */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-[#18005F] transition-colors">
                        {job.job_title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {job.employer_organization?.organization_name || 'Company Name'}
                      </p>
                    </div>
                    
                    {/* Job Details */}
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

                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-gray-400" />
                        {job.number_of_openings} opening{job.number_of_openings !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    {/* Skills */}
                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {job.skills_required.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-[#18005F]/10 text-[#18005F] rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                          {job.skills_required.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{job.skills_required.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {job.has_five_day_week && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">5 Day Week</span>
                        )}
                        {job.has_health_insurance && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">Health Insurance</span>
                        )}
                        {job.has_life_insurance && (
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">Life Insurance</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </div>
                      <Link
                        to={`/job/${job.id}`}
                        className="px-4 py-2 bg-[#18005F] text-white rounded-lg text-sm font-medium hover:bg-[#18005F]/90 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && jobs.length > 0 && totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-[#18005F] text-white'
                            : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium ${
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Jobs;