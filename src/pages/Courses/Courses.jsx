import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import debounce from 'lodash.debounce';
import { fetchCourses, fetchCourseImage } from '../../services/api';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const fetchCoursesData = async (query = '') => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetchCourses(query);
      
      // Handle both array and object response formats
      const coursesData = Array.isArray(response.data) 
        ? response.data 
        : response.data?.data || [];
      
      // Parse content if it's a string
      const formattedCourses = coursesData.map(course => ({
        ...course,
        content: typeof course.content === 'string' 
          ? JSON.parse(course.content) 
          : course.content || {},
        price: course.price || 0
      }));

      setCourses(formattedCourses);
    } catch (error) {
      console.error("Fetch error:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null || price === 0) return 'Free';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const debouncedSearch = debounce((query) => {
    fetchCoursesData(query);
  }, 400);

  useEffect(() => {
    fetchCoursesData();
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.8 }}
      className="pt-24 min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            Explore Our Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover a wide range of courses designed to help you grow.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {isError && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-600 text-center mb-8"
          >
            Error loading courses. Please try again later.
          </motion.p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Grid */}
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {courses.map((course) => {
                const courseContent = course.content || {};
                const imageUrl = course.image 
                  ? `/api/adept/${course._id}/image` 
                  : 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg';

                return (
                  <motion.div
                    key={course._id}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                  >
                    <div className="relative overflow-hidden group">
                      <img
                        src={imageUrl}
                        alt={courseContent.title || 'Course image'}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-2 text-gray-900">
                        {courseContent.courseTitle || 'Untitled Course'}
                      </h3>
                      <div className="text-xl font-semibold text-purple-600 mb-3">
                        {formatPrice(course.price)}
                      </div>
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {courseContent.summary || 'No description available'}
                      </p>
                      <Link
                        to={`/courses/${course._id}`}
                        className="inline-block px-6 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
                      >
                        Learn More →
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No results */}
        {courses.length === 0 && !isLoading && !isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try another search term.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default Courses;