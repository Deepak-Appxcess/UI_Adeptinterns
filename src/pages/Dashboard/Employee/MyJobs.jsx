import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Clock, DollarSign, ArrowLeft, Edit, Users } from 'lucide-react';
import { fetchMyJobs } from '../../../services/api';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await fetchMyJobs();
        console.log('Fetched jobs:', data); // Debugging
        setJobs(data);
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
        title="My Jobs"
        actionText="Post New Job"
        actionLink="/post-job"
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {jobs.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={48} className="text-gray-400" />}
            title="No Jobs Found"
            description="You haven't posted any jobs yet"
            actionText="Post Job"
            actionLink="/post-job"
          />
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <JobCard 
                key={job._id}
                job={job}
                onEdit={() => navigate(`/edit-job/${job._id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Reused sub-components from MyInternships
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

const JobCard = ({ job, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{job.companyName || 'Your Company Name'}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {job.jobType} • {job.workMode || 'On-site'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            {job.location || 'Remote'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
            {job.salary ? `$${job.salary}/year` : 'Not specified'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            {job.experienceRequired || 'Any experience'}
          </div>
        </div>

        {job.skills?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Skills Required</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Details Section */}
        {isExpanded && (
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Job Description</h4>
              <p className="mt-2 text-sm text-gray-600">{job.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Responsibilities</h4>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                {job.responsibilities?.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Requirements</h4>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                {job.requirements?.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Additional Information</h4>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p><span className="font-medium">Posted On:</span> {formatDate(job.postedAt)}</p>
                  <p><span className="font-medium">Deadline:</span> {formatDate(job.applicationDeadline)}</p>
                </div>
                <div>
                  <p><span className="font-medium">Education:</span> {job.educationRequired || 'Not specified'}</p>
                  <p><span className="font-medium">Openings:</span> {job.openings || 'Not specified'}</p>
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

export default MyJobs;