import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <Sprout className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-white">
                AgroLink <span className="text-emerald-500">BD</span>
              </span>
            </div>
            <p className="text-sm">
              Empowering Bangladeshi farmers by eliminating middlemen. Providing fresh organic products directly from fields to dining tables.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-emerald-500"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-emerald-500"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-emerald-500"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/marketplace" className="hover:text-emerald-500">Browse Produce</Link></li>
              <li><Link to="/crop-disease" className="hover:text-emerald-500">AI Crop Diagnosis</Link></li>
              <li><Link to="/register" className="hover:text-emerald-500">Register as Farmer</Link></li>
              <li><Link to="/register" className="hover:text-emerald-500">Join as Business Buyer</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/marketplace?category=vegetables" className="hover:text-emerald-500">Fresh Vegetables</Link></li>
              <li><Link to="/marketplace?category=fruits" className="hover:text-emerald-500">Organic Fruits</Link></li>
              <li><Link to="/marketplace?category=rice" className="hover:text-emerald-500">Premium Rice</Link></li>
              <li><Link to="/marketplace?category=organic-products" className="hover:text-emerald-500">Organic Essentials</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>Gulshan-2, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>+880 1711-223344</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>info@agrolinkbd.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} AgroLink BD. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-emerald-500">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500">Terms of Service</a>
            <a href="#" className="hover:text-emerald-500">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
