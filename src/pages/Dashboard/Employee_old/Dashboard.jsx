// Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Briefcase, LogOut, Building, Users, FileText, MapPin, Plus } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [postedInternships, setPostedInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Create axios instance with base config
  const api = axios.create({
    baseURL: 'https://97b7-2401-4900-8824-2846-747a-4c92-ed8f-9daa.ngrok-free.app',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      "ngrok-skip-browser-warning": "true",
      
    },
    withCredentials: true
  
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Set up axios config
        const config = {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true
        };

        // Fetch data using axios
        const [profileResponse, jobsResponse, internshipsResponse] = await Promise.all([
          api.get('/auth/profile', config),
          api.get('/employee/my-jobs', config),
          api.get('/employee/my-internships', config)
        ]);

        setUserData(profileResponse.data.user);
        setPostedJobs(jobsResponse.data);
        setPostedInternships(internshipsResponse.data);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Employee Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/profile" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="bg-white shadow rounded-lg overflow-hidden col-span-1">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Profile Summary</h2>
            </div>
            <div className="px-6 py-4">
              {userData && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-lg font-medium">{userData.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-lg font-medium">{userData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Organization</p>
                      <p className="text-lg font-medium">{userData.organizationName || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Opportunity Posting</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  to="/post-job" 
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 p-4 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Post a Job
                </Link>
                <Link 
                  to="/post-internship" 
                  className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 p-4 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Post an Internship
                </Link>
              </div>
            </div>

            {/* Posted Jobs */}
          {/* Posted Jobs */}
<div className="bg-white shadow rounded-lg p-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-medium text-gray-900">Posted Jobs</h2>
    {postedJobs.length > 0 && (
      <Link to="/my-jobs" className="text-sm text-blue-600 hover:underline">
        View All
      </Link>
    )}
  </div>
  {postedJobs.length > 0 ? (
    <div className="space-y-4">
      {postedJobs.slice(0, 2).map(job => (
        <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
          <h3 className="font-medium">{job.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {job.jobType} • {job.salary || 'Salary not disclosed'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {job.experienceRequired} • {job.openings} opening{job.openings !== 1 ? 's' : ''}
          </p>
          <div className="mt-2">
            <Link 
              to={`/job/${job._id}`} 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details →
            </Link>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-4">
      <p className="text-gray-500 mb-2">No jobs posted yet</p>
      <Link 
        to="/post-job" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        <Plus className="h-4 w-4 mr-1" />
        Post your first job
      </Link>
    </div>
  )}
</div>

            {/* Posted Internships */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Posted Internships</h2>
                {postedInternships.length > 0 && (
                  <Link to="/my-internships" className="text-sm text-blue-600 hover:underline">
                    View All
                  </Link>
                )}
              </div>
              {postedInternships.length > 0 ? (
                <div className="space-y-4">
                  {postedInternships.slice(0, 2).map(internship => (
                    <div key={internship._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <h3 className="font-medium">{internship.profile}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {internship.internshipType} • {internship.workType}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Duration: {internship.duration} months • {internship.openings} openings
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No internships posted yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;