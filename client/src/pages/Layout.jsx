import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Login from './Login'
import UploadResumeModal from '../components/UploadResumeModal'

const Layout = () => {

  const { user, loading } = useSelector(state => state.auth)
  const [showUploadModal, setShowUploadModal] = useState(false)

  if (loading) {
    return <Loader />
  }

  return (
    <div>
      {
        user ? (
          <div className='min-h-screen bg-gray-50'>
            <Navbar onOpenUpload={() => setShowUploadModal(true)} />
            <Outlet />
            <UploadResumeModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
          </div>
        )
          : <Login />
      }

    </div>
  )
}

export default Layout
