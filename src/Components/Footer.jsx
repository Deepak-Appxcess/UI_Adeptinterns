import { Link } from 'react-router-dom';

function Footer({ isDarkMode }) {
  return (
    <footer className={`py-8 md:py-16 ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <div className="container mx-auto px-4 md:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-bold">Edu-cause</h3>
            <p className={`${isDarkMode ? 'text-white/80' : 'text-black/80'} text-sm md:text-base`}>
              We're always in search of talented and motivated people. Don't be shy, introduce yourself!
            </p>
            <div className="flex space-x-4">
              {/* Social Media Icons */}
              {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
                  } transition-colors`}
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-bold">Contact With Us</h3>
            <div className={`space-y-2 ${isDarkMode ? 'text-white/80' : 'text-black/80'} text-sm md:text-base`}>
              <p>E-mail: support@adeptinterns.com</p>
              <p>Phone: +1 234 567 890</p>
              <p>Location: New York, USA</p>
            </div>
          </div>

          {/* Useful Links */}
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-bold">Useful Links</h3>
            <ul className={`grid grid-cols-2 gap-2 ${isDarkMode ? 'text-white/80' : 'text-black/80'} text-sm md:text-base`}>
              <li><Link to="/" className="hover:underline">Home</Link></li>
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/internships" className="hover:underline">For Intern</Link></li>
              <li><Link to="/corporate" className="hover:underline">For Corporate</Link></li>
              <li><Link to="/blog" className="hover:underline">Blog</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xl md:text-2xl font-bold">Get Contact</h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter Your Email Here"
                className={`w-full px-4 py-3 rounded-lg text-sm md:text-base ${
                  isDarkMode 
                    ? 'bg-white/5 text-white border-white/10' 
                    : 'bg-black/5 text-black border-black/10'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <button className={`w-full px-4 py-3 rounded-lg text-sm md:text-base font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-white text-black hover:bg-white/90' 
                  : 'bg-black text-white hover:bg-black/90'
              }`}>
                Subscribe Now
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`border-t ${isDarkMode ? 'border-white/10' : 'border-black/10'} pt-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className={`${isDarkMode ? 'text-white/60' : 'text-black/60'} text-center md:text-left`}>
              Copyright © 2025 AdeptInterns All Rights Reserved
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-8">
              <Link to="/terms" className={`${isDarkMode ? 'text-white/60' : 'text-black/60'} hover:underline`}>
                Terms of service
              </Link>
              <Link to="/privacy" className={`${isDarkMode ? 'text-white/60' : 'text-black/60'} hover:underline`}>
                Privacy policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;