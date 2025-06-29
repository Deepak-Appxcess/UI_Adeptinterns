import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const projects = [
  {
    title: '📚 Courses',
    link: './images/COURSE1.png', // Replace with actual course image path
    color: '#4e6fb1d1', // Light blue
  },
  {
    title: '💼 Jobs',
    link: './images/Internships.png', // Replace with actual job image path
    color: '#18005fc9', // Light purple
  },
  {
    title: '🧑‍💻 Internships',
    link: './images/Internships.png', // Replace with actual internship image path
    color: '#14b1efa8', // Light green
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
                className="absolute inset-0 mx-auto w-full h-full rounded-xl md:rounded-[48px] shadow-xl overflow-hidden"
              >
                <img
                  src={project.link}
                  alt={project.title}
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </div>
  );
}