import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Search, FileText, Sparkles, MessageSquare, DollarSign, Layout, User, LogIn } from 'lucide-react';
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

            {/* Mobile Menu Sidebar - Portaled to Body */}
            {createPortal(
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/50 z-[100] md:hidden"
                            />

                            {/* Sidebar */}
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[101] md:hidden font-[Outfit] flex flex-col rounded-l-3xl overflow-hidden"
                            >

                                {/* Indigo Guest Header */}
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
                                                src={`https://ui-avatars.com/api/?name=Guest&background=fff&color=4F46E5`}
                                                alt="Guest"
                                                className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl"
                                            />
                                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-white border-2 border-indigo-600 rounded-full"></div>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">Welcome Guest</h3>
                                        <p className="text-indigo-100 text-sm">Explore premium resumes</p>
                                    </div>
                                </div>

                                {/* Nav Links */}
                                <div className="flex-1 py-6 px-4 overflow-y-auto">
                                    <div className="space-y-2">
                                        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu</p>

                                        {navLinks.map((link) => {
                                            // Mapping icons based on link name
                                            let Icon = Layout;
                                            if (link.name === 'Dashboard') Icon = Layout;
                                            if (link.name === 'Templates') Icon = FileText;
                                            if (link.name === 'Features') Icon = Sparkles;
                                            if (link.name === 'Reviews') Icon = MessageSquare;
                                            if (link.name === 'Pricing') Icon = DollarSign;

                                            return (
                                                <a
                                                    key={link.name}
                                                    href={link.href}
                                                    className="flex items-center justify-between px-4 py-3.5 text-base font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                                        {link.name}
                                                    </div>
                                                </a>
                                            );
                                        })}

                                        <div className="h-px bg-slate-100 my-4 mx-4"></div>

                                        <Link
                                            to="/app?state=login"
                                            className="flex items-center justify-between px-4 py-3.5 text-base font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all group"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <LogIn className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                                Login
                                            </div>
                                        </Link>

                                        <Link
                                            to="/app?state=register"
                                            className="flex items-center justify-between px-4 py-3.5 text-base font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all group mt-2"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <ArrowRight className="w-5 h-5 text-indigo-600" />
                                                Get Started
                                            </div>
                                        </Link>

                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default Navbar;
