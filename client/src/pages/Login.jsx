import { Lock, Mail, User2Icon, ArrowRight, Sparkles, FileText, Paperclip, Star, Cloud, Briefcase, Globe, Search, Monitor, PenTool, Code, Terminal, Cpu, Database, Server, Loader2 } from 'lucide-react'
import React from 'react'
import api from '../configs/api'
import { useDispatch } from 'react-redux'
import { login } from '../app/features/authSlice'
import toast from 'react-hot-toast'
import loginImg from '../assets/login.jpeg'
import { motion } from 'framer-motion'

import { useNavigate } from 'react-router-dom'

const Login = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const query = new URLSearchParams(window.location.search)
    const urlState = query.get('state')
    const [state, setState] = React.useState(urlState || "login")
    const [showOTP, setShowOTP] = React.useState(false)
    const [verificationEmail, setVerificationEmail] = React.useState('')

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        newPassword: '',
        otp: ''
    })

    const [rememberMe, setRememberMe] = React.useState(false)

    React.useEffect(() => {
        const remembered = localStorage.getItem('rememberedUser')
        if (remembered) {
            try {
                const { email, password } = JSON.parse(atob(remembered))
                setFormData(prev => ({ ...prev, email, password }))
                setRememberMe(true)
            } catch (e) {
                localStorage.removeItem('rememberedUser')
            }
        }
    }, [])

    const [isLoading, setIsLoading] = React.useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            if (showOTP) {
                // Verify OTP
                const { data } = await api.post('/api/users/verify-otp', {
                    email: verificationEmail || formData.email,
                    otp: formData.otp
                })
                dispatch(login(data))
                localStorage.setItem('token', data.token)
                toast.success(data.message)
                navigate('/app')
                return;
            }

            const { data } = await api.post(`/api/users/${state}`, formData)

            if (state === 'forgot-password') {
                toast.success(data.message)
                setState('verify-reset-otp')
                return
            }

            if (state === 'verify-reset-otp') {
                toast.success(data.message)
                setState('reset-password')
                return
            }

            if (state === 'reset-password') {
                toast.success(data.message)
                setState('login')
                return
            }

            if (data.requiresVerification) {
                setShowOTP(true)
                setVerificationEmail(data.email)
                toast.success(data.message)
            } else {
                dispatch(login(data))
                localStorage.setItem('token', data.token)

                // Handle Remember Me
                if (rememberMe && state === 'login') {
                    const credentials = btoa(JSON.stringify({ email: formData.email, password: formData.password }))
                    localStorage.setItem('rememberedUser', credentials)
                } else if (!rememberMe) {
                    localStorage.removeItem('rememberedUser')
                }

                toast.success(data.message)
                navigate('/app')
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || error.message;
            if (error?.response?.status === 403 && error?.response?.data?.requiresVerification) {
                const email = error?.response?.data?.email;
                setShowOTP(true)
                setVerificationEmail(email)
                toast.error(errorMsg)
                // Automatically trigger resend OTP so they get a fresh code
                try {
                    await api.post('/api/users/resend-otp', { email });
                } catch (resendError) {
                    console.error("Auto-resend OTP failed:", resendError);
                }
            } else if (error?.response?.status === 404 && error?.response?.data?.userNotFound) {
                setState("register")
                toast.error(errorMsg)
            } else {
                toast.error(errorMsg)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOTP = async () => {
        try {
            setIsLoading(true)
            const { data } = await api.post('/api/users/resend-otp', { email: verificationEmail || formData.email })
            toast.success(data.message)
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Generate random icons with different movement directions (Right to Left, Left to Right, etc.)
    const bgIcons = [
        { Icon: Mail, size: 45, duration: 45, delay: 0, startPos: { top: '15%', left: '0%' }, moveType: 'right' },
        { Icon: Briefcase, size: 50, duration: 50, delay: 2, startPos: { top: '40%', right: '0%' }, moveType: 'left' },
        { Icon: FileText, size: 55, duration: 55, delay: 5, startPos: { top: '65%', right: '0%' }, moveType: 'left' },
        { Icon: Paperclip, size: 40, duration: 50, delay: 2, startPos: { top: '0%', left: '35%' }, moveType: 'down' },
        { Icon: Globe, size: 45, duration: 60, delay: 1, startPos: { top: '25%', left: '0%' }, moveType: 'right' },
        { Icon: Monitor, size: 48, duration: 52, delay: 7, startPos: { top: '75%', right: '0%' }, moveType: 'left' },
        { Icon: Sparkles, size: 35, duration: 40, delay: 8, startPos: { bottom: '0%', left: '80%' }, moveType: 'up' },
        { Icon: Star, size: 30, duration: 60, delay: 1, startPos: { top: '55%', left: '0%' }, moveType: 'right' },
        { Icon: Cloud, size: 70, duration: 65, delay: 4, startPos: { top: '10%', right: '0%' }, moveType: 'left' },
        { Icon: PenTool, size: 38, duration: 45, delay: 10, startPos: { top: '0%', right: '20%' }, moveType: 'down' },
        { Icon: Search, size: 42, duration: 48, delay: 3, startPos: { top: '30%', left: '0%' }, moveType: 'diagonal' },
        { Icon: Mail, size: 40, duration: 58, delay: 12, startPos: { bottom: '0%', left: '20%' }, moveType: 'up' },
        { Icon: Briefcase, size: 35, duration: 52, delay: 9, startPos: { top: '85%', left: '0%' }, moveType: 'right' },
        { Icon: Sparkles, size: 28, duration: 19, delay: 3, top: '90%' },
        { Icon: Globe, size: 55, duration: 65, delay: 6, startPos: { top: '20%', right: '0%' }, moveType: 'left' },
        { Icon: Code, size: 42, duration: 55, delay: 4, startPos: { top: '5%', right: '10%' }, moveType: 'diagonal-reverse' },
        { Icon: Terminal, size: 38, duration: 62, delay: 11, startPos: { bottom: '10%', left: '5%' }, moveType: 'right' },
        { Icon: Cpu, size: 45, duration: 50, delay: 7, startPos: { top: '40%', left: '40%' }, moveType: 'up' }, // Center-ish
        { Icon: Database, size: 40, duration: 58, delay: 2, startPos: { top: '15%', right: '25%' }, moveType: 'down' },
        { Icon: Server, size: 50, duration: 53, delay: 5, startPos: { bottom: '20%', right: '5%' }, moveType: 'left' },
        { Icon: Cloud, size: 60, duration: 70, delay: 14, startPos: { top: '60%', left: '10%' }, moveType: 'right' },
        { Icon: Star, size: 24, duration: 45, delay: 8, startPos: { top: '80%', right: '40%' }, moveType: 'up' },
    ]

    const getAnimation = (type) => {
        switch (type) {
            case 'right': return { x: ['-10vw', '100vw'] };
            case 'left': return { x: ['100vw', '-10vw'] };
            case 'down': return { y: ['-10vh', '110vh'] };
            case 'up': return { y: ['110vh', '-10vh'] };
            case 'diagonal': return { x: ['-10vw', '100vw'], y: ['-10vh', '100vh'] };
            case 'diagonal-reverse': return { x: ['-10vw', '100vw'], y: ['100vh', '-10vh'] };
            default: return { x: ['-10vw', '100vw'] };
        }
    }

    return (
        <div className='min-h-screen flex w-full bg-white relative overflow-hidden'>

            {/* Multi-Directional Background Icons */}
            {bgIcons.map(({ Icon, size, duration, delay, startPos, moveType }, index) => (
                <motion.div
                    key={index}
                    className="absolute text-slate-500/60"
                    style={startPos}
                    initial={{ opacity: 0 }} // Start invisible to avoid pop-in, but animate to constant
                    animate={{
                        ...getAnimation(moveType),
                        opacity: 1, // Constant opacity once started
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: duration,
                        repeat: Infinity,
                        ease: "linear",
                        delay: delay
                    }}
                >
                    <Icon size={size} strokeWidth={1.5} />
                </motion.div>
            ))}


            {/* Content Container */}
            <div className='relative z-10 flex w-full'>

                {/* Left Side - Login Form */}
                <div className='w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12'>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className='w-full max-w-md p-8 sm:p-12'
                    >
                        <div className='text-center mb-10'>
                            {/* Logo */}
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-6 shadow-lg shadow-indigo-100">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                                {showOTP ? "Verify Email" : state === "login" ? "Welcome back" : "Create an account"}
                            </h1>
                            <p className="text-slate-500 text-base">
                                {showOTP ? `Enter the 6-digit code sent to ${verificationEmail}` : state === "login" ? "Enter your details to access your account." : "Start your journey to a better career."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {showOTP || state === 'verify-reset-otp' ? (
                                <div className="space-y-5">
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <input
                                            type="text"
                                            name="otp"
                                            placeholder="6-digit OTP"
                                            maxLength={6}
                                            className="w-full bg-white border border-slate-200 rounded-full px-12 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold tracking-[8px] text-center text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal shadow-sm"
                                            value={formData.otp}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-between items-center px-2">
                                        {state !== 'verify-reset-otp' && (
                                            <button
                                                type="button"
                                                onClick={() => setShowOTP(false)}
                                                className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                                            >
                                                Change email
                                            </button>
                                        )}
                                        {state === 'verify-reset-otp' && (
                                            <button
                                                type="button"
                                                onClick={() => setState('forgot-password')}
                                                className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
                                            >
                                                Change email
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={state === 'verify-reset-otp' ? () => { /* Handle resend for reset */ } : handleResendOTP}
                                            disabled={isLoading}
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {state === "register" && (
                                        <>
                                            <div className="relative group">
                                                <User2Icon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    placeholder="Full Name"
                                                    className="w-full bg-white border border-slate-200 rounded-full px-12 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="Phone Number"
                                                    className="w-full bg-white border border-slate-200 rounded-full px-12 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}

                                    {state !== "reset-password" && (
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Email address"
                                                className="w-full bg-white border border-slate-200 rounded-full px-12 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    )}


                                    {state !== "forgot-password" && (
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                            <input
                                                type={state === 'reset-password' ? 'text' : 'password'}
                                                name={state === 'reset-password' ? 'newPassword' : 'password'}
                                                placeholder={state === 'reset-password' ? 'New Password' : 'Password'}
                                                className="w-full bg-white border border-slate-200 rounded-full px-12 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                                                value={state === 'reset-password' ? formData.newPassword : formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {state === "login" && !showOTP && (
                                <div className="flex justify-between items-center px-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                                    </label>
                                    <button type="button" onClick={() => setState("forgot-password")} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">Forget password?</button>
                                </div>
                            )}

                            {state === "forgot-password" && (
                                <button type="button" onClick={() => setState("login")} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors block text-center w-full">Back to Login</button>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-full transition-all shadow-lg shadow-indigo-100 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {showOTP ? "Verify & Continue" : state === "login" ? "Sign In" : state === "register" ? "Create Account" : state === "forgot-password" ? "Send OTP" : state === "verify-reset-otp" ? "Verify OTP" : "Reset Password"}
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            {!["forgot-password", "verify-reset-otp", "reset-password"].includes(state) && (
                                <p className="text-center text-slate-500 text-sm mt-6">
                                    {state === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                                    <span
                                        onClick={() => setState(prev => prev === "login" ? "register" : "login")}
                                        className="text-indigo-600 font-bold hover:underline cursor-pointer"
                                    >
                                        {state === "login" ? "Sign up" : "Log in"}
                                    </span>
                                </p>
                            )}
                        </form>
                    </motion.div>
                </div>


                {/* Right Side - Floating Image */}
                <div className="hidden lg:flex w-1/2 items-center justify-center p-12">
                    <motion.img
                        src={loginImg}
                        alt="Login Illustration"
                        className="w-full max-w-[350px] h-auto object-cover rounded-3xl"
                        animate={{
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default Login
