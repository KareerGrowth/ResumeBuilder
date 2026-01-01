import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import { FileText, Layout, Upload, CheckCircle, ChevronDown, User, LogOut, Menu, X, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const Navbar = ({ onOpenUpload }) => {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const logoutUser = () => {
    dispatch(logout())
    navigate('/')
    setProfileOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { name: 'Home', href: '/app', icon: Home },
    { name: 'Templates', href: '#templates', icon: FileText },
    { name: 'Project', href: '/app/projects', icon: Layout },
    { name: 'Upload Resume', href: '#upload', icon: Upload },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 font-[Outfit]">
      <div className="w-full px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            Ai.Scanner
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={(e) => {
                if (item.name === 'Upload Resume' && onOpenUpload) {
                  e.preventDefault()
                  onOpenUpload()
                }
              }}
              className={clsx(
                "text-sm font-medium transition-colors flex items-center gap-2",
                isActive(item.href) ? "text-blue-600" : "text-slate-600 hover:text-blue-600"
              )}
            >
              {item.name}
            </Link>
          ))}

          {/* Check ATS Score - Special Link */}

        </div>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-6">
          {/* Check ATS Score - Special Link */}
          <Link
            to="/app/ats-check"
            className="relative overflow-hidden text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-emerald-700 bg-emerald-50 hover:text-emerald-800"
          >
            {/* Pulsing Background */}
            <div className={`absolute inset-0 bg-emerald-200/50 animate-pulse ${isActive('/app/ats-check') ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />

            {/* Content (Solid) */}
            <div className="relative z-10 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Check ATS Score
            </div>
          </Link>

          {/* Removed Resume Builder Button as requested */}

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 focus:outline-none group p-1.5 rounded-full hover:bg-gray-50 transition-colors"
            >
              <div className="relative">
                {/* Fallback avatar if user.avatar is missing */}
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover:border-blue-100 transition-colors"
                />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'User'}</p>
              </div>
              <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform duration-200", profileOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/app/profile"
                      className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg flex items-center gap-2 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      to="/app/projects"
                      className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg flex items-center gap-2 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FileText className="w-4 h-4" />
                      My Resumes
                    </Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                      onClick={logoutUser}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden font-[Outfit]"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block text-base font-medium text-slate-600 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/app/ats-check"
                className="block text-base font-medium text-emerald-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Check ATS Score
              </Link>
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  className="w-full text-left text-sm text-red-600 font-medium flex items-center gap-2"
                  onClick={logoutUser}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
