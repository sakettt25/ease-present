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
      <footer className="py-12 bg-primary text-primary-foreground">
        <div className="container px-4 text-center">
          <p className="font-display text-lg font-semibold mb-2">QR Attendance System</p>
          <p className="text-sm text-primary-foreground/70">
            Secure, fraud-proof attendance management for educational institutions
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
