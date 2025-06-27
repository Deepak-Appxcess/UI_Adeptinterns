import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { fetchCourseById } from '../../services/api';
import CourseRegistration from './CourseRegistration';

function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetchCourseById(id);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Coming soon';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
        <div>Course not found</div>
      </div>
    );
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[60vh] overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src={course.image?.url || 'https://via.placeholder.com/1920x1080?text=Course+Image'}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/1920x1080?text=Course+Image';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-bold mb-6"
            >
              {course.title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-6"
            >
              <div className="text-4xl font-bold text-purple-300 mb-2">
                {formatPrice(course.price)}
              </div>
              <p className="text-xl text-gray-200">
                Next batch starts: {formatDate(course.batchStartDate)}
              </p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-200"
            >
              {course.summary}
            </motion.p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview Section */}
            <motion.section
              ref={ref}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Overview</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">What You'll Learn</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {course.whatYouWillLearn.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 text-lg">✓</span>
                        </div>
                        <p className="text-gray-700">{item}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Content Section */}
            <motion.section
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Course Content</h2>
              <div className="space-y-6">
                {course.modules.map((module, index) => (
                  <motion.div
                    key={module._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">{module.moduleTitle}</h3>
                    <ul className="space-y-3 pl-6">
                      {module.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="text-gray-700 list-disc">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Details Section */}
            <motion.section
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Details</h2>
              <div className="space-y-8">
                {/* Requirements */}
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">Requirements</h3>
                  <ul className="space-y-4">
                    {course.requirements.map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-4"
                      >
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                        <span className="text-gray-700">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">Description</h3>
                  <div className="space-y-4">
                    {course.description.map((item, index) => (
                      <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: index * 0.1 }}
                        className="text-gray-700"
                      >
                        {item}
                      </motion.p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Registration Form - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <CourseRegistration 
                courseTitle={course.title}
                price={course.price}
                courseDate={course.batchStartDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;