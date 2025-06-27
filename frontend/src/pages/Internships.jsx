import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  GraduationCap, 
  DollarSign, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  X,
  CheckCircle,
  Users,
  Star,
  Building,
  Calendar
} from 'lucide-react';
import api from '../services/api';

function Internships() {
  const location = useLocation();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    opportunity_type: 'INTERNSHIP',
    skills_required: '',
    internship_type: '',
    is_part_time: false,
    is_paid: false,
    fixed_stipend_amount: '',
    max_fixed_stipend: '',
    duration: '',
    duration_unit: '',
    has_ppo: false,
    allow_women_returning: false,
    start_date_option: ''
  });
  
  // Expanded internship details
  const [expandedInternshipId, setExpandedInternshipId] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9);

  // Fetch internships on initial load and when filters change
  useEffect(() => {
    fetchInternships();
  }, [currentPage, filters]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      
      // Prepare filter parameters
      const params = { opportunity_type: 'INTERNSHIP' };
      
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
      
      setInternships(response.data.results || []);
      setTotalPages(Math.ceil((response.data.count || 0) / itemsPerPage));
      
    } catch (err) {
      console.error('Error fetching internships:', err);
      setError('Failed to load internships. Please try again later.');
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
    fetchInternships();
  };

  const clearFilters = () => {
    setFilters({
      opportunity_type: 'INTERNSHIP',
      skills_required: '',
      internship_type: '',
      is_part_time: false,
      is_paid: false,
      fixed_stipend_amount: '',
      max_fixed_stipend: '',
      duration: '',
      duration_unit: '',
      has_ppo: false,
      allow_women_returning: false,
      start_date_option: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleInternshipDetails = (internshipId) => {
    setExpandedInternshipId(expandedInternshipId === internshipId ? null : internshipId);
  };

  const formatStipend = (min, max, isPaid) => {
    if (!isPaid) return 'Unpaid';
    if (!min && !max) return 'Stipend not disclosed';
    if (min && max) return `₹${parseFloat(min).toLocaleString()} - ₹${parseFloat(max).toLocaleString()}/month`;
    if (min) return `₹${parseFloat(min).toLocaleString()}+/month`;
    return `Up to ₹${parseFloat(max).toLocaleString()}/month`;
  };

  const getInternshipType = (internshipType, isPartTime) => {
    const type = internshipType === 'IN_OFFICE' ? 'In Office' : 
                internshipType === 'HYBRID' ? 'Hybrid' : 'Remote';
    
    const schedule = isPartTime ? 'Part-time' : 'Full-time';
    
    return `${type} • ${schedule}`;
  };

  // Filter sections for sidebar
  const filterSections = [
    {
      title: 'Internship Type',
      name: 'internship_type',
      options: [
        { value: 'IN_OFFICE', label: 'In Office' },
        { value: 'HYBRID', label: 'Hybrid' },
        { value: 'REMOTE', label: 'Remote' }
      ]
    },
    {
      title: 'Start Date',
      name: 'start_date_option',
      options: [
        { value: 'IMMEDIATE', label: 'Immediate' },
        { value: 'FLEXIBLE', label: 'Flexible' },
        { value: 'SPECIFIC', label: 'Specific Date' }
      ]
    },
    {
      title: 'Duration',
      name: 'duration',
      options: [
        { value: '1', label: '1 Month' },
        { value: '2', label: '2 Months' },
        { value: '3', label: '3 Months' },
        { value: '6', label: '6 Months' }
      ]
    },
    {
      title: 'Duration Unit',
      name: 'duration_unit',
      options: [
        { value: 'WEEKS', label: 'Weeks' },
        { value: 'MONTHS', label: 'Months' }
      ]
    }
  ];

  // Additional options
  const additionalOptions = [
    { name: 'is_part_time', label: 'Part-time Only' },
    { name: 'is_paid', label: 'Paid Only' },
    { name: 'has_ppo', label: 'With PPO' },
    { name: 'allow_women_returning', label: 'Women Returning to Work' }
  ];

  // Stipend ranges
  const stipendRanges = [
    { min: '', max: '5000', label: 'Below ₹5K' },
    { min: '5000', max: '10000', label: '₹5K - ₹10K' },
    { min: '10000', max: '15000', label: '₹10K - ₹15K' },
    { min: '15000', max: '20000', label: '₹15K - ₹20K' },
    { min: '20000', max: '', label: 'Above ₹20K' }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Internships</h1>
          <p className="text-gray-600">Find the perfect internship to kickstart your career</p>
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
                      Search Internships
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Internship title, skills, company..."
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

                {/* Stipend Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stipend Range
                  </label>
                  <div className="space-y-2">
                    {stipendRanges.map((range) => (
                      <label key={range.label} className="flex items-center">
                        <input
                          type="radio"
                          name="stipend_range"
                          checked={filters.fixed_stipend_amount === range.min && filters.max_fixed_stipend === range.max}
                          onChange={() => setFilters(prev => ({
                            ...prev,
                            fixed_stipend_amount: range.min,
                            max_fixed_stipend: range.max
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

                {/* Additional Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Options
                  </label>
                  <div className="space-y-2">
                    {additionalOptions.map((option) => (
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

          {/* Internships List */}
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
                    {loading ? 'Loading internships...' : `${internships.length} Internships Found`}
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
                    <option value="stipend_high">Highest Stipend</option>
                    <option value="stipend_low">Lowest Stipend</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Internships Grid */}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Internships</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchInternships}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : internships.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Internships Found</h3>
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
                {internships.map((internship) => (
                  <motion.div
                    key={internship.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        {internship.has_ppo && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Star className="w-3 h-3 mr-1" />
                            PPO Available
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{internship.internship_profile_title}</h3>
                      
                      <p className="text-gray-600 mb-2">
                        {internship.employer_organization?.organization_name || 'Company Name'}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {getInternshipType(internship.internship_type, internship.is_part_time)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                          {formatStipend(internship.fixed_stipend_min, internship.fixed_stipend_max, internship.is_paid)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {internship.duration} {internship.duration_unit?.toLowerCase() || 'months'}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {internship.start_date_option === 'IMMEDIATE' ? 'Start Immediately' : 
                           internship.start_date_option === 'FLEXIBLE' ? 'Flexible Start Date' : 
                           'Specific Start Date'}
                        </div>
                      </div>
                      
                      {internship.skills_required && internship.skills_required.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {internship.skills_required.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
                                {skill}
                              </span>
                            ))}
                            {internship.skills_required.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                +{internship.skills_required.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Link
  to={`/internship/${internship.id}`}
  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
>
  More details <ChevronDown className="w-4 h-4 ml-1" />
</Link>
                        
                        <Link
                          to={`/internship/${internship.id}`}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Apply Now
                        </Link>
                      </div>
                      
                      
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && internships.length > 0 && totalPages > 1 && (
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

export default Internships;