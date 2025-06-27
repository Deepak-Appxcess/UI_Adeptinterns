import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  BriefcaseIcon, 
  BookOpen, 
  TrendingUp, 
  Eye,
  Heart,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Zap,
  Activity,
  Calendar
} from 'lucide-react';
import api from '../../../services/api';
import { fetchRecentActivity } from '../../../services/api';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingProfile, setCompletingProfile] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile/');
        setProfile(data);
        
        if (data.role.name !== 'Candidate') {
          navigate('/dashboard/employer');
          return;
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Navigation handlers with loading states
  const handleCompleteNow = async () => {
    setCompletingProfile(true);
    try {
      if (!profile.has_completed_bio) {
        await navigate('/profile/candidate/bio');
      } else if (!profile.has_completed_preferences) {
        await navigate('/student/preferences');
      }
    } finally {
      setCompletingProfile(false);
    }
  };

  useEffect(() => {
    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const { data } = await fetchRecentActivity();
        setRecentActivity(data);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivity();
  }, []);

  // Loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen ">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#18005F] mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen ">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Button with loader component
  const ButtonWithLoader = ({ loading, children, className = "", ...props }) => (
    <button 
      {...props} 
      disabled={loading}
      className={`${className} ${loading ? 'opacity-90 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          Processing...
        </span>
      ) : children}
    </button>
  );

  return (
    <div className="min-h-screen ">
      {/* Professional attention banner for incomplete profile */}
      {(!profile.has_completed_bio || !profile.has_completed_preferences) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-start mb-3 md:mb-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-semibold text-amber-900">Complete Your Profile</h4>
                  <p className="text-sm text-amber-800 mt-1">
                    Your profile is currently hidden from employers. Complete your profile to increase visibility and unlock opportunities.
                  </p>
                </div>
              </div>
              <ButtonWithLoader
                onClick={handleCompleteNow}
                loading={completingProfile}
                className="bg-[#18005F] hover:bg-[#140047] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center whitespace-nowrap"
              >
                <Zap className="w-4 h-4 mr-2" />
                Complete Now
              </ButtonWithLoader>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {profile.first_name}. Here's your career overview.</p>
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-4 md:mt-0">
            <Calendar className="w-4 h-4 mr-2" />
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Hero Welcome Card */}
        <div className="relative bg-gradient-to-br from-[#18005F] via-[#220066] to-[#2a0077] rounded-2xl shadow-xl text-white p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">Ready to advance your career?</h2>
                <p className="text-white/90 mb-6 text-lg">
                  Discover opportunities that match your skills and aspirations.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    {profile.has_completed_bio && profile.has_completed_preferences ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Profile Complete
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Profile Incomplete
                      </>
                    )}
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                    {profile.candidate_profile?.preferences?.currently_looking_for || 'Career Focus: Not Set'}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="w-12 h-12 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Applications Sent</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-2">Ready to apply?</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Saved Opportunities</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-2">Save jobs you love</p>
              </div>
              <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Profile Views</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-2">
                  {profile.has_completed_bio && profile.has_completed_preferences 
                    ? 'Visible to employers' 
                    : 'Complete profile to be visible'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">Start your career journey</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="group bg-gradient-to-br from-[#18005F] to-[#220066] hover:from-[#140047] hover:to-[#1a0052] text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => navigate('/jobs')}
            >
              <div className="flex items-center justify-between mb-4">
                <BriefcaseIcon className="w-8 h-8" />
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Browse Jobs</h3>
              <p className="text-white/80 text-sm">Discover full-time opportunities</p>
            </button>

            <button 
              className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => navigate('/internships')}
            >
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-8 h-8" />
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Find Internships</h3>
              <p className="text-white/80 text-sm">Gain valuable experience</p>
            </button>

            <button 
              className="group bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => navigate('/profile')}
            >
              <div className="flex items-center justify-between mb-4">
                <User className="w-8 h-8" />
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Manage Profile</h3>
              <p className="text-white/80 text-sm">Update your information</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#18005F]" />
              Recent Activity
            </h2>
            {recentActivity.length > 0 && (
              <button className="text-[#18005F] hover:text-[#140047] text-sm font-medium">
                View All
              </button>
            )}
          </div>

          {activityLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#18005F] mb-4"></div>
              <p className="text-sm text-gray-500">Loading your activity...</p>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.activity_type === 'JOB_APPLIED' ? (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#18005F]/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-[#18005F]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/job/${activity.related_id}`)}
                    className="inline-flex items-center px-4 py-2 bg-[#18005F] hover:bg-[#140047] text-white text-xs font-medium rounded-lg transition-colors duration-150"
                  >
                    View
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-500 mb-6">
                Your job applications, profile views, and other activities will appear here.
              </p>
              <button 
                onClick={() => navigate('/jobs')}
                className="inline-flex items-center px-6 py-3 bg-[#18005F] hover:bg-[#140047] text-white font-medium rounded-lg transition-colors duration-150"
              >
                <BriefcaseIcon className="w-4 h-4 mr-2" />
                Start Browsing Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>   
  );
};

export default StudentDashboard;