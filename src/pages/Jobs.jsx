import React from 'react';

const jobCategories = ['Big brands', 'Work from home', 'Part-time', 'MBA', 'Engineering', 'Media', 'Design', 'Data Science'];

const jobs = [
  {
    title: 'Product Designer (UI, Visual Design)',
    company: 'SnapFind',
    location: 'Delhi',
    salary: '₹11,00,000 - 15,00,000 /year',
    isActive: true
  },
  {
    title: 'Sales Associate',
    company: 'PlanetSpark',
    location: 'Delhi, Pune, Bangalore',
    salary: '₹6,50,000 - 7,50,000 /year',
    isActive: true
  },
  {
    title: 'Business Development (Sales) Executive',
    company: 'PlanetSpark',
    location: 'Gurgaon, Jalandhar, Kolkata',
    salary: '₹6,50,000 - 7,50,000 /year',
    isActive: true
  }
];

function Jobs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Latest jobs on Internshala</h1>
      
      {/* Categories */}
      <div className="mb-8">
        <p className="text-sm mb-2">POPULAR CATEGORIES:</p>
        <div className="flex flex-wrap gap-2">
          {jobCategories.map((category, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full text-sm ${
                category === 'Big brands'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job, index) => (
          <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            {job.isActive && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-2">
                Actively hiring
              </span>
            )}
            <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
            <p className="text-gray-600 mb-2">{job.company}</p>
            <p className="text-gray-500 mb-2">{job.location}</p>
            <p className="text-gray-700 mb-4">{job.salary}</p>
            <button className="text-blue-500 hover:text-blue-700">View details →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Jobs;