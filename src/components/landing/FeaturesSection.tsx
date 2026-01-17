import { MapPin, Smartphone, Clock, Shield, FileSpreadsheet, Users } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Location Verification",
    description: "Students must be within 50 meters of the faculty's location to mark attendance.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Smartphone,
    title: "Device Fingerprinting",
    description: "Each device can submit attendance only once per session, blocking proxy attempts.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Clock,
    title: "QR Code Expiry",
    description: "Dynamic QR codes with 120-second validity and one-time use tokens.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Shield,
    title: "Anti-Fraud Protection",
    description: "50-minute cooldown after successful submission prevents re-attempts.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: FileSpreadsheet,
    title: "CSV Reports",
    description: "Automatically generate detailed attendance reports with timestamps.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Users,
    title: "Student Verification",
    description: "Cross-check roll numbers and names against official student lists.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 bg-black">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Comprehensive Anti-Fraud System
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Multiple layers of verification ensure genuine attendance tracking
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-blue-500/40 hover-lift cursor-default overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm backdrop-blur-sm`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
