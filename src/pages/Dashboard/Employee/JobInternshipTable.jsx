// src/components/employer/JobInternshipTable.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JobInternshipTable = ({ data, type }) => {
  const [expandedRows, setExpandedRows] = useState([]);
  const navigate = useNavigate();

  const toggleRow = (id) => {
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter(rowId => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };

  const handleEdit = (id) => {
    if (type === 'JOB') {
      navigate(`/employer/jobs/update/${id}`);
    } else {
      navigate(`/employer/internships/update/${id}`);
    }
  };

  const mainColumns = type === 'JOB' ? [
    { header: 'Job Title', accessor: 'job_title' },
    { header: 'Experience', accessor: 'minimum_experience_years' },
    { header: 'Skills', accessor: (item) => item.skills_required.join(', ') },
    { header: 'Type', accessor: 'job_type' },
    { header: 'Salary Range', accessor: (item) => `${item.fixed_pay_min} - ${item.fixed_pay_max}` },
    { header: 'Status', accessor: 'status' },
    { 
      header: 'Actions', 
      accessor: (item) => item.status,
      cell: (item) => (
        <div className="flex justify-between items-center space-x-2">
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
          <div className="flex items-center">
            <button 
              onClick={() => toggleRow(item.id)}
              className="ml-2 text-indigo-600 hover:text-indigo-900"
            >
              {expandedRows.includes(item.id) ? '▲' : '▼'}
            </button>
            {item.status === 'DRAFT' ||'REJECTED' && (
              <button
                onClick={() => handleEdit(item.id)}
                className="ml-2 text-green-600 hover:text-green-900"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )
    }
  ] : [
    { header: 'Internship Title', accessor: 'internship_profile_title' },
    { header: 'Type', accessor: 'internship_type' },
    { header: 'Stipend', accessor: (item) => `${item.fixed_stipend_min} - ${item.fixed_stipend_max}` },
    { header: 'Duration', accessor: (item) => `${item.duration} ${item.duration_unit}` },
    { header: 'PPO', accessor: (item) => item.has_ppo ? 'Yes' : 'No' },
    { header: 'Status', accessor: 'status' },
    { 
      header: 'Actions', 
      accessor: (item) => item.status,
      cell: (item) => (
        <div className="flex justify-between items-center space-x-2">
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
          <div className="flex items-center">
            <button 
              onClick={() => toggleRow(item.id)}
              className="ml-2 text-indigo-600 hover:text-indigo-900"
            >
              {expandedRows.includes(item.id) ? '▲' : '▼'}
            </button>
            {item.status === 'DRAFT' ||'REJECTED' && (
              <button
                onClick={() => handleEdit(item.id)}
                className="ml-2 text-green-600 hover:text-green-900"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )
    }
  ];

  const allColumns = type === 'JOB' ? [
    ...mainColumns,
    { header: 'Work Schedule', accessor: 'work_schedule' },
    { header: 'Openings', accessor: 'number_of_openings' },
    { header: 'Description', accessor: (item) => item.job_description.join(', ') },
    { header: 'Incentives', accessor: (item) => `${item.incentives_min} - ${item.incentives_max}` },
    { header: '5 Day Week', accessor: (item) => item.has_five_day_week ? 'Yes' : 'No' },
    { header: 'Health Insurance', accessor: (item) => item.has_health_insurance ? 'Yes' : 'No' },
    { header: 'Life Insurance', accessor: (item) => item.has_life_insurance ? 'Yes' : 'No' },
    { header: 'Screening Questions', accessor: (item) => item.screening_questions.join(', ') },
    { header: 'Skills Required', accessor: (item) => item.skills_required.join(', ') },
    { header: 'Preferences', accessor: 'candidate_preferences' },
    { header: 'Organization', accessor: (item) => item.employer_organization.organization_name }
  ] : [
    ...mainColumns,
    { header: 'Part Time', accessor: (item) => item.is_part_time ? 'Yes' : 'No' },
    { header: 'Paid', accessor: (item) => item.is_paid ? 'Yes' : 'No' },
    { header: 'Start Date', accessor: 'start_date_option' },
    { header: 'Incentives', accessor: (item) => `${item.incentives_min} - ${item.incentives_max}` },
    { header: 'Stipend Type', accessor: 'stipend_type' },
    { header: 'Responsibilities', accessor: (item) => item.responsibilities.join(', ') },
    { header: 'Perks', accessor: 'perks' },
    { header: 'Screening Questions', accessor: (item) => item.screening_questions.join(', ') },
    { header: 'Preferences', accessor: 'candidate_preferences' },
    { header: 'Openings', accessor: 'number_of_openings' },
    { header: 'Organization', accessor: (item) => item.employer_organization.organization_name },
    { header: 'Women Returning', accessor: (item) => item.allow_women_returning ? 'Yes' : 'No' }
  ];

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {mainColumns.map((col, index) => (
              <th 
                key={index}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <React.Fragment key={item.id}>
              <tr className="hover:bg-gray-50">
                {mainColumns.map((col, colIndex) => (
                  <td 
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {col.cell ? col.cell(item) : (typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor])}
                  </td>
                ))}
              </tr>
              
              {expandedRows.includes(item.id) && (
                <tr className="bg-gray-50">
                  <td colSpan={mainColumns.length} className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allColumns.slice(mainColumns.length).map((col, index) => (
                        <div key={index}>
                          <p className="text-xs font-medium text-gray-500">{col.header}</p>
                          <p className="text-sm text-gray-900 mt-1">
                            {typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobInternshipTable;