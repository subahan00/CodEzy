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
      <ArchitectureDiagram />
      <Footer />
      </>
   
  );
};

export default HomePage;