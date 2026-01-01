import React, { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Projects from './pages/Projects'
import Preview from './pages/Preview'
import Login from './pages/Login'
import SubscriptionPage from './pages/SubscriptionPage'
import ATSCheckerPage from './pages/ATSCheckerPage'
import ProfilePage from './pages/ProfilePage'
import TemplatesPage from './pages/TemplatesPage'
import { useDispatch } from 'react-redux'
import api from './configs/api'
import { login, setLoading } from './app/features/authSlice'
import { Toaster } from 'react-hot-toast'

const App = () => {
  const dispatch = useDispatch()
  const location = useLocation()

  const getUserData = async () => {
    const token = localStorage.getItem('token')
    try {
      if (token) {
        const { data } = await api.get('/api/users/data', { headers: { Authorization: token } })
        if (data.user) {
          dispatch(login({ token, user: data.user }))
        }
        dispatch(setLoading(false))
      } else {
        dispatch(setLoading(false))
      }
    } catch (error) {
      dispatch(setLoading(false))
      console.log(error.message)
    }
  }

  useEffect(() => {
    // Check if current path is a guest page (Landing, Login, Register)
    const publicPaths = ['/', '/login', '/register'];
    const isPublicPath = publicPaths.includes(location.pathname) || location.pathname.startsWith('/view/');
    const isAppPath = location.pathname.startsWith('/app');

    // Also check for state query params (login/register)
    const searchParams = new URLSearchParams(location.search);
    const authState = searchParams.get('state');
    const isAuthSearch = authState === 'login' || authState === 'register';

    // Hydration Logic:
    // 1. If we are on an /app path, ALWAYS try to get user data if a token exists.
    // 2. If we are on a public path but have a token, we SHOULD try to hydrate (to show "Dashboard" links).
    // 3. ONLY skip and silence 401s if we are on a purely public/auth page WITH NO TOKEN.
    const token = localStorage.getItem('token');

    if (token) {
      if (isAppPath || (!isAuthSearch)) {
        getUserData();
      } else {
        // We are on /login or /register with a token - still hydrate to allow auto-redirect
        getUserData();
      }
    } else {
      // No token, definitely a guest
      dispatch(setLoading(false));
    }
  }, [location.pathname]) // Removed location.search from dependencies to avoid redundant calls

  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='app' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='templates' element={<TemplatesPage />} />
          <Route path='projects' element={<Projects />} />
          <Route path='builder/:resumeId' element={<ResumeBuilder />} />
          <Route path='subscription' element={<SubscriptionPage />} />
          <Route path='ats-check' element={<ATSCheckerPage />} />
          <Route path='profile' element={<ProfilePage />} />
        </Route>

        <Route path='view/:resumeId' element={<Preview />} />

      </Routes>
    </>
  )
}

export default App
