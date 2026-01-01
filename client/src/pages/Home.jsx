import React from 'react';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import TemplatesSection from '../components/home/TemplatesSection';
import Features from '../components/home/Features';
import Testimonial from '../components/home/Testimonial';
import Pricing from '../components/home/Pricing';
import CallToAction from '../components/home/CallToAction';
import Footer from '../components/home/Footer';

const Home = () => {
  return (
    <div id="home" className="bg-white min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <TemplatesSection />
        <Features />
        <Testimonial />
        <Pricing />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Home
