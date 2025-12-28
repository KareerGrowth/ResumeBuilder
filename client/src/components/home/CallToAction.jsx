import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const CallToAction = () => {
  return (
    <section id="cta" className="relative h-screen w-full bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex items-center justify-center overflow-hidden scroll-mt-0">

      {/* Abstract Background Branding Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-sm font-medium mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Join 50,000+ Professionals</span>
          </div>

          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-tight">
            Build your legacy <br /> Let's start <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">today.</span>
          </h2>

          <p className="text-xl md:text-2xl text-indigo-100/80 max-w-2xl mx-auto mb-12 font-light">
            Your dream job is just one perfect resume away. Experience the future of career tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/app?state=register"
              className="inline-flex items-center justify-center h-16 px-10 rounded-full bg-white text-indigo-900 text-lg font-bold hover:bg-indigo-50 hover:scale-105 transition-all duration-300 shadow-2xl shadow-indigo-900/50 group"
            >
              Build My Resume
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>No credit card required</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating UI Elements for 'Branding' Feel */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-10 md:left-20 bg-white/5 backdrop-blur-lg border border-white/10 p-4 rounded-2xl hidden md:block"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <div className="text-white font-bold">Offer Letter Received</div>
            <div className="text-white/60 text-xs">Just now via Email</div>
          </div>
        </div>
      </motion.div>

    </section>
  );
};
import { Check } from 'lucide-react'; // Needed for the floating element above

export default CallToAction;
