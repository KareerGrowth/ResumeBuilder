import React from 'react';
import { MessageSquareQuote } from 'lucide-react';

const Testimonial = () => {
    const cardsData = [
        {
            image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
            name: 'Briar Martin',
            role: 'Software Engineer',
            text: "This resume builder completely transformed my job search. I landed interviews at top tech companies within weeks!",
        },
        {
            image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
            name: 'Avery Johnson',
            role: 'Product Manager',
            text: "The AI suggestions were spot on. It helped me articulate my achievements in a way I never could before.",
        },
        {
            image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60',
            name: 'Jordan Lee',
            role: 'Marketing Director',
            text: "Simple, intuitive, and the templates are gorgeous. Highly recommend to anyone looking to level up their career.",
        },
        {
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200',
            name: 'Sarah Chen',
            role: 'UX Designer',
            text: "Finally, a resume builder that actually cares about design. The layouts are clean and professional.",
        },
        {
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200',
            name: 'Michael Ross',
            role: 'Data Analyst',
            text: "The ATS scoring feature is a game changer. I knew exactly what to fix to get past the screening bots.",
        },
    ];

    const ReviewCard = ({ card }) => (
        <div className="w-80 md:w-96 shrink-0 mx-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-start gap-4 mb-4">
                <img className="w-12 h-12 rounded-full object-cover border-2 border-indigo-50" src={card.image} alt={card.name} />
                <div>
                    <h4 className="font-bold text-slate-800 text-sm">{card.name}</h4>
                    <p className="text-xs text-indigo-600 font-medium">{card.role}</p>
                </div>
                <MessageSquareQuote className="w-8 h-8 text-indigo-100 ml-auto" />
            </div>
            <p className="text-slate-600 text-sm leading-relaxed italic">"{card.text}"</p>
        </div>
    );

    return (
        <section id="testimonials" className="py-20 lg:py-32 bg-white overflow-hidden scroll-mt-0 min-h-screen flex flex-col justify-center">
            <div className="text-center max-w-2xl mx-auto px-6 mb-16">
                <span className="text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-2 block">Testimonials</span>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Loved by job seekers <br /> around the world</h2>
            </div>

            <div className="marquee-row w-full overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full w-20 md:w-60 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent"></div>
                <div className="marquee-inner flex py-4">
                    {[...cardsData, ...cardsData].map((card, index) => (
                        <ReviewCard key={`row1-${index}`} card={card} />
                    ))}
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-60 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent"></div>
            </div>

            <div className="marquee-row w-full overflow-hidden relative mt-8">
                <div className="absolute left-0 top-0 h-full w-20 md:w-60 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent"></div>
                <div className="marquee-inner marquee-reverse flex py-4">
                    {[...cardsData, ...cardsData].map((card, index) => (
                        <ReviewCard key={`row2-${index}`} card={card} />
                    ))}
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-60 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent"></div>
            </div>

            <style>{`
            @keyframes marqueeScroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .marquee-inner {
                width: max-content;
                animation: marqueeScroll 40s linear infinite;
            }
            .marquee-inner:hover {
                animation-play-state: paused;
            }
            .marquee-reverse {
                animation-direction: reverse;
            }
        `}</style>
        </section>
    );
};

export default Testimonial;
