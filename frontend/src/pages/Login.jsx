import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {useNavigate} from "react-router-dom"; 
import { 
  Code2, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  AlertCircle,
  Terminal,
  Zap,
  Database,
  Wifi,
  Activity,
  UserCircle, // Added for Full Name
  TrendingUp  // Added for Skill Level
} from "lucide-react";
import LoginService from "../services/LoginService";

// --- ANIMATED PARTICLES FOR LEFT SIDE ---
const ParticleField = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const updateSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateSize();
    
    const particles = [];
    const particleCount = 100;
    
    class Particle {
      constructor() {
        this.reset();
      }
      
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.size = Math.random() * 2.5;
        this.opacity = Math.random() * 0.6 + 0.2;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      
      draw() {
        ctx.fillStyle = `rgba(96, 165, 250, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, i) => {
        particle.update();
        particle.draw();
        
        particles.slice(i + 1).forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.2 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// --- FLOATING ICONS ANIMATION ---
const FloatingIcon = ({ Icon, delay, duration, x, y }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.1, 0.3, 0.1],
      scale: [1, 1.2, 1],
      y: [0, -20, 0]
    }}
    transition={{
      duration: duration,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
    style={{ left: x, top: y }}
  >
    <Icon className="w-8 h-8 text-blue-400" />
  </motion.div>
);

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [creds, setCreds] = useState({
    fullName: "",    // Added field
    username: "",
    email: "",
    skillLevel: "beginner", // Added field with default
    password: "",
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const Navigate = useNavigate();


  useEffect(() => {
    setError(null);
    setMessage("");
  }, [mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCreds((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    try {
      setLoading(true);

      if (mode === "register") {
        // Validation check before sending
        if(creds.password.length < 8) {
           throw new Error("Password must be at least 8 characters");
        }
        
        const response = await LoginService.Test_Reg(creds);
        setMessage("Node initialized successfully. You can now sign in.");
        
        // Optional: Auto switch to login after delay
        setTimeout(() => setMode("login"), 2000); 

      } else {
        console.log('creds-',creds);
        const response = await LoginService.Test_login(creds.email, creds.password);
        const token = response.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        if (response.data.user.role === "admin") {
          Navigate("/admin/dashboard");
        } else {
          Navigate("/profile");
        }
      }
    } catch (err) {
      // Improved error handling to catch string errors or response errors
      const errorMsg = err.response?.data?.message || err.message || (mode === "register" ? "Initialization failed" : "Access denied");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#030014] relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes data-flow {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        /* Custom Scrollbar for form container if needed on small screens */
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 2px; }
      `}</style>

      {/* ===== LEFT SIDE - VISUAL/BRANDING ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#030014] via-[#050525] to-[#030014] overflow-hidden">
        
        {/* Background Effects */}
        <div className="absolute inset-0">
          <ParticleField />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.08]" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, #3b82f6 1px, transparent 1px),
              linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} 
        />

        {/* Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
        
        {/* Floating Icons */}
        <FloatingIcon Icon={Database} delay={0} duration={4} x="15%" y="20%" />
        <FloatingIcon Icon={Wifi} delay={0.5} duration={5} x="75%" y="30%" />
        <FloatingIcon Icon={Activity} delay={1} duration={4.5} x="25%" y="70%" />
        <FloatingIcon Icon={Cpu} delay={1.5} duration={5.5} x="80%" y="65%" />
        <FloatingIcon Icon={ShieldCheck} delay={2} duration={4} x="50%" y="85%" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="relative inline-block mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.6)]"
              >
                <Code2 className="w-12 h-12 text-white" />
              </motion.div>
              
              {/* Pulse Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-2xl border-2 border-blue-400/30 animate-[pulse-ring_3s_ease-out_infinite]" />
                <div className="w-24 h-24 rounded-2xl border-2 border-purple-400/30 animate-[pulse-ring_3s_ease-out_infinite_1s]" />
              </div>
            </div>

            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              Neural <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Mesh</span>
            </h1>
            <p className="text-lg text-gray-400 font-mono mb-8">
              Next-Generation Authentication System
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-400 mb-1">99.9%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Uptime</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-purple-400 mb-1">256-bit</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Encryption</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-cyan-400 mb-1">&lt;50ms</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Response</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Data Flow Lines */}
          <div className="absolute bottom-0 left-0 right-0 h-40 overflow-hidden opacity-20">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-20 bg-gradient-to-b from-transparent via-blue-400 to-transparent"
                style={{ left: `${20 + i * 15}%` }}
                animate={{ y: ['-100%', '300%'] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "linear"
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE - FORM ===== */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-8 bg-[#030014] overflow-y-auto custom-scroll">
        
        {/* Subtle Background Effects for Right Side */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-20 left-[-10%] w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full" />
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          
          {/* Top HUD */}
          <div className="flex justify-between items-center mb-6 px-1">
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400">
              <ShieldCheck size={12} className="animate-pulse" style={{ animationDuration: '2s' }} />
              <span className="tracking-wider">SECURE_CONNECTION</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLINE</span>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-gradient-to-br from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(37,99,235,0.15)] overflow-hidden">
            
            <div className="p-8">
              
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                    <Terminal className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {mode === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-xs text-gray-500 font-mono">
                      {mode === "login" ? "Enter your credentials" : "Initialize new node"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="relative flex bg-black/40 p-1 rounded-lg border border-white/10 mb-8">
                <motion.div 
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-blue-600/40 to-purple-600/40 rounded-md border border-blue-400/30 shadow-lg"
                  animate={{ x: mode === "login" ? 0 : "calc(100% + 4px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`relative flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors z-10 ${mode === "login" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`relative flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors z-10 ${mode === "register" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Sign Up
                </button>
              </div>

              {/* Messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-300 font-mono">{error}</p>
                    </div>
                  </motion.div>
                )}
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                      <Terminal className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-emerald-300 font-mono">{message}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Fields */}
              <div className="space-y-4">
                
                <AnimatePresence>
                  {mode === "register" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-4"
                    >
                      {/* FULL NAME */}
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                          Full Name
                        </label>
                        <div className="relative group">
                          <UserCircle className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" />
                          <input
                            name="fullName"
                            type="text"
                            value={creds.fullName}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* USERNAME */}
                      <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                          Username
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" />
                          <input
                            name="username"
                            type="text"
                            value={creds.username}
                            onChange={handleChange}
                            placeholder="Choose username"
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* EMAIL (Always visible) */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" />
                    <input
                      name="email"
                      type="email"
                      value={creds.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {mode === "register" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      {/* SKILL LEVEL */}
                      <div className="mb-4">
                        <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                          Skill Level
                        </label>
                        <div className="relative group">
                          <TrendingUp className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" />
                          <select
                            name="skillLevel"
                            value={creds.skillLevel}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                          >
                            <option value="beginner" className="bg-[#0a0a0a] text-gray-300">Beginner</option>
                            <option value="intermediate" className="bg-[#0a0a0a] text-gray-300">Intermediate</option>
                            <option value="advanced" className="bg-[#0a0a0a] text-gray-300">Advanced</option>
                          </select>
                          <div className="absolute right-3 top-3.5 pointer-events-none">
                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-500"></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* PASSWORD (Always visible) */}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors z-10" />
                    <input
                      name="password"
                      type="password"
                      value={creds.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                {mode === "login" && (
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                      <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/10 bg-black/40" />
                      <span>Remember me</span>
                    </label>
                    <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full mt-6 group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Cpu className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">
                          {mode === "login" ? "Sign In" : "Initialize Node"}
                        </span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </motion.button>
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
          </div>

          {/* Bottom Text */}
          <p className="text-center text-xs text-gray-500 mt-6 font-mono">
            Protected by AES-256 encryption  •  {mode === "login" ? "Don't" : "Already"} have an account?{" "}
            <button 
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>

        </motion.div>
      </div>

      {/* Mobile Logo (visible only on small screens) */}
      <div className="lg:hidden absolute top-8 left-8 z-20">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]">
          <Code2 className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;