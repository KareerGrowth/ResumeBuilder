import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, LayoutTemplate, Eye, FileDown, CheckCircle2, Layers } from 'lucide-react';

const features = [
    {
        icon: <Wand2 className="w-6 h-6" />,
        title: "AI Writing Assistant",
        description: "Generate professional summaries and bullet points tailored to your role with a single click."
    },
    {
        icon: <LayoutTemplate className="w-6 h-6" />,
        title: "ATS-Friendly Templates",
        description: "Choose from a library of professionally designed templates optimized to pass Applicant Tracking Systems."
    },
    {
        icon: <Eye className="w-6 h-6" />,
        title: "Real-time Preview",
        description: "See your changes instantly as you type. No more guessing how your resume will look."
    },
    {
        icon: <FileDown className="w-6 h-6" />,
        title: "Instant PDF Export",
        description: "Download high-quality, print-ready PDFs perfect for emailing or uploading to job boards."
    },
    {
        icon: <CheckCircle2 className="w-6 h-6" />,
        title: "Smart Formatting",
        description: "Automatic layout adjustments ensure your resume looks polished without manual tweaking."
    },
    {
        icon: <Layers className="w-6 h-6" />,
        title: "Multi-Version Management",
        description: "Create and manage multiple versions of your resume for different job applications."
    }
];

const Features = () => {
    return (
        <section id="features" className="py-20 lg:py-32 bg-slate-50 relative overflow-hidden scroll-mt-0 min-h-screen flex flex-col justify-center">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-200/20 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-2xl mx-auto mb-16"
                >
                    <span className="text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-2 block">Powerful Features</span>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Everything you need to <br /> build the perfect resume</h2>
                    <p className="text-slate-600 text-lg">Our platform combines powerful AI with intuitive design tools to help you stand out from the crowd.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
