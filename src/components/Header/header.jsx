import React, { useState, useRef, useEffect } from "react";
import { CircleUser, SquarePen, LogIn, UserPlus, Menu, X, FileText } from "lucide-react";
import Registerform from "../Registration/Registration";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Header({ onFilerAdded }) {
  const [open, setOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const dropdownRef = useRef(null);
  const [userName, setUserName] = useState("User");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get current location and navigation
  const location = useLocation();
  const navigate = useNavigate();
  const isRegisterPage = location.pathname === "/register";

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserName(parsedUser.name || "User");
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    if (onFilerAdded) {
      onFilerAdded();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <button className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hidden sm:block">
                TaxFiler
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Home
            </button>
            <Link to="/dashboard">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Dashboard
              </button>
            </Link>
            <Link to="/register">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Business
              </button>
            </Link> 
             <Link to="/filer">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Filing
              </button>
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Show Register button only on /register path */}
            {isRegisterPage && (
              <button
                onClick={() => setShowRegister(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <SquarePen className="w-4 h-4" />
                <span>Register</span>
              </button>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <CircleUser className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium">{userName}</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                  <Link to="/login">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-gray-500" />
                      Login
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      <UserPlus className="w-4 h-4 text-gray-500" />
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              Home
            </button>
            <Link to="/dashboard">
              <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                Dashboard
              </button>
            </Link>
            <Link to="/register">
              <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                Business
              </button>
            </Link>
            {/* Show Register button only on /register path */}
            {isRegisterPage && (
              <button
                onClick={() => {
                  setShowRegister(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm"
              >
                <SquarePen className="w-4 h-4" />
                Register
              </button>
            )}
          </div>
        )}
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <h3 className="text-lg font-semibold text-gray-800">
                Business Information
              </h3>
              <button
                onClick={() => setShowRegister(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Registerform onSuccess={handleRegisterSuccess} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;