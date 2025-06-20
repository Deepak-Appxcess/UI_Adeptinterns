import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Building,
  Users,
  Calendar,
  ChevronDown,
  X,
  Star
} from 'lucide-react';
import api from '../services/api';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  const [totalJobs, setTotalJobs] = useState(0);
  const [itemsPerPage] = useState(12);

  // Fetch jobs on initial load and when filters change
  useEffect(() => {
    fetchJobs();
  }, [currentPage, filters, searchQuery]);

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
        params.skills_required = searchQuery;
      }
      
      const response = await api.get('/jobs/filtered/', { params });
      
      setJobs(response.data.results || []);
      setTotalJobs(response.data.count || 0);
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
    setCurrentPage(1);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
              <p className="text-gray-600 mt-1">
                {totalJobs > 0 ? `${totalJobs.toLocaleString()} jobs found` : 'Search for your next opportunity'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* Sidebar Filters - Sticky */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Filter Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Filter className="w-5 h-5 mr-2 text-[#18005F]" />
                      Filters
                    </h2>
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-[#18005F] hover:text-[#18005F]/80 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                {/* Filter Content */}
                <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Jobs
                    </label>
                    <form onSubmit={handleSearchSubmit}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Job title, skills, company..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#18005F] focus:border-[#18005F] text-sm"
                        />
                      </div>
                    </form>
                  </div>

                  {/* Job Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Job Type
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: '', label: 'All Types' },
                        { value: 'REMOTE', label: 'Remote' },
                        { value: 'HYBRID', label: 'Hybrid' },
                        { value: 'IN_OFFICE', label: 'In Office' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="job_type"
                            value={option.value}
                            checked={filters.job_type === option.value}
                            onChange={handleFilterChange}
                            className="h-4 w-4 text-[#18005F] focus:ring-[#18005F] border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Work Schedule */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Work Schedule
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: '', label: 'All Schedules' },
                        { value: 'FULL_TIME', label: 'Full Time' },
                        { value: 'PART_TIME', label: 'Part Time' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="work_schedule"
                            value={option.value}
                            checked={filters.work_schedule === option.value}
                            onChange={handleFilterChange}
                            className="h-4 w-4 text-[#18005F] focus:ring-[#18005F] border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Experience Level
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: '', label: 'All Levels' },
                        { value: '0', label: 'Entry Level (0 years)' },
                        { value: '1', label: 'Junior (1+ years)' },
                        { value: '3', label: 'Mid-level (3+ years)' },
                        { value: '5', label: 'Senior (5+ years)' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="minimum_experience_years"
                            value={option.value}
                            checked={filters.minimum_experience_years === option.value}
                            onChange={handleFilterChange}
                            className="h-4 w-4 text-[#18005F] focus:ring-[#18005F] border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Salary Range (₹/year)
                    </label>
                    <div className="space-y-2">
                      {[
                        { min: '', max: '', label: 'All Salaries' },
                        { min: '', max: '500000', label: 'Under ₹5L' },
                        { min: '500000', max: '1000000', label: '₹5L - ₹10L' },
                        { min: '1000000', max: '1500000', label: '₹10L - ₹15L' },
                        { min: '1500000', max: '2000000', label: '₹15L - ₹20L' },
                        { min: '2000000', max: '', label: 'Above ₹20L' }
                      ].map((range, index) => (
                        <label key={index} className="flex items-center">
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
                          <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Benefits
                    </label>
                    <div className="space-y-2">
                      {[
                        { name: 'has_five_day_week', label: '5-Day Work Week' },
                        { name: 'has_health_insurance', label: 'Health Insurance' },
                        { name: 'has_life_insurance', label: 'Life Insurance' },
                        { name: 'allow_women_returning', label: 'Women Returning to Work' }
                      ].map((benefit) => (
                        <label key={benefit.name} className="flex items-center">
                          <input
                            type="checkbox"
                            name={benefit.name}
                            checked={filters[benefit.name]}
                            onChange={handleFilterChange}
                            className="h-4 w-4 text-[#18005F] focus:ring-[#18005F] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{benefit.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#18005F] focus:border-[#18005F]">
                    <option value="relevance">Most Relevant</option>
                    <option value="recent">Most Recent</option>
                    <option value="salary_high">Highest Salary</option>
                    <option value="salary_low">Lowest Salary</option>
                  </select>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {jobs.length} of {totalJobs} jobs
                </div>
              </div>
            </div>

            {/* Jobs List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Jobs</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchJobs}
                  className="px-4 py-2 bg-[#18005F] text-white rounded-md hover:bg-[#18005F]/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-[#18005F] text-white rounded-md hover:bg-[#18005F]/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg border border-gray-200 hover:border-[#18005F] hover:shadow-md transition-all duration-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Company Logo */}
                          <div className="flex-shrink-0">
                            <img
                              src={getCompanyLogo(job.company_logo_url, job.employer_organization?.organization_name)}
                              alt="Company Logo"
                              className="w-12 h-12 rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.target.src = getCompanyLogo(null, job.employer_organization?.organization_name);
                              }}
                            />
                          </div>

                          {/* Job Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-[#18005F] transition-colors">
                                  <Link to={`/job/${job.id}`}>
                                    {job.job_title}
                                  </Link>
                                </h3>
                                <p className="text-gray-600 mt-1">
                                  {job.employer_organization?.organization_name || 'Company Name'}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                                  Actively Hiring
                                </span>
                              </div>
                            </div>

                            {/* Job Meta Information */}
                            <div className="flex items-center space-x-6 mt-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {getWorkType(job.job_type, job.work_schedule)}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {formatSalary(job.fixed_pay_min, job.fixed_pay_max)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {job.minimum_experience_years || 0} years exp
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {job.number_of_openings} opening{job.number_of_openings !== 1 ? 's' : ''}
                              </div>
                            </div>

                            {/* Skills */}
                            {job.skills_required && job.skills_required.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                  {job.skills_required.slice(0, 5).map((skill, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#18005F]/10 text-[#18005F]">
                                      {skill}
                                    </span>
                                  ))}
                                  {job.skills_required.length > 5 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                      +{job.skills_required.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Benefits */}
                            {(job.has_five_day_week || job.has_health_insurance || job.has_life_insurance) && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                  {job.has_five_day_week && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                      5-Day Week
                                    </span>
                                  )}
                                  {job.has_health_insurance && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                                      Health Insurance
                                    </span>
                                  )}
                                  {job.has_life_insurance && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700">
                                      Life Insurance
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                Posted {formatDate(job.created_at)}
                              </div>
                              <Link
                                to={`/job/${job.id}`}
                                className="inline-flex items-center px-4 py-2 border border-[#18005F] text-[#18005F] rounded-md hover:bg-[#18005F] hover:text-white transition-colors text-sm font-medium"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-[#18005F] text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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