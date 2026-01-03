import React, { useState, useEffect } from "react";
import { 
  Play, 
  Cpu, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Terminal,
  ScanLine,
  ChevronRight,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- MOCK SCENARIOS BASED ON PROJECT DOCS ---
// The doc mentions moving beyond "Pass/Fail" to "Why it is wrong".
const SCENARIOS = [
  {
    id: "efficiency",
    label: "Algorithmic Efficiency",
    icon: Zap,
    code: `function findPair(nums, target) {
  // ⚠️ Inefficient O(n²) approach
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (i !== j && nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return null;
}`,
    analysis: {
      score: 65,
      complexity: "O(n²)",
      memory: "O(1)",
      feedback: [
        { type: "critical", msg: "Detected quadratic time complexity due to nested loops." },
        { type: "suggestion", msg: "Use a Hash Map to reduce lookups to O(1)." },
        { type: "info", msg: "Execution time for 1M inputs: ~4500ms (Too Slow)." }
      ],
      optimizedCode: `function findPair(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
  return null;
}`
    }
  },
  {
    id: "security",
    label: "Security & Safety",
    icon: ShieldAlert,
    code: `function getUserData(userId) {
  // ⚠️ SQL Injection vulnerability
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.execute(query);
}`,
    analysis: {
      score: 12,
      complexity: "N/A",
      memory: "N/A",
      feedback: [
        { type: "critical", msg: "CRITICAL: SQL Injection vulnerability detected." },
        { type: "warning", msg: "Never concatenate strings directly into queries." },
        { type: "suggestion", msg: "Use parameterized queries or ORM methods." }
      ],
      optimizedCode: `function getUserData(userId) {
  // ✅ Sanitized Approach
  return db.execute(
    "SELECT * FROM users WHERE id = ?", 
    [userId]
  );
}`
    }
  }
];

const PlaygroundDemo = () => {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    
    // Simulate AI Latency
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 1800);
  };

  return (
            <section className="relative bg-[#05050a]">

    <div className="w-full bg-[#030014] py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-900/10 mb-6"
          >
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-purple-200 uppercase tracking-widest">
              CodEzy Neural Engine v1.0
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            See the AI in Action
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Experience our feedback loop. Select a coding scenario and watch the neural engine analyze logic, not just syntax.
          </p>
        </div>

        {/* Playground Interface */}
        <div className="grid lg:grid-cols-12 gap-8 h-auto lg:h-[600px]">
          
          {/* LEFT: Editor & Controls */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Scenario Tabs */}
            <div className="flex flex-wrap gap-2">
              {SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => {
                    setActiveScenario(scenario);
                    setShowResults(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border ${
                    activeScenario.id === scenario.id
                      ? "bg-blue-600/20 border-blue-500 text-blue-200"
                      : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                  }`}
                >
                  <scenario.icon className="w-4 h-4" />
                  {scenario.label}
                </button>
              ))}
            </div>

            {/* Code Editor */}
            <div className="flex-1 rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] relative group shadow-2xl">
              {/* Fake Menu Bar */}
              <div className="h-10 bg-[#1a1a1a] border-b border-white/5 flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <div className="text-xs text-gray-500 font-mono">main.js</div>
              </div>

              {/* Code Area */}
              <div className="p-6 font-mono text-sm md:text-base leading-relaxed text-gray-300 relative h-full">
                <pre>{activeScenario.code}</pre>
                
                {/* Scanning Overlay Animation */}
                <AnimatePresence>
                  {isAnalyzing && (
                    <motion.div 
                      initial={{ top: 0, opacity: 0 }}
                      animate={{ top: "100%", opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-20"
                    >
                      <div className="absolute top-0 right-0 text-[10px] text-cyan-400 font-bold -mt-4 mr-2">
                        ANALYZING NODES...
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Glitch Overlay during scan */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay pointer-events-none" />
                )}
              </div>

              {/* Action Button */}
              <div className="absolute bottom-6 right-6">
                <button 
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      Run Semantic Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Analysis Panel */}
          <div className="lg:col-span-5 h-full">
            <div className="h-full rounded-2xl bg-[#0b0b15]/80 backdrop-blur-xl border border-white/10 p-1 relative overflow-hidden">
              
              {/* Default State */}
              {!showResults && !isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Terminal className="w-8 h-8 opacity-50" />
                  </div>
                  <p>Run the analysis to view the Neural Engine's feedback on complexity and logic.</p>
                </div>
              )}

              {/* Analyzing State */}
              {isAnalyzing && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                   <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6" />
                   <h3 className="text-white font-bold text-xl mb-2">Analyzing AST...</h3>
                   <div className="space-y-1">
                     <p className="text-xs text-gray-400 font-mono">Tokenizing input stream...</p>
                     <p className="text-xs text-gray-400 font-mono">Comparing against 40M patterns...</p>
                     <p className="text-xs text-gray-400 font-mono">Generating optimization graph...</p>
                   </div>
                </div>
              )}

              {/* Results State */}
              {showResults && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col bg-[#0f0f1a] rounded-xl overflow-hidden"
                >
                  {/* Result Header */}
                  <div className="p-6 border-b border-white/5 flex justify-between items-start bg-black/20">
                    <div>
                      <h3 className="text-gray-400 text-xs font-bold tracking-wider uppercase mb-1">Code Quality Score</h3>
                      <div className={`text-4xl font-black ${activeScenario.analysis.score > 80 ? 'text-green-400' : 'text-orange-400'}`}>
                        {activeScenario.analysis.score}/100
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs text-gray-500 uppercase">Complexity</div>
                      <div className="text-sm font-mono text-white flex items-center justify-end gap-2">
                        <Database className="w-3 h-3 text-purple-400" />
                        {activeScenario.analysis.complexity}
                      </div>
                    </div>
                  </div>

                  {/* Feedback List */}
                  <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <ScanLine className="w-4 h-4 text-blue-400" />
                      Neural Feedback
                    </h4>
                    
                    <div className="space-y-3 mb-8">
                      {activeScenario.analysis.feedback.map((item, idx) => (
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          key={idx} 
                          className={`p-3 rounded-lg border text-sm flex gap-3 items-start ${
                            item.type === 'critical' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                            item.type === 'suggestion' ? 'bg-blue-500/10 border-blue-500/30 text-blue-200' :
                            item.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-200' :
                            'bg-gray-800 border-gray-700 text-gray-300'
                          }`}
                        >
                          {item.type === 'critical' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                          {item.type === 'suggestion' && <Zap className="w-4 h-4 shrink-0 mt-0.5" />}
                          {item.type === 'info' && <Terminal className="w-4 h-4 shrink-0 mt-0.5" />}
                          {item.type === 'warning' && <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />}
                          <span>{item.msg}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Suggested Fix */}
                    <div className="bg-green-900/10 border border-green-500/20 rounded-lg overflow-hidden">
                      <div className="bg-green-900/20 px-4 py-2 text-xs font-bold text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3" /> SUGGESTED REFACTOR
                      </div>
                      <div className="p-4 font-mono text-xs text-green-100/80 leading-relaxed overflow-x-auto">
                        <pre>{activeScenario.analysis.optimizedCode}</pre>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

        </div>

        {/* Feature Highlights (Mini Bento) */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 text-center md:text-left">
          {[
            { title: "Static Analysis", desc: "Detects syntax and pattern errors instantly." },
            { title: "Dynamic Profiling", desc: "Estimates runtime execution cost." },
            { title: "Semantic Understanding", desc: "Knows what you're trying to build." },
          ].map((feature, i) => (
            <div key={i} className="border-t border-white/10 pt-6">
              <h4 className="text-white font-bold mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
    </section>
  );
};

export default PlaygroundDemo;