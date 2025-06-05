import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, MapPin, Clock, DollarSign, ArrowLeft, Edit, Users } from 'lucide-react';
import { fetchMyInternships } from '../../../services/api';

const MyInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await fetchMyInternships();
        setInternships(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar 
        title="My Internships"
        actionText="Post New Internship"
        actionLink="/post-internship"
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {internships.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={48} className="text-gray-400" />}
            title="No Internships Found"
            description="You haven't posted any internships yet"
            actionText="Post Internship"
            actionLink="/post-internship"
          />
        ) : (
          <div className="grid gap-6">
            {internships.map((internship) => (
              <InternshipCard 
                key={internship._id}
                internship={internship}
                onEdit={() => navigate(`/edit-internship/${internship._id}`)}
                onViewApps={() => navigate(`/internship-applications/${internship._id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Sub-components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
      <p className="font-medium">Error</p>
      <p>{message}</p>
    </div>
  </div>
);

const NavBar = ({ title, actionText, actionLink }) => {
  const navigate = useNavigate();
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="mr-2 p-1 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>
          <Link
            to={actionLink}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            {actionText}
          </Link>
        </div>
      </div>
    </nav>
  );
};

const EmptyState = ({ icon, title, description, actionText, actionLink }) => (
  <div className="bg-white shadow rounded-lg p-8 text-center">
    <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
    <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
    <div className="mt-6">
      <Link
        to={actionLink}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
      >
        {actionText}
      </Link>
    </div>
  </div>
);

const InternshipCard = ({ internship, onEdit, onViewApps }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{internship.profile}</h3>
            <p className="text-sm text-gray-500 mt-1">{internship.companyName || 'Your Company Name'}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {internship.internshipType} • {internship.workType}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            {internship.location || 'Remote'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
            {internship.isPaid ? 
              `$${internship.fixedStipendMin}-${internship.fixedStipendMax}/mo` : 
              'Unpaid'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            {internship.duration} months
          </div>
        </div>

        {internship.skillsRequired && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Skills Required</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {internship.skillsRequired.split(',').map((skill, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Details Section */}
        {isExpanded && (
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Responsibilities</h4>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                {internship.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Preferences</h4>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                {internship.preferences.map((pref, index) => (
                  <li key={index}>{pref}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Perks</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {internship.perks.map((perk, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {perk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Additional Information</h4>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p><span className="font-medium">Start Date:</span> {new Date(internship.startDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Application Deadline:</span> {new Date(internship.applicationDeadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <p><span className="font-medium">PPO Available:</span> {internship.hasPPO ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Women Returnship:</span> {internship.allowWomenReturnship ? 'Allowed' : 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onEdit}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          <button
            onClick={toggleExpand}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Users className="h-4 w-4 mr-2" />
            {isExpanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyInternships;