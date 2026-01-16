import { Button } from "@/components/ui/button";
import { QrCode, Shield, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/80">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container relative z-10 px-4 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 animate-fade-in">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-accent text-sm font-medium">Fraud-Proof Attendance</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Smart QR-Based
              <span className="block mt-2 text-accent">Attendance System</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-xl mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Eliminate proxy attendance with location verification, device fingerprinting, and real-time validation for educational institutions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button 
                size="xl" 
                variant="accent" 
                onClick={() => navigate('/faculty')}
                className="group"
              >
                <QrCode className="w-5 h-5 transition-transform group-hover:rotate-12" />
                Faculty Dashboard
              </Button>
              <Button 
                size="xl" 
                variant="hero-outline" 
                onClick={() => navigate('/scan')}
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Scan Attendance
              </Button>
            </div>
          </div>

          {/* Visual element */}
          <div className="flex-1 flex justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative">
              {/* Glowing backdrop */}
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75" />
              
              {/* QR Code mock */}
              <div className="relative bg-card p-8 rounded-3xl shadow-2xl qr-glow animate-float">
                <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <QrCode className="w-32 h-32 md:w-40 md:h-40 text-primary-foreground/90" />
                  
                  {/* Scan line animation */}
                  <div className="absolute left-0 right-0 h-1 bg-accent/50 animate-scan-line" />
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm font-medium text-muted-foreground">Session Active</p>
                  <p className="text-xs text-muted-foreground/60">Scan to mark attendance</p>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -left-4 bg-card px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-float" style={{ animationDelay: '0.5s' }}>
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium">50m Radius</span>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-card px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-float" style={{ animationDelay: '1s' }}>
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-xs font-medium">120s Expiry</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
