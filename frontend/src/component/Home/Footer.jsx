import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Code2, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  ArrowRight, 
  Terminal,
  Activity,
  Cpu,
  CheckCircle2
} from "lucide-react";

// --- SUB-COMPONENTS ---

const CircuitPattern = () => (
  <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
    style={{ 
      backgroundImage: `
        linear-gradient(to right, #333 1px, transparent 1px),
        linear-gradient(to bottom, #333 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      maskImage: 'linear-gradient(to top, black 40%, transparent 100%)'
    }} 
  />
);

const FooterLink = ({ href, children }) => (
  <li>
    <a 
      href={href} 
      className="text-gray-500 hover:text-blue-400 transition-colors text-sm flex items-center gap-2 group"
    >
      <span className="w-1 h-1 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="group-hover:translate-x-1 transition-transform duration-300">{children}</span>
    </a>
  </li>
);

const SocialLink = ({ href, icon: Icon }) => (
  <a 
    href={href}
    className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-blue-500/30 hover:bg-blue-500/10 transition-all duration-300 group"
  >
    <Icon size={18} className="group-hover:scale-110 transition-transform" />
  </a>
);

const TerminalInput = () => {
  const [focused, setFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, success

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("success");
    setTimeout(() => {
      setEmail("");
      setStatus("idle");
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-2">
      <div 
        className={`
          flex items-center gap-2 p-3 rounded-xl border bg-black/50 transition-all duration-300
          ${focused ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-white/10'}
        `}
      >
        <Terminal size={16} className={`transition-colors ${focused ? 'text-blue-400' : 'text-gray-600'}`} />
        <span className="text-gray-600 select-none">~</span>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="enter_email_for_updates"
          className="bg-transparent border-none outline-none text-sm text-gray-300 w-full placeholder-gray-700 font-mono"
          required
        />
        <button 
          type="submit"
          className="p-1.5 rounded-md bg-white/5 hover:bg-blue-500 hover:text-white text-gray-400 transition-all"
        >
          {status === "success" ? <CheckCircle2 size={16} className="text-emerald-400" /> : <ArrowRight size={16} />}
        </button>
      </div>
      {status === "success" && (
        <div className="absolute -bottom-6 left-0 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          SUBSCRIBED_SUCCESSFULLY
        </div>
      )}
    </form>
  );
};

// --- MAIN FOOTER ---

const Footer = () => {
  return (
    <footer className="relative bg-[#02000d] pt-24 pb-12 overflow-hidden border-t border-white/5">
      
      {/* Backgrounds */}
      <CircuitPattern />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-900/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-white">CodEzy</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Code Beyond Binary Judgment. The first competitive platform powered by semantic AI analysis and real-time execution meshes.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={Github} />
              <SocialLink href="#" icon={Twitter} />
              <SocialLink href="#" icon={Linkedin} />
              <SocialLink href="#" icon={Mail} />
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2">
              <FooterLink href="#">The Arena</FooterLink>
              <FooterLink href="#">Learning Paths</FooterLink>
              <FooterLink href="#">Enterprise</FooterLink>
              <FooterLink href="#">Pricing</FooterLink>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <FooterLink href="#">Documentation</FooterLink>
              <FooterLink href="#">API Reference</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Community</FooterLink>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Stay Synced</h4>
            <p className="text-xs text-gray-500">
              Join the neural network. Get the latest architecture updates and challenge drops.
            </p>
            <TerminalInput />
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-600">© 2025 CodEzy Inc.</span>
            <div className="hidden md:flex gap-6">
              <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms of Service</a>
            </div>
          </div>

          {/* System Status Indicator */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-mono font-medium text-gray-400 flex items-center gap-2">
              SYSTEM STATUS: <span className="text-emerald-400">OPERATIONAL</span>
            </span>
            <div className="w-[1px] h-3 bg-white/10 mx-1" />
            <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
              <Cpu size={10} /> v2.4.0
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;