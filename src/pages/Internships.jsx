import React from 'react';

const internshipCategories = ['Big brands', 'Work from home', 'Part-time', 'MBA', 'Engineering', 'Media', 'Design', 'Data Science'];

const internships = [
  {
    title: 'Human Resources (HR)',
    company: 'NotBroker',
    location: 'Bangalore',
    duration: '4 Months',
    stipend: '₹10,000 - 13,000 /month'
  },
  {
    title: 'Law/Legal',
    company: 'American Oncology Institute',
    location: 'Bangalore',
    duration: '2 Months',
    stipend: 'Unpaid'
  },
  {
    title: 'Graphic Design',
    company: 'Enrich Hair And Skin Solutions Private Limited',
    location: 'Mumbai',
    duration: '3 Months',
    stipend: '₹10,000 - 12,000 /month'
  }
];

function Internships() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Latest internships on Internshala</h1>
      
      {/* Categories */}
      <div className="mb-8">
        <p className="text-sm mb-2">POPULAR CATEGORIES:</p>
        <div className="flex flex-wrap gap-2">
          {internshipCategories.map((category, index) => (
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

      {/* Internship Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((internship, index) => (
          <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">{internship.title}</h2>
            <p className="text-gray-600 mb-2">{internship.company}</p>
            <p className="text-gray-500 mb-2">{internship.location}</p>
            <p className="text-gray-700 mb-2">Duration: {internship.duration}</p>
            <p className="text-gray-700 mb-4">Stipend: {internship.stipend}</p>
            <button className="text-blue-500 hover:text-blue-700">View details →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Internships;