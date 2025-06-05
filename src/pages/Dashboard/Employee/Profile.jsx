// Profile.jsx
import { useEffect, useState } from 'react';
import { User, Mail, Briefcase, Building, MapPin, Users, FileText } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('https://97b7-2401-4900-8824-2846-747a-4c92-ed8f-9daa.ngrok-free.app/auth/profile', {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
          }
        });
        setUserData(response.data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>Error loading profile</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Personal Information</h2>
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{userData.name}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-green-100 text-green-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{userData.email}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Designation</p>
              <p className="font-medium">{userData.designation || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        {/* Organization Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Organization Information</h2>
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-orange-100 text-orange-600">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Organization Name</p>
              <p className="font-medium">{userData.organizationName || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-red-100 text-red-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Organization City</p>
              <p className="font-medium">{userData.organizationCity || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Number of Employees</p>
              <p className="font-medium">{userData.noOfEmployees || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Info */}
      <div className="mt-6 space-y-4">
        {userData.organizationDescription && (
          <div>
            <h3 className="font-medium text-gray-700">Organization Description</h3>
            <p className="text-gray-600 mt-1">{userData.organizationDescription}</p>
          </div>
        )}
        
        <div>
          <h3 className="font-medium text-gray-700">Industry</h3>
          <p className="text-gray-600 mt-1">{userData.industry || 'Not specified'}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-700">Verification Status</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`p-1 rounded-full ${userData.isVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
              <FileText className="h-4 w-4" />
            </div>
            <span>{userData.isVerified ? 'Verified' : 'Not Verified'}</span>
          </div>
          {userData.verificationValue && (
            <a 
              href={userData.verificationValue} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 text-sm mt-1 inline-block"
            >
              View Verification Document
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;