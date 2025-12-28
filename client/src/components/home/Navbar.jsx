import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Search, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const user = null; // Replace with actual user state from context/store

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Dashboard', href: '#home' },
        { name: 'Templates', href: '#templates-preview' },
        { name: 'Features', href: '#features' }, // These sections exist but might be hidden in Home.jsx currently
        { name: 'Reviews', href: '#testimonials' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 backdrop-blur-md border-slate-200/50 py-3 shadow-sm' : 'bg-white/5 backdrop-blur-sm border-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                            ResumeBuilder
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>

                        {user ? (
                            <Link
                                to="/app"
                                className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/app?state=login"
                                    className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/app?state=register"
                                    className="group px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
                                >
                                    Get Started
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed inset-0 z-[60] bg-white flex flex-col p-6 md:hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-xl font-bold text-slate-900">ResumeBuilder</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-lg font-medium text-slate-700 hover:text-indigo-600"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <hr className="border-slate-100" />
                            {user ? (
                                <Link
                                    to="/app"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-center px-6 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/app?state=login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-center py-2 text-slate-600 font-medium hover:text-indigo-600"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/app?state=register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-center px-6 py-3 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
