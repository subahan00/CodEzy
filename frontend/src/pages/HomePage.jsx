import React from "react";
import Hero from "../component/Home/Hero";
import PlaygroundDemo from "../component/Home/PlaygroundDemo";
import Timeline from "../component/Home/TimeLine";
import FeatureGrid from "../component/Home/FeatureGrid";
import ArchitectureDiagram from "../component/Home/ArchitectureDiagram";
import Footer from "../component/Home/Footer";

const HomePage = () => {
  return (
    <>
      <Hero />
      <PlaygroundDemo />
      <Timeline />
      <FeatureGrid />

      {/* --- HALL OF CHAMPIONS CTA (Teaser Only) --- */}
      <section className="relative py-28 text-center bg-[#030014] border-t border-white/5 overflow-hidden">
        
        {/* Glow */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[700px] h-[300px] bg-yellow-500/10 blur-[120px] rounded-full" />

        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Enter the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Hall of Champions
            </span>
          </h2>

          <p className="text-gray-400 text-lg mb-8">
            See who dominates the global arena.  
            Rankings powered by logic, speed, and precision.
          </p>

          <a
            href="/leaderboard"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-black font-bold text-sm
                       hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            View Global Leaderboard
          </a>
        </div>
      </section>

      <ArchitectureDiagram />
      <Footer />
    </>
  );
};

export default HomePage;
