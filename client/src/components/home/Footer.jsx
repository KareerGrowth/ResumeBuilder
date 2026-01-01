import React from 'react';
import { Twitter, Linkedin, Youtube, Instagram, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white pt-20 pb-10 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <img src="/logo.svg" alt="logo" className="h-8 w-auto" />
                            <span className="text-xl font-bold text-slate-900">ResumeBuilder</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
                            Empowering job seekers with AI-driven tools to create professional, winning resumes in minutes.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Templates</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Reviews</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Career Blog</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Resume Examples</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Cover Letter Tips</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-slate-500">
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-indigo-600 transition-colors">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>© 2025 ResumeBuilder. All rights reserved.</p>
                    <div className="flex items-center gap-1">
                        Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> by SystemMindz
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
