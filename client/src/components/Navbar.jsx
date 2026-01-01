import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import { FileText, Layout, Upload, CheckCircle, ChevronDown, User, LogOut, Menu, X, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import api from '../configs/api'

const Navbar = ({ onOpenUpload }) => {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [resumeCount, setResumeCount] = useState(0)
  const { token } = useSelector(state => state.auth)

  useEffect(() => {
    const fetchResumeCount = async () => {
      if (!token) return;
      try {
        const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } })
        setResumeCount(data.resumes?.length || 0)
      } catch (error) {
        console.error("Failed to fetch resume count", error)
      }
    }
    if (mobileMenuOpen) {
      fetchResumeCount()
    }
  }, [mobileMenuOpen, token])

  const logoutUser = () => {
    dispatch(logout())
    navigate('/')
    setProfileOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { name: 'Home', href: '/app', icon: Home },
    { name: 'Templates', href: '/app/templates', icon: FileText },
    { name: 'Project', href: '/app/projects', icon: Layout },
    { name: 'Upload Resume', href: '#upload', icon: Upload },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 font-[Outfit]">
      <div className="w-full px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            Profilite-Ai
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

        {/* Right Side Actions & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 md:gap-6">
            {/* Check ATS Score - Special Link */}
            <Link
              to="/app/ats-check"
              className="hidden md:flex relative overflow-hidden text-sm font-medium items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-emerald-700 bg-emerald-50 hover:text-emerald-800"
            >
              {/* Pulsing Background */}
              <div className={`absolute inset-0 bg-emerald-200/50 animate-pulse ${isActive('/app/ats-check') ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`} />

              {/* Content (Solid) */}
              <div className="relative z-10 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Check ATS Score
              </div>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 md:gap-3 focus:outline-none group p-1 md:p-1.5 rounded-full hover:bg-gray-50 transition-colors"
              >
                <div className="relative">
                  {/* Fallback avatar if user.avatar is missing */}
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D8ABC&color=fff`}
                    alt="Profile"
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-md group-hover:border-blue-100 transition-colors"
                  />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'User'}</p>
                </div>
                <ChevronDown className={clsx("hidden md:block w-4 h-4 text-slate-400 transition-transform duration-200", profileOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
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
            className="md:hidden text-slate-900 p-1"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu />
          </button>
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[70] md:hidden font-[Outfit] flex flex-col rounded-l-3xl overflow-hidden"
            >

              {/* Indigo Profile Header */}
              <div className="bg-indigo-600 p-8 pt-12 pb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 z-10">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

                <div className="flex flex-col items-center text-center relative z-0">
                  <div className="relative mb-4">
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=fff&color=4F46E5`}
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl"
                    />
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{user?.name || 'Guest User'}</h3>
                  <p className="text-indigo-100 text-sm">{user?.email || 'No email connected'}</p>
                </div>
              </div>

              {/* Nav Links */}
              <div className="flex-1 py-6 px-4 overflow-y-auto">
                <div className="space-y-2">
                  <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>

                  {navLinks.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center justify-between px-4 py-3.5 text-base font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group"
                      onClick={(e) => {
                        if (item.name === 'Upload Resume' && onOpenUpload) {
                          e.preventDefault()
                          onOpenUpload()
                        }
                        setMobileMenuOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        {item.name}
                      </div>

                      {/* Counts / Badges */}
                      {item.name === 'Project' && resumeCount > 0 && (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">
                          {resumeCount}
                        </span>
                      )}

                      {item.name === 'Templates' && (
                        <span className="text-xs font-bold text-slate-400">
                          12
                        </span>
                      )}

                    </Link>
                  ))}

                  <Link
                    to="/app/profile"
                    className="flex items-center justify-between px-4 py-3.5 text-base font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-4">
                      <User className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      My Profile
                    </div>
                  </Link>

                  <div className="h-px bg-slate-100 my-4 mx-4"></div>

                  <Link
                    to="/app/ats-check"
                    className="flex items-center justify-between px-4 py-3.5 text-base font-medium text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-4">
                      <CheckCircle className="w-5 h-5 text-emerald-500 group-hover:text-emerald-700 transition-colors" />
                      Check ATS Score
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      New
                    </span>
                  </Link>

                  <button
                    className="w-full flex items-center justify-between px-4 py-3.5 text-base font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group mt-2"
                    onClick={logoutUser}
                  >
                    <div className="flex items-center gap-4">
                      <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
                      Sign Out
                    </div>
                  </button>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav >
  )
}

export default Navbar
