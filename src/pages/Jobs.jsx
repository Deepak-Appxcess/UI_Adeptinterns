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
  Star,
  Heart,
  Bookmark
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
  const [showFilters, setShowFilters] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Jobs</h1>
          <p className="text-gray-600">Find the perfect job to advance your career</p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4 lg:sticky lg:top-8 max-h-[calc(100vh-4rem)] overflow-y-auto h-fit">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col min-h-[400px]">
              {/* Filter Header */}
              <div className="p-6 border-b border-gray-100 flex items-center gap-2 sticky top-0 z-10 bg-white/90 backdrop-blur-md">
                <Filter className="w-6 h-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
              </div>

              {/* Filter Body */}
              <div className="flex-1 p-6 space-y-8">
                {/* Search */}
                <div>
                  <form onSubmit={handleSearchSubmit} className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Search Jobs
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Job title, skills, company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full shadow focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base bg-white"
                      />
                    </div>
                  </form>
                </div>

                {/* Quick Skills (example) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Popular Skills</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['React', 'Python', 'JavaScript', 'Node.js', 'Java', 'AWS'].map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => setFilters(prev => ({ ...prev, skills_required: skill }))}
                        className={`px-3 py-1 rounded-full text-xs font-medium border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors ${filters.skills_required === skill ? 'bg-indigo-600 text-white border-indigo-600' : ''}`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    name="skills_required"
                    value={filters.skills_required}
                    onChange={handleFilterChange}
                    placeholder="Add skill..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Job Type</label>
                  <div className="flex flex-col gap-2">
                    {[{ value: '', label: 'All Types' }, { value: 'REMOTE', label: 'Remote' }, { value: 'HYBRID', label: 'Hybrid' }, { value: 'IN_OFFICE', label: 'In Office' }].map(option => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                        <input
                          type="radio"
                          name="job_type"
                          value={option.value}
                          checked={filters.job_type === option.value}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Work Schedule</label>
                  <div className="flex flex-col gap-2">
                    {[{ value: '', label: 'All Schedules' }, { value: 'FULL_TIME', label: 'Full Time' }, { value: 'PART_TIME', label: 'Part Time' }].map(option => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                        <input
                          type="radio"
                          name="work_schedule"
                          value={option.value}
                          checked={filters.work_schedule === option.value}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Experience Level</label>
                  <div className="flex flex-col gap-2">
                    {[{ value: '', label: 'All Levels' }, { value: '0', label: 'Entry Level (0 years)' }, { value: '1', label: 'Junior (1+ years)' }, { value: '3', label: 'Mid-level (3+ years)' }, { value: '5', label: 'Senior (5+ years)' }].map(option => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                        <input
                          type="radio"
                          name="minimum_experience_years"
                          value={option.value}
                          checked={filters.minimum_experience_years === option.value}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Salary Range (₹/year)</label>
                  <div className="flex flex-col gap-2">
                    {[{ min: '', max: '', label: 'All Salaries' }, { min: '', max: '500000', label: 'Under ₹5L' }, { min: '500000', max: '1000000', label: '₹5L - ₹10L' }, { min: '1000000', max: '1500000', label: '₹10L - ₹15L' }, { min: '1500000', max: '2000000', label: '₹15L - ₹20L' }, { min: '2000000', max: '', label: 'Above ₹20L' }].map((range, index) => (
                      <label key={index} className="flex items-center gap-3 cursor-pointer hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                        <input
                          type="radio"
                          name="salary_range"
                          checked={filters.fixed_pay === range.min && filters.max_fixed_pay === range.max}
                          onChange={() => setFilters(prev => ({ ...prev, fixed_pay: range.min, max_fixed_pay: range.max }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 font-medium">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Benefits</label>
                  <div className="flex flex-col gap-2">
                    {[{ name: 'has_five_day_week', label: '5-Day Work Week' }, { name: 'has_health_insurance', label: 'Health Insurance' }, { name: 'has_life_insurance', label: 'Life Insurance' }, { name: 'allow_women_returning', label: 'Women Returning to Work' }].map(benefit => (
                      <label key={benefit.name} className="flex items-center gap-3 cursor-pointer hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          name={benefit.name}
                          checked={filters[benefit.name]}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 font-medium">{benefit.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reset All Button */}
                <div className="pt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-6 py-2 rounded-full bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
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
                  <div key={job.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-20 h-12 overflow-hidden flex items-center justify-center border border-gray-200 bg-white">
                          <img
                            src={job.company_logo_url || getCompanyLogo(null, job.employer_organization?.organization_name)}
                            alt={job.employer_organization?.organization_name || 'Company Logo'}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getCompanyLogo(null, job.employer_organization?.organization_name);
                            }}
                          />
                        </div>
                        {job.has_five_day_week && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Star className="w-3 h-3 mr-1" />
                            5-Day Week
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.job_title}</h3>
                      <p className="text-gray-600 mb-2">{job.employer_organization?.organization_name || 'Company Name'}</p>
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
                          {job.minimum_experience_years || 0} years exp
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(job.created_at)}
                        </div>
                      </div>
                      {job.skills_required && job.skills_required.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {job.skills_required.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
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
                        <Link
                          to={`/job/${job.id}`}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                        >
                          More details <ChevronDown className="w-4 h-4 ml-1" />
                        </Link>
                        <Link
                          to={`/job/${job.id}`}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Apply Now
                        </Link>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Jobs;