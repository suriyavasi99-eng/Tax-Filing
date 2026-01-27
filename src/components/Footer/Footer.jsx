import React from "react";
import { FileText, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                TaxFiler
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Simplifying tax filing for businesses and individuals. Your trusted partner for quarterly federal excise tax returns.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-blue-400 transition-colors">
                  Booking
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm hover:text-blue-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm hover:text-blue-400 transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Form 720 Filing
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Tax Consultation
                </a>
              </li>
           
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  123 Tax Street,<br />
                  Texas, US
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="tel:+911234567890" className="text-sm hover:text-blue-400 transition-colors">
                  +1 (945) 248-3933
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="mailto:support@taxfiler.com" className="text-sm hover:text-blue-400 transition-colors">
                  support@taxfiler.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2026 TaxFiler. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;