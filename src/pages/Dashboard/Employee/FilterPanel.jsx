// src/components/employer/FilterPanel.jsx
import React, { useState } from 'react';
import { FiPlus, FiMinus, FiX } from 'react-icons/fi';

const FilterPanel = ({ type, onFilterChange }) => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [filters, setFilters] = useState({
    skills_required: '',
    ...(type === 'JOB' ? {
      job_type: '',
      minimum_experience_years: '',
      fixed_pay: '',
      max_fixed_pay: '',
      work_schedule: '',
      has_five_day_week: false,
      has_health_insurance: false,
      has_life_insurance: false,
      allow_women_returning: false
    } : {
      internship_profile_title: '',
      internship_type: '',
      is_part_time: false,
      is_paid: false,
      fixed_stipend_amount: '',
      max_fixed_stipend: '',
      duration: '',
      duration_unit: '',
      has_ppo: false,
      allow_women_returning: false,
      start_date_option: '',
      stipend_type: ''
    })
  });

  const filterGroups = type === 'JOB' ? [
    {
      name: 'Basic',
      filters: [
        { name: 'skills_required', label: 'Skills Required', type: 'text' },
        { name: 'job_type', label: 'Job Type', type: 'select', options: ['IN_OFFICE', 'HYBRID', 'REMOTE'] },
        { name: 'work_schedule', label: 'Work Schedule', type: 'select', options: ['FULL_TIME', 'PART_TIME'] }
      ]
    },
    {
      name: 'Experience & Salary',
      filters: [
        { name: 'minimum_experience_years', label: 'Min Experience (years)', type: 'number' },
        { name: 'fixed_pay', label: 'Min Salary', type: 'number' },
        { name: 'max_fixed_pay', label: 'Max Salary', type: 'number' }
      ]
    },
    {
      name: 'Benefits',
      filters: [
        { name: 'has_five_day_week', label: '5 Day Work Week', type: 'checkbox' },
        { name: 'has_health_insurance', label: 'Health Insurance', type: 'checkbox' },
        { name: 'has_life_insurance', label: 'Life Insurance', type: 'checkbox' },
        { name: 'allow_women_returning', label: 'Women Returning', type: 'checkbox' }
      ]
    }
  ] : [
    {
      name: 'Basic',
      filters: [
        { name: 'internship_profile_title', label: 'Internship Title', type: 'text' },
        { name: 'skills_required', label: 'Skills Required', type: 'text' },
        { name: 'internship_type', label: 'Internship Type', type: 'select', options: ['IN_OFFICE', 'HYBRID', 'REMOTE'] },
        { name: 'start_date_option', label: 'Start Date Option', type: 'select', options: ['IMMEDIATE', 'FLEXIBLE', 'FIXED'] }
      ]
    },
    {
      name: 'Details',
      filters: [
        { name: 'is_part_time', label: 'Part Time', type: 'checkbox' },
        { name: 'is_paid', label: 'Paid', type: 'checkbox' },
        { name: 'stipend_type', label: 'Stipend Type', type: 'select', options: ['MONTHLY', 'WEEKLY', 'ONE_TIME'] }
      ]
    },
    {
      name: 'Stipend & Duration',
      filters: [
        { name: 'fixed_stipend_amount', label: 'Min Stipend', type: 'number' },
        { name: 'max_fixed_stipend', label: 'Max Stipend', type: 'number' },
        { name: 'duration', label: 'Duration', type: 'number' },
        { name: 'duration_unit', label: 'Duration Unit', type: 'select', options: ['WEEKS', 'MONTHS'] }
      ]
    },
    {
      name: 'Additional',
      filters: [
        { name: 'has_ppo', label: 'PPO Available', type: 'checkbox' },
        { name: 'allow_women_returning', label: 'Women Returning', type: 'checkbox' }
      ]
    }
  ];

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFilters(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Update active filters
    if (newValue && newValue !== '') {
      if (!activeFilters.includes(name)) {
        setActiveFilters([...activeFilters, name]);
      }
    } else {
      setActiveFilters(activeFilters.filter(filter => filter !== name));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = typeof filters[key] === 'boolean' ? false : '';
      return acc;
    }, {});
    setFilters(resetFilters);
    setActiveFilters([]);
    onFilterChange(resetFilters);
  };

  const removeFilter = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: typeof filters[filterName] === 'boolean' ? false : ''
    }));
    setActiveFilters(activeFilters.filter(f => f !== filterName));
    // Trigger filter change immediately when removing a filter
    onFilterChange({
      ...filters,
      [filterName]: typeof filters[filterName] === 'boolean' ? false : ''
    });
  };

  const getFilterLabel = (filterName) => {
    const filterGroup = filterGroups.find(group => 
      group.filters.some(f => f.name === filterName)
    );
    if (!filterGroup) return filterName;
    
    const filterDef = filterGroup.filters.find(f => f.name === filterName);
    return filterDef?.label || filterName;
  };

  const getFilterValueDisplay = (filterName) => {
    const value = filters[filterName];
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return value;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Options</h3>
      
      {/* Selected Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Applied Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filterName => (
              <span 
                key={filterName}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {getFilterLabel(filterName)}: {getFilterValueDisplay(filterName)}
                <button 
                  onClick={() => removeFilter(filterName)}
                  className="ml-1 text-indigo-600 hover:text-indigo-900"
                >
                  <FiX size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Filter Sections */}
        {filterGroups.map((group, index) => (
          <div key={index} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(group.name)}
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
            >
              <span className="text-sm font-medium text-gray-700">{group.name}</span>
              {expandedSections[group.name] ? <FiMinus /> : <FiPlus />}
            </button>
            
            {expandedSections[group.name] && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.filters.map((filter, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700">
                      {filter.label}
                    </label>
                    {filter.type === 'select' ? (
                      <select
                        name={filter.name}
                        value={filters[filter.name]}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">Select {filter.label}</option>
                        {filter.options.map(option => (
                          <option key={option} value={option}>
                            {option.split('_').map(word => 
                              word.charAt(0) + word.slice(1).toLowerCase()
                            ).join(' ')}
                          </option>
                        ))}
                      </select>
                    ) : filter.type === 'checkbox' ? (
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name={filter.name}
                            checked={filters[filter.name]}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Enabled</span>
                        </label>
                      </div>
                    ) : (
                      <input
                        type={filter.type}
                        name={filter.name}
                        value={filters[filter.name]}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset All
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterPanel;