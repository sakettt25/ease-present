import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      
      {/* Footer */}
      <footer className="relative bg-black border-t border-gray-800 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5"></div>
        
        <div className="relative container px-4 py-12">
          {/* Main Content */}
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur-md opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  EasePresent
                </h3>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-gray-400 max-w-md text-sm leading-relaxed">
              Modern attendance tracking powered by QR technology and location verification
            </p>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="/faculty" className="text-gray-400 hover:text-blue-400 transition-colors">Faculty</a>
              <a href="/scan" className="text-gray-400 hover:text-blue-400 transition-colors">Student</a>
              <a href="#privacy" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy</a>
              <a href="#terms" className="text-gray-400 hover:text-blue-400 transition-colors">Terms</a>
            </div>

            {/* Divider */}
            <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>

            {/* Copyright */}
            <p className="text-gray-500 text-xs">
              © 2026 EasePresent. Secure attendance management.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/3 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyan-500/3 rounded-full blur-3xl pointer-events-none"></div>
      </footer>
    </div>
  );
};

export default Index;
