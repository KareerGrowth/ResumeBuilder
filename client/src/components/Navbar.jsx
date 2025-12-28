import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import { FileText, LogOut } from 'lucide-react'

const Navbar = () => {

  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const navigate = useNavigate()

  const logoutUser = () => {
    navigate('/')
    dispatch(logout())
  }

  return (
    <div className='bg-white border-b border-slate-200 sticky top-0 z-50'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-6 py-4 transition-all'>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
            ResumeBuilder
          </span>
        </Link>
        <div className='flex items-center gap-6'>
          <Link to="/app/projects" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">
            Projects
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={logoutUser} className='group flex items-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-all duration-200 border border-transparent hover:border-red-100'>
              <span className="text-sm font-medium">Logout</span>
              <LogOut className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
