import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const projects = [
  {
    title: '📚 Courses',
    description: 'Master in-demand skills through industry-curated courses in AI, Web Development, Cybersecurity, and more.',
    link: '/images/courses.png', // Replace with actual course image path
     color: '#5196fd', // Light blue
  },
  {
    title: '💼 Jobs',
    description: 'Explore job opportunities with top companies, from startups to MNCs, tailored to your tech skillset.',
    link: '/images/jobs.png', // Replace with actual job image path
      color: '#8f89ff', // Light purple
  },
  {
    title: '🧑‍💻 Internships',
    description: 'Get hands-on experience with internships that bridge the gap between learning and industry practice.',
    link: '/images/internships.png', // Replace with actual internship image path
   color: '#13006c', // Light green
  }
];


export default function StackingCard({ isDarkMode }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % projects.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">

      {projects.map((project, index) => {
        const zIndex = index === activeIndex ? projects.length : projects.length - index;
        const isActive = index === activeIndex;

        return (
          <AnimatePresence key={index}>
            {isActive && (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -100 }}
                transition={{ duration: 1, ease: 'easeInOut' }}
                style={{
                  zIndex,
                  backgroundColor: project.color,
                }}
                className="absolute inset-0 mx-auto w-full h-full rounded-xl md:rounded-[48px] shadow-xl p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8"
              >
                {/* Content - Left Side (First Half) */}
                <div className="w-full md:w-1/2 flex flex-col justify-center text-white p-4 md:p-8">
                  <h2 className="text-2xl md:text-4xl font-bold mb-4">{project.title}</h2>
                  <p className="text-base md:text-lg opacity-90">{project.description}</p>
                </div>
                
                {/* Image - Right Side (Second Half) */}
                <div className="w-full md:w-1/2 h-64 md:h-full rounded-lg md:rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={project.link}
                    alt={project.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
}