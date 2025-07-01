import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  DollarSign, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  User,
  Bookmark,
  Share2,
  AlertCircle
} from 'lucide-react';
import { fetchCourseDetails, enrollInCourse, initiatePayment } from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await fetchCourseDetails(id);
      setCourse(response.data);
    } catch (err) {
      console.error('Error fetching course details:', err);
      setError('Failed to load course details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }

    try {
      setIsEnrolling(true);
      
      // First enroll in the course with slot: 1 (temporary)
      const enrollmentResponse = await enrollInCourse({ course: id, slot: 1 });
      
      // Then initiate payment
      const paymentResponse = await initiatePayment({ 
        enrollment_id: enrollmentResponse.data.id 
      });
      
      setPaymentDetails(paymentResponse.data);
      setShowPaymentModal(true);
      setEnrollmentSuccess(true);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      
      if (err.response) {
        if (err.response.status === 400) {
          if (err.response.data.detail === 'Course is already full') {
            toast.error('This course is already full');
          } else if (err.response.data.detail === 'Registration deadline has passed') {
            toast.error('Registration deadline has passed');
          } else if (err.response.data.detail === 'You are already enrolled in this course') {
            toast.error('You are already enrolled in this course');
          } else {
            toast.error('Unable to enroll: ' + JSON.stringify(err.response.data));
          }
        } else if (err.response.status === 403) {
          toast.error('Only candidates can enroll in courses');
        } else {
          toast.error('Failed to enroll. Please try again.');
        }
      } else {
        toast.error('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    const options = {
      key: paymentDetails.key,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      name: course.title,
      description: 'Course Enrollment',
      order_id: paymentDetails.order_id,
      handler: function(response) {
        toast.success('Payment successful! Enrollment confirmed.');
        setShowPaymentModal(false);
        // You might want to refresh the course data here
        fetchCourseData();
      },
      prefill: {
        name: 'User Name', // You can get this from user profile
        email: 'user@example.com', // You can get this from user profile
      },
      theme: {
        color: '#4f46e5' // indigo-600
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Course</h3>
          <p className="text-gray-600 mb-4">{error || 'Course not found'}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Go Back
            </button>
            <button
              onClick={fetchCourseData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Course Banner */}
      <div 
        className="relative h-96 w-full bg-gray-900"
        style={{ 
          backgroundImage: `url(${course.course_banner_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end pb-12 px-4">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-white hover:text-indigo-200 text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Courses
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  course.status === 'open' 
                    ? 'bg-green-100 text-green-800' 
                    : course.status === 'closed' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.status === 'open' ? 'Open' : course.status === 'closed' ? 'Closed' : 'Draft'}
                </span>
                <h1 className="text-4xl font-bold text-white mt-2 mb-1">{course.title}</h1>
                <p className="text-lg text-gray-200 max-w-3xl">{course.description}</p>
              </div>
              
              <div className="flex space-x-3 mt-4 md:mt-0">
                <button className="p-2 text-white hover:text-indigo-200 hover:bg-white hover:bg-opacity-10 rounded-full">
                  <Bookmark className="w-5 h-5" />
                </button>
                <button className="p-2 text-white hover:text-indigo-200 hover:bg-white hover:bg-opacity-10 rounded-full">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About the Course */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Course</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700">{course.description}</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">What You'll Learn</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Comprehensive understanding of {course.title.split(' ')[0]}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Hands-on projects and real-world applications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Expert guidance from industry professionals</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Course Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Start Date</h3>
                    <p className="text-gray-600">{formatDate(course.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">End Date</h3>
                    <p className="text-gray-600">{formatDate(course.end_date)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <Clock className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Registration Deadline</h3>
                    <p className="text-gray-600">{formatDate(course.registration_deadline)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Seats Available</h3>
                    <p className="text-gray-600">{course.available_seats} of {course.base_capacity}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6 sticky top-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Enroll in this Course</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course Fee</span>
                  <span className="font-semibold">{formatCurrency(course.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course Type</span>
                  <span className="font-medium capitalize">
                    {course.course_type.replace('_', '-')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    course.status === 'open' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {course.status === 'open' ? 'Open for Enrollment' : 'Closed'}
                  </span>
                </div>
              </div>

              {course.is_enrolled ? (
                <button
                  className="w-full py-3 px-4 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow text-sm cursor-not-allowed"
                  disabled
                >
                  Already Enrolled
                </button>
              ) : course.status !== 'open' ? (
                <button
                  className="w-full py-3 px-4 bg-gray-300 text-gray-700 font-semibold rounded-lg shadow text-sm cursor-not-allowed"
                  disabled
                >
                  Enrollment Closed
                </button>
              ) : (
                <button
                  onClick={handleEnrollClick}
                  disabled={isEnrolling}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isEnrolling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </button>
              )}

              {!isAuthenticated && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  You need to <Link to="/login" className="text-indigo-600 hover:underline">log in</Link> to enroll
                </p>
              )}

              {course.available_seats < 5 && course.status === 'open' && (
                <div className="mt-4 flex items-center text-sm text-yellow-700 bg-yellow-50 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Only {course.available_seats} seat{course.available_seats !== 1 ? 's' : ''} left!
                </div>
              )}
            </motion.div>

            {/* Share Course */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="font-medium text-gray-900 mb-3">Share this course</h3>
              <div className="flex space-x-3">
                <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="p-2 bg-blue-100 text-blue-400 rounded-full hover:bg-blue-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && paymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Your Enrollment</h2>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Course:</span>
                <span className="font-medium">{course.title}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">{formatCurrency(course.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">Credit/Debit Card</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Proceed to Payment
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
}

export default CourseDetails;